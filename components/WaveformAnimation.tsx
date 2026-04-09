"use client";

import { useEffect, useRef } from "react";

interface WaveformAnimationProps {
  isRecording: boolean;
  analyser: AnalyserNode | null;
}

export default function WaveformAnimation({ isRecording, analyser }: WaveformAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !analyser || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationRef.current = requestAnimationFrame(draw);
      analyser!.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx!.clearRect(0, 0, width, height);

      const barCount = 40;
      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barHeight = Math.max(4, value * height * 0.9);
        const x = i * (barWidth + gap) + gap / 2;
        const y = (height - barHeight) / 2;

        const alpha = 0.5 + value * 0.5;
        ctx!.fillStyle = `rgba(245, 158, 11, ${alpha})`;
        ctx!.beginPath();
        ctx!.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx!.fill();
      }
    }

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, analyser]);

  if (!isRecording) return null;

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      className="w-full max-w-xs opacity-90"
    />
  );
}
