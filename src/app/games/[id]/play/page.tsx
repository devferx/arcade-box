"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES } from "@/lib/data";
import { useArcade } from "@/lib/context/arcade-context";
import AsteroidsCanvas from "@/games/asteroids/AsteroidsCanvas";
import type { EngineState } from "@/games/asteroids/engine";

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, saveScore } = useArcade();
  const { id } = use(params);
  const game = GAMES.find((g) => g.id === id);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [name, setName] = useState(user ? user.name : "PLAYER");
  const [saved, setSaved] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function endGame() {
    setOver(true);
  }

  function handleEngineStateChange(state: EngineState) {
    setScore(state.score);
    setLives(state.lives);
    setLevel(state.level);
  }

  function restart() {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPaused(false);
    setOver(false);
    setSaved(false);
    setRestartKey((k) => k + 1);
  }

  function handleSave() {
    if (!game) return;
    saveScore({ game: game.id, score, name });
    setSaved(true);
  }

  if (!game) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "120px 32px",
          color: "var(--ink-faint)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="pixel" style={{ fontSize: 14, color: "var(--magenta)", marginBottom: 12 }}>
          GAME NOT FOUND
        </div>
        <button className="btn ghost" onClick={() => router.push("/")}>
          BACK TO LIBRARY
        </button>
      </div>
    );
  }

  return (
    <div className="av-player fade-in" style={{ position: "relative", zIndex: 2 }}>
      <div className="player-hud">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div className="hud-stat">
            <div className="l">Player</div>
            <div className="v" style={{ color: "var(--ink)" }}>
              {name}
            </div>
          </div>
          <div className="hud-stat">
            <div className="l">Score</div>
            <div className="v">{score.toLocaleString()}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Lives</div>
            <div className="v">{"♥ ".repeat(lives).trim()}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Level</div>
            <div className="v">{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button className="btn yellow" onClick={() => setPaused((p) => !p)}>
            {paused ? "RESUME" : "PAUSE"}
          </button>
          <button className="btn magenta" onClick={endGame}>
            END
          </button>
          <button className="btn ghost" onClick={() => router.push(`/games/${game.id}`)}>
            EXIT
          </button>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <div className="crt-content">
            {game.id === "asteroids" ? (
              <AsteroidsCanvas
                key={restartKey}
                paused={paused}
                onStateChange={handleEngineStateChange}
                onGameOver={endGame}
              />
            ) : (
              <div style={{ textAlign: "center" }}>
                <div className="pixel neon-cyan flicker" style={{ fontSize: 18, marginBottom: 16 }}>
                  {game.title}
                </div>
                <div
                  className="pixel"
                  style={{
                    fontSize: 11,
                    color: "var(--magenta)",
                    letterSpacing: "0.2em",
                    marginBottom: 24,
                  }}
                >
                  COMING SOON
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-faint)",
                    letterSpacing: "0.14em",
                  }}
                >
                  GAME ENGINE NOT INSTALLED
                </div>
              </div>
            )}
          </div>

          {paused && (
            <div className="crt-content" style={{ background: "rgba(0,0,0,0.75)", zIndex: 5 }}>
              <div style={{ textAlign: "center" }}>
                <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                  PAUSED
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-dim)",
                    marginTop: 10,
                    letterSpacing: "0.16em",
                  }}
                >
                  PRESS RESUME TO CONTINUE
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="crt-bottom">
          <span className="led">SIGNAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>LOAD · 1MB</span>
        </div>
      </div>

      {over && (
        <div className="modal-bd">
          <div className="modal">
            <h2>GAME OVER</h2>
            <div className="final-label">FINAL SCORE</div>
            <div className="final">{score.toLocaleString()}</div>

            {!saved ? (
              <div className="input-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="YOUR INITIALS"
                />
                <button className="btn yellow" onClick={handleSave}>
                  SAVE SCORE
                </button>
              </div>
            ) : (
              <div className="toast-saved">▸ SCORE SAVED_</div>
            )}

            <div className="actions">
              <button className="btn" onClick={restart}>
                PLAY AGAIN
              </button>
              <button className="btn magenta" onClick={() => router.push("/")}>
                BACK TO LIBRARY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
