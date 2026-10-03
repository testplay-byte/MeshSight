"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

/**
 * In-page table of contents with scroll-spy, styled as a sidebar section.
 * The scroll container is main.page — sections get scroll-margin-top in CSS.
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
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="On this page" style={{ position: "sticky", top: 8 }}>
      <div className="nav-label">On this page</div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                style={{
                  display: "block",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: isActive ? "var(--color-accent-lime)" : "var(--color-text-muted)",
                  background: isActive ? "rgba(188,255,95,0.07)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(188,255,95,0.15)" : "transparent"}`,
                  transition: "all .2s",
                }}
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
