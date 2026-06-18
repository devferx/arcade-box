# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Box is a platform to play online and compete for the highest score. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

There is no test runner configured yet.

## Stack notes

- **Next.js 16** — uses the App Router. Pages live under `app/`. Read `node_modules/next/dist/docs/` before writing Next.js code; this version has breaking changes from prior releases.
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `app/globals.css` and `postcss.config.mjs`; no `tailwind.config.*` file. Theme tokens are defined with `@theme inline` in the CSS file, not in a JS config.
- **Path alias** — `@/*` maps to the project root (e.g. `@/app/...`, `@/components/...`).
- **Fonts** — Geist Sans and Geist Mono loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.
- **ESLint** — flat config (`eslint.config.mjs`) using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
