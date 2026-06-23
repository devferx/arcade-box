"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { GAMES, CATS, type Game } from "@/lib/data";

function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  }

  function onMouseLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      className="card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => router.push(`/games/${game.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="cover">
        <div className={`cover-bg ${game.cover}`} />
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>BEST SCORE</span>
            <b>{game.best.toLocaleString()}</b>
          </div>
          <button
            className={`btn${game.color === "magenta" ? " magenta" : game.color === "yellow" ? " yellow" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/games/${game.id}`);
            }}
          >
            PLAY
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  const filtered = useMemo(
    () =>
      GAMES.filter(
        (g) =>
          (cat === "ALL" || g.cat === cat) &&
          g.title.toLowerCase().includes(q.toLowerCase())
      ),
    [q, cat]
  );

  return (
    <div className="fade-in" style={{ position: "relative", zIndex: 2 }}>
      <section className="av-hero">
        <h1 className="flicker">ARCADE BOX</h1>
        <div className="sub">
          INSERT COIN TO PLAY <span className="blink">_</span>
        </div>
      </section>

      <div className="av-filters">
        <div className="av-search">
          <span className="ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a game by name…"
          />
        </div>
        <div className="av-chips">
          {CATS.map((c) => (
            <button
              key={c}
              className={"chip" + (cat === c ? " active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="av-grid">
        {filtered.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 80,
              color: "var(--ink-faint)",
            }}
          >
            <div
              className="pixel"
              style={{ fontSize: 14, color: "var(--magenta)", marginBottom: 12 }}
            >
              NO RESULTS
            </div>
            <div>Try a different search or category.</div>
          </div>
        )}
      </div>
    </div>
  );
}
