"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useArcade } from "@/lib/context/arcade-context";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useArcade();

  const [tab, setTab] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    login({ name: (username || "PLAYER1").toUpperCase().slice(0, 10) });
    router.push("/");
  }

  function playAsGuest() {
    router.push("/");
  }

  return (
    <div
      className="av-auth-wrap fade-in"
      style={{ position: "relative", zIndex: 2 }}
    >
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark" />
          <h2 className="neon-cyan">ARCADE BOX</h2>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.16em",
              marginTop: 6,
            }}
          >
            SYSTEM ACCESS · v1.0
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={tab === "in" ? "on" : ""}
            onClick={() => setTab("in")}
            type="button"
          >
            SIGN IN
          </button>
          <button
            className={tab === "up" ? "on" : ""}
            onClick={() => setTab("up")}
            type="button"
          >
            REGISTER
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="px_kai"
              autoComplete="username"
            />
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@arcade.gg"
                autoComplete="email"
              />
            </div>
          )}
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
            />
          </div>

          <button
            className="btn lg"
            type="submit"
            style={{ width: "100%", marginTop: 8 }}
          >
            {tab === "in" ? "ENTER THE BOX" : "CREATE & PLAY"}
          </button>
        </form>

        <button
          className="btn ghost"
          type="button"
          style={{ width: "100%", marginTop: 10 }}
          onClick={playAsGuest}
        >
          PLAY AS GUEST
        </button>

        <div className="auth-divider">OR CONTINUE WITH</div>

        <div className="social">
          <button className="btn ghost" type="button">
            ◆&nbsp; GOOGLE
          </button>
          <button className="btn ghost" type="button">
            ▣&nbsp; GITHUB
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-faint)",
            letterSpacing: "0.1em",
          }}
        >
          BY SIGNING IN YOU ACCEPT THE ARCADE HALL TERMS
        </div>
      </div>
    </div>
  );
}
