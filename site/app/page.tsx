import Link from "next/link";
import Logo from "@/components/Logo";
import { IconArrowRight } from "@/components/Icons";
import { getGuides, PHASES } from "@/lib/guides";

export default function Home() {
  const guides = getGuides();
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const stages = PHASES.map((p, i) => ({ ...p, guide: bySlug.get(p.guides[0])!, sky: i === 2 }));

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-block">
        <Logo className="hero-mark" animated />
        <span className="hero-eyebrow">Self-hosted · On-device · No cloud</span>
        <h1 className="display-hero hero-title">
          Train your own object recognition.
        </h1>
        <p className="hero-sub">
          From a folder of photos to live detection on your phone — annotate,
          split, cluster, train, run.
        </p>
        <Link href="/guides" className="btn-primary">
          Start the guide
          <IconArrowRight className="ic" />
        </Link>
      </section>

      {/* ── The flow ─────────────────────────────────────────────── */}
      <section className="flow-section">
        <p className="label-micro-bold" style={{ marginBottom: 22 }}>
          The flow
        </p>
        <div className="rail-flow">
          {stages.map((s, i) => (
            <Link key={s.key} href={`/guides/${s.guides[0]}`} className="rail-row">
              <span className={`rail-node${s.sky ? " sky" : ""}`}>
                {String(s.guide.step).padStart(2, "0")}
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
    </div>
  );
}
