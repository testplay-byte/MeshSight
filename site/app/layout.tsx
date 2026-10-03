import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Logo from "@/components/Logo";
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

const NAV = [
  { href: "/", label: "Home" },
  { href: "/guides", label: "Guides" },
  { href: "/design", label: "Design" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <div className="relative flex min-h-dvh flex-col noise-bg grid-pattern">
          <div className="orb orb-mint top-[-80px] left-[-80px] h-72 w-72" />
          <div className="orb orb-sky bottom-[-100px] right-[-60px] h-80 w-80" />

          {/* header */}
          <header className="relative z-10 border-b border-white/[0.06] bg-bg-sidebar/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <Logo className="h-9 w-9 rounded-[10px]" />
                <span className="text-sm font-bold tracking-wide text-white">
                  MeshSight
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {n.label}
                  </Link>
                ))}
                <a
                  href="https://github.com/testplay-byte/MeshSight"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 hidden items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-accent-mint/40 hover:text-white sm:flex"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </header>

          {/* content */}
          <main className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 pt-8 sm:px-6">
            {children}
          </main>

          {/* footer */}
          <footer className="relative z-10 border-t border-white/[0.06] bg-bg-sidebar/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-text-muted sm:flex-row">
              <span>
                MeshSight — self-trainable object recognition. Data stays on
                your machine.
              </span>
              <a
                href="https://github.com/testplay-byte/MeshSight/releases"
                target="_blank"
                rel="noreferrer"
                className="text-accent-mint-soft transition-colors hover:text-white"
              >
                Download the latest APK →
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
