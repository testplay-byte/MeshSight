import Link from "next/link";
import PipelineDiagram from "@/components/PipelineDiagram";
import {
  GUIDE_ICONS,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconClock,
  IconCrop,
  IconDownload,
  IconGithub,
  IconLayers,
  IconLock,
  IconMap,
  IconNetwork,
  IconPhoneScan,
  IconRunner,
  IconTarget,
} from "@/components/Icons";
import { getGuides } from "@/lib/guides";

const RELEASES = "https://github.com/testplay-byte/MeshSight/releases";

const FEATURES = [
  {
    Icon: IconCrop,
    title: "One object per sample",
    body: "Five dogs in one photo become five training samples.",
  },
  {
    Icon: IconNetwork,
    title: "Classes discover variants",
    body: "“cat” splits into tight visual sub-classes automatically.",
  },
  {
    Icon: IconMap,
    title: "Interactive dataset map",
    body: "See clusters and outliers in a standalone HTML map.",
  },
  {
    Icon: IconPhoneScan,
    title: "On-device inference",
    body: "Boxes and masks, live on your phone. Fully offline.",
  },
  {
    Icon: IconLock,
    title: "Private by design",
    body: "Data and weights never touch the repository.",
  },
  {
    Icon: IconRunner,
    title: "Zero local builds",
    body: "GitHub Actions compiles the APK into Releases.",
  },
];

export default function Home() {
  const guides = getGuides();

  return (
    <div className="flex flex-col">
      {/* ── Page title row ───────────────────────────────────────── */}
      <div className="page-title">
        <div>
          <h1>MeshSight</h1>
          <div className="sub">
            Train your own object recognition — from photos to phone.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="live-dot" />
          <span className="live-lbl">Self-hosted</span>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid g4 stagger">
        <div className="stat-card">
          <div className="deco-glow" />
          <div className="top">
            <div className="icon-badge lime">
              <IconTarget className="ic s" />
            </div>
            <span className="lbl">Pipeline</span>
          </div>
          <div>
            <div className="val">7 steps</div>
            <div className="sub lime-t">photos → phone</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="icon-badge sky">
              <IconLayers className="ic s" />
            </div>
            <span className="lbl">Colab stages</span>
          </div>
          <div>
            <div className="val">10</div>
            <div className="sub sky-t">split · cluster · map</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="icon-badge sky">
              <IconPhoneScan className="ic s" />
            </div>
            <span className="lbl">App</span>
          </div>
          <div>
            <div className="val">Android 12+</div>
            <div className="sub muted-t">CameraX · TFLite</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="top">
            <div className="icon-badge lime">
              <IconLock className="ic s" />
            </div>
            <span className="lbl">Your data</span>
          </div>
          <div>
            <div className="val">Local</div>
            <div className="sub lime-t">never uploaded</div>
          </div>
        </div>
      </div>

      {/* ── Status cards ─────────────────────────────────────────── */}
      <div className="grid g3 mt stagger">
        <div className="status-card good">
          <IconCheck className="ic lime-t" />
          <div>
            <div className="t">APK builds in CI</div>
            <div className="d">Every change ships a debug build to Releases.</div>
          </div>
        </div>
        <div className="status-card info">
          <IconLayers className="ic sky-t" />
          <div>
            <div className="t">Guides cover everything</div>
            <div className="d">Annotate → cluster → train → run, step by step.</div>
          </div>
        </div>
        <div className="status-card warn">
          <IconClock className="ic coral-t" />
          <div>
            <div className="t">Training needs a GPU</div>
            <div className="d">Colab's free T4 handles hobby datasets fine.</div>
          </div>
        </div>
      </div>

      {/* ── Flow + actions ───────────────────────────────────────── */}
      <div className="two-col mt">
        <div className="card">
          <div className="deco-glow" />
          <div className="card-head">
            <div className="icon-badge sky">
              <IconLayers className="ic s" />
            </div>
            <span className="card-title">How it flows</span>
          </div>
          <PipelineDiagram />
        </div>
        <div className="card">
          <div className="card-head">
            <div className="icon-badge lime">
              <IconArrowRight className="ic s" />
            </div>
            <span className="card-title">Start here</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Link href="/guides" className="btn-primary">
              <IconBook />
              Open the guides
            </Link>
            <a href={RELEASES} target="_blank" rel="noreferrer" className="btn-secondary">
              <IconDownload className="ic s" />
              Download the APK
            </a>
            <a
              href="https://github.com/testplay-byte/MeshSight"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ alignSelf: "center" }}
            >
              <IconGithub className="ic xs" />
              Browse the source on GitHub
            </a>
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="kv-row">
              <span className="k">Collect &amp; organize</span>
              <span className="v">guide 01</span>
            </div>
            <div className="kv-row">
              <span className="k">Annotate</span>
              <span className="v">guide 02</span>
            </div>
            <div className="kv-row">
              <span className="k">Split &amp; cluster in Colab</span>
              <span className="v sky">guide 03–04</span>
            </div>
            <div className="kv-row">
              <span className="k">Convert &amp; train</span>
              <span className="v">guide 05–06</span>
            </div>
            <div className="kv-row" style={{ marginBottom: 0 }}>
              <span className="k">Run on your phone</span>
              <span className="v lime">guide 07</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why (compact) ────────────────────────────────────────── */}
      <div className="card mt">
        <div className="card-head">
          <div className="icon-badge lime">
            <IconTarget className="ic s" />
          </div>
          <span className="card-title">Why MeshSight</span>
        </div>
        <div className="grid g3 stagger">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div className="icon-badge sky" style={{ marginTop: 2 }}>
                <Icon className="ic s" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, lineHeight: 1.5 }}>
                  {body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── The seven steps ────────────────────────────────────────── */}
      <div className="page-title mt" style={{ marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 16 }}>The seven steps</h1>
          <div className="sub">Each guide produces what the next expects.</div>
        </div>
        <Link href="/guides" className="btn-ghost">
          All guides
          <IconArrowRight className="ic xs" />
        </Link>
      </div>
      <div className="grid g3 stagger">
        {guides.map((g) => {
          const Icon = GUIDE_ICONS[g.slug];
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="stat-card"
              style={{ textDecoration: "none" }}
            >
              <div className="top">
                <div className="icon-badge lime">
                  {Icon ? <Icon className="ic s" /> : null}
                </div>
                <span className="lbl">Step {g.step}</span>
                <span className="badge sky" style={{ marginLeft: "auto" }}>
                  <IconClock className="ic xs" />
                  {g.time}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                  {g.short}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}
                >
                  {g.outputs.join(" · ")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
