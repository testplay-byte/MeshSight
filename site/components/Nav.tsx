"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { IconGithub, IconMenu, IconClose } from "@/components/Icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/guides", label: "Guides" },
  { href: "/design", label: "Design" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line-sidebar bg-bg-sidebar/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        {/* brand */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-bold tracking-wide text-white">
            MeshSight
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border-accent-lime/20 bg-accent-lime/[0.07] text-accent-lime"
                    : "border-transparent text-text-muted hover:bg-white/[0.04] hover:text-text-secondary"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/testplay-byte/MeshSight"
            target="_blank"
            rel="noreferrer"
            className="ml-2 flex items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-line-strong hover:text-white"
          >
            <IconGithub className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <nav className="border-t border-line-sidebar bg-bg-sidebar/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-lime/[0.07] text-accent-lime"
                    : "text-text-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {n.label}
                {active && <span className="live-dot text-accent-lime" />}
              </Link>
            );
          })}
          <a
            href="https://github.com/testplay-byte/MeshSight"
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <IconGithub className="h-4 w-4" />
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}
