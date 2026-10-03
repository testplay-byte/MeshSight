import type { SVGProps } from "react";

/**
 * Custom line-art icon set for MeshSight.
 *
 * DESIGN.md §9: consistent 24×24 grid, 2px stroke, round caps/joins,
 * `currentColor` inheritance. Sizes follow §9.2 — the component renders
 * at 24 and scales via the `className` width/height utilities.
 * No emoji anywhere in production UI (§20).
 */

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Svg({ children, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Pipeline / domain icons ──────────────────────────────────────── */

/** Camera viewfinder — collect photos */
export const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h2.5L8 5.5h8L17.5 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </Svg>
);

/** Polygon trace — annotation */
export const IconPolygon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 20 9l-3 9.5H7L4 9l8-5.5Z" />
    <circle cx="12" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="20" cy="9" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="7" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="4" cy="9" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
);

/** Cloud with play — Colab pipeline */
export const IconCloudRun = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 18a4.5 4.5 0 0 1-.4-8.98 6 6 0 0 1 11.6 1.06A4 4 0 0 1 17.5 18h-11Z" />
    <path d="m10.5 11 4 2.5-4 2.5V11Z" />
  </Svg>
);

/** Scatter — split & cluster */
export const IconScatter = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="7" r="1.6" />
    <circle cx="10.5" cy="12" r="1.6" />
    <circle cx="7" cy="17" r="1.6" />
    <circle cx="16" cy="6.5" r="1.6" />
    <circle cx="18.5" cy="13.5" r="1.6" />
    <circle cx="14.5" cy="18" r="1.6" />
    <path d="M6 7 10.5 12 7 17M16 6.5l2.5 7-4 4.5" strokeDasharray="2 2.5" />
  </Svg>
);

/** Database with layers — dataset format */
export const IconDatabase = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
    <path d="M4.5 5.5v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-6" />
    <path d="M4.5 11.5v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-6" />
  </Svg>
);

/** CPU with spark — train & export */
export const IconChip = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
    <path d="M10 10.5h4M12 8.5v7" opacity="0" />
    <path d="m13.2 8.8-2.4 3.2h2.4l-2.4 3.2" />
    <path d="M9 3.5v3M15 3.5v3M9 17.5v3M15 17.5v3M3.5 9h3M3.5 15h3M17.5 9h3M17.5 15h3" />
  </Svg>
);

/** Phone with scan — the app */
export const IconPhoneScan = (p: IconProps) => (
  <Svg {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M10.5 19.5h3" />
    <path d="M10 8.5V10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8.5" opacity="0" />
    <path d="M9.75 12.25 12 10l2.25 2.25" />
    <path d="M12 10v5" />
  </Svg>
);

/* ── Feature icons ────────────────────────────────────────────────── */

/** Crop frame — one object per sample */
export const IconCrop = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 2.5v15a1 1 0 0 0 1 1h15" />
    <path d="M2.5 6.5h15a1 1 0 0 1 1 1v15" />
  </Svg>
);

/** Network graph — variants discovered */
export const IconNetwork = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M10.8 6.9 6.2 16.1M13.2 6.9l4.6 9.2M7.2 18h9.6" />
  </Svg>
);

/** Constellation map */
export const IconMap = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 4-6 2.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
    <path d="M9 4v13M15 6.5v13" />
  </Svg>
);

/** Lock — privacy */
export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
  </Svg>
);

/** CI runner — zero local builds */
export const IconRunner = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
  </Svg>
);

/* ── UI icons ─────────────────────────────────────────────────────── */

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v11M7.5 10 12 14.5 16.5 10" />
    <path d="M4 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
  </Svg>
);

export const IconGithub = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

/** Alias used by the design page's rule rows */
export const IconX = IconClose;

/** Copy to clipboard */
export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </Svg>
);

/** Chevron for expandable details */
export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3.5 12.5 8.5 4.7 8.5-4.7" />
    <path d="m3.5 16.8 8.5 4.7 8.5-4.7" opacity="0.5" />
  </Svg>
);

export const IconFolder = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h6a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-11Z" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconPalette = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.1-9-7.1Z" />
    <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3.5A2.5 2.5 0 0 0 17.5 1H6.5A2.5 2.5 0 0 0 4 3.5v16Z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </Svg>
);

export const IconExternalLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10" />
  </Svg>
);

/** Dashboard — four tiles (home nav) */
export const IconDash = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Svg>
);

/** Target / focus */
export const IconTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

/** Alert triangle — warn status */
export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

/** Guide icon lookup by slug */
export const GUIDE_ICONS: Record<string, (p: IconProps) => React.ReactNode> = {
  "01-collect-and-organize": IconCamera,
  "02-annotate": IconPolygon,
  "03-run-colab-pipeline": IconCloudRun,
  "04-split-and-cluster": IconScatter,
  "05-convert-dataset": IconDatabase,
  "06-train-and-export": IconChip,
  "07-android-app": IconPhoneScan,
};
