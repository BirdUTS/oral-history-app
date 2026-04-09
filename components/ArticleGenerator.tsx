"use client";

import { useState } from "react";

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

interface ArticleGeneratorProps {
  segments: Segment[];
  subjectInfo: SubjectInfo;
}

export default function ArticleGenerator({ segments, subjectInfo }: ArticleGeneratorProps) {
  const [article, setArticle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setIsOpen(true);

    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, subjectInfo }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `生成失敗 (${res.status})`);
      }

      const data = await res.json();
      setArticle(data.article ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成文章時出現問題，請再試。");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (article) navigator.clipboard.writeText(article);
  }

  return (
    <div className="space-y-4">
      {/* Trigger button */}
      <button
        onClick={handleGenerate}
        disabled={loading || segments.length === 0}
        className="w-full bg-stone-800 hover:bg-stone-700 active:bg-stone-900 disabled:bg-stone-300 text-white font-semibold py-4 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            正在生成文章...
          </>
        ) : (
          <>
            ✍️ 生成口述歷史文章
          </>
        )}
      </button>

      {/* Article panel */}
      {isOpen && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-700 text-base">生成文章</h2>
            <div className="flex items-center gap-2">
              {article && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  複製全文
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            {loading && (
              <div className="text-center py-12 space-y-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-stone-400 text-sm">AI 正在整理故事，請稍候...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {article && !loading && (
              <div className="prose prose-stone max-w-none">
                {article.split("\n").map((line, i) => {
                  if (!line.trim()) return <div key={i} className="h-3" />;
                  // First non-empty line is treated as the title
                  if (i === 0 || (i <= 2 && article.split("\n").slice(0, i).every(l => !l.trim()))) {
                    return (
                      <h3 key={i} className="text-xl font-bold text-stone-800 mb-4 leading-snug">
                        {line}
                      </h3>
                    );
                  }
                  return (
                    <p key={i} className="text-stone-700 leading-loose text-base mb-0">
                      {line}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
