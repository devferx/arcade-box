"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useArcade } from "@/lib/context/arcade-context";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useArcade();

  const isLibrary = pathname.startsWith("/games");
  const isHall = pathname === "/hall-of-fame";
  const isAuth = pathname === "/auth";

  function close() {
    setOpen(false);
  }

  return (
    <>
      <nav className="av-nav" style={{ position: "relative", zIndex: 50 }}>
        <Link href="/" className="logo">
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">BOX</span>
          </div>
        </Link>

        <div className="links">
          <Link href="/games" className={isLibrary ? "active" : ""}>
            Library
          </Link>
          <Link href="/hall-of-fame" className={isHall ? "active" : ""}>
            Hall of Fame
          </Link>
        </div>

        <div className="spacer" />

        <div className="coin-counter">
          <span className="coin" />
          <span>CREDITS · 03</span>
        </div>

        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Sign In
          </Link>
        )}

        <button
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menu"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
        aria-hidden="true"
        style={{ zIndex: 55 }}
      />

      <aside
        className={"av-mobile-panel" + (open ? " open" : "")}
        style={{ zIndex: 60 }}
      >
        <div
          className="pixel neon-cyan"
          style={{ fontSize: 11, marginBottom: 16 }}
        >
          MENU
        </div>
        <Link href="/games" className={isLibrary ? "active" : ""} onClick={close}>
          Library
        </Link>
        <Link
          href="/hall-of-fame"
          className={isHall ? "active" : ""}
          onClick={close}
        >
          Hall of Fame
        </Link>
        <Link href="/auth" className={isAuth ? "active" : ""} onClick={close}>
          {user ? "Account" : "Sign In"}
        </Link>
        <div style={{ flex: 1 }} />
        <div
          className="pixel"
          style={{
            fontSize: 9,
            color: "var(--ink-faint)",
            letterSpacing: "0.16em",
          }}
        >
          CREDITS · 03
        </div>
      </aside>
    </>
  );
}
