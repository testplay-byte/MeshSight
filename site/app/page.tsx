import Link from "next/link";
import Logo from "@/components/Logo";
import PipelineDiagram, { type FlowStage } from "@/components/PipelineDiagram";
import { IconArrowRight } from "@/components/Icons";
import { getGuides } from "@/lib/guides";

export default function Home() {
  const guides = getGuides();

  const stages: FlowStage[] = guides.map((g) => ({
    href: `/guides/${g.slug}`,
    label: g.short,
    sub: g.sub,
    time: g.time,
  }));

  return (
    <div className="flex flex-col" style={{ maxWidth: 1120 }}>
      {/* ── Split hero: motto + CTA left, big clickable flow right ── */}
      <section
        className="grid items-center gap-10"
        style={{ gridTemplateColumns: "minmax(0,1fr)" }}
      >
        <div className="hero-grid">
          {/* left — motto + start */}
          <div className="flex flex-col items-start gap-6">
            <span className="badge lime" style={{ padding: "5px 12px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
              Self-hosted · On-device · No cloud
            </span>
            <h1 className="display-hero" style={{ fontSize: "clamp(38px, 4.6vw, 62px)" }}>
              Train your own object recognition.
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-text-muted)",
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              From photos to live detection — on your phone.
            </p>
            <Link href="/guides" className="btn-primary">
              Start the guide
              <IconArrowRight className="ic" />
            </Link>
          </div>

          {/* right — the flow, big and bold, clickable */}
          <div className="card" style={{ padding: 24 }}>
            <div className="card-head" style={{ marginBottom: 12 }}>
              <span className="card-title">How it flows — click a stage</span>
            </div>
            <PipelineDiagram stages={stages} />
          </div>
        </div>
      </section>

      {/* ── The pipeline: seven bold rows ── */}
      <section style={{ marginTop: 72 }}>
        <p className="label-micro-bold" style={{ marginBottom: 8 }}>
          The pipeline
        </p>
        <div>
          {guides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="step-row">
              <span className="num">{String(g.step).padStart(2, "0")}</span>
              <span className="t">{g.short}</span>
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
      </section>
    </div>
  );
}
