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
 * Guides index: a compact pipeline stepper (what flows into/out of each
 * step) + a searchable card grid. Search matches title, description,
 * goal, and the in/out artifacts — so users can find steps by what they
 * produce ("classes.txt") or what they do ("cluster").
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
    <div className="flex flex-col gap-10">
      {/* header row: title + search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-micro-bold mb-2">Pipeline</p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Start-to-finish guides
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            Six steps, one flow — each guide produces exactly what the next
            expects. Search by what you want to do or what you're holding.
          </p>
        </div>

        {/* search input (§10.1 keypad-input pattern, simplified) */}
        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
            <IconSearch className="h-4 w-4 text-text-dim" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps, files, tools…"
            className="h-11 w-full rounded-xl border border-line bg-bg-base pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-accent-lime/40 focus:ring-2 focus:ring-accent-lime/15"
          />
        </div>
      </div>

      {/* pipeline stepper: compact horizontal flow of in → out */}
      <div className="card custom-scrollbar overflow-x-auto p-5">
        <div className="flex min-w-max items-stretch gap-0">
          {guides.map((g, i) => (
            <div key={g.slug} className="flex items-center">
              <Link
                href={`/guides/${g.slug}`}
                className="group flex w-40 flex-col gap-1.5 rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-line hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  <span className="data-mono text-[10px] font-bold text-accent-lime">
                    {String(g.step).padStart(2, "0")}
                  </span>
                  <span className="truncate text-xs font-semibold text-white">
                    {g.short}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.outputs.slice(0, 2).map((o) => (
                    <span
                      key={o}
                      className="data-mono rounded-md bg-accent-lime/[0.07] px-1.5 py-0.5 text-[9px] text-accent-lime-bright"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </Link>
              {i < guides.length - 1 && (
                <span className="mx-1 shrink-0 text-text-dim">
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="icon-badge icon-badge-lg icon-badge-sky">
            <IconSearch className="h-5 w-5 opacity-40" />
          </span>
          <h3 className="text-base font-semibold text-white">No steps match</h3>
          <p className="max-w-xs text-sm text-text-muted">
            Try a different word — or clear the search to see all six steps.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-1 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent-lime/40 hover:text-white"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const Icon = GUIDE_ICONS[g.slug];
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="card group flex flex-col p-5 transition-all duration-300 hover:border-accent-lime/25 hover:bg-bg-elevated/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="icon-badge icon-badge-lime">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="data-mono text-[10px] font-semibold text-text-dim">
                    STEP {g.step} / {guides.length}
                  </span>
                </div>

                <h2 className="text-[15px] font-semibold text-white">
                  {g.short}
                </h2>
                <p className="mt-1 flex-1 text-[13px] leading-relaxed text-text-muted">
                  {g.description}
                </p>

                {/* in → out */}
                <div className="mt-4 flex flex-col gap-1.5 border-t border-line-subtle pt-3">
                  <div className="flex items-start gap-2">
                    <span className="label-micro w-10 shrink-0 pt-0.5">In</span>
                    <span className="data-mono text-[11px] leading-relaxed text-text-secondary">
                      {g.inputs.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="label-micro w-10 shrink-0 pt-0.5 text-accent-lime">
                      Out
                    </span>
                    <span className="data-mono text-[11px] leading-relaxed text-accent-lime-bright">
                      {g.outputs.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] text-text-dim">
                    <IconClock className="h-3 w-3" />
                    {g.time}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-accent-lime opacity-0 transition-opacity group-hover:opacity-100">
                    Open guide
                    <IconArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* done banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-accent-lime/15 bg-accent-lime/[0.04] px-5 py-4">
        <span className="icon-badge icon-badge-lime">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm text-text-secondary">
          Finished all six? Your model is running on your phone — share the
          loop by starring the{" "}
          <a
            href="https://github.com/testplay-byte/MeshSight"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-accent-lime transition-colors hover:text-accent-lime-bright"
          >
            repository
          </a>
          .
        </p>
      </div>
    </div>
  );
}
