import Link from "next/link";
import Logo from "@/components/Logo";
import PipelineDiagram from "@/components/PipelineDiagram";
import { getGuides } from "@/lib/guides";

export default function Home() {
  const guides = getGuides();

  return (
    <div className="flex flex-col gap-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-8 pt-8 text-center sm:pt-16">
        <Logo className="h-28 w-28 rounded-3xl shadow-glow-mint" animated />
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="mx-auto flex items-center gap-2 rounded-full border border-accent-mint/20 bg-accent-mint/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-mint-soft">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-mint opacity-75 animate-ping-soft" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-mint" />
            </span>
            Self-hosted · on-device · yours
          </span>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Train your own object recognition.
            <br />
            <span className="bg-gradient-to-r from-accent-mint to-accent-sky bg-clip-text text-transparent">
              Run it on your phone.
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-text-secondary">
            MeshSight is a complete pipeline from raw photos to live
            detection: annotate objects, split every instance out, cluster
            visual variants, train a segmentation model in Google Colab, and
            run it fully offline in the Android app.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/guides"
            className="flex h-12 items-center gap-2 rounded-xl bg-accent-mint px-6 text-base font-medium text-bg-base shadow-glow-mint transition-all duration-300 hover:bg-accent-mint-soft"
          >
            Start the guide →
          </Link>
          <a
            href="https://github.com/testplay-byte/MeshSight/releases"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 text-base font-medium text-white backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08]"
          >
            Download the APK
          </a>
        </div>
      </section>

      {/* ── Pipeline ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            How it flows
          </h2>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-bg-surface/80 p-6 backdrop-blur-xl sm:p-10">
          <PipelineDiagram />
          <p className="mt-6 text-center text-sm text-text-muted">
            Photos + annotations → split every object out → cluster variants →
            YOLO dataset → train in Colab → export TFLite → recognize on-device.
          </p>
        </div>
      </section>

      {/* ── Why ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white">Why MeshSight?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "✂",
              title: "One object per sample",
              body: "A photo of five dogs becomes five training samples. The model learns your objects, not the background.",
            },
            {
              icon: "🧠",
              title: "Classes discover variants",
              body: "DINOv2 + UMAP + HDBSCAN split a loose class like “cat” into visual sub-classes — each one tight and learnable.",
            },
            {
              icon: "🗺",
              title: "Interactive dataset map",
              body: "A standalone HTML constellation map: see clusters, spot outliers, judge your data at a glance before training.",
            },
            {
              icon: "📱",
              title: "On-device inference",
              body: "The Android app runs your TFLite model fully offline — live camera or gallery, boxes and segmentation masks.",
            },
            {
              icon: "🔒",
              title: "Private by design",
              body: "Your data and weights never touch the repository. Only tools and docs are versioned; everything local stays local.",
            },
            {
              icon: "⚙",
              title: "Zero local builds",
              body: "GitHub Actions compiles the APK and publishes it as a release. Your machine never runs a heavy build.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/[0.08] bg-bg-surface p-5 transition-all duration-300 hover:border-accent-mint/25 hover:bg-bg-elevated/60"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-accent-mint/15 bg-accent-mint/10 text-lg">
                {f.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline preview ─────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">The six steps</h2>
            <p className="mt-1 text-sm text-text-muted">
              Each guide produces exactly what the next one expects.
            </p>
          </div>
          <Link
            href="/guides"
            className="text-sm font-medium text-accent-mint-soft transition-colors hover:text-white"
          >
            View all guides →
          </Link>
        </div>
        <div className="relative">
          {/* rail */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-mint/60 via-white/10 to-accent-sky/60" />
          <ol className="flex flex-col gap-3">
            {guides.map((g) => (
              <li key={g.slug} className="relative pl-12">
                <span className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-accent-mint/30 bg-bg-surface font-mono text-sm font-bold text-accent-mint">
                  {g.step}
                </span>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border border-white/[0.06] bg-bg-surface/60 px-4 py-3 transition-all duration-200 hover:border-accent-mint/25 hover:bg-bg-elevated/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">
                      {g.short}
                    </span>
                    <span className="text-xs text-text-dim">→</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                    {g.description}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Repo map ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.08] bg-bg-surface/80 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-white">In the repository</h2>
        <div className="grid gap-3 font-mono text-sm sm:grid-cols-2">
          {[
            ["android/", "Kotlin app — CameraX + TFLite"],
            ["colab/", "10-stage dataset pipeline"],
            ["scripts/", "Local converters (CVAT, crop, YOLO)"],
            ["docs/", "The six guides you just saw"],
            ["config/", "Example class lists & templates"],
            ["data/", "Local-only datasets (gitignored)"],
          ].map(([dir, desc]) => (
            <div key={dir} className="flex items-baseline gap-3">
              <span className="text-accent-mint-soft">{dir}</span>
              <span className="text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
