import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-xl w-full space-y-10">
        {/* Icon */}
        <div className="text-6xl">🎙️</div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">
            口述歷史訪問
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed">
            以聲音保育生命故事
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 text-left space-y-4">
          <p className="text-stone-700 leading-loose text-base">
            透過語音錄音，讓 AI 訪問員引導長者講述童年故事、鄉村記憶和家族文化，
            將珍貴的口述歷史結構化存檔，留存給下一代。
          </p>
          <ul className="space-y-2 text-stone-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">●</span>
              <span>按住錄音鍵，以廣東話自由講述</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">●</span>
              <span>AI 自動轉文字，生成追問問題</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">●</span>
              <span>全部對話自動儲存，隨時查閱</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/session/new"
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-colors shadow-md"
          >
            開始新訪問
          </Link>
          <Link
            href="/sessions"
            className="bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 font-semibold text-lg px-10 py-4 rounded-2xl transition-colors shadow-sm border border-stone-200"
          >
            查看訪問記錄
          </Link>
        </div>
      </div>
    </main>
  );
}
