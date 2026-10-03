import type { Metadata } from "next";
import Logo from "@/components/Logo";
import {
  IconAlert,
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconChip,
  IconClock,
  IconCloudRun,
  IconCrop,
  IconDatabase,
  IconGithub,
  IconLayers,
  IconLock,
  IconMap,
  IconNetwork,
  IconPhoneScan,
  IconPolygon,
  IconRunner,
  IconScatter,
  IconSearch,
  IconTarget,
  IconX,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Design",
  description:
    "The MeshSight design language — Dark Neon: dark-first surfaces, glass, monospace data, three accents.",
};

const ALL_ICONS: [string, (p: { className?: string }) => React.ReactNode][] = [
  ["camera", IconCamera],
  ["polygon", IconPolygon],
  ["cloud-run", IconCloudRun],
  ["scatter", IconScatter],
  ["database", IconDatabase],
  ["chip", IconChip],
  ["phone-scan", IconPhoneScan],
  ["crop", IconCrop],
  ["network", IconNetwork],
  ["map", IconMap],
  ["lock", IconLock],
  ["runner", IconRunner],
  ["layers", IconLayers],
  ["search", IconSearch],
  ["clock", IconClock],
  ["github", IconGithub],
  ["target", IconTarget],
  ["arrow-right", IconArrowRight],
  ["check", IconCheck],
  ["alert", IconAlert],
];

