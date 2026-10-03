import Link from "next/link";
import { IconArrowRight, IconSearch } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <span className="icon-badge icon-badge-lg icon-badge-sky">
        <IconSearch className="h-5 w-5 opacity-50" />
      </span>
      <h1 className="text-xl font-bold text-white">Page not found</h1>
      <p className="max-w-sm text-sm leading-relaxed text-text-muted">
        This page isn't part of the pipeline. The guides cover everything from
        photos to on-device detection.
      </p>
      <Link
        href="/guides"
        className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-accent-lime px-5 text-sm font-medium text-bg-base shadow-glow-lime transition-all duration-300 hover:bg-accent-lime-bright"
      >
        Browse the guides
        <IconArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
