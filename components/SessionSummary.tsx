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
  segments: Segment[];
  subjectInfo: SubjectInfo;
}

export default function SessionSummary({ segments, subjectInfo }: SessionSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (segments.length === 0) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments, subjectInfo }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "無法生成摘要");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [segments, subjectInfo]);

  if (segments.length === 0) return null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-stone-100 bg-stone-50">
        <span className="text-lg">📋</span>
        <h2 className="font-semibold text-stone-700 text-base">訪談摘要</h2>
        {loading && (
          <span className="ml-auto">
            <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
          </span>
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
            {/* Topics */}
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

            {/* Key Details */}
            {summary.keyDetails?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">重要細節</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.keyDetails.map((d, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1 rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-ups */}
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
