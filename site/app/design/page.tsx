import type { Metadata } from "next";
import Logo from "@/components/Logo";
import {
  IconArrowRight,
  IconCamera,
  IconChip,
  IconClock,
  IconCrop,
  IconGithub,
  IconLock,
  IconMap,
  IconNetwork,
  IconPhoneScan,
  IconPolygon,
  IconRunner,
  IconScatter,
  IconSearch,
  IconDatabase,
  IconCloudRun,
  IconLayers,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Design",
  description:
    "The MeshSight design language — a dark-first, glass system with one brand accent, monospace for data, and custom line-art icons.",
};

const SURFACES = [
  { name: "bg-base", hex: "#1E1E24", use: "Page background" },
  { name: "bg-surface", hex: "#28282F", use: "Cards, panels" },
  { name: "bg-sidebar", hex: "#242430", use: "Nav, code blocks" },
  { name: "bg-elevated", hex: "#333340", use: "Hover, active" },
];

const ACCENTS = [
  { name: "accent-lime", hex: "#34C781", role: "Primary — actions, success, brand" },
  { name: "accent-sky", hex: "#5FC9FF", role: "Secondary — info, steps, focus" },
  { name: "accent-coral", hex: "#FF5F7E", role: "Danger — errors only" },
];

const TEXT = [
  { name: "white", hex: "#FFFFFF", use: "Headlines, values" },
  { name: "text-secondary", hex: "#C8C8D4", use: "Body text" },
  { name: "text-muted", hex: "#8888A0", use: "Labels, captions" },
  { name: "text-dim", hex: "#55556A", use: "Decorative only" },
];

const ALL_ICONS = [
  ["IconCamera", IconCamera],
  ["IconPolygon", IconPolygon],
  ["IconCloudRun", IconCloudRun],
  ["IconScatter", IconScatter],
  ["IconDatabase", IconDatabase],
  ["IconChip", IconChip],
  ["IconPhoneScan", IconPhoneScan],
  ["IconCrop", IconCrop],
  ["IconNetwork", IconNetwork],
  ["IconMap", IconMap],
  ["IconLock", IconLock],
  ["IconRunner", IconRunner],
  ["IconLayers", IconLayers],
  ["IconSearch", IconSearch],
  ["IconClock", IconClock],
  ["IconGithub", IconGithub],
  ["IconArrowRight", IconArrowRight],
] as const;

function Swatch({ hex, label, sub }: { hex: string; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-10 w-10 shrink-0 rounded-xl border border-line"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <div className="data-mono truncate text-xs font-semibold text-white">
          {label}
        </div>
        <div className="data-mono text-[11px] text-text-muted">{hex}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-text-dim">{sub}</div>}
      </div>
    </div>
  );
}

