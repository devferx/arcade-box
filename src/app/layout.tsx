import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ArcadeProvider } from "@/lib/context/arcade-context";
import Nav from "@/components/nav";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcade Box",
  description: "Play online and compete for the highest score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ArcadeProvider>
          <div className="av-bg" aria-hidden="true" />
          <div className="av-noise" aria-hidden="true" />
          <Nav />
          <main className="av-main">{children}</main>
          <footer
            style={{
              borderTop: "1px solid var(--line)",
              padding: "20px 32px",
              textAlign: "center",
              color: "var(--ink-faint)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              position: "relative",
              zIndex: 2,
            }}
          >
            © 2026 ARCADE BOX · HECHO CON PIXELES Y NEÓN · v1.0.0
          </footer>
        </ArcadeProvider>
      </body>
    </html>
  );
}
