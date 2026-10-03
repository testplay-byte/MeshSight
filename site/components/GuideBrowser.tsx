"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconArrowRight,
  IconSearch,
} from "@/components/Icons";
import type { Guide } from "@/lib/guides";

/**
 * Guides index: one bold row per step. Search filters by name or artifacts.
 */
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
    <div className="flex flex-col" style={{ maxWidth: 980 }}>
      <div
        className="page-title"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 20 }}
      >
        <div>
          <h1 className="display-h2">Guides</h1>
          <div className="sub" style={{ fontSize: 14, marginTop: 6 }}>
            Seven steps, one flow — in order.
          </div>
        </div>
        <div className="kp-field" style={{ width: 300, maxWidth: "100%" }}>
          <span className="lead">
            <IconSearch className="ic s" />
          </span>
          <input
            className="kp-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps, files, tools…"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "80px 0" }}>
          <div className="eb">
            <IconSearch className="ic l" />
          </div>
          <h3>No steps match</h3>
          <p style={{ fontSize: 13 }}>
            Try a different word — or clear the search to see all seven steps.
          </p>
          <button
            className="btn-secondary"
            style={{ height: 40, fontSize: 13 }}
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div>
          {filtered.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="step-row">
              <span className="num">{String(g.step).padStart(2, "0")}</span>
              <span>
                <span className="t" style={{ display: "block" }}>{g.short}</span>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--color-text-dim)", display: "block", marginTop: 4 }}
                >
                  {g.outputs.join(" · ")}
                </span>
              </span>
              <span className="meta">
                <span className="badge sky">{g.time}</span>
                <span className="go">
                  Open
                  <IconArrowRight className="ic s" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
