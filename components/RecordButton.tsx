"use client";

type RecordState = "idle" | "recording" | "processing";

interface RecordButtonProps {
  state: RecordState;
  onStart: () => void;
  onStop: () => void;
}

export default function RecordButton({ state, onStart, onStop }: RecordButtonProps) {
  const isIdle = state === "idle";
  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isIdle) onStart();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isRecording) onStop();
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={isProcessing}
        className={[
          "relative w-32 h-32 rounded-full flex items-center justify-center",
          "transition-all duration-150 focus:outline-none touch-none",
          isIdle && "bg-amber-500 hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-200",
          isRecording && "bg-red-500 scale-110 shadow-xl shadow-red-200",
          isProcessing && "bg-stone-300 cursor-not-allowed",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={isIdle ? "按住錄音" : isRecording ? "放開完成" : "處理中"}
      >
        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
        )}

        {/* Icon */}
        {isProcessing ? (
          <svg
            className="w-10 h-10 text-stone-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <svg
            className={`w-12 h-12 ${isRecording ? "text-white" : "text-white"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
          </svg>
        )}
      </button>

      {/* Label */}
      <p className="text-stone-500 text-sm font-medium">
        {isIdle && "按住說話"}
        {isRecording && "放開完成"}
        {isProcessing && "正在聆聽..."}
      </p>
    </div>
  );
}
