import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MemoryFileManager, { MemoryItem } from "@/components/MemoryFileManager";

async function getSession(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, subject_name, subject_age, village")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as { id: string; subject_name: string; subject_age: number | null; village: string | null };
}

async function getMemoryItems(sessionId: string): Promise<MemoryItem[]> {
  const { data, error } = await supabase
    .from("memory_items")
    .select("id, file_name, file_path, file_type, mime_type, file_size, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as MemoryItem[];
}

export default async function MemoryFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, items] = await Promise.all([getSession(id), getMemoryItems(id)]);

  if (!session) notFound();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link
            href={`/sessions/${id}`}
            className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
          >
            ← 返回訪問詳情
          </Link>
          <div className="flex items-start justify-between gap-4 pt-1">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">記憶檔案</h1>
              <p className="text-stone-500 text-sm mt-1">
                {session.subject_name}
                {session.subject_age && <span className="ml-2">{session.subject_age} 歲</span>}
                {session.village && <span className="ml-2">📍 {session.village}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-stone-600 leading-relaxed">
          上載受訪者的相片、聲音記錄或文件，讓 AI 訪問員在訪談前了解其背景，提出更貼切的問題。
        </div>

        {/* File manager */}
        <MemoryFileManager sessionId={id} initialItems={items} />
      </div>
    </main>
  );
}
