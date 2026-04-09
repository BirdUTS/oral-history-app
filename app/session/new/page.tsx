"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSessionPage() {
  const router = useRouter();
  const [subjectName, setSubjectName] = useState("");
  const [subjectAge, setSubjectAge] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectName.trim()) {
      setError("請輸入受訪者姓名");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_name: subjectName.trim(),
          subject_age: subjectAge ? parseInt(subjectAge, 10) : null,
          village: village.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "未知錯誤");

      router.push(`/session/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "建立訪問失敗，請重試");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Back link */}
        <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 transition-colors">
          ← 返回
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-800">開始新訪問</h1>
          <p className="text-stone-500 text-base">請填寫受訪者的基本資料</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="subjectName" className="block text-stone-700 font-medium text-base">
              受訪者姓名 <span className="text-red-400">*</span>
            </label>
            <input
              id="subjectName"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="例：陳婆婆"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subjectAge" className="block text-stone-700 font-medium text-base">
              年齡 <span className="text-stone-400 font-normal text-sm">（可選）</span>
            </label>
            <input
              id="subjectAge"
              type="number"
              min={1}
              max={120}
              value={subjectAge}
              onChange={(e) => setSubjectAge(e.target.value)}
              placeholder="例：82"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="village" className="block text-stone-700 font-medium text-base">
              村落 / 地區 <span className="text-stone-400 font-normal text-sm">（可選）</span>
            </label>
            <input
              id="village"
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="例：元朗廈村"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300 text-white font-semibold text-lg py-4 rounded-2xl transition-colors shadow-md"
          >
            {loading ? "正在建立..." : "開始訪問"}
          </button>
        </form>
      </div>
    </main>
  );
}