function Section({
  kicker,
  title,
  desc,
  children,
}: {
  kicker: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="label-micro-bold text-accent-lime">{kicker}</span>
        <span className="h-px flex-1 bg-line-subtle" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-muted">
          {desc}
        </p>
      </div>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10 rounded-lg" />
          <div>
            <p className="label-micro-bold">Design language</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Dark-first. Glass. One accent.
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          This site and the app share one visual system, adapted from a
          broader Dark Neon design language: muted dark surfaces, glass
          overlays, monospace for all data, and a single vivid brand accent.
          The full token reference lives in{" "}
          <a
            href="https://github.com/testplay-byte/MeshSight/blob/main/docs/DESIGN.md"
            target="_blank"
            rel="noreferrer"
            className="text-accent-lime-bright underline decoration-accent-lime/30 underline-offset-2 transition-colors hover:text-white"
          >
            docs/DESIGN.md
          </a>
          .
        </p>
      </header>

      <Section
        kicker="01 · Color"
        title="Surfaces"
        desc="Every surface starts dark. Depth comes from elevation and glass — never from light backgrounds."
      >
        <div className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {SURFACES.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.use} />
          ))}
        </div>
      </Section>

      <Section
        kicker="01 · Color"
        title="Accents"
        desc="Lime (MeshSight mint) carries all brand energy and primary actions. Sky is informational; coral is strictly danger. No fourth accent, ever."
      >
        <div className="card grid gap-4 p-6 sm:grid-cols-3">
          {ACCENTS.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.role} />
          ))}
        </div>
        <div className="card flex flex-wrap items-center gap-3 p-6">
          <button className="flex h-11 items-center gap-2 rounded-xl bg-accent-lime px-5 text-sm font-medium text-bg-base shadow-glow-lime transition-all duration-300 hover:bg-accent-lime-bright">
            Primary
            <IconArrowRight className="h-4 w-4" />
          </button>
          <button className="h-11 rounded-xl border border-line-strong bg-white/[0.04] px-5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.08]">
            Secondary
          </button>
          <button className="h-11 rounded-xl border border-accent-lime/20 bg-accent-lime/10 px-5 text-sm font-medium text-accent-lime transition-all duration-200 hover:bg-accent-lime/20">
            Toggle · on
          </button>
          <span className="badge-sky">
            <IconClock className="h-3 w-3" />
            20–40 min
          </span>
          <span className="badge-coral">danger</span>
        </div>
      </Section>

      <Section
        kicker="01 · Color"
        title="Text hierarchy"
        desc="Labels use muted; values use white or an accent. Dim is decorative only — never required reading."
      >
        <div className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEXT.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.use} />
          ))}
        </div>
      </Section>

      <Section
        kicker="02 · Type"
        title="Typography"
        desc="Geist Sans for UI and prose; Geist Mono for every number, path, and technical token — so data aligns and reads as data."
      >
        <div className="card grid gap-6 p-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="label-micro">Display / headings — sans</p>
            <p className="text-3xl font-bold text-white">Train your own model</p>
            <p className="text-lg font-semibold text-white">Section heading</p>
            <p className="text-sm text-text-secondary">
              Body copy sits at 14–15px with relaxed line-height for
              comfortable reading across the guides.
            </p>
          </div>
          <div className="flex flex-col gap-3 border-line-subtle sm:border-l sm:pl-6">
            <p className="label-micro">Data — mono, tabular</p>
            <p className="data-mono text-2xl font-bold text-accent-lime">92.5%</p>
            <p className="data-mono text-sm text-white">14ms · 640×640</p>
            <p className="data-mono text-xs text-text-muted">
              colab/04_process_images.py
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="03 · Icons"
        title="Custom line-art icons"
        desc="One 24px grid, 2px strokes, round caps, currentColor inheritance. Every icon in the product is drawn here — no emoji, no mixed libraries."
      >
        <div className="card grid grid-cols-3 gap-2 p-6 sm:grid-cols-5 lg:grid-cols-6">
          {ALL_ICONS.map(([name, Ico]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <span className="text-accent-lime">
                <Ico className="h-5 w-5" />
              </span>
              <span className="data-mono text-center text-[9px] leading-tight text-text-dim">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        kicker="04 · Shape"
        title="Cards & glass"
        desc="Cards round at 16px, controls at 12px, badges at 8px. Overlays use backdrop-blur over a translucent surface — never a solid fill."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="icon-badge icon-badge-lime mb-3">
              <IconLayers className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-white">Card · 16px</p>
            <p className="mt-1 text-xs text-text-muted">
              Default content container with a hairline border.
            </p>
          </div>
          <div className="glass p-5">
            <div className="icon-badge icon-badge-sky mb-3">
              <IconLock className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-white">Glass · blur</p>
            <p className="mt-1 text-xs text-text-muted">
              Floating overlays and popups: 97% fill + 16px blur.
            </p>
          </div>
          <div className="rounded-2xl border border-accent-lime/20 bg-accent-lime/5 p-5">
            <div className="icon-badge icon-badge-lime shadow-glow-step mb-3">
              <IconChip className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-white">Glow · halo</p>
            <p className="mt-1 text-xs text-text-muted">
              Accent glow marks focus, live state and emphasis.
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="05 · Motion"
        title="Animation with meaning"
        desc="Motion communicates state and guides attention — it never delays the user. Draws, pops, flows and pings are all CSS."
      >
        <div className="card flex flex-wrap items-center gap-x-10 gap-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="live-dot text-accent-lime" />
            <span className="text-xs text-text-muted">live ping — status</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="blink-cursor" />
            <span className="text-xs text-text-muted">blink — input focus</span>
          </div>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 80 8" className="h-2 w-20">
              <line
                x1="0" y1="4" x2="80" y2="4"
                stroke="#34C781" strokeWidth="2"
                strokeDasharray="8 10"
                className="flow-line"
              />
            </svg>
            <span className="text-xs text-text-muted">flow — pipeline</span>
          </div>
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 rounded-lg" animated />
            <span className="text-xs text-text-muted">draw-in — identity</span>
          </div>
        </div>
      </Section>

      <Section
        kicker="06 · Identity"
        title="The logo"
        desc="A scan frame around a recognition mesh — see what's there, connect it, recognize it. White mark on emerald, or emerald mark on dark. Never recolored."
      >
        <div className="card flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center">
          <Logo className="h-28 w-28 shrink-0 rounded-3xl shadow-glow-lime" animated />
          <div className="flex flex-col gap-2 text-sm text-text-secondary">
            <p>
              <span className="font-semibold text-white">Brackets</span> — the
              camera viewfinder: capture and frame the world.
            </p>
            <p>
              <span className="font-semibold text-white">Mesh</span> — detected
              objects linked to one bright focus point: recognition.
            </p>
            <p>
              <span className="font-semibold text-white">Gradient</span> —{" "}
              <span className="data-mono text-accent-lime-bright">#34C781 → #109669</span>
              , reserved for the logo tile and primary actions.
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="07 · Rules"
        title="Principles"
        desc="The rules that keep the system coherent."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Dark-first", "Every surface starts dark; light comes only from accent and subtle borders."],
            ["Glass, not flat", "Overlays use backdrop-blur and translucent fills to create depth."],
            ["Monospace for data", "Numbers, paths and technical values use mono with tabular alignment."],
            ["One accent family", "Lime leads, sky informs, coral warns — no colors outside the system."],
            ["Motion with meaning", "Animation communicates state — it never slows the user down."],
            ["Mobile-first", "Design for touch, then enhance for wide screens."],
          ].map(([t, d]) => (
            <div key={t} className="card flex gap-3 p-4">
              <span className="icon-badge icon-badge-lime mt-0.5 h-6 w-6 shrink-0 rounded-md text-[10px]">
                ✓
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
