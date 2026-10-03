/**
 * Custom line-art illustrations for each pipeline step.
 * Consistent with the icon language (§9): 2px strokes, round caps,
 * mint primary / sky secondary, no emoji, no raster.
 */

const S = {
  stroke: "#BCFF5F",
  stroke2: "#5FC9FF",
  dim: "rgba(255,255,255,0.18)",
  fill: "rgba(52,199,129,0.08)",
  fill2: "rgba(95,201,255,0.08)",
};

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 320 150"
      className="h-auto w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/* 01 — Collect & annotate: photo with polygon trace */
function Collect() {
  return (
    <Frame label="A photo being annotated with a polygon around a cat">
      {/* photo */}
      <rect x="18" y="18" width="120" height="114" rx="10" stroke={S.dim} strokeWidth="2" />
      {/* simple cat shape */}
      <path
        d="M52 96c-6-10-4-26 8-34 4-10 10-14 14-14s10 4 14 14c12 8 14 24 8 34-8 6-36 6-44 0Z"
        stroke={S.stroke}
        strokeWidth="2"
        fill={S.fill}
      />
      <path d="M62 52 58 38l12 8M90 52l4-14-12 8" stroke={S.stroke} strokeWidth="2" />
      {/* polygon vertices */}
      {[
        [52, 96], [46, 66], [58, 38], [74, 48], [94, 38], [104, 66], [96, 96],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={S.stroke2} />
      ))}
      {/* arrow to annotation */}
      <path d="M150 75h30m-8-8 8 8-8 8" stroke={S.dim} strokeWidth="2" />
      {/* label chip */}
      <rect x="196" y="52" width="104" height="46" rx="10" stroke={S.stroke2} strokeWidth="2" fill={S.fill2} />
      <text x="248" y="72" textAnchor="middle" fill="#5FC9FF" fontSize="11" fontFamily="ui-monospace, monospace">
        label: cat
      </text>
      <text x="248" y="88" textAnchor="middle" fill="rgba(200,200,212,0.7)" fontSize="10" fontFamily="ui-monospace, monospace">
        polygon: 7 pts
      </text>
    </Frame>
  );
}

/* 02 — Colab pipeline: notebook cells running */
function Colab() {
  return (
    <Frame label="Colab notebook cells running the pipeline">
      {/* notebook */}
      <rect x="26" y="14" width="150" height="122" rx="10" stroke={S.dim} strokeWidth="2" />
      {[30, 58, 86, 114].map((y, i) => (
        <g key={i}>
          <rect x="40" y={y} width="122" height="18" rx="5" stroke={i < 3 ? S.stroke : S.stroke2} strokeWidth="1.6" fill={i < 3 ? S.fill : S.fill2} />
          <path d={`M48 ${y + 9}h${i < 3 ? 40 : 30}`} stroke={S.stroke} strokeWidth="2" opacity="0.7" />
          {/* play glyph */}
          <path d={`M150 ${y + 5}v8l7-4-7-4Z`} fill={i < 3 ? S.stroke : S.stroke2} stroke="none" />
        </g>
      ))}
      {/* arrow */}
      <path d="M186 75h28m-8-8 8 8-8 8" stroke={S.dim} strokeWidth="2" />
      {/* output archive */}
      <rect x="224" y="48" width="70" height="54" rx="8" stroke={S.stroke2} strokeWidth="2" fill={S.fill2} />
      <path d="M224 62h70" stroke={S.stroke2} strokeWidth="1.6" />
      <text x="259" y="84" textAnchor="middle" fill="#5FC9FF" fontSize="9.5" fontFamily="ui-monospace, monospace">
        organized.zip
      </text>
    </Frame>
  );
}

