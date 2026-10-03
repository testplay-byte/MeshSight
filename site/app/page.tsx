import Link from "next/link";
import Logo from "@/components/Logo";
import { IconArrowRight, IconDownload } from "@/components/Icons";
import { getGuides } from "@/lib/guides";

const RELEASES = "https://github.com/testplay-byte/MeshSight/releases";

const WHY = [
  <>One photo of five dogs becomes <span className="display-hl">five samples</span>.</>,
  <>Look-alike classes <span className="display-hl">split themselves</span>.</>,
  <>It all <span className="display-hl">runs on your phone</span> — offline.</>,
];

export default function Home() {
  const guides = getGuides();

  return (
    <div className="flex flex-col" style={{ maxWidth: 980 }}>
      {/* ── Hero ── */}
      <section
        className="flex flex-col items-start gap-7"
        style={{ minHeight: "52dvh", justifyContent: "center" }}
      >
        <Logo className="h-14 w-14 rounded-2xl" animated />
        <h1 className="display-hero">
          Train your own
          <br />
          object recognition.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--color-text-muted)",
            maxWidth: 460,
            lineHeight: 1.6,
          }}
        >
          From photos to live detection — on your phone.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link href="/guides" className="btn-primary">
            Start the guide
            <IconArrowRight className="ic" />
          </Link>
          <a
            href={RELEASES}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ height: 48, fontSize: 14, padding: "0 20px" }}
          >
            <IconDownload className="ic s" />
            Get the APK
          </a>
        </div>
      </section>

      {/* ── The pipeline: seven bold rows ── */}
      <section style={{ marginTop: 40 }}>
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

      {/* ── Why: three bold statements ── */}
      <section style={{ marginTop: 96 }}>
        <p className="label-micro-bold" style={{ marginBottom: 24 }}>
          Why it works
        </p>
        <div className="stagger flex flex-col gap-10">
          {WHY.map((line, i) => (
            <p key={i} className="display-say">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="flex flex-col items-center gap-4"
        style={{ margin: "110px auto 30px", textAlign: "center" }}
      >
        <a href={RELEASES} target="_blank" rel="noreferrer" className="btn-primary">
          <IconDownload className="ic" />
          Download the APK
        </a>
        <span className="mono dim-t" style={{ fontSize: 11 }}>
          debug build · rebuilt on every change
        </span>
      </section>
    </div>
  );
}
