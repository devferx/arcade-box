"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  name: string;
}

interface ScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface ArcadeContextValue {
  user: User | null;
  login: (u: User) => void;
  signOut: () => void;
  scores: ScoreEntry[];
  saveScore: (entry: Omit<ScoreEntry, "at">) => void;
}

const ArcadeContext = createContext<ArcadeContextValue | null>(null);

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("av_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    try {
      const stored = localStorage.getItem("av_scores");
      if (stored) setScores(JSON.parse(stored));
    } catch {}
  }, []);

  function login(u: User) {
    setUser(u);
    localStorage.setItem("av_user", JSON.stringify(u));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("av_user");
  }

  function saveScore(entry: Omit<ScoreEntry, "at">) {
    const newEntry: ScoreEntry = { ...entry, at: Date.now() };
    setScores((prev) => {
      const updated = [...prev, newEntry];
      localStorage.setItem("av_scores", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <ArcadeContext.Provider value={{ user, login, signOut, scores, saveScore }}>
      {children}
    </ArcadeContext.Provider>
  );
}

export function useArcade(): ArcadeContextValue {
  const ctx = useContext(ArcadeContext);
  if (!ctx) throw new Error("useArcade must be used inside ArcadeProvider");
  return ctx;
}
