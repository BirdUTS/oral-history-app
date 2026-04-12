"use client";

import { useState, useRef, useTransition } from "react";

export interface MemoryItem {
  id: string;
  file_name: string;
  file_path: string;
  file_type: "image" | "audio" | "document";
  mime_type: string;
  file_size: number;
  created_at: string;
}

interface Props {
  sessionId: string;
  initialItems: MemoryItem[];
}

const ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "application/pdf",
].join(",");

function fileTypeLabel(type: MemoryItem["file_type"]): string {
  if (type === "image") return "相片";
  if (type === "audio") return "聲音記錄";
  return "文件";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function proxyUrl(path: string): string {
  return `/api/memory-file?path=${encodeURIComponent(path)}`;
}

function ImageCard({ item, onDelete }: { item: MemoryItem; onDelete: () => void }) {
  return (
    <div className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyUrl(item.file_path)}
        alt={item.file_name}
        className="w-full h-36 object-cover"
      />
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <p className="text-xs text-stone-600 truncate">{item.file_name}</p>
        <button
          onClick={onDelete}
          className="shrink-0 text-stone-300 hover:text-red-400 transition-colors text-base leading-none"
          aria-label="刪除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AudioCard({ item, onDelete }: { item: MemoryItem; onDelete: () => void }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-500 text-lg shrink-0">♪</span>
          <p className="text-sm text-stone-700 truncate font-medium">{item.file_name}</p>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 text-stone-300 hover:text-red-400 transition-colors text-base leading-none"
          aria-label="刪除"
        >
          ✕
        </button>
      </div>
      <audio
        controls
        src={proxyUrl(item.file_path)}
        className="w-full h-8"
        preload="none"
      />
      <p className="text-xs text-stone-400">{formatSize(item.file_size)}</p>
    </div>
  );
}

function DocumentCard({ item, onDelete }: { item: MemoryItem; onDelete: () => void }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="shrink-0 w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500 font-bold text-xs">
        PDF
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 font-medium truncate">{item.file_name}</p>
        <p className="text-xs text-stone-400">{formatSize(item.file_size)}</p>
      </div>
      <a
        href={proxyUrl(item.file_path)}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors"
      >
        開啟
      </a>
      <button
        onClick={onDelete}
        className="shrink-0 text-stone-300 hover:text-red-400 transition-colors text-base leading-none"
        aria-label="刪除"
      >
        ✕
      </button>
    </div>
  );
}

export default function MemoryFileManager({ sessionId, initialItems }: Props) {
  const [items, setItems] = useState<MemoryItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const images = items.filter((i) => i.file_type === "image");
  const audios = items.filter((i) => i.file_type === "audio");
  const documents = items.filter((i) => i.file_type === "document");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch(`/api/sessions/${sessionId}/memory`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error ?? "上載失敗");
          break;
        }
        setItems((prev) => [...prev, data as MemoryItem]);
      } catch {
        setUploadError("上載時發生錯誤，請重試");
        break;
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(
        `/api/sessions/${sessionId}/memory/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    });
  }

  const isEmpty = items.length === 0;

  return (
    <div className="space-y-8">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center hover:border-amber-300 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-stone-400 text-sm">正在上載...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl">📎</p>
            <p className="text-stone-600 font-medium text-sm">點擊或拖放檔案至此</p>
            <p className="text-stone-400 text-xs">支援相片、聲音記錄及 PDF 文件，每個檔案上限 50 MB</p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{uploadError}</p>
      )}

      {/* Empty state */}
      {isEmpty && !uploading && (
        <div className="text-center py-10 text-stone-400 text-sm">
          尚未有任何記憶檔案，請上載相片、聲音或文件
        </div>
      )}

      {/* Photos */}
      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-700 flex items-center gap-2">
            <span>🖼</span> 相片
            <span className="text-xs font-normal text-stone-400">（{images.length}）</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((item) => (
              <ImageCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Audio */}
      {audios.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-700 flex items-center gap-2">
            <span>🎵</span> 聲音記錄
            <span className="text-xs font-normal text-stone-400">（{audios.length}）</span>
          </h2>
          <div className="space-y-2">
            {audios.map((item) => (
              <AudioCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-700 flex items-center gap-2">
            <span>📄</span> 文件
            <span className="text-xs font-normal text-stone-400">（{documents.length}）</span>
          </h2>
          <div className="space-y-2">
            {documents.map((item) => (
              <DocumentCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