/* 03 — Split & cluster: one photo → crops → clusters */
function SplitCluster() {
  return (
    <Frame label="One photo split into crops, then clustered into variants">
      {/* source photo with two objects */}
      <rect x="10" y="42" width="66" height="66" rx="8" stroke={S.dim} strokeWidth="2" />
      <circle cx="32" cy="66" r="8" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} />
      <circle cx="52" cy="88" r="8" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} />
      <path d="M84 75h22m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
      {/* crops */}
      {[116, 148].map((x, i) => (
        <rect key={i} x={x} y="57" width="24" height="36" rx="5" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} />
      ))}
      <rect x="116" y="98" width="24" height="24" rx="5" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} opacity="0.55" />
      <rect x="148" y="98" width="24" height="24" rx="5" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} opacity="0.55" />
      <path d="M180 75h22m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
      {/* cluster field */}
      <g>
        <circle cx="228" cy="52" r="4" fill={S.stroke} />
        <circle cx="240" cy="60" r="4" fill={S.stroke} />
        <circle cx="230" cy="70" r="4" fill={S.stroke} />
        <circle cx="242" cy="80" r="4" fill={S.stroke2} />
        <circle cx="232" cy="92" r="4" fill={S.stroke2} />
        <circle cx="244" cy="102" r="4" fill={S.stroke2} />
        <circle cx="286" cy="70" r="4" fill="rgba(255,95,126,0.9)" />
        <circle cx="228" cy="52" r="20" stroke={S.stroke} strokeWidth="1.4" strokeDasharray="3 4" opacity="0.6" />
        <circle cx="238" cy="91" r="20" stroke={S.stroke2} strokeWidth="1.4" strokeDasharray="3 4" opacity="0.6" />
        <circle cx="286" cy="70" r="11" stroke="rgba(255,95,126,0.7)" strokeWidth="1.4" strokeDasharray="3 4" />
      </g>
      <text x="238" y="132" textAnchor="middle" fill="rgba(136,136,160,0.9)" fontSize="9" fontFamily="ui-monospace, monospace">
        cat_C1 · cat_C2 · outlier
      </text>
    </Frame>
  );
}

/* 04 — Convert to YOLO: folders → dataset with label files */
function Convert() {
  return (
    <Frame label="Cluster folders converted into a YOLO dataset">
      {/* folder stack */}
      <path d="M16 44h24l6 8h26a4 4 0 0 1 4 4v44a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V48a4 4 0 0 1 4-4Z" stroke={S.stroke} strokeWidth="2" fill={S.fill} />
      <text x="38" y="80" textAnchor="middle" fill="#BCFF5F" fontSize="10" fontFamily="ui-monospace, monospace">cat_C1</text>
      <path d="M84 75h20m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
      {/* dataset grid */}
      <g>
        {[
          [120, 34, "img"], [120, 66, "img"], [120, 98, "img"],
        ].map(([x, y, t], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="44" height="26" rx="6" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} />
            <text x={(x as number) + 22} y={(y as number) + 17} textAnchor="middle" fill="rgba(200,200,212,0.8)" fontSize="9" fontFamily="ui-monospace, monospace">{t}.jpg</text>
          </g>
        ))}
        {[34, 66, 98].map((y, i) => (
          <g key={i}>
            <rect x="176" y={y} width="44" height="26" rx="6" stroke={S.stroke2} strokeWidth="1.8" fill={S.fill2} />
            <text x="198" y={y + 17} textAnchor="middle" fill="#5FC9FF" fontSize="9" fontFamily="ui-monospace, monospace">.txt</text>
          </g>
        ))}
      </g>
      <path d="M232 75h18m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
      {/* yaml */}
      <rect x="256" y="46" width="52" height="58" rx="8" stroke={S.stroke} strokeWidth="2" fill={S.fill} />
      <path d="M264 62h36M264 72h28M264 82h36M264 92h20" stroke={S.stroke} strokeWidth="1.6" opacity="0.65" />
      <text x="282" y="122" textAnchor="middle" fill="rgba(136,136,160,0.9)" fontSize="9" fontFamily="ui-monospace, monospace">dataset.yaml</text>
    </Frame>
  );
}