export default function DesignPage() {
  return (
    <div className="flex flex-col">
      {/* page title */}
      <div className="page-title">
        <div>
          <h1>Design</h1>
          <div className="sub">Dark Neon design system — MeshSight edition</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="live-dot" />
          <span className="live-lbl">Live</span>
        </div>
      </div>

      {/* intro card */}
      <div className="card mb">
        <div className="deco-glow" />
        <div className="card-head">
          <div className="icon-badge lime">
            <IconLayers className="ic s" />
          </div>
          <span className="card-title">Philosophy</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 720 }}>
          Dark-first surfaces, glass overlays, monospace for all data, and
          exactly three accents: <span className="lime-t" style={{ fontWeight: 600 }}>lime</span> for
          brand and action, <span className="sky-t" style={{ fontWeight: 600 }}>sky</span> for
          information, <span className="coral-t" style={{ fontWeight: 600 }}>coral</span> for danger.
          Motion communicates state — never decoration for its own sake.
          Full reference:{" "}
          <a
            href="https://github.com/testplay-byte/MeshSight/blob/main/docs/DESIGN.md"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--color-accent-lime)" }}
          >
            docs/DESIGN.md
          </a>
        </p>
      </div>

      {/* surface tokens */}
      <div className="grid g4 stagger mb">
        <div className="sw">
          <div className="chip" style={{ background: "#1e1e24" }} />
          <span className="nm">bg-base</span>
          <span className="hx">#1e1e24</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#28282f" }} />
          <span className="nm">bg-surface</span>
          <span className="hx">#28282f</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#242430" }} />
          <span className="nm">bg-sidebar</span>
          <span className="hx">#242430</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#333340" }} />
          <span className="nm">bg-elevated</span>
          <span className="hx">#333340</span>
        </div>
      </div>

      {/* accent tokens */}
      <div className="grid g4 stagger mb">
        <div className="sw">
          <div className="chip" style={{ background: "#BCFF5F" }} />
          <span className="nm">accent-lime</span>
          <span className="hx">#BCFF5F</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#5FC9FF" }} />
          <span className="nm">accent-sky</span>
          <span className="hx">#5FC9FF</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#FF5F7E" }} />
          <span className="nm">accent-coral</span>
          <span className="hx">#FF5F7E</span>
        </div>
        <div className="sw">
          <div className="chip" style={{ background: "#c8c8d4" }} />
          <span className="nm">text-secondary</span>
          <span className="hx">#c8c8d4</span>
        </div>
      </div>

      {/* radius + glow */}
      <div className="two-col mb">
        <div className="card">
          <div className="card-head">
            <div className="icon-badge sky">
              <IconLayers className="ic s" />
            </div>
            <span className="card-title">Radius scale</span>
          </div>
          <div className="r-demo">
            <div className="r-box" style={{ borderRadius: 16 }}><span>16px</span></div>
            <div className="r-box" style={{ borderRadius: 12 }}><span>12px</span></div>
            <div className="r-box" style={{ borderRadius: 8 }}><span>8px</span></div>
            <div className="r-box" style={{ borderRadius: 9999 }}><span>full</span></div>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-dim)", marginTop: 12 }}>
            Cards 16 · buttons/inputs 12 · badges 8 · avatars full.
          </p>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="icon-badge lime">
              <IconChip className="ic s" />
            </div>
            <span className="card-title">Glow tokens</span>
          </div>
          <div className="glow-demo">
            <span className="glow-pill" style={{ background: "var(--color-accent-lime)", color: "var(--color-bg-base)", boxShadow: "0 0 20px rgba(188,255,95,.2)" }}>
              glow-lime
            </span>
            <span className="glow-pill" style={{ background: "var(--color-accent-sky)", color: "var(--color-bg-base)", boxShadow: "0 0 20px rgba(95,201,255,.2)" }}>
              glow-sky
            </span>
            <span className="glow-pill" style={{ background: "var(--color-accent-coral)", color: "var(--color-bg-base)", boxShadow: "0 0 20px rgba(255,95,126,.2)" }}>
              glow-coral
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
            <div className="icon-badge lg">
              <IconChip className="ic" />
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              glow-step · icon badge
            </span>
          </div>
        </div>
      </div>

      {/* buttons + badges */}
      <div className="two-col mb">
        <div className="card">
          <div className="card-head">
            <div className="icon-badge lime">
              <IconTarget className="ic s" />
            </div>
            <span className="card-title">Buttons &amp; controls</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="btn-primary">
              <IconArrowRight className="ic" />
              Primary action
            </button>
            <button className="btn-secondary">
              <IconLayers className="ic s" />
              Secondary action
            </button>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge lime">
                <IconCheck className="ic xs" />
                output
              </span>
              <span className="badge sky">
                <IconClock className="ic xs" />
                20–40 min
              </span>
              <span className="badge coral">
                <IconAlert className="ic xs" />
                danger
              </span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="live-dot" />
                <span className="live-lbl">live</span>
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="icon-badge sky">
              <IconSearch className="ic s" />
            </div>
            <span className="card-title">Data display</span>
          </div>
          <div className="kv-row">
            <span className="k">Confidence</span>
            <span className="v lime">92.5%</span>
          </div>
          <div className="kv-row">
            <span className="k">Latency</span>
            <span className="v">14ms</span>
          </div>
          <div className="kv-row">
            <span className="k">Input</span>
            <span className="v sky">640×640</span>
          </div>
          <div className="kv-row" style={{ marginBottom: 0 }}>
            <span className="k">Model</span>
            <span className="v" style={{ color: "var(--color-text-dim)" }}>
              best_float32.tflite
            </span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="progress">
              <div style={{ width: "62%" }} />
            </div>
            <div
              className="mono"
              style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-text-dim)", marginTop: 6 }}
            >
              <span>PIPELINE</span>
              <span>4 / 6</span>
            </div>
          </div>
        </div>
      </div>

      {/* icon set */}
      <div className="card mb">
        <div className="card-head">
          <div className="icon-badge lime">
            <IconCamera className="ic s" />
          </div>
          <span className="card-title">Custom line-art icons — 24px grid, 2px stroke</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))", gap: 4 }}>
          {ALL_ICONS.map(([name, Ico]) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "10px 4px",
                borderRadius: 8,
                transition: "background .2s",
              }}
              className="icon-cell"
            >
              <span className="lime-t">
                <Ico className="ic l" />
              </span>
              <span className="mono" style={{ fontSize: 9, color: "var(--color-text-dim)" }}>
                {name}
              </span>
            </div>
          ))}
        </div>
        <style>{`.icon-cell:hover{background:rgba(255,255,255,.04)}`}</style>
      </div>

      {/* logo */}
      <div className="card mb">
        <div className="card-head">
          <div className="icon-badge sky">
            <IconTarget className="ic s" />
          </div>
          <span className="card-title">Identity — the MeshSight mark</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <Logo className="h-24 w-24 shrink-0 rounded-2xl" animated />
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 480 }}>
            <div className="kv-row" style={{ maxWidth: 340 }}>
              <span className="k">Brackets</span>
              <span className="v" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>viewfinder — capture</span>
            </div>
            <div className="kv-row" style={{ maxWidth: 340 }}>
              <span className="k">Mesh</span>
              <span className="v" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>objects linked to focus</span>
            </div>
            <div className="kv-row" style={{ maxWidth: 340, marginBottom: 0 }}>
              <span className="k">Rule</span>
              <span className="v" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>never recolored or restyled</span>
            </div>
          </div>
        </div>
      </div>

      {/* rules */}
      <div className="card">
        <div className="card-head">
          <div className="icon-badge coral">
            <IconAlert className="ic s" />
          </div>
          <span className="card-title">Rule reminders</span>
        </div>
        <div className="two-col" style={{ gap: 4 }}>
          <div>
            <div className="rule-row">
              <IconCheck className="ic s lime-t" />
              <span>font-mono for all numerical values</span>
            </div>
            <div className="rule-row">
              <IconCheck className="ic s lime-t" />
              <span>accent colors at /5 · /10 · /20 opacity</span>
            </div>
            <div className="rule-row">
              <IconCheck className="ic s lime-t" />
              <span>backdrop-blur on every overlay</span>
            </div>
            <div className="rule-row">
              <IconCheck className="ic s lime-t" />
              <span>custom-scrollbar on scrollable regions</span>
            </div>
          </div>
          <div>
            <div className="rule-row">
              <IconX className="ic s coral-t" />
              <span>never indigo or blue as primary</span>
            </div>
            <div className="rule-row">
              <IconX className="ic s coral-t" />
              <span>never text-white for labels — text-muted</span>
            </div>
            <div className="rule-row">
              <IconX className="ic s coral-t" />
              <span>never h-screen — use dvh units</span>
            </div>
            <div className="rule-row">
              <IconX className="ic s coral-t" />
              <span>never new accents outside lime/sky/coral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
