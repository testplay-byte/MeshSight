import type { Metadata } from "next";
import Link from "next/link";
import { getGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "The MeshSight workflow, start to finish — six steps from raw photos to live detection on your phone.",
};

export default function GuidesPage() {
  const guides = getGuides();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Start-to-finish guides</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
          Follow the steps in order — each one produces exactly what the next
          expects. The timeline shows where you are in the pipeline; you can
          jump between steps any time.
        </p>
      </div>

      <div className="relative">
        {/* vertical rail */}
        <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-accent-mint via-white/10 to-accent-sky" />

        <ol className="flex flex-col gap-4">
          {guides.map((g) => (
            <li key={g.slug} className="relative pl-16">
              <span className="absolute left-0 top-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent-mint/30 bg-bg-surface font-mono text-lg font-bold text-accent-mint shadow-glow-mint">
                {g.step}
              </span>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-2xl border border-white/[0.08] bg-bg-surface/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-accent-mint/30 hover:bg-bg-elevated/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    {g.short}
                  </h2>
                  <span className="rounded-lg border border-accent-sky/20 bg-accent-sky/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-sky">
                    Step {g.step} of {guides.length}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  {g.description}
                </p>
                {g.goal && (
                  <p className="mt-3 border-l-2 border-accent-mint/40 pl-3 text-xs leading-relaxed text-text-secondary">
                    <span className="font-semibold uppercase tracking-wider text-accent-mint-soft">
                      Goal:{" "}
                    </span>
                    {g.goal}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
