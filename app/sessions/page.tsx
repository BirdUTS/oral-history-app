import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Session {
  id: string;
  subject_name: string;
  subject_age: number | null;
  village: string | null;
  created_at: string;
  segment_count: number;
}

async function getSessions(): Promise<Session[]> {
  // Fetch sessions with segment count via a join
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, subject_name, subject_age, village, created_at")
    .order("created_at", { ascending: false });

  if (error || !sessions) return [];

  // Fetch segment counts for all sessions
  const { data: counts } = await supabase
    .from("segments")
    .select("session_id");

  const countMap: Record<string, number> = {};
  if (counts) {
    for (const row of counts) {
      countMap[row.session_id] = (countMap[row.session_id] ?? 0) + 1;
    }
  }

  return sessions.map((s) => ({ ...s, segment_count: countMap[s.id] ?? 0 }));
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
              ← 返回主頁
            </Link>
            <h1 className="text-3xl font-bold text-stone-800">訪問記錄</h1>
          </div>
          <Link
            href="/session/new"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            + 新訪問
          </Link>
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">📭</div>
            <p className="text-stone-400 text-lg">尚未有任何訪問記錄</p>
            <Link
              href="/session/new"
              className="inline-block text-amber-500 hover:text-amber-600 font-medium text-base transition-colors"
            >
              開始第一次訪問 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/sessions/${session.id}`} className="space-y-1 flex-1 min-w-0 group">
                    <h2 className="text-xl font-semibold text-stone-800 truncate group-hover:text-amber-600 transition-colors">
                      {session.subject_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
                      {session.subject_age && (
                        <span>{session.subject_age} 歲</span>
                      )}
                      {session.village && (
                        <span>📍 {session.village}</span>
                      )}
                      <span className="text-amber-500">
                        {session.segment_count > 0
                          ? `${session.segment_count} 段對話`
                          : "未開始"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {formatDate(session.created_at)}
                    </p>
                  </Link>
                  <Link
                    href={`/session/${session.id}`}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                  >
                    繼續訪問
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
