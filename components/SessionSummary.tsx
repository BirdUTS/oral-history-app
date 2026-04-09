"use client";

import { useEffect, useState } from "react";

interface Segment {
  ai_question: string | null;
  transcript: string | null;
  sequence_number: number;
}

interface SubjectInfo {
  subject_name: string;
  subject_age: number | null;
  village: string | null;
}

interface Summary {
  topics: string[];
  keyDetails: string[];
  followUps: string[];
}

interface SessionSummaryProps {
  sessionId: string;
  cachedSegmentId?: string;       // DB id of the saved summary row, if it exists
  cachedSummaryJson?: string;     // JSON string stored in transcript column
  cachedSegmentCount: number;     // how many segments the saved summary covers
  currentSegmentCount: number;    // current number of real segments
  conversationSegments: Segment[];
  subjectInfo: SubjectInfo;
}

export default function SessionSummary({
  sessionId,
  cachedSegmentId,
  cachedSummaryJson,
  cachedSegmentCount,
  currentSegmentCount,
  conversationSegments,
  subjectInfo,
}: SessionSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(() => {
    if (cachedSummaryJson) {
      try { return JSON.parse(cachedSummaryJson); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(!cachedSummaryJson);
  const [error, setError] = useState("");
  // true if new segments added since last summary was generated
  const isStale = currentSegmentCount > cachedSegmentCount && cachedSummaryJson != null;

  useEffect(() => {
    // If we already have a cached summary and it's not stale, skip generation
    if (cachedSummaryJson && !isStale) {
      setLoading(false);
      return;
    }
    // No cache or stale — generate
    if (conversationSegments.length === 0) {
      setLoading(false);
      return;
    }
    generate(cachedSegmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(existingId?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: conversationSegments, subjectInfo }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: Summary = await res.json();
      setSummary(data);

      // Save (or update) the summary row in the segments table
      const summaryJson = JSON.stringify(data);
      if (existingId) {
        // Update existing row — also update audio_url to store new segment count
        await fetch("/api/segments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingId,
            transcript: summaryJson,
            audio_url: String(currentSegmentCount),
          }),
        });
      } else {
        // Insert new summary row — reuse audio_url field to store segment count
        await fetch("/api/segments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            sequence_number: 0,
            ai_question: "__SUMMARY__",
            transcript: summaryJson,
            audio_url: String(currentSegmentCount),
          }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法生成摘要");
    } finally {
      setLoading(false);
    }
  }

  if (conversationSegments.length === 0) return null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-stone-100 bg-stone-50">
        <span className="text-lg">📋</span>
        <h2 className="font-semibold text-stone-700 text-base">訪談摘要</h2>

        {loading && (
          <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-1" />
        )}

        {/* Stale warning */}
        {isStale && !loading && (
          <span className="ml-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            有新對話，摘要已更新
          </span>
        )}

        {/* Cached indicator */}
        {!loading && !isStale && summary && (
          <span className="ml-1 text-xs text-stone-400">已儲存</span>
        )}

        {/* Regenerate button */}
        {!loading && summary && (
          <button
            onClick={() => generate(cachedSegmentId)}
            className="ml-auto text-xs text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            重新生成
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {loading && !error && (
          <div className="space-y-3 animate-pulse">
            <div className="h-3 bg-stone-100 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/2" />
            <div className="h-3 bg-stone-100 rounded w-2/3" />
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-5">
            {summary.topics?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">已討論話題</h3>
                <ul className="space-y-1.5">
                  {summary.topics.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="text-amber-400 mt-0.5 shrink-0">●</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.keyDetails?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">重要細節</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.keyDetails.map((d, i) => (
                    <span key={i} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {summary.followUps?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">下次追問方向</h3>
                <ul className="space-y-1.5">
                  {summary.followUps.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="text-stone-300 mt-0.5 shrink-0">→</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
