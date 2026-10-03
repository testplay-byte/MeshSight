import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { IconArrowLeft, IconArrowRight } from "@/components/Icons";
import CodeBlock from "@/components/CodeBlock";
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
 *  - sibling guide links (`03-run-colab-pipeline.md`) -> site routes
 *  - repo-relative links (`../colab/`, `docs/`, `README.md`, ...) -> GitHub
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
    return nodeText(
      (node as { props?: { children?: React.ReactNode } }).props?.children
    );
  }
  return "";
}

const MD_COMPONENTS = (currentSlug: string) => ({
  a: ({
    href,
    children,
    ...rest
  }: {
    href?: string;
    children?: React.ReactNode;
  }) => (
    <a
      href={href ? resolveHref(href, currentSlug) : href}
      target={href && !href.startsWith("#") ? "_blank" : undefined}
      rel={href && !href.startsWith("#") ? "noreferrer" : undefined}
      {...rest}
    >
      {children}
    </a>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <CodeBlock>{children}</CodeBlock>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 id={headingId(nodeText(children))}>{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 id={headingId(nodeText(children))}>{children}</h3>
  ),
});

/**
 * Split the guide on [[illustration:name]] markers and interleave the SVG
 * scenes between the markdown sections - illustrations sit alongside the
 * text they explain, not stacked at the top.
 */
function renderWithIllustrations(guide: Guide) {
  const parts = guide.content.split(/\[\[illustration:([a-z-]+)\]\]/g);
  const components = MD_COMPONENTS(guide.slug);
  return parts.map((part, i) =>
    i % 2 === 0 ? (
      <ReactMarkdown
        key={i}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {part}
      </ReactMarkdown>
    ) : (
      <StepIllustration key={i} name={part} />
    )
  );
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
  const pct = Math.round((guide.step / guides.length) * 100);

  return (
    <div className="guide-layout">
      {/* Step rail (the left sidebar, only where it is needed) */}
      <aside className="rail rail-lg">
        <div className="rail-label">Pipeline</div>
        <ol style={{ display: "flex", flexDirection: "column" }}>
          {guides.map((g) => {
            const active = g.slug === guide.slug;
            const done = g.step < guide.step;
            return (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className={`rail-item${active ? " active" : ""}${done ? " done" : ""}`}
                >
                  <span className="n">
                    {done ? "\u2713" : String(g.step).padStart(2, "0")}
                  </span>
                  <span>{g.short}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Article column */}
      <article style={{ minWidth: 0 }}>
        <header style={{ marginBottom: 36 }}>
          <p className="label-micro-bold" style={{ marginBottom: 10 }}>
            Step {guide.step} of {guides.length} — {guide.time}
          </p>
          <h1 className="display-h2">{guide.short}</h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--color-text-secondary)",
              maxWidth: 640,
              lineHeight: 1.65,
              marginTop: 14,
            }}
          >
            {guide.goal}
          </p>
          <div style={{ marginTop: 28 }}>
            <div className="progress">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div
              className="mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--color-text-dim)",
                marginTop: 8,
              }}
            >
              <span>PHOTOS</span>
              <span>
                {guide.step} / {guides.length}
              </span>
              <span>PHONE</span>
            </div>
          </div>
        </header>

        <div className="md">{renderWithIllustrations(guide)}</div>

        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 40,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20,
          }}
        >
          {prev ? (
            <Link
              href={`/guides/${prev.slug}`}
              className="stat-card"
              style={{ maxWidth: "46%", padding: "12px 16px", textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconArrowLeft className="ic xs" style={{ color: "var(--color-text-dim)" }} />
                <span className="lbl">Previous</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {prev.step}. {prev.short}
              </div>
            </Link>
          ) : (
            <Link
              href="/guides"
              className="stat-card"
              style={{ padding: "12px 16px", textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconArrowLeft className="ic xs" style={{ color: "var(--color-text-dim)" }} />
                <span className="lbl">All guides</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 4 }}>
                Pipeline overview
              </div>
            </Link>
          )}
          {next ? (
            <Link
              href={`/guides/${next.slug}`}
              className="stat-card"
              style={{
                maxWidth: "46%",
                padding: "12px 16px",
                textDecoration: "none",
                borderColor: "rgba(188,255,95,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  justifyContent: "flex-end",
                }}
              >
                <span className="lbl" style={{ color: "var(--color-accent-lime)" }}>
                  Next
                </span>
                <IconArrowRight
                  className="ic xs"
                  style={{ color: "var(--color-accent-lime)" }}
                />
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {next.step}. {next.short}
              </div>
            </Link>
          ) : (
            <a
              href="https://github.com/testplay-byte/MeshSight/releases"
              target="_blank"
              rel="noreferrer"
              className="stat-card"
              style={{
                padding: "12px 16px",
                textDecoration: "none",
                borderColor: "rgba(188,255,95,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  justifyContent: "flex-end",
                }}
              >
                <span className="lbl" style={{ color: "var(--color-accent-lime)" }}>
                  Done?
                </span>
                <IconArrowRight
                  className="ic xs"
                  style={{ color: "var(--color-accent-lime)" }}
                />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 4 }}>
                Download the APK
              </div>
            </a>
          )}
        </nav>
      </article>

      {/* TOC (very wide screens) */}
      <aside className="toc-col">
        <Toc headings={guide.headings} />
      </aside>
    </div>
  );
}