/* 05 — Train & export: loss curve → chip */
function Train() {
  return (
    <Frame label="Training loss curve and TFLite model export">
      {/* axes */}
      <path d="M24 22v104h120" stroke={S.dim} strokeWidth="2" />
      {/* loss curve */}
      <path d="M28 36c22 2 30 34 44 48s34 22 66 24" stroke={S.stroke} strokeWidth="2.4" />
      <path d="M28 60c26 6 40 30 56 40s34 12 50 12" stroke={S.stroke2} strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
      <text x="84" y="140" textAnchor="middle" fill="rgba(136,136,160,0.9)" fontSize="9" fontFamily="ui-monospace, monospace">epochs →</text>
      <text x="14" y="26" textAnchor="middle" fill="rgba(136,136,160,0.9)" fontSize="9" fontFamily="ui-monospace, monospace" transform="rotate(-90 14 26)">loss</text>
      {/* arrow */}
      <path d="M156 75h26m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
      {/* chip */}
      <rect x="196" y="46" width="58" height="58" rx="10" stroke={S.stroke} strokeWidth="2" fill={S.fill} />
      <path d="M212 62h26M212 75h26M212 88h18" stroke={S.stroke} strokeWidth="1.6" opacity="0.6" />
      {[60, 75, 90].map((y) => (
        <g key={y}>
          <path d={`M254 ${y}h10`} stroke={S.stroke2} strokeWidth="2" />
          <path d={`M196 ${y}h-10`} stroke={S.stroke2} strokeWidth="2" />
        </g>
      ))}
      <text x="225" y="122" textAnchor="middle" fill="#5FC9FF" fontSize="9.5" fontFamily="ui-monospace, monospace">best.tflite</text>
      {/* phone hint */}
      <rect x="284" y="52" width="26" height="46" rx="6" stroke={S.dim} strokeWidth="2" />
      <path d="M292 92h10" stroke={S.dim} strokeWidth="2" />
      <path d="M310 75h0" stroke={S.dim} />
      <path d="M276 75h6" stroke={S.dim} strokeWidth="2" />
    </Frame>
  );
}

/* 06 — Android app: phone with live detection */
function Phone() {
  return (
    <Frame label="Phone running live detection with a box and mask">
      <rect x="128" y="8" width="64" height="134" rx="12" stroke={S.dim} strokeWidth="2" />
      <path d="M150 16h20" stroke={S.dim} strokeWidth="2" />
      {/* screen content: object + box */}
      <rect x="136" y="26" width="48" height="98" rx="6" fill="rgba(255,255,255,0.03)" />
      <path d="M152 96c-4-8-2-20 6-26 3-7 8-10 10-10s7 3 10 10c8 6 10 18 6 26-6 4-26 4-32 0Z" stroke={S.stroke} strokeWidth="1.8" fill={S.fill} />
      {/* detection box */}
      <rect x="144" y="52" width="36" height="48" rx="2" stroke={S.stroke} strokeWidth="2" />
      {/* label chip */}
      <rect x="144" y="42" width="34" height="10" rx="3" fill={S.stroke} />
      <text x="161" y="50" textAnchor="middle" fill="#1e1e24" fontSize="7" fontWeight="700" fontFamily="ui-monospace, monospace">CAT 94%</text>
      {/* live badge */}
      <circle cx="142" cy="32" r="2.6" fill={S.stroke2} />
      <text x="150" y="35" fill="#5FC9FF" fontSize="7.5" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="1">LIVE</text>
      {/* side annotations */}
      <g>
        <path d="M64 58h44m-6-6 6 6-6 6" stroke={S.dim} strokeWidth="2" />
        <text x="56" y="48" textAnchor="end" fill="rgba(200,200,212,0.8)" fontSize="10" fontFamily="ui-monospace, monospace">.tflite</text>
        <text x="56" y="62" textAnchor="end" fill="rgba(136,136,160,0.9)" fontSize="8.5">your model</text>
      </g>
      <g>
        <path d="M256 58h-44m6-6-6 6 6 6" stroke={S.dim} strokeWidth="2" />
        <text x="264" y="48" fill="rgba(200,200,212,0.8)" fontSize="10" fontFamily="ui-monospace, monospace">classes.txt</text>
        <text x="264" y="62" fill="rgba(136,136,160,0.9)" fontSize="8.5">your labels</text>
      </g>
    </Frame>
  );
}

const MAP: Record<string, () => React.ReactNode> = {
  "01-collect-and-annotate": Collect,
  "02-run-colab-pipeline": Colab,
  "03-split-and-cluster": SplitCluster,
  "04-convert-dataset": Convert,
  "05-train-and-export": Train,
  "06-android-app": Phone,
};

export default function StepIllustration({ slug }: { slug: string }) {
  const Scene = MAP[slug];
  if (!Scene) return null;
  return <Scene />;
}
