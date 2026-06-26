"use client";

import { useEffect, useState } from "react";
import { sendContactEmail } from "./actions";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function HighlightIcon({ kind }: { kind: "HEART" | "BROWSER" | "PLANT" }) {
  const C = "currentColor";
  if (kind === "HEART")
    return (
      <svg className="hl-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="2" y="3" width="4" height="2" />
          <rect x="10" y="3" width="4" height="2" />
          <rect x="1" y="4" width="2" height="4" />
          <rect x="13" y="4" width="2" height="4" />
          <rect x="2" y="8" width="2" height="2" />
          <rect x="12" y="8" width="2" height="2" />
          <rect x="3" y="9" width="10" height="2" />
          <rect x="4" y="11" width="8" height="2" />
          <rect x="5" y="12" width="6" height="2" />
          <rect x="6" y="13" width="4" height="1" />
          <rect x="7" y="14" width="2" height="1" />
        </g>
      </svg>
    );
  if (kind === "BROWSER")
    return (
      <svg className="hl-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect
            x="1"
            y="2"
            width="14"
            height="12"
            fill="none"
            stroke={C}
            strokeWidth="1.4"
          />
          <rect x="1" y="2" width="14" height="3" />
          <rect x="3" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="5" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="7" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="3" y="7" width="4" height="1" />
          <rect x="3" y="9" width="6" height="1" />
          <rect x="3" y="11" width="3" height="1" />
        </g>
      </svg>
    );
  if (kind === "PLANT")
    return (
      <svg className="hl-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="7" y="2" width="2" height="10" />
          <rect x="4" y="4" width="3" height="2" />
          <rect x="9" y="6" width="3" height="2" />
          <rect x="3" y="3" width="2" height="2" />
          <rect x="11" y="5" width="2" height="2" />
          <rect x="3" y="12" width="10" height="2" />
          <rect x="4" y="14" width="8" height="1" />
        </g>
      </svg>
    );
  return null;
}

const highlights: {
  i: "HEART" | "BROWSER" | "PLANT";
  t: string;
  c: string;
}[] = [
  { i: "HEART", t: "BUILT WITH LOVE FOR PLAYERS", c: "magenta" },
  { i: "BROWSER", t: "HTML GAMES — RUNS IN ANY BROWSER", c: "cyan" },
  { i: "PLANT", t: "A PROJECT IN CONSTANT GROWTH", c: "green" },
];

export default function AboutPage() {
  useReveal();

  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setPending(true);
    setError(null);
    const result = await sendContactEmail(form);
    setPending(false);
    if (result.ok) {
      setSent(form.name.trim());
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="about fade-in">
      {/* ABOUT */}
      <section className="about-hero">
        <div className="kicker pixel neon-yellow">▸ ABOUT</div>
        <h1 className="about-title">ABOUT ARCADE BOX</h1>
        <p className="about-mission">
          Arcade Box was born from a love of classic video games. Our mission is
          to preserve and celebrate the arcades that defined a generation —
          making them accessible to everyone, anywhere, for free.
        </p>

        <div className="highlight-row">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`highlight ${h.c}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <HighlightIcon kind={h.i} />
              <div className="hl-text pixel">{h.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="about-divider reveal" aria-hidden="true">
        <div className="div-bar" />
        <div className="div-pixels">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="div-bar" />
      </div>

      {/* CONTACT */}
      <section className="about-contact reveal">
        <div className="contact-grid">
          <div className="contact-intro">
            <div className="kicker pixel neon-cyan">▸ CONTACT</div>
            <h2 className="contact-title">GET IN TOUCH</h2>
            <p className="contact-sub">
              Have a suggestion, want to propose a game, or just want to say
              hello? Write to us.
            </p>
            <div className="contact-tips">
              <div className="tip">
                <span className="tip-led" />
                REPLY WITHIN 24–48 H
              </div>
              <div className="tip">
                <span className="tip-led y" />
                SUGGESTIONS WELCOME
              </div>
              <div className="tip">
                <span className="tip-led m" />
                NO SPAM, EVER
              </div>
            </div>
          </div>

          <form
            className={`contact-form${shake ? " shake" : ""}`}
            onSubmit={onSubmit}
          >
            {!sent ? (
              <>
                <div className="field">
                  <label htmlFor="cf-name">NAME</label>
                  <input
                    id="cf-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="px_kai"
                  />
                </div>
                <div className="field">
                  <label htmlFor="cf-email">EMAIL</label>
                  <input
                    id="cf-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="player@arcade.gg"
                  />
                </div>
                <div className="field">
                  <label htmlFor="cf-msg">MESSAGE</label>
                  <textarea
                    id="cf-msg"
                    rows={5}
                    value={form.msg}
                    onChange={(e) => setForm({ ...form, msg: e.target.value })}
                    placeholder="Tell us what's on your mind…"
                  />
                </div>
                <button
                  className="btn xl press"
                  type="submit"
                  style={{ width: "100%" }}
                  disabled={pending}
                >
                  {pending ? "SENDING…" : "▶  SEND MESSAGE"}
                </button>
                {error && (
                  <p
                    style={{
                      marginTop: 10,
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--magenta)",
                    }}
                  >
                    ✗ {error}
                  </p>
                )}
              </>
            ) : (
              <div className="terminal-success">
                <div className="term-bar">
                  <span className="dot r" />
                  <span className="dot y" />
                  <span className="dot g" />
                  <span className="term-title">ARCADE-OS // TERMINAL</span>
                </div>
                <div className="term-body">
                  <div className="line">
                    <span className="prompt">arcade@box:~$</span>
                    ./send_message --to=team
                  </div>
                  <div className="line dim">[OK] Connecting to server…</div>
                  <div className="line dim">[OK] Validating payload…</div>
                  <div className="line dim">[OK] Transmitting packet…</div>
                  <div className="line success">
                    &gt; MESSAGE RECEIVED. WE&apos;LL GET BACK TO YOU SOON.
                    THANKS, {sent.toUpperCase()}.
                    <span className="caret">_</span>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setSent(null);
                        setForm({ name: "", email: "", msg: "" });
                        setError(null);
                      }}
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
