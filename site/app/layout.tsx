import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import { IconDownload } from "@/components/Icons";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MeshSight — Train your own object recognition",
    template: "%s | MeshSight",
  },
  description:
    "A complete, self-hosted pipeline for custom object detectors: annotate photos, split and cluster datasets in Colab, train YOLO, run it on your phone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        {/* Root: flex column, footer pinned to bottom (§4.1) */}
        <div className="relative flex min-h-dvh flex-col noise-bg grid-pattern">
          {/* Ambient orbs (§14.3) */}
          <div className="orb orb-lime -top-32 -left-32 h-64 w-64" />
          <div className="orb orb-sky -bottom-40 -right-24 h-64 w-64" />
          <div className="orb orb-coral top-1/3 left-1/2 h-96 w-96" />

          <Nav />

          {/* Main scrolls; content width capped at 1400 (§4.3) */}
          <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 pb-20 pt-10 sm:px-6">
            {children}
          </main>

          {/* Footer: shrink-0, never position:sticky (§4.1, §20) */}
          <footer className="relative z-10 shrink-0 border-t border-line-sidebar bg-bg-sidebar/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="label-micro">
                  MeshSight — your data stays on your machine
                </span>
              </div>
              <div className="flex items-center gap-5">
                <Link
                  href="/guides"
                  className="text-xs font-medium text-text-muted transition-colors hover:text-white"
                >
                  Guides
                </Link>
                <Link
                  href="/design"
                  className="text-xs font-medium text-text-muted transition-colors hover:text-white"
                >
                  Design
                </Link>
                <a
                  href="https://github.com/testplay-byte/MeshSight/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent-lime transition-colors hover:text-accent-lime-bright"
                >
                  <IconDownload className="h-3.5 w-3.5" />
                  Download the APK
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
