"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GUIDE_ICONS,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconSearch,
} from "@/components/Icons";
import type { Guide } from "@/lib/guides";

/**
 * Guides index: pipeline stepper (in → out per step) + searchable cards.
 * Search matches title, description, goal and artifacts.
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
    <div className="flex flex-col">
      {/* page title + search */}
      <div className="page-title">
        <div>
          <h1>Guides</h1>
          <div className="sub">
            Seven steps, one flow — each produces what the next expects.
          </div>
        </div>
        <div className="kp-field" style={{ width: 280, maxWidth: "100%" }}>
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

      {/* pipeline stepper */}
      <div className="card mb" style={{ padding: 16 }}>
        <div
          className="custom-scrollbar"
          style={{ display: "flex", alignItems: "stretch", overflowX: "auto", gap: 0 }}
        >
          {guides.map((g, i) => (
            <div key={g.slug} style={{ display: "flex", alignItems: "center" }}>
              <Link
                href={`/guides/${g.slug}`}
                style={{
                  width: 168,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid transparent",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--color-accent-lime)" }}>
                    {String(g.step).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {g.short}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {g.outputs.slice(0, 2).map((o) => (
                    <span
                      key={o}
                      className="mono"
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 6,
                        background: "rgba(188,255,95,0.07)",
                        color: "var(--color-accent-lime)",
                      }}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </Link>
              {i < guides.length - 1 && (
                <span style={{ margin: "0 4px", color: "var(--color-text-dim)", flexShrink: 0 }}>
                  <IconArrowRight className="ic s" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* results */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
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
        </div>
      ) : (
        <div className="grid g3 stagger">
          {filtered.map((g) => {
            const Icon = GUIDE_ICONS[g.slug];
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="stat-card"
                style={{ textDecoration: "none", padding: 20, gap: 14, display: "flex" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="icon-badge lime">{Icon ? <Icon className="ic s" /> : null}</div>
                  <span className="lbl">Step {g.step} / {guides.length}</span>
                  <span className="badge sky" style={{ marginLeft: "auto" }}>
                    <IconClock className="ic xs" />
                    {g.time}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{g.short}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1.6 }}>
                    {g.description}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="kv-row" style={{ margin: 0 }}>
                    <span className="k">In</span>
                    <span className="v" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textAlign: "right" }}>
                      {g.inputs.join(", ")}
                    </span>
                  </div>
                  <div className="kv-row" style={{ margin: 0 }}>
                    <span className="k">Out</span>
                    <span className="v lime" style={{ fontSize: 11, fontWeight: 500, textAlign: "right" }}>
                      {g.outputs.join(", ")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* done banner */}
      <div className="status-card good mt">
        <IconCheck className="ic lime-t" />
        <div>
          <div className="t">Finished all seven?</div>
          <div className="d">
            Your model is running on your phone — the{" "}
            <a
              href="https://github.com/testplay-byte/MeshSight"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--color-accent-lime)" }}
            >
              repository
            </a>{" "}
            holds every tool you used.
          </div>
        </div>
      </div>
    </div>
  );
}
