import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GUIDE_ICONS,
  IconArrowLeft,
  IconArrowRight,
  IconClock,
  IconDownload,
} from "@/components/Icons";
import StepIllustration from "@/components/StepIllustration";
import Toc from "@/components/Toc";
import { getGuides, githubUrl, headingId, type Guide } from "@/lib/guides";

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

  const rel = file.replace(/^(\.\.?\/)+/, "").replace(/^docs\//, "");
  if (!rel) return href;
  return `${githubUrl(rel)}${anchor}`;
}

/** Render text children of a heading to a plain string for id slugs. */
function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return "";
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

  const Icon = GUIDE_ICONS[guide.slug];
  const prev = guides[guide.step - 2];
  const next = guides[guide.step];

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:gap-10">
      {/* ── Left: step rail (lg+) ─────────────────────────────────── */}
      <aside className="sticky top-24 hidden h-fit w-52 shrink-0 lg:block">
        <p className="label-micro-bold mb-3">Pipeline</p>
        <ol className="relative flex flex-col gap-0.5">
          <div className="absolute bottom-3 left-[13px] top-3 w-px bg-line" />
          {guides.map((g) => {
            const active = g.slug === guide.slug;
            const done = g.step < guide.step;
            return (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className={`relative z-10 flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors ${
                    active ? "" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all ${
                      active
                        ? "border-accent-lime bg-accent-lime text-bg-base shadow-glow-lime"
                        : done
                          ? "border-accent-lime/40 bg-bg-surface text-accent-lime"
                          : "border-line bg-bg-surface text-text-dim"
                    }`}
                  >
                    {done ? "✓" : g.step}
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

      {/* ── Article ───────────────────────────────────────────────── */}
      <article className="min-w-0 flex-1">
        {/* header card */}
        <header className="card relative mb-8 overflow-hidden p-6 sm:p-7">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-accent-lime/5 blur-[60px]" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="icon-badge icon-badge-lg icon-badge-lime mt-0.5 shrink-0">
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </span>
              <div>
                <p className="label-micro-bold mb-1.5">
                  Step {guide.step} of {guides.length}
                </p>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {guide.short}
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
                  {guide.goal}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
              <span className="badge-sky">
                <IconClock className="h-3 w-3" />
                {guide.time}
              </span>
            </div>
          </div>

          {/* in / out */}
          <div className="mt-6 grid gap-3 border-t border-line-subtle pt-5 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <span className="label-micro mt-0.5 w-8 shrink-0">In</span>
              <div className="flex flex-wrap gap-1.5">
                {guide.inputs.map((x) => (
                  <span
                    key={x}
                    className="data-mono rounded-md border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] text-text-secondary"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="label-micro mt-0.5 w-8 shrink-0 text-accent-lime">
                Out
              </span>
              <div className="flex flex-wrap gap-1.5">
                {guide.outputs.map((x) => (
                  <span
                    key={x}
                    className="data-mono rounded-md border border-accent-lime/20 bg-accent-lime/[0.07] px-2 py-0.5 text-[11px] text-accent-lime-bright"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* illustration */}
        <div className="card mb-10 hidden p-6 sm:block">
          <StepIllustration slug={guide.slug} />
        </div>

        {/* body + TOC */}
        <div className="flex gap-10">
          <div className="md min-w-0 flex-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...rest }) => (
                  <a
                    href={href ? resolveHref(href, guide.slug) : href}
                    target={href && !href.startsWith("#") ? "_blank" : undefined}
                    rel={href && !href.startsWith("#") ? "noreferrer" : undefined}
                    {...rest}
                  >
                    {children}
                  </a>
                ),
                h2: ({ children }) => {
                  const text = nodeText(children);
                  return (
                    <h2 id={headingId(text)}>{children}</h2>
                  );
                },
                h3: ({ children }) => {
                  const text = nodeText(children);
                  return (
                    <h3 id={headingId(text)}>{children}</h3>
                  );
                },
              }}
            >
              {guide.content}
            </ReactMarkdown>
          </div>

          {/* TOC (xl+) */}
          <aside className="hidden w-52 shrink-0 xl:block">
            <Toc headings={guide.headings} />
          </aside>
        </div>

        {/* prev / next */}
        <nav className="mt-12 flex items-stretch justify-between gap-3 border-t border-line pt-6">
          {prev ? (
            <Link
              href={`/guides/${prev.slug}`}
              className="group flex max-w-[48%] flex-col rounded-xl border border-line bg-bg-surface/60 px-4 py-3 transition-all hover:border-accent-lime/30 hover:bg-bg-elevated/50"
            >
              <span className="label-micro flex items-center gap-1.5">
                <IconArrowLeft className="h-3 w-3" />
                Previous
              </span>
              <span className="mt-1 truncate text-sm font-medium text-white">
                {prev.step}. {prev.short}
              </span>
            </Link>
          ) : (
            <Link
              href="/guides"
              className="group flex flex-col rounded-xl border border-line bg-bg-surface/60 px-4 py-3 transition-all hover:border-accent-lime/30"
            >
              <span className="label-micro flex items-center gap-1.5">
                <IconArrowLeft className="h-3 w-3" />
                All guides
              </span>
              <span className="mt-1 text-sm font-medium text-white">
                Pipeline overview
              </span>
            </Link>
          )}
          {next ? (
            <Link
              href={`/guides/${next.slug}`}
              className="group flex max-w-[48%] flex-col items-end rounded-xl border border-accent-lime/25 bg-accent-lime/[0.05] px-4 py-3 text-right transition-all hover:border-accent-lime/50 hover:bg-accent-lime/10"
            >
              <span className="label-micro flex items-center gap-1.5 text-accent-lime">
                Next
                <IconArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-1 truncate text-sm font-medium text-white">
                {next.step}. {next.short}
              </span>
            </Link>
          ) : (
            <a
              href="https://github.com/testplay-byte/MeshSight/releases"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-end rounded-xl border border-accent-lime/25 bg-accent-lime/[0.05] px-4 py-3 text-right transition-all hover:border-accent-lime/50 hover:bg-accent-lime/10"
            >
              <span className="label-micro flex items-center gap-1.5 text-accent-lime">
                Done?
                <IconDownload className="h-3 w-3" />
              </span>
              <span className="mt-1 text-sm font-medium text-white">
                Download the APK
              </span>
            </a>
          )}
        </nav>
      </article>
    </div>
  );
}
