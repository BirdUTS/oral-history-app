"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import RecordButton from "@/components/RecordButton";
import WaveformAnimation from "@/components/WaveformAnimation";
import { supabase } from "@/lib/supabaseClient";

interface Session {
  id: string;
  subject_name: string;
  subject_age: number | null;
  village: string | null;
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

type RecordState = "idle" | "recording" | "processing";

interface InterviewClientProps {
  session: Session;
}

export default function InterviewClient({ session }: InterviewClientProps) {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [segmentCount, setSegmentCount] = useState(0);
  const [isContinuation, setIsContinuation] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load existing segments then fetch next AI question
  useEffect(() => {
    async function init() {
      try {
        // 1. Fetch all prior segments for this session
        const segRes = await fetch(`/api/segments?session_id=${session.id}`);
        const existingSegments: Array<{
          sequence_number: number;
          ai_question: string | null;
          transcript: string | null;
        }> = segRes.ok ? await segRes.json() : [];

        // 2. Rebuild history from prior segments
        const loadedHistory: HistoryMessage[] = [];
        let loadedCount = 0;

        if (Array.isArray(existingSegments) && existingSegments.length > 0) {
          for (const seg of existingSegments) {
            if (seg.ai_question) loadedHistory.push({ role: "assistant", content: seg.ai_question });
            if (seg.transcript) loadedHistory.push({ role: "user", content: seg.transcript });
          }
          loadedCount = existingSegments.length;
          setHistory(loadedHistory);
          setSegmentCount(loadedCount);
          setIsContinuation(true);
        }

        // 3. Ask AI for next question (fresh start or continuation)
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: loadedHistory,
            isContinuation: loadedCount > 0,
            subjectInfo: {
              subject_name: session.subject_name,
              subject_age: session.subject_age,
              village: session.village,
            },
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setCurrentQuestion(data.question ?? "歡迎您，請開始分享您的故事。");
      } catch {
        setCurrentQuestion("多謝您今日願意同我分享您的故事。想請問您，可唔可以話俾我聽，您係邊度長大㗎？");
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, [session]);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Web Audio analyser for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Start recording
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setRecordState("recording");
    } catch (err) {
      setError("無法存取麥克風，請檢查瀏覽器權限設定。");
      console.error(err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    mediaRecorder.onstop = async () => {
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAnalyserNode(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setRecordState("processing");
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      try {
        // 1. Upload audio to Supabase Storage
        const fileName = `${session.id}/${segmentCount + 1}-${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("recordings")
          .upload(fileName, audioBlob, { contentType: "audio/webm" });

        // Store the storage path so the audio proxy can generate a fresh signed URL on demand.
        // Storing a static public URL won't work for private buckets.
        const audioUrl: string | null = uploadError ? null : fileName;

        // 2. Transcribe audio via MiniMax
        const transcribeFormData = new FormData();
        transcribeFormData.append("audio", audioBlob, "recording.webm");
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: transcribeFormData,
        });
        if (!transcribeRes.ok) {
          const errData = await transcribeRes.json().catch(() => ({}));
          throw new Error(errData.error ?? `轉文字失敗 (${transcribeRes.status})`);
        }
        const transcribeData = await transcribeRes.json();
        const newTranscript: string = transcribeData.transcript ?? "";

        setTranscript(newTranscript);
        setShowTranscript(true);

        // 3. Build updated history
        const currentQ = currentQuestion;
        const updatedHistory: HistoryMessage[] = [
          ...history,
          { role: "assistant", content: currentQ },
          { role: "user", content: newTranscript },
        ];
        setHistory(updatedHistory);

        // 4. Get next AI question
        const interviewRes = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: updatedHistory,
            subjectInfo: {
              subject_name: session.subject_name,
              subject_age: session.subject_age,
              village: session.village,
            },
          }),
        });
        if (!interviewRes.ok) {
          const errData = await interviewRes.json().catch(() => ({}));
          throw new Error(errData.error ?? `AI 問題生成失敗 (${interviewRes.status})`);
        }
        const interviewData = await interviewRes.json();
        const nextQuestion: string = interviewData.question ?? "請繼續分享。";

        // 5. Save segment to Supabase
        const newSegmentNumber = segmentCount + 1;
        await fetch("/api/segments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.id,
            sequence_number: newSegmentNumber,
            audio_url: audioUrl,
            transcript: newTranscript,
            ai_question: currentQ,
          }),
        });

        setSegmentCount(newSegmentNumber);

        // 6. Show next question after brief transcript display
        setTimeout(() => {
          setShowTranscript(false);
          setCurrentQuestion(nextQuestion);
          setRecordState("idle");
        }, 2000);
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : "處理時出現問題";
        setError(`${message}，請再試一次。`);
        setRecordState("idle");
      }
    };

    mediaRecorder.stop();
  }, [currentQuestion, history, segmentCount, session]);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <Link href="/sessions" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← 結束訪問
        </Link>
        <div className="text-center">
          <p className="font-semibold text-stone-700 text-sm">{session.subject_name}</p>
          {(session.subject_age || session.village) && (
            <p className="text-xs text-stone-400">
              {[session.subject_age && `${session.subject_age} 歲`, session.village]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <div className="text-xs text-stone-400 min-w-[48px] text-right">
          {segmentCount > 0 && `第 ${segmentCount} 段`}
        </div>
      </div>

      {/* Continuation banner */}
      {isContinuation && !isInitializing && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-center text-sm text-amber-700">
          已載入 {segmentCount} 段對話記錄，AI 將從上次繼續訪問
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 items-center justify-between px-6 py-8 max-w-lg mx-auto w-full gap-8">
        {/* Question display */}
        <div className="flex-1 flex items-center justify-center w-full">
          {isInitializing ? (
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-stone-400 text-sm">正在準備問題...</p>
            </div>
          ) : (
            <div className="text-center space-y-6 w-full">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-6">
                <p className="text-xl leading-relaxed text-stone-800 font-medium">
                  {currentQuestion}
                </p>
              </div>

              {/* Transcript preview */}
              {showTranscript && transcript && (
                <div className="bg-stone-100 rounded-2xl px-5 py-4 transition-all duration-500">
                  <p className="text-sm text-stone-500 mb-1">您說：</p>
                  <p className="text-stone-700 leading-relaxed">{transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Waveform + Record button */}
        <div className="flex flex-col items-center gap-6 w-full">
          <WaveformAnimation
            isRecording={recordState === "recording"}
            analyser={analyserNode}
          />

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-4 py-3 w-full">
              {error}
            </p>
          )}

          <RecordButton
            state={recordState}
            onStart={startRecording}
            onStop={stopRecording}
          />

          {/* Cantonese hint */}
          {recordState === "idle" && !isInitializing && segmentCount === 0 && (
            <p className="text-xs text-stone-400 text-center max-w-xs">
              請以廣東話回答。錄音後系統會自動轉為文字。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
