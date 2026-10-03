"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

/**
 * In-page table of contents with scroll-spy: the section currently in
 * view is highlighted. Hidden on small screens (the article itself is the
 * focus there).
 */
export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="label-micro-bold mb-3">On this page</p>
      <ul className="custom-scrollbar flex max-h-[calc(100dvh-12rem)] flex-col gap-0.5 overflow-y-auto pr-1">
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block border-l-2 py-1.5 pl-3 text-xs leading-snug transition-all duration-200 ${
                  isActive
                    ? "border-accent-lime font-medium text-white"
                    : "border-line text-text-muted hover:border-line-strong hover:text-text-secondary"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
