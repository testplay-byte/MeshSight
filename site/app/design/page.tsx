import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design",
  description:
    "The MeshSight design language — a dark-first, glass-morphism system with emerald accents, adapted from the Dark Neon Design System.",
};

const SURFACES = [
  { name: "bg-base", hex: "#1E1E24", use: "Page background" },
  { name: "bg-surface", hex: "#28282F", use: "Cards, panels" },
  { name: "bg-sidebar", hex: "#242430", use: "Nav, overlays" },
  { name: "bg-elevated", hex: "#333340", use: "Hover, active" },
];

const ACCENTS = [
  { name: "accent-mint", hex: "#34C781", role: "Primary — actions, success, brand" },
  { name: "accent-sky", hex: "#5FC9FF", role: "Secondary — info, links, focus" },
  { name: "accent-coral", hex: "#FF5F7E", role: "Danger — errors, destructive" },
];

const TEXT = [
  { name: "white", hex: "#FFFFFF", use: "Headlines, values" },
  { name: "text-secondary", hex: "#C8C8D4", use: "Body text" },
  { name: "text-muted", hex: "#8888A0", use: "Labels, captions" },
  { name: "text-dim", hex: "#55556A", use: "Hints, decorative" },
];

function Swatch({ hex, label, sub }: { hex: string; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded-xl border border-white/10"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <div className="truncate font-mono text-xs font-semibold text-white">
          {label}
        </div>
        <div className="font-mono text-[11px] text-text-muted">{hex}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-text-dim">{sub}</div>}
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{desc}</p>
      </div>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full border border-accent-mint/20 bg-accent-mint/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-mint-soft">
          Design language
        </span>
        <h1 className="text-3xl font-bold text-white">
          The MeshSight visual system
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          This site and the app share one design language: a dark-first,
          glass-morphism system built on muted surfaces with a single vivid
          accent. It is adapted from a broader <em>Dark Neon</em> system, with
          the brand color swapped to MeshSight emerald and the palette trimmed
          to what this product actually needs.
        </p>
      </header>

      <Section
        title="Surfaces"
        desc="Every surface starts dark. Depth comes from elevation and glass, not from light backgrounds."
      >
        <div className="grid gap-4 rounded-2xl border border-white/[0.08] bg-bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
          {SURFACES.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.use} />
          ))}
        </div>
      </Section>

      <Section
        title="Accents"
        desc="Mint carries all brand energy and primary actions. Sky is informational; coral is reserved strictly for danger. Never a fourth accent."
      >
        <div className="grid gap-4 rounded-2xl border border-white/[0.08] bg-bg-surface p-6 sm:grid-cols-3">
          {ACCENTS.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.role} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 rounded-2xl border border-white/[0.08] bg-bg-surface p-6">
          <button className="h-11 rounded-xl bg-accent-mint px-5 text-sm font-medium text-bg-base shadow-glow-mint transition-all hover:bg-accent-mint-soft">
            Primary
          </button>
          <button className="h-11 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white transition-all hover:bg-white/[0.08]">
            Secondary
          </button>
          <button className="h-11 rounded-xl border border-accent-mint/25 bg-accent-mint/10 px-5 text-sm font-medium text-accent-mint transition-all hover:bg-accent-mint/20">
            Toggle · on
          </button>
          <button className="h-11 rounded-xl border border-accent-coral/25 bg-accent-coral/10 px-5 text-sm font-medium text-accent-coral transition-all hover:bg-accent-coral/20">
            Danger
          </button>
        </div>
      </Section>

      <Section
        title="Text hierarchy"
        desc="Labels use muted; values use white or an accent. Dim is decorative only — never something the user must read."
      >
        <div className="grid gap-4 rounded-2xl border border-white/[0.08] bg-bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEXT.map((s) => (
            <Swatch key={s.name} hex={s.hex} label={s.name} sub={s.use} />
          ))}
        </div>
      </Section>

      <Section
        title="Typography"
        desc="Geist Sans for UI and prose; Geist Mono for every number, path, and technical token — so data aligns and reads as data."
      >
        <div className="grid gap-6 rounded-2xl border border-white/[0.08] bg-bg-surface p-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Display / headings — Sans
            </p>
            <p className="text-3xl font-bold text-white">Train your own model</p>
            <p className="text-lg font-semibold text-white">Section heading</p>
            <p className="text-sm text-text-secondary">
              Body copy sits at 14px with relaxed line-height for comfortable
              reading across the guides.
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Data — Mono
            </p>
            <p className="font-mono text-2xl font-bold text-accent-mint">92.5%</p>
            <p className="font-mono text-sm text-white">14ms · 640×640</p>
            <p className="font-mono text-xs text-text-muted">
              colab/04_process_images.py
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Shape & glass"
        desc="Cards round at 16px, controls at 12px. Overlays use backdrop-blur over a translucent surface — never a solid fill."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-bg-surface p-5">
            <div className="mb-3 h-9 w-9 rounded-lg border border-accent-mint/15 bg-accent-mint/10" />
            <p className="text-sm font-semibold text-white">Card · 16px radius</p>
            <p className="mt-1 text-xs text-text-muted">Default content container.</p>
          </div>
          <div className="rounded-xl border border-white/[0.12] bg-bg-sidebar/90 p-5 backdrop-blur-2xl">
            <div className="mb-3 h-9 w-9 rounded-xl border border-accent-sky/20 bg-accent-sky/10" />
            <p className="text-sm font-semibold text-white">Glass · blur + border</p>
            <p className="mt-1 text-xs text-text-muted">Floating overlays, popups.</p>
          </div>
          <div className="rounded-2xl border border-accent-mint/20 bg-accent-mint/5 p-5">
            <div className="mb-3 h-9 w-9 rounded-lg border border-accent-mint/25 bg-accent-mint/10 shadow-glow-mint" />
            <p className="text-sm font-semibold text-white">Glow · accent halo</p>
            <p className="mt-1 text-xs text-text-muted">Focus and active emphasis.</p>
          </div>
        </div>
      </Section>

      <Section
        title="The logo"
        desc="A scan frame around a recognition mesh — the exact idea of the product: view what's there, connect it, recognize it. The same mint→emerald gradient runs through the whole system."
      >
        <div className="flex flex-wrap items-center gap-8 rounded-2xl border border-white/[0.08] bg-bg-surface p-8">
          <svg viewBox="0 0 512 512" className="h-32 w-32 rounded-3xl shadow-glow-mint">
            <defs>
              <linearGradient id="dgrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#34C781" />
                <stop offset="1" stopColor="#109669" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="112" fill="url(#dgrad)" />
            <g fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
              <path d="M110 190 V130 L170 110" />
              <path d="M342 110 L402 130 V190" />
              <path d="M402 322 V382 L342 402" />
              <path d="M170 402 L110 382 V322" />
            </g>
            <g stroke="#fff" strokeWidth="3">
              <line x1="256" y1="168" x2="182" y2="240" />
              <line x1="256" y1="168" x2="330" y2="240" />
              <line x1="182" y1="240" x2="214" y2="330" />
              <line x1="330" y1="240" x2="298" y2="330" />
              <line x1="214" y1="330" x2="298" y2="330" />
              <line x1="182" y1="240" x2="256" y2="252" />
              <line x1="330" y1="240" x2="256" y2="252" />
              <line x1="214" y1="330" x2="256" y2="252" />
              <line x1="298" y1="330" x2="256" y2="252" />
              <line x1="256" y1="168" x2="256" y2="252" />
            </g>
            <g fill="#fff">
              <circle cx="256" cy="168" r="7" />
              <circle cx="182" cy="240" r="7" />
              <circle cx="330" cy="240" r="7" />
              <circle cx="214" cy="330" r="7" />
              <circle cx="298" cy="330" r="7" />
              <circle cx="256" cy="252" r="9" />
            </g>
          </svg>
          <div className="flex flex-col gap-2 text-sm text-text-secondary">
            <p><span className="font-semibold text-white">Meaning.</span> Brackets = the camera viewfinder; the mesh = detected objects linked to a focus point.</p>
            <p><span className="font-semibold text-white">Gradient.</span> #34C781 → #109669, the brand emerald, used only for the logo tile and primary actions.</p>
            <p><span className="font-semibold text-white">Rule.</span> White mark on emerald, or emerald mark on dark — never a new color.</p>
          </div>
        </div>
      </Section>

      <Section
        title="Principles"
        desc="The rules that keep the system coherent."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Dark-first", "Every surface starts dark; light is added only through accent and subtle borders."],
            ["Glass, not flat", "Overlays use backdrop-blur and translucent fills to create depth."],
            ["Monospace for data", "All numbers, paths and technical values use mono with tabular alignment."],
            ["One accent family", "Mint leads, sky informs, coral warns — no colors outside the system."],
            ["Motion with meaning", "Animation communicates state and guides attention, never delays the user."],
            ["Mobile-first", "Design for touch, then enhance for wide screens."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-xl border border-white/[0.08] bg-bg-surface/60 p-4"
            >
              <p className="text-sm font-semibold text-white">{t}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <p className="text-center text-xs text-text-dim">
        The full token reference lives in{" "}
        <a
          href="https://github.com/testplay-byte/MeshSight/blob/main/docs/DESIGN.md"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-accent-mint-soft hover:text-white"
        >
          docs/DESIGN.md
        </a>
        .
      </p>
    </div>
  );
}
