import Link from "next/link";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ─── Section 1: The Question ─── */}
      <section className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 py-24 text-center relative">
        {/* Badge */}
        <div className="mb-10">
          <span className="inline-block border border-amber-500/40 text-amber-400 text-xs font-medium tracking-[0.2em] px-5 py-2 rounded-full">
            社區口述歷史計劃
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight max-w-2xl">
          香港嘅歷史，<br />
          <span className="text-amber-400">係誰人寫嘅？</span>
        </h1>

        {/* Body */}
        <p className="mt-10 max-w-lg text-stone-400 text-lg leading-8">
          官方記錄給了我們年份、數字、事件。
          <br className="hidden sm:block" />
          但屬於這座城市的記憶——
          <br className="hidden sm:block" />
          街角的氣味、市場的叫賣聲、已拆掉的老屋——
          <br className="hidden sm:block" />
          從來不在那裡。
        </p>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-stone-600 animate-bounce">
          <div className="w-px h-8 bg-stone-700 mx-auto" />
          <span className="text-xs tracking-widest">向下</span>
        </div>
      </section>

      {/* ─── Section 2: The Insight ─── */}
      <section className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full mx-auto space-y-14">

          {/* Network illustration */}
          <div className="relative">
            <svg viewBox="0 0 440 280" className="w-full max-w-md mx-auto" aria-hidden="true">
              {/* Lines — person to topic */}
              <line x1="220" y1="140" x2="90"  y2="60"  stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1="220" y1="140" x2="350" y2="60"  stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1="220" y1="140" x2="50"  y2="190" stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1="220" y1="140" x2="390" y2="190" stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1="220" y1="140" x2="155" y2="240" stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1="220" y1="140" x2="290" y2="240" stroke="#d6d3d1" strokeWidth="1.5" />

              {/* Cross-connections (shared memories) */}
              <line x1="90"  y1="60"  x2="350" y2="60"  stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
              <line x1="50"  y1="190" x2="155" y2="240" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.5" />
              <line x1="350" y1="60"  x2="390" y2="190" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4" />

              {/* Central node — topic */}
              <circle cx="220" cy="140" r="26" fill="#f59e0b" />
              <text x="220" y="136" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">筲箕灣</text>
              <text x="220" y="150" textAnchor="middle" fontSize="9"  fill="white" opacity="0.8">碼頭</text>

              {/* Person nodes — highlighted pair */}
              <circle cx="90"  cy="60"  r="16" fill="#292524" />
              <text x="90"  cy="60"  y="64"  textAnchor="middle" fontSize="9" fill="white">陳婆婆</text>

              <circle cx="350" cy="60"  r="16" fill="#292524" />
              <text x="350" cy="60"  y="64"  textAnchor="middle" fontSize="9" fill="white">李伯伯</text>

              {/* Other people — greyed */}
              <circle cx="50"  cy="190" r="12" fill="#a8a29e" />
              <text x="50"  y="215" textAnchor="middle" fontSize="8" fill="#a8a29e">王叔</text>

              <circle cx="390" cy="190" r="12" fill="#a8a29e" />
              <text x="390" y="215" textAnchor="middle" fontSize="8" fill="#a8a29e">梁姐</text>

              <circle cx="155" cy="240" r="12" fill="#a8a29e" />
              <text x="155" y="264" textAnchor="middle" fontSize="8" fill="#a8a29e">張伯</text>

              <circle cx="290" cy="240" r="12" fill="#a8a29e" />
              <text x="290" y="264" textAnchor="middle" fontSize="8" fill="#a8a29e">黃婆婆</text>
            </svg>

            {/* Caption for the amber dashed line */}
            <p className="text-center text-xs text-amber-600 tracking-wide mt-2">
              — — 共同記憶的連結
            </p>
          </div>

          {/* Text */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight">
              歷史唔係一條線，<br />
              <span className="text-amber-500">係一張網。</span>
            </h2>
            <div className="space-y-4 text-stone-500 text-base leading-8 max-w-md mx-auto">
              <p>
                陳婆婆記得筲箕灣碼頭的鹹魚氣味。<br />
                李伯伯記得那裡最後一班渡輪開走的日子。
              </p>
              <p className="text-stone-700 font-medium">
                他們從未相識，但他們的記憶，<br />
                在同一個地方相遇。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: The Mission ─── */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full mx-auto space-y-16 text-center">

          <div className="space-y-5">
            <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight">
              我哋做嘅，係建立
              <br />
              <span className="text-amber-500">一個屬於香港人的</span>
              <br />
              真正歷史。
            </h2>
            <p className="text-stone-500 text-base leading-7 max-w-md mx-auto">
              將散落於不同人、不同街道、不同年代的記憶碎片，
              收集起來，讓它們互相找到彼此。
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-stone-50 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">🎙</div>
              <h3 className="font-semibold text-stone-800 text-base">口述訪問</h3>
              <p className="text-stone-500 text-sm leading-6">
                以聲音記錄每位長者的親歷記憶。AI 訪問員細心引導，讓故事自然流露。
              </p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">🔗</div>
              <h3 className="font-semibold text-stone-800 text-base">AI 發現連結</h3>
              <p className="text-stone-500 text-sm leading-6">
                自動分析逐字稿，找出不同受訪者之間隱藏的共同地點、食物與事件。
              </p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">🌐</div>
              <h3 className="font-semibold text-stone-800 text-base">社區共同歷史</h3>
              <p className="text-stone-500 text-sm leading-6">
                讓記憶不再孤立。有共同回憶的人，在這裡找到彼此，延續那段歷史。
              </p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="border-t border-stone-100 pt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-500">∞</p>
              <p className="text-xs text-stone-400 mt-1">每段記憶都有價值</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-stone-700">×</p>
              <p className="text-xs text-stone-400 mt-1">記憶與記憶相乘</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">1</p>
              <p className="text-xs text-stone-400 mt-1">屬於社區的歷史</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: CTA ─── */}
      <section className="min-h-screen bg-stone-900 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl w-full space-y-12">

          <div className="space-y-6">
            <p className="text-amber-400/70 text-sm tracking-[0.2em] font-medium">
              加入我們
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              您身邊，有沒有
              <br />
              一個值得被記錄
              <br />
              <span className="text-amber-400">的故事？</span>
            </h2>
            <p className="text-stone-400 text-base leading-7 max-w-sm mx-auto">
              每一段記憶，都是香港歷史拼圖的一塊。
              <br />
              讓我們一起，把它留下來。
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/session/new"
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-colors shadow-lg"
            >
              開始訪問長者
            </Link>
            <Link
              href="/sessions"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition-colors border border-white/20"
            >
              查看訪問記錄
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-stone-600 text-xs leading-6">
            口述歷史計劃 · 以聲音保育社區記憶
            <br />
            所有記錄預設公開，共同建構香港社區歷史
          </p>
        </div>
      </section>

    </div>
  );
}
