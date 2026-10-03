"use client";

import { useRouter } from "next/navigation";

/**
 * The pipeline flow — big, bold, and clickable.
 * Every node routes to its guide; each node shows the expected duration.
 * Lime connectors carry the data path, sky the results, and the final
 * phone node is the payoff.
 */

export type FlowStage = {
  href: string;
  label: string;
  sub: string;
  time: string;
};

const NODE_W = 150;
const NODE_H = 84;
const TOP_CENTERS = [90, 270, 450, 630];
const BOT_CENTERS = [180, 360, 540];
const TOP_Y = 70;
const BOT_Y = 262;

export default function PipelineDiagram({ stages }: { stages: FlowStage[] }) {
  const router = useRouter();
  const top = stages.slice(0, 4);
  const bottom = stages.slice(4, 7);

  const Node = ({
    cx,
    cy,
    s,
    accent,
  }: {
    cx: number;
    cy: number;
    s: FlowStage;
    accent: string;
  }) => (
    <g
      className="flow-node"
      onClick={() => router.push(s.href)}
      role="link"
      aria-label={`${s.label} guide (${s.time})`}
    >
      <rect
        x={cx - NODE_W / 2}
        y={cy - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={14}
        fill="#28282f"
        stroke="rgba(255,255,255,0.1)"
        style={{ transition: "stroke .2s" }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="600">
        {s.label}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#8888a0" fontSize="11">
        {s.sub}
      </text>
      <text
        x={cx}
        y={cy + 30}
        textAnchor="middle"
        fill={accent}
        fontSize="11"
        fontFamily="ui-monospace, monospace"
      >
        {s.time}
      </text>
    </g>
  );

  const HArrow = ({
    x1,
    x2,
    y,
    color,
  }: {
    x1: number;
    x2: number;
    y: number;
    color: string;
  }) => (
    <g stroke={color} strokeWidth="2.5">
      <line x1={x1} y1={y} x2={x2 - 10} y2={y} strokeDasharray="7 8" className="flow-line" />
      <path d={`M${x2} ${y}l-10-6v12Z`} fill={color} stroke="none" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 720 340"
      className="h-auto w-full"
      role="group"
      aria-label="Pipeline flow — click a stage to open its guide"
    >
      {/* top row connectors (lime — the data path) */}
      {top.slice(0, -1).map((s, i) => (
        <HArrow
          key={i}
          x1={TOP_CENTERS[i] + NODE_W / 2 + 6}
          x2={TOP_CENTERS[i + 1] - NODE_W / 2 - 6}
          y={TOP_Y}
          color="#BCFF5F"
        />
      ))}

      {/* wrap connector (sky — Split & Cluster down to Convert) */}
      <path
        d={`M${TOP_CENTERS[3]} ${TOP_Y + NODE_H / 2 + 8}V160H${BOT_CENTERS[0]}V${
          BOT_Y - NODE_H / 2 - 8
        }`}
        fill="none"
        stroke="#5FC9FF"
        strokeWidth="2.5"
        strokeDasharray="7 8"
        className="flow-line"
      />
      <path
        d={`M${BOT_CENTERS[0]} ${BOT_Y - NODE_H / 2 - 2}l-7-12h14Z`}
        fill="#5FC9FF"
        stroke="none"
      />

      {/* bottom row connectors (lime) */}
      {bottom.slice(0, -1).map((s, i) => (
        <HArrow
          key={i}
          x1={BOT_CENTERS[i] + NODE_W / 2 + 6}
          x2={BOT_CENTERS[i + 1] - NODE_W / 2 - 6}
          y={BOT_Y}
          color="#BCFF5F"
        />
      ))}

      {/* nodes — lime accents on the work, sky on the results */}
      {top.map((s, i) => (
        <Node key={s.href} cx={TOP_CENTERS[i]} cy={TOP_Y} s={s} accent="#BCFF5F" />
      ))}
      {bottom.map((s, i) => (
        <Node
          key={s.href}
          cx={BOT_CENTERS[i]}
          cy={BOT_Y}
          s={s}
          accent={i === bottom.length - 1 ? "#BCFF5F" : "#5FC9FF"}
        />
      ))}
    </svg>
  );
}
