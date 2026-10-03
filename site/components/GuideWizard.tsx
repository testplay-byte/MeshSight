"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
 * Full-screen setup wizard: one step per screen, everything else hidden
 * (site nav, rail, footer). Next advances *within* the guide; the guide
 * only ends when you finish its last step.
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
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  // keep check-offs across refreshes
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`ms-check:${guide.slug}`);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, [guide.slug]);
  useEffect(() => {
    try {
      window.localStorage.setItem(`ms-check:${guide.slug}`, JSON.stringify(done));
    } catch {}
  }, [guide.slug, done]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [i, finished]);

  const step: Step | undefined = guide.steps[i];
  const isLast = i === guide.steps.length - 1;
  const stepDone = step ? step.checklist.filter((c) => done[c.id]).length : 0;

  const mdComponents = useMemo(
    () => ({
      a: ({ href, children, ...rest }: { href?: string; children?: React.ReactNode }) => (
        <a
          href={href ? (href.match(/^\d{2}-/) ? `/guides/${href.replace(/\.md.*$/, "")}` : githubUrl(href.replace(/^\.\.?\//, "").replace(/^docs\//, ""))) : href}
          target={href && /^(https?:|mailto:)/.test(href) ? "_blank" : undefined}
          rel={href && /^(https?:|mailto:)/.test(href) ? "noreferrer" : undefined}
          {...rest}
        >
          {children}
        </a>
      ),
      pre: ({ children }: { children?: React.ReactNode }) => (
        <CodeBlock>{children}</CodeBlock>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 id={headingId(String(children ?? ""))}>{children}</h2>
      ),
    }),
    []
  );

  // ── Completion screen ──────────────────────────────────────────
  if (finished) {
    return (
      <div className="wizard">
        <div className="wiz-done">
          <span className="wiz-done-badge">
            <IconCheck className="ic l" />
          </span>
          <h1 className="display-h2">{guide.short} — done</h1>
          <p style={{ color: "var(--color-text-muted)", maxWidth: 420, textAlign: "center", lineHeight: 1.7 }}>
            That completes guide {guide.step} of {totalGuides}. {nextGuide ? `Next up: ${nextGuide.short}.` : "You have everything — now run it."}
          </p>
          <div className="wiz-done-actions">
            {nextGuide ? (
              <Link href={`/guides/${nextGuide.slug}`} className="btn-primary">
                Start {nextGuide.short}
                <IconArrowRight className="ic" />
              </Link>
            ) : (
              <Link
                href="https://github.com/testplay-byte/MeshSight/releases"
                className="btn-primary"
              >
                <IconArrowRight className="ic" />
                Download the APK
              </Link>
            )}
            <Link href="/guides" className="btn-ghost" style={{ height: 44, fontSize: 13 }}>
              All guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="wizard">
      {/* ── Wizard header ─────────────────────────────────────────── */}
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
          <span className="mono wiz-counter">
            {i + 1} / {guide.steps.length}
          </span>
          <div className="wiz-progress">
            <span style={{ width: `${((i + 1) / guide.steps.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* ── Step body ─────────────────────────────────────────────── */}
      <main className="wiz-body">
        <div className="wiz-step">
          <p className="label-micro-bold" style={{ marginBottom: 10 }}>
            Step {step.n}
          </p>
          <h1 className="display-h2">{step.title}</h1>

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
                      aria-pressed={on}
                    >
                      <span className="wiz-box">{on && <IconCheck className="ic xs" />}</span>
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
        </div>
      </main>

      {/* ── Wizard footer ─────────────────────────────────────────── */}
      <footer className="wiz-foot">
        <button
          className="btn-ghost"
          style={{ height: 44, fontSize: 13 }}
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
        >
          <IconArrowLeft className="ic s" />
          Back
        </button>

        <span className="mono wiz-foot-hint">
          {step.checklist.length > 0
            ? `${stepDone} / ${step.checklist.length} done`
            : step.n === 1
              ? guide.goal
              : ""}
        </span>

        {isLast ? (
          <button className="btn-primary" style={{ height: 44, fontSize: 14 }} onClick={() => setFinished(true)}>
            Finish guide
            <IconCheck className="ic s" />
          </button>
        ) : (
          <button className="btn-primary" style={{ height: 44, fontSize: 14 }} onClick={() => setI(i + 1)}>
            Next step
            <IconArrowRight className="ic s" />
          </button>
        )}
      </footer>
    </div>
  );
}
