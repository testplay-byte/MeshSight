"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrowRight, IconSearch } from "@/components/Icons";
import type { Guide } from "@/lib/guides";

/** Guides index — same rail language as the homepage flow. */
export default function GuideBrowser({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) =>
      [g.short, g.description, g.goal, g.time, ...g.inputs, ...g.outputs]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, guides]);

  return (
    <main id="main" className="flex flex-col">
      <div className="page-title">
        <div>
          <h1 className="display-h2">Guides</h1>
          <div className="sub" style={{ fontSize: 14, marginTop: 6 }}>
            Seven steps, one flow — each guide hands you the input the next one needs.
          </div>
        </div>
        {/* role="search" + a real label: a placeholder disappears on the
            first keystroke and is not a reliable accessible name. */}
        <div
          className="kp-field"
          role="search"
          style={{ width: 280, maxWidth: "100%" }}
        >
          <span className="lead">
            <IconSearch className="ic s" />
          </span>
          <label htmlFor="guide-search" className="sr-only">
            Search the guides
          </label>
          <input
            id="guide-search"
            className="kp-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps, files, tools…"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "70px 0" }}>
          <div className="eb">
            <IconSearch className="ic l" />
          </div>
          <h3>No steps match</h3>
          <p style={{ fontSize: 13 }}>
            Try a different word — or clear the search to see all seven.
          </p>
          <button className="btn-secondary" style={{ height: 40, fontSize: 13 }} onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="rail-flow" style={{ marginTop: 8 }}>
          {filtered.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="rail-row">
              <span className="rail-node">
                {String(g.step).padStart(2, "0")}
              </span>
              <span className="rail-title">{g.short}</span>
              <span className="rail-blurb">{g.description}</span>
              <span className="rail-meta">
                <span className="rail-time">{g.time}</span>
                {g.outputs.slice(0, 2).map((o) => (
                  <span key={o} className="rail-chip">{o}</span>
                ))}
              </span>
              <span className="rail-arrow">
                <IconArrowRight className="ic" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
