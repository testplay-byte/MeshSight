"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import {
  IconBook,
  IconDash,
  IconGithub,
} from "@/components/Icons";

const NAV = [
  { href: "/", label: "Home", Icon: IconDash },
  { href: "/guides", label: "Guides", Icon: IconBook },
];

const GITHUB = "https://github.com/testplay-byte/MeshSight";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Ambient orbs (§14.3) */}
      <div className="orb orb-lime" />
      <div className="orb orb-sky" />
      <div className="orb orb-coral" />

      {/* App frame (§4.1) — full-bleed, edge to edge */}
      <div className="frame noise-bg grid-pattern">
        <div className="body-row">
          {/* ── Sidebar (desktop, §16.1) ─────────────────────────── */}
          <aside className="sidebar">
            <div className="side-head">
              <Logo className="h-8 w-8 rounded-lg" />
              <span className="brand-name">MeshSight</span>
            </div>
            <nav className="side-nav custom-scrollbar">
              <div className="nav-label">Navigation</div>
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item${isActive(pathname, href) ? " active" : ""}`}
                >
                  <Icon className="ic" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="nav-label" style={{ marginTop: 20 }}>
                External
              </div>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="nav-item">
                <IconGithub className="ic" />
                <span>Repository</span>
              </a>
              <a
                href={`${GITHUB}/releases`}
                target="_blank"
                rel="noreferrer"
                className="nav-item"
              >
                <IconBook className="ic" />
                <span>Download APK</span>
              </a>
            </nav>
            <div className="side-stats">
              <h4>At a glance</h4>
              <div className="kv-row">
                <span className="k">Pipeline steps</span>
                <span className="v">7</span>
              </div>
              <div className="kv-row">
                <span className="k">Colab stages</span>
                <span className="v sky">10</span>
              </div>
              <div className="kv-row">
                <span className="k">Your data</span>
                <span className="v lime">local</span>
              </div>
              <div className="kv-row" style={{ marginBottom: 0 }}>
                <span className="k">APK build</span>
                <span className="v">CI</span>
              </div>
            </div>
          </aside>

          {/* ── Main column ──────────────────────────────────────── */}
          <div className="main-col">
            {/* Mobile header (§16.2) */}
            <div className="mobile-head">
              <div className="brand">
                <Logo className="h-8 w-8 rounded-lg" />
                <span>MeshSight</span>
              </div>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="icon-btn"
                aria-label="GitHub repository"
              >
                <IconGithub className="ic" />
              </a>
            </div>
            {/* Mobile tab bar (§16.2) */}
            <div className="tabbar">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={isActive(pathname, href) ? "active" : undefined}
                >
                  <Icon className="ic s" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Scrolling content */}
            <main className="page custom-scrollbar fade-in" key={pathname}>
              {children}
            </main>

            {/* Footer (sticky via flex, §4.1) */}
            <footer className="app-footer">
              <span className="l">MESHSIGHT — SELF-HOSTED OBJECT RECOGNITION</span>
              <div className="r">
                <span className="mono">APK on GitHub Releases</span>
                <span className="live-dot sky" />
                <span className="live-lbl sky">Live</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
