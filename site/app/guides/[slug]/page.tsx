import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGuides, githubUrl, type Guide } from "@/lib/guides";

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

function guideMeta(guide: Guide): Metadata {
  return {
    title: `${guide.step}. ${guide.short}`,
    description: guide.description,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuides().find((g) => g.slug === slug);
  return guide ? guideMeta(guide) : { title: "Guide" };
}

/**
 * Rewrite links found inside the markdown docs:
 *  - sibling guide links (`02-run-colab-pipeline.md`) → site routes
 *  - repo-relative links (`../colab/`, `docs/`, `README.md`, …) → GitHub
 *  - anchors / absolute URLs pass through untouched
 */
function resolveHref(href: string, currentSlug: string): string {
  if (!href) return href;
  if (/^(https?:|mailto:|#)/.test(href)) return href;

  const file = href.split("#")[0].split("?")[0];
  const anchor = href.includes("#") ? "#" + href.split("#")[1] : "";

  const m = file.match(/^(\d{2}-[a-z0-9-]+)\.md$/);
  if (m && m[1] !== currentSlug) return `/guides/${m[1]}${anchor}`;

  // strip leading ../ or ./ segments and docs/ prefix
  const rel = file.replace(/^(\.\.?\/)+/, "").replace(/^docs\//, "");
  if (!rel) return href;
  return `${githubUrl(rel)}${anchor}`;
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guides = getGuides();
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return null;

  const prev = guides[guide.step - 2];
  const next = guides[guide.step];

  return (
    <div className="flex gap-8 lg:gap-10">
      {/* ── Timeline rail (desktop) ──────────────────────────────── */}
      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          Pipeline
        </p>
        <ol className="relative flex flex-col gap-1">
          <div className="absolute left-[13px] top-3 bottom-3 w-px bg-white/[0.08]" />
          {guides.map((g) => {
            const active = g.slug === guide.slug;
            const done = g.step < guide.step;
            return (
              <li key={g.slug} className="relative">
                <Link
                  href={`/guides/${g.slug}`}
                  className={`group flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors ${
                    active ? "" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all ${
                      active
                        ? "border-accent-mint bg-accent-mint text-bg-base shadow-glow-mint"
                        : done
                          ? "border-accent-mint/40 bg-accent-mint/10 text-accent-mint"
                          : "border-white/10 bg-bg-surface text-text-dim"
                    }`}
                  >
                    {g.step}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      active
                        ? "text-white"
                        : "text-text-muted group-hover:text-text-secondary"
                    }`}
                  >
                    {g.short}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* ── Article ──────────────────────────────────────────────── */}
      <article className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-mint/30 bg-accent-mint/10 font-mono text-sm font-bold text-accent-mint shadow-glow-mint">
            {guide.step}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Step {guide.step} of {guides.length}
          </span>
        </div>

        <div className="md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...rest }) => (
                <a
                  href={href ? resolveHref(href, guide.slug) : href}
                  target={href && !href.startsWith("#") ? "_blank" : undefined}
                  rel={
                    href && !href.startsWith("#") ? "noreferrer" : undefined
                  }
                  {...rest}
                >
                  {children}
                </a>
              ),
            }}
          >
            {guide.content}
          </ReactMarkdown>
        </div>

        {/* prev / next */}
        <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-white/[0.08] pt-6">
          {prev ? (
            <Link
              href={`/guides/${prev.slug}`}
              className="group flex max-w-[48%] flex-col rounded-xl border border-white/[0.08] bg-bg-surface/60 px-4 py-3 transition-all hover:border-accent-mint/30 hover:bg-bg-elevated/50"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                ← Previous
              </span>
              <span className="mt-0.5 truncate text-sm font-medium text-white">
                {prev.step}. {prev.short}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/guides/${next.slug}`}
              className="group flex max-w-[48%] flex-col items-end rounded-xl border border-accent-mint/25 bg-accent-mint/5 px-4 py-3 text-right transition-all hover:border-accent-mint/50 hover:bg-accent-mint/10"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-mint-soft">
                Next →
              </span>
              <span className="mt-0.5 truncate text-sm font-medium text-white">
                {next.step}. {next.short}
              </span>
            </Link>
          ) : (
            <Link
              href="https://github.com/testplay-byte/MeshSight/releases"
              target="_blank"
              className="flex flex-col items-end rounded-xl border border-accent-mint/25 bg-accent-mint/5 px-4 py-3 text-right transition-all hover:border-accent-mint/50 hover:bg-accent-mint/10"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-mint-soft">
                Done? →
              </span>
              <span className="mt-0.5 text-sm font-medium text-white">
                Download the APK
              </span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
