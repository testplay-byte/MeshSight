"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  }, [i]);

  const step: Step | undefined = guide.steps[i];
  const isLast = i === guide.steps.length - 1;

  const mdComponents = useMemo(
    () => ({
      a: ({
        href,
        children,
        ...rest
      }: {
        href?: string;
        children?: React.ReactNode;
      }) => {
        const target = href
          ? href.match(/^\d{2}-/)
            ? `/guides/${href.replace(/\.md.*$/, "")}`
            : githubUrl(href.replace(/^\.\.?\//, "").replace(/^docs\//, ""))
          : href;
        const external = Boolean(href && /^(https?:|mailto:)/.test(href));
        return (
          <a
            href={target}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
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
          <span className="mono wiz-counter">
            {i + 1} / {guide.steps.length}
          </span>
          <div className="wiz-progress">
            <span style={{ width: `${((i + 1) / guide.steps.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* step body */}
      <main className="wiz-body">
        <div className="wiz-step">
          <p className="label-micro-bold" style={{ marginBottom: 10 }}>
            Step {step.n} of {guide.steps.length}
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