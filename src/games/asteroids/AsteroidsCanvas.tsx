"use client";

import { useEffect, useRef } from "react";
import { AsteroidsEngine, type EngineState } from "./engine";

interface AsteroidsCanvasProps {
  paused: boolean;
  onStateChange: (state: EngineState) => void;
  onGameOver: (finalScore: number) => void;
}

export default function AsteroidsCanvas({
  paused,
  onStateChange,
  onGameOver,
}: AsteroidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AsteroidsEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new AsteroidsEngine({
      canvas: canvasRef.current,
      onStateChange,
      onGameOver,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <canvas ref={canvasRef} width={800} height={600} style={{ width: "100%", height: "100%" }} />
  );
}
