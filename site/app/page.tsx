import Link from "next/link";
import Logo from "@/components/Logo";
import { IconArrowRight } from "@/components/Icons";
import { getGuides, PHASES } from "@/lib/guides";

export default function Home() {
  const guides = getGuides();
  const bySlug = new Map(guides.map((g) => [g.slug, g]));

  return (
    <div className="flex flex-col" style={{ maxWidth: 1040 }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="flex flex-col items-start gap-6"
        style={{ paddingTop: 24, paddingBottom: 16 }}
      >
        <span
          className="badge lime"
          style={{ padding: "5px 12px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}
        >
          Self-hosted · On-device · No cloud
        </span>
        <h1 className="display-hero" style={{ fontSize: "clamp(38px, 4.6vw, 62px)" }}>
          Train your own object recognition.
        </h1>
        <p style={{ fontSize: 16, color: "var(--color-text-muted)", maxWidth: 440, lineHeight: 1.6 }}>
          From photos to live detection — on your phone.
        </p>
        <Link href="/guides" className="btn-primary">
          Start the guide
          <IconArrowRight className="ic" />
        </Link>
      </section>

      {/* ── Flow (bottom) ───────────────────────────────────────── */}
      <section style={{ marginTop: 72 }}>
        <p className="label-micro-bold" style={{ marginBottom: 16 }}>
          The flow
        </p>

        {/* row 1 — two mini blocks */}
        <div className="flow-mini-row">
          {PHASES.filter((p) => !p.wide).map((phase) => {
            const g = bySlug.get(phase.guides[0]);
            return (
              <Link key={phase.key} href={`/guides/${phase.guides[0]}`} className="flow-mini">
                <div className="flow-mini-top">
                  <span className="mono flow-num">
                    {String(g?.step ?? 1).padStart(2, "0")}
                  </span>
                  <span className="badge sky">{g?.time}</span>
                </div>
                <span className="flow-mini-title">{phase.label}</span>
                <span className="flow-mini-sub">{phase.blurb}</span>
              </Link>
            );
          })}
        </div>

        {/* row 2..n — full blocks */}
        <div className="flow-blocks">
          {PHASES.filter((p) => p.wide).map((phase) => (
            <Link key={phase.key} href={`/guides/${phase.guides[0]}`} className="flow-block">
              <div className="flow-block-main">
                <div className="flow-block-head">
                  <span className="mono flow-num">
                    {String(bySlug.get(phase.guides[0])?.step ?? 1).padStart(2, "0")}
                  </span>
                  <span className="badge lime">{bySlug.get(phase.guides[0])?.time}</span>
                </div>
                <span className="flow-block-title">{phase.label}</span>
                <span className="flow-block-sub">{phase.blurb}</span>
              </div>
              {phase.details.length > 0 && (
                <div className="flow-details">
                  {phase.details.map((d) => (
                    <span key={d} className="flow-detail">{d}</span>
                  ))}
                </div>
              )}
              <span className="flow-go">
                <IconArrowRight className="ic s" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
