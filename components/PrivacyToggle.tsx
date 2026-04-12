"use client";

import { useState, useTransition } from "react";

interface PrivacyToggleProps {
  sessionId: string;
  initialIsPrivate: boolean;
}

export default function PrivacyToggle({ sessionId, initialIsPrivate }: PrivacyToggleProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !isPrivate;
    setIsPrivate(next);
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_private: next }),
      });

      if (!res.ok) {
        // Revert on failure
        setIsPrivate(!next);
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "更新失敗，請重試");
      }
    });
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-stone-700">私密訪問</p>
          <p className="text-xs text-stone-400">
            {isPrivate ? "此訪問已隱藏於記錄列表" : "此訪問顯示於記錄列表"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPrivate}
          onClick={toggle}
          disabled={isPending}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
            isPrivate ? "bg-amber-500" : "bg-stone-200"
          } disabled:opacity-50`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isPrivate ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
