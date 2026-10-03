/**
 * Animated pipeline diagram: the six stages of MeshSight with flowing
 * connection lines. Pure SVG + CSS — no runtime animation library needed.
 */
export default function PipelineDiagram() {
  const stages = [
    { x: 60, label: "Photos", sub: "collect" },
    { x: 200, label: "Annotate", sub: "polygons" },
    { x: 340, label: "Colab", sub: "split + cluster" },
    { x: 480, label: "YOLO", sub: "dataset" },
  ];
  const bottom = [
    { x: 130, label: "Train", sub: "YOLOv8-se" },
    { x: 270, label: "Export", sub: ".tflite" },
    { x: 410, label: "Phone", sub: "live detection" },
  ];

  const Node = ({ x, y, label, sub }: { x: number; y: number; label: string; sub: string }) => (
    <g>
      <rect
        x={x - 58}
        y={y - 26}
        width="116"
        height="52"
        rx="14"
        fill="#28282f"
        stroke="rgba(255,255,255,0.1)"
      />
      <text x={x} y={y - 2} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">
        {label}
      </text>
      <text x={x} y={y + 15} textAnchor="middle" fill="#8888a0" fontSize="10">
        {sub}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 540 260" className="w-full" role="img" aria-label="MeshSight pipeline diagram">
      {/* top row connectors */}
      {stages.slice(0, -1).map((s, i) => (
        <line
          key={i}
          x1={s.x + 58}
          y1="70"
          x2={stages[i + 1].x - 58}
          y2="70"
          stroke="#34C781"
          strokeWidth="2"
          className="flow-line"
        />
      ))}
      {/* top → bottom connector */}
      <path
        d="M480 96 V130 H130 V144"
        fill="none"
        stroke="#5FC9FF"
        strokeWidth="2"
        className="flow-line"
      />
      {/* bottom row connectors */}
      {bottom.slice(0, -1).map((s, i) => (
        <line
          key={i}
          x1={s.x + 58}
          y1="170"
          x2={bottom[i + 1].x - 58}
          y2="170"
          stroke="#34C781"
          strokeWidth="2"
          className="flow-line"
        />
      ))}
      {stages.map((s) => (
        <Node key={s.label} x={s.x} y={70} label={s.label} sub={s.sub} />
      ))}
      {bottom.map((s) => (
        <Node key={s.label} x={s.x} y={170} label={s.label} sub={s.sub} />
      ))}
    </svg>
  );
}
