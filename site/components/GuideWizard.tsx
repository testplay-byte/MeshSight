"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeBlock from "@/components/CodeBlock";
import StepIllustration from "@/components/StepIllustration";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
} from "@/components/Icons";
import type { Guide, Step } from "@/lib/guides";
import { githubUrl, headingId } from "@/lib/md-utils";

/**
 * Full-screen setup wizard: one step per screen, all site chrome hidden.
 * Navigation is inline at the end of the content — no fixed bottom bar.
 * Next advances within the guide; the last step hands off directly to the
 * next guide (no intermediate "done" screen).
 */
export default function GuideWizard({
  guide,
  nextGuide,
  totalGuides,
}: {
  guide: Guide;
  nextGuide?: Guide;
  totalGuides: number;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLElement>(null);

  // Check-offs are deliberately NOT persisted. A checklist that remembers
  // itself is worse than useless here: the reader re-enters a step they already
  // ticked last time and sees it pre-ticked, with no memory of doing it.
  // They do reset per guide though — the last step routes to the next guide
  // within the same component instance, which would otherwise carry the
  // previous guide's ticks over.
  const slugRef = useRef(guide.slug);
  useEffect(() => {
    if (slugRef.current !== guide.slug) {
      slugRef.current = guide.slug;
      setDone({});
      setI(0);
    }
  }, [guide.slug]);

  // The wizard is position:fixed and .wiz-body is the scroller, so the window
  // never scrolls — scrollTo on it is a no-op and the new step would open at
  // the previous step's offset. On mount (i=0) leave focus where the browser
  // put it so the header's exit link stays reachable without shift-tabbing.
  useEffect(() => {
    if (i > 0) {
      bodyRef.current?.scrollTo({ top: 0 });
      // preventScroll matters here: a bare focus() scrolls the heading into
      // view, which lands the reader mid-step instead of at its top.
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/guides");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const step: Step | undefined = guide.steps[i];
  const isLast = i === guide.steps.length - 1;
  // "Step N of M" must count only the steps the author numbered — reference
  // sections are screens too, and counting them advertised a step that doesn't
  // exist ("Step 5 of 6" on the last screen of a 5-step guide).
  const numberedTotal = guide.steps.filter((s) => s.numbered).length;

  const mdComponents = useMemo(
    () => ({
      a: ({
        href,
        children,
        // react-markdown v9 passes an AST `node` through the props spread;
        // left in, React stringifies it into the DOM as node="[object Object]".
        node: _node,
        ...rest
      }: {
        href?: string;
        children?: React.ReactNode;
        node?: unknown;
      }) => {
        // absolute links pass straight through (never github-rewrapped)
        if (!href || /^(https?:|mailto:|#|\/)/.test(href)) {
          return (
            <a
              href={href}
              target={href && /^(https?:|mailto:)/.test(href) ? "_blank" : undefined}
              rel={href && /^(https?:|mailto:)/.test(href) ? "noreferrer" : undefined}
              {...rest}
            >
              {children}
            </a>
          );
        }
        // sibling guide link → site route (next/link adds the basePath)
        const sibling = href.match(/^(\d{2}-[a-z0-9-]+)\.md(.*)$/);
        if (sibling) {
          return (
            <Link href={`/guides/${sibling[1]}`} {...rest}>
              {children}
            </Link>
          );
        }
        // repo-relative file → GitHub
        return (
          <a
            href={githubUrl(href.replace(/^docs\//, ""))}
            target="_blank"
            rel="noreferrer"
            {...rest}
          >
            {children}
          </a>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => (
        <CodeBlock>{children}</CodeBlock>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 id={headingId(String(children ?? ""))}>{children}</h2>
      ),
    }),
    []
  );

  if (!step) return null;

  return (
    <div className="wizard">
      {/* header */}
      <header className="wiz-head">
        <div className="wiz-head-left">
          <Link href="/guides" className="wiz-exit" aria-label="Back to guides">
            <IconClose className="ic s" />
          </Link>
          <div className="wiz-head-meta">
            <span className="label-micro-bold">
              Guide {guide.step} / {totalGuides}
            </span>
            <span className="wiz-head-title">{guide.short}</span>
          </div>
        </div>
        <div className="wiz-head-right">
          <span className="mono wiz-counter" aria-hidden="true">
            {i + 1} / {guide.steps.length}
          </span>
          <div className="wiz-progress">
            <span style={{ width: `${((i + 1) / guide.steps.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* step body */}
      <main id="main" className="wiz-body" ref={bodyRef}>
        <div className="wiz-step">
          {numberedTotal > 0 && (
            <p className="label-micro-bold" style={{ marginBottom: 10 }} aria-live="polite">
              {step.numbered ? `Step ${step.n} of ${numberedTotal}` : "Reference"}
            </p>
          )}
          <h1 ref={headingRef} tabIndex={-1} className="display-h2">
            {step.title}
          </h1>
          {/* the step position, announced when focus moves to the heading */}
          <p className="sr-only" role="status">
            Step {i + 1} of {guide.steps.length}
            {numberedTotal > 0 && step.numbered
              ? `, step ${step.n} of ${numberedTotal}`
              : ""}
          </p>

          {/* the guide's framing text (goal + any critical callout) */}
          {i === 0 && guide.intro && (
            <div className="md" style={{ marginBottom: 20 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={mdComponents}
              >
                {guide.intro}
              </ReactMarkdown>
            </div>
          )}

          {step.illustration && (
            <div className="wiz-illo">
              <StepIllustration name={step.illustration} />
            </div>
          )}

          {step.checklist.length > 0 && (
            <ul className="wiz-check">
              {step.checklist.map((c) => {
                const on = !!done[c.id];
                return (
                  <li key={c.id}>
                    <button
                      className={`wiz-check-row${on ? " on" : ""}`}
                      onClick={() => setDone((d) => ({ ...d, [c.id]: !d[c.id] }))}
                      role="checkbox"
                      aria-checked={on}
                    >
                      <span className="wiz-box">
                        {on && <IconCheck className="ic xs" />}
                      </span>
                      <span>{c.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={mdComponents}
            >
              {step.body}
            </ReactMarkdown>
          </div>

          {/* inline navigation — scrolls with the content, no bottom bar */}
          <nav className="wiz-nav">
            {i > 0 ? (
              <button className="btn-ghost" onClick={() => setI(i - 1)}>
                <IconArrowLeft className="ic s" />
                Back
              </button>
            ) : (
              <span />
            )}

            {isLast ? (
              nextGuide ? (
                <button
                  className="btn-primary"
                  onClick={() => router.push(`/guides/${nextGuide.slug}`)}
                >
                  Start {nextGuide.short}
                  <IconArrowRight className="ic s" />
                </button>
              ) : (
                <a
                  className="btn-primary"
                  href="https://github.com/testplay-byte/MeshSight/releases"
                >
                  Download the APK
                  <IconArrowRight className="ic s" />
                </a>
              )
            ) : (
              <button className="btn-primary" onClick={() => setI(i + 1)}>
                Next step
                <IconArrowRight className="ic s" />
              </button>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}