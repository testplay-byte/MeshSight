import Link from "next/link";
import Logo from "@/components/Logo";
import { IconArrowRight } from "@/components/Icons";
import StepIllustration from "@/components/StepIllustration";
import { getGuides, PHASES } from "@/lib/guides";

export default function Home() {
  const guides = getGuides();
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const stages = PHASES.map((p, i) => ({ ...p, guide: bySlug.get(p.guides[0])!, sky: i === 2 }));

  return (
    <main id="main" className="flex flex-col" style={{ gap: 40 }}>
      {/* ── Hero — glass panel (nav carries strongest glass, content lighter) */}
      <section className="card hero-panel" aria-labelledby="hero-title">
        <div className="hero-glow" />
        <div className="hero-inner">
          <Logo className="hero-mark" animated />
          <span className="hero-eyebrow">Self-hosted · On-device · No cloud</span>
          <h1 id="hero-title" className="display-hero hero-title">Train your own object recognition.</h1>
          <p className="hero-sub">
            From a folder of photos to live detection on your phone — annotate, split,
            cluster, train, run.
          </p>
          <Link href="/guides" className="btn-primary">
            Start the guide
            <IconArrowRight className="ic" />
          </Link>
        </div>
        {/* fills the dead space beside the headline on wide screens */}
        <div className="hero-art" aria-hidden="true">
          <StepIllustration name="colab" />
        </div>
      </section>

      {/* ── The flow — glass rail ─────────────────────────────────── */}
      <section className="glass flow-panel" aria-labelledby="flow-title">
        <p id="flow-title" className="label-micro-bold" style={{ marginBottom: 18 }}>
          The flow
        </p>
        <div className="rail-flow">
          {stages.map((s) => (
            <Link key={s.key} href={`/guides/${s.guides[0]}`} className="rail-row">
              <span className={`rail-node${s.sky ? " sky" : ""}`}>
                {s.guides
                  .map((slug) => String(bySlug.get(slug)?.step ?? "").padStart(2, "0"))
                  .join("·")}
              </span>
              <span className="rail-title">{s.label}</span>
              <span className="rail-blurb">{s.blurb}</span>
              <span className="rail-meta">
                <span className="rail-time">{s.guide.time}</span>
                {s.details.map((d) => (
                  <span key={d} className="rail-chip">{d}</span>
                ))}
              </span>
              <span className="rail-arrow">
                <IconArrowRight className="ic" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
