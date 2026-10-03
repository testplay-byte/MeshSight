"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { IconGithub } from "@/components/Icons";

const GITHUB = "https://github.com/testplay-byte/MeshSight";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/guides", label: "Guides" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Floating rounded glass navigation bar (top, inset on all corners). */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <Link href="/" className="brand">
        <Logo className="h-8 w-8 rounded-lg" />
        <span>MeshSight</span>
      </Link>

      <div className="links">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${isActive(pathname, href) ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}
        <a
          href={`${GITHUB}/releases`}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{ height: 38, fontSize: 13, padding: "0 16px", marginLeft: 8 }}
        >
          Get the APK
        </a>
        <a
          href={GITHUB}
          target="_blank"
          rel="noreferrer"
          className="icon-btn"
          aria-label="GitHub repository"
          style={{ marginLeft: 4 }}
        >
          <IconGithub className="ic" />
        </a>
      </div>
    </nav>
  );
}
