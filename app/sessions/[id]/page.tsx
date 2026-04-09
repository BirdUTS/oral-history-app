import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import ArticleGenerator from "@/components/ArticleGenerator";
import SessionSummary from "@/components/SessionSummary";

interface Segment {
  id: string;
  sequence_number: number;
  ai_question: string | null;
  transcript: string | null;
  audio_url: string | null;
  created_at: string;
}

interface Session {
  id: string;
  subject_name: string;
  subject_age: number | null;
  village: string | null;
  created_at: string;
}

async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, subject_name, subject_age, village, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Session;
}

async function getSegments(sessionId: string): Promise<Segment[]> {
  const { data, error } = await supabase
    .from("segments")
    .select("*")
    .eq("session_id", sessionId)
    .order("sequence_number", { ascending: true });

  if (error || !data) return [];
  return data as Segment[];
}

// Converts whatever is stored in audio_url into a proxy URL.
// Old records store the full Supabase public URL; new records store just the path.
function audioProxyUrl(raw: string): string {
  // Extract path after "/recordings/" from old-style full URLs
  const match = raw.match(/\/recordings\/(.+)$/);
  const path = match ? match[1] : raw;
  return `/api/audio?path=${encodeURIComponent(path)}`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, allSegments] = await Promise.all([getSession(id), getSegments(id)]);

  if (!session) notFound();

  // Separate the cached summary row from real conversation segments
  const summarySegment = allSegments.find(
    (s) => s.sequence_number === 0 && s.ai_question === "__SUMMARY__"
  );
  const segments = allSegments.filter(
    (s) => !(s.sequence_number === 0 && s.ai_question === "__SUMMARY__")
  );

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/sessions" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
            ← 返回記錄列表
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">{session.subject_name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 mt-1">
                {session.subject_age && <span>{session.subject_age} 歲</span>}
                {session.village && <span>📍 {session.village}</span>}
                <span>{formatDate(session.created_at)}</span>
              </div>
            </div>
            <Link
              href={`/session/${session.id}`}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
            >
              繼續訪問
            </Link>
          </div>
        </div>

        {/* Summary bar */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-stone-600">
          共 <span className="font-semibold text-amber-600">{segments.length}</span> 段對話記錄
        </div>

        {/* Session summary — loads from cache or generates once, then saves */}
        {segments.length > 0 && (
          <SessionSummary
            sessionId={session.id}
            cachedSegmentId={summarySegment?.id}
            cachedSummaryJson={summarySegment?.transcript ?? undefined}
            cachedSegmentCount={summarySegment ? parseInt(summarySegment.audio_url ?? "0", 10) : 0}
            currentSegmentCount={segments.length}
            conversationSegments={segments.map((s) => ({
              ai_question: s.ai_question,
              transcript: s.transcript,
              sequence_number: s.sequence_number,
            }))}
            subjectInfo={{
              subject_name: session.subject_name,
              subject_age: session.subject_age,
              village: session.village,
            }}
          />
        )}

        {/* Article generator */}
        {segments.length > 0 && (
          <ArticleGenerator
            segments={segments.map((s) => ({
              ai_question: s.ai_question,
              transcript: s.transcript,
              sequence_number: s.sequence_number,
            }))}
            subjectInfo={{
              subject_name: session.subject_name,
              subject_age: session.subject_age,
              village: session.village,
            }}
          />
        )}

        {/* Conversation */}
        {segments.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">💬</div>
            <p className="text-stone-400 text-base">尚未有對話記錄</p>
            <Link
              href={`/session/${session.id}`}
              className="inline-block text-amber-500 hover:text-amber-600 font-medium text-base transition-colors"
            >
              開始訪問 →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {segments.map((segment) => (
              <div key={segment.id} className="space-y-3">
                {/* AI Question */}
                {segment.ai_question && (
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-sm font-semibold">
                      AI
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-5 py-4 text-stone-700 leading-relaxed flex-1">
                      {segment.ai_question}
                    </div>
                  </div>
                )}

                {/* User response */}
                {segment.transcript && (
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="shrink-0 w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.subject_name.slice(0, 1)}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="bg-stone-700 text-white rounded-2xl rounded-tr-sm px-5 py-4 leading-relaxed">
                        {segment.transcript}
                      </div>
                      {segment.audio_url && (
                        <div className="flex justify-end">
                          <audio
                            controls
                            src={audioProxyUrl(segment.audio_url)}
                            className="h-8 w-full max-w-xs opacity-70 hover:opacity-100 transition-opacity"
                            preload="none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
