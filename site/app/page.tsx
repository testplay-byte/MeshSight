import Link from "next/link";
import Logo from "@/components/Logo";
import PipelineDiagram from "@/components/PipelineDiagram";
import {
  GUIDE_ICONS,
  IconArrowRight,
  IconClock,
  IconCrop,
  IconFolder,
  IconGithub,
  IconLayers,
  IconLock,
  IconMap,
  IconNetwork,
  IconPhoneScan,
  IconRunner,
} from "@/components/Icons";
import { getGuides } from "@/lib/guides";

const FEATURES = [
  {
    Icon: IconCrop,
    title: "One object per sample",
    body: "A photo of five dogs becomes five training samples. The model learns your objects — not the background.",
  },
  {
    Icon: IconNetwork,
    title: "Classes discover variants",
    body: "DINOv2 + UMAP + HDBSCAN split a loose class like “cat” into tight visual sub-classes the model can actually learn.",
  },
  {
    Icon: IconMap,
    title: "Interactive dataset map",
    body: "A standalone HTML constellation map: see clusters, spot outliers, judge your data at a glance before training.",
  },
  {
    Icon: IconPhoneScan,
    title: "On-device inference",
    body: "The Android app runs your TFLite model fully offline — live camera or gallery, boxes and segmentation masks.",
  },
  {
    Icon: IconLock,
    title: "Private by design",
    body: "Your data and weights never touch the repository. Only tools and docs are versioned; everything local stays local.",
  },
  {
    Icon: IconRunner,
    title: "Zero local builds",
    body: "GitHub Actions compiles the APK and publishes it as a release. Your machine never runs a heavy build.",
  },
];

const REPO = [
  { dir: "android/", desc: "Kotlin app — CameraX + TFLite", Icon: IconPhoneScan },
  { dir: "colab/", desc: "10-stage dataset pipeline", Icon: IconLayers },
  { dir: "scripts/", desc: "Local converters (CVAT, crop, YOLO)", Icon: IconFolder },
  { dir: "docs/", desc: "The six guides, rendered on this site", Icon: IconGithub },
];

export default function Home() {
  const guides = getGuides();

  return (
    <div className="flex flex-col gap-20 sm:gap-24">
      {/* ── Split hero: minimal left, flow right ─────────────────── */}
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* left */}
        <div className="stagger flex flex-col items-start gap-5">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12 rounded-xl shadow-glow-lime" animated />
            <span className="label-micro-bold">MeshSight</span>
          </div>

          <h1 className="text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-[2.75rem]">
            Train your own
            <br />
            object recognition.
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-text-secondary">
            From raw photos to live detection on your phone — annotate, split,
            cluster, train, run. Fully self-hosted, fully yours.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/guides"
              className="flex h-11 items-center gap-2 rounded-xl bg-accent-lime px-5 text-sm font-medium text-bg-base shadow-glow-lime transition-all duration-300 hover:bg-accent-lime-bright"
            >
              Start the guide
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/testplay-byte/MeshSight/releases"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08]"
            >
              Get the APK
            </a>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-accent-lime">
              <span className="live-dot" />
              Self-hosted
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              On-device
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              No cloud
            </span>
          </div>
        </div>

        {/* right: the flow */}
        <div className="fade-up card relative overflow-hidden p-5 sm:p-7" style={{ animationDelay: "0.15s" }}>
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent-lime/5 blur-[60px]" />
          <div className="mb-4 flex items-center gap-2">
            <span className="icon-badge icon-badge-lime">
              <IconLayers className="h-3.5 w-3.5" />
            </span>
            <span className="label-micro-bold">How it flows</span>
          </div>
          <PipelineDiagram />
          <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-text-dim">
            photos → annotate → split → cluster → yolo → train → tflite → phone
          </p>
        </div>
      </section>

      {/* ── Why ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Why MeshSight?
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Generic models can't see what you care about.
            </p>
          </div>
        </div>
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="card group flex flex-col gap-3 p-5 transition-all duration-300 hover:border-accent-lime/25 hover:bg-bg-elevated/40"
            >
              <span className="icon-badge icon-badge-lime transition-colors group-hover:bg-accent-lime/10">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-[13px] leading-relaxed text-text-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The six steps ────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              The six steps
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Each guide produces exactly what the next expects.
            </p>
          </div>
          <Link
            href="/guides"
            className="hidden items-center gap-1.5 text-sm font-medium text-accent-lime transition-colors hover:text-accent-lime-bright sm:flex"
          >
            All guides
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => {
            const Icon = GUIDE_ICONS[g.slug];
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="card group flex flex-col gap-3 p-5 transition-all duration-300 hover:border-accent-lime/25 hover:bg-bg-elevated/40"
              >
                <div className="flex items-center justify-between">
                  <span className="icon-badge icon-badge-sky">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="data-mono text-[11px] font-semibold text-text-dim">
                    STEP {String(g.step).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{g.short}</h3>
                <p className="flex-1 text-[13px] leading-relaxed text-text-muted">
                  {g.description}
                </p>
                <div className="flex items-center justify-between border-t border-line-subtle pt-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-text-dim">
                    <IconClock className="h-3 w-3" />
                    {g.time}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-accent-lime opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Open
                    <IconArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/guides"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-accent-lime transition-colors hover:text-accent-lime-bright sm:hidden"
        >
          View all guides
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* ── Repo map ─────────────────────────────────────────────── */}
      <section className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="icon-badge icon-badge-lime">
            <IconFolder className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            In the repository
          </h2>
        </div>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {REPO.map(({ dir, desc, Icon }) => (
            <div key={dir} className="flex items-center gap-3">
              <span className="text-text-dim">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="data-mono text-[13px] font-semibold text-accent-lime-bright">
                {dir}
              </span>
              <span className="text-[13px] text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
