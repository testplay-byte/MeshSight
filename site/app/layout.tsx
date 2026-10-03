import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import { IconGithub } from "@/components/Icons";
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

const GITHUB = "https://github.com/testplay-byte/MeshSight";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="stage">
          <SiteNav />
          {/* The wizard supplies its own <main> (it hides site chrome), so
              this is a plain div for every other route — which is why those
              routes were missing a main landmark entirely. */}
          <div className="page-wrap fade-in">{children}</div>

          {/* footer */}
          <footer className="app-footer">
            <span className="l">MESHSIGHT — SELF-HOSTED OBJECT RECOGNITION</span>
            <div className="r">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="mono"
                style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                github.com/testplay-byte/MeshSight
              </a>
              <span className="live-dot sky" />
              <span className="live-lbl sky">Live</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
