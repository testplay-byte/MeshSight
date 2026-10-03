import { useId } from "react";

/**
 * MeshSight logo — scan-frame brackets around a recognition mesh.
 * `animated` draws the frame + mesh in, then pops the nodes (hero use).
 * Static version is used in the nav/footer.
 */
export default function Logo({
  className = "",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const grad = `lg-${id}`;

  const brackets = [
    "M110 190 V130 L170 110",
    "M342 110 L402 130 V190",
    "M402 322 V382 L342 402",
    "M170 402 L110 382 V322",
  ];

  const lines: [number, number, number, number][] = [
    [256, 168, 182, 240],
    [256, 168, 330, 240],
    [182, 240, 214, 330],
    [330, 240, 298, 330],
    [214, 330, 298, 330],
    [182, 240, 256, 252],
    [330, 240, 256, 252],
    [214, 330, 256, 252],
    [298, 330, 256, 252],
    [256, 168, 256, 252],
  ];

  const nodes: [number, number, number][] = [
    [256, 168, 7],
    [182, 240, 7],
    [330, 240, 7],
    [214, 330, 7],
    [298, 330, 7],
  ];

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="MeshSight logo"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34C781" />
          <stop offset="1" stopColor="#109669" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${grad})`} />

      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {brackets.map((d, i) => (
          <path
            key={d}
            d={d}
            className={animated ? "draw-line" : undefined}
            style={animated ? { animationDelay: `${0.1 + i * 0.12}s` } : undefined}
          />
        ))}
      </g>

      <g stroke="#FFFFFF" strokeWidth="3" opacity="0.95">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={animated ? "draw-line" : undefined}
            style={animated ? { animationDelay: `${0.7 + i * 0.07}s` } : undefined}
          />
        ))}
      </g>

      <g fill="#FFFFFF">
        {nodes.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            className={animated ? "pop-node" : undefined}
            style={animated ? { animationDelay: `${1.5 + i * 0.12}s` } : undefined}
          />
        ))}
        <circle
          cx="256"
          cy="252"
          r="9"
          className={animated ? "pop-node pulse-core" : undefined}
          style={animated ? { animationDelay: "2.1s" } : undefined}
        />
      </g>
    </svg>
  );
}
