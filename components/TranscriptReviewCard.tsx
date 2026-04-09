"use client";

import { useState } from "react";

export interface UncertainTerm {
  original: string;
  context: string;
  reason: string;
}

interface TranscriptReviewCardProps {
  terms: UncertainTerm[];
  onConfirm: (corrections: Record<string, string>) => void;
  onDismiss: () => void;
}

export default function TranscriptReviewCard({
  terms,
  onConfirm,
  onDismiss,
}: TranscriptReviewCardProps) {
  // editedValues maps original → current edited value
  const [editedValues, setEditedValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(terms.map((t) => [t.original, t.original]))
  );
  const [editingTerm, setEditingTerm] = useState<string | null>(null);

  if (terms.length === 0) return null;

  function handleChange(original: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [original]: value }));
  }

  function handleConfirm() {
    // Only pass back terms that were actually changed
    const corrections: Record<string, string> = {};
    for (const [orig, edited] of Object.entries(editedValues)) {
      if (edited.trim() && edited.trim() !== orig) {
        corrections[orig] = edited.trim();
      }
    }
    onConfirm(corrections);
  }

  const hasChanges = Object.entries(editedValues).some(
    ([orig, edited]) => edited.trim() && edited.trim() !== orig
  );

  return (
    <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-50 border-b border-amber-100">
        <span className="text-base">✏️</span>
        <p className="text-sm font-semibold text-amber-800 flex-1">
          請確認以下字詞是否正確
        </p>
        <button
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600 text-xs transition-colors"
        >
          跳過
        </button>
      </div>

      {/* Terms list */}
      <div className="divide-y divide-stone-100">
        {terms.map((term) => {
          const isEditing = editingTerm === term.original;
          const currentValue = editedValues[term.original] ?? term.original;
          const isChanged = currentValue.trim() !== term.original;

          return (
            <div key={term.original} className="px-5 py-4 space-y-2">
              {/* Context sentence */}
              <p className="text-xs text-stone-400 leading-relaxed">
                上下文：「{term.context}」
              </p>

              {/* Term row */}
              <div className="flex items-center gap-3">
                {/* Original label */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-xs text-stone-400">原文</span>
                  <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-1 rounded-lg">
                    {term.original}
                  </span>
                </div>

                <span className="text-stone-300 text-sm">→</span>

                {/* Editable correction field */}
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={currentValue}
                    onChange={(e) => handleChange(term.original, e.target.value)}
                    onBlur={() => setEditingTerm(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingTerm(null);
                      if (e.key === "Escape") {
                        handleChange(term.original, term.original);
                        setEditingTerm(null);
                      }
                    }}
                    className="flex-1 border border-amber-300 rounded-lg px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                ) : (
                  <button
                    onClick={() => setEditingTerm(term.original)}
                    className={[
                      "flex-1 text-left border rounded-lg px-3 py-1.5 text-sm transition-colors",
                      isChanged
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-300 hover:bg-amber-50",
                    ].join(" ")}
                  >
                    {currentValue}
                    {isChanged && (
                      <span className="ml-1.5 text-xs text-green-500">✓ 已更改</span>
                    )}
                    {!isChanged && (
                      <span className="ml-1.5 text-xs text-stone-400">點擊更正</span>
                    )}
                  </button>
                )}

                {/* Reset button if changed */}
                {isChanged && !isEditing && (
                  <button
                    onClick={() => handleChange(term.original, term.original)}
                    className="shrink-0 text-stone-300 hover:text-stone-500 text-xs transition-colors"
                    title="還原"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Reason */}
              <p className="text-xs text-stone-400 italic">{term.reason}</p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
        <button
          onClick={handleConfirm}
          className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {hasChanges ? "確認更改" : "所有正確，繼續"}
        </button>
      </div>
    </div>
  );
}
