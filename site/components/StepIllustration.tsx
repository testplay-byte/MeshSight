/**
 * Custom line-art illustrations for the pipeline steps.
 *
 * Design rules:
 *  - viewBox 560x280, 2.5px strokes, round caps - scales cleanly at any size
 *  - large text (14px+) so it stays readable when the SVG shrinks on mobile
 *  - lime = the object / the action, sky = results & outputs, coral = outliers
 *  - no tiny labels: one or two words maximum per scene
 */

const S = {
  lime: "#BCFF5F",
  sky: "#5FC9FF",
  coral: "#ff8296",
  dim: "rgba(255,255,255,0.16)",
  soft: "rgba(255,255,255,0.55)",
  fill: "rgba(188,255,95,0.07)",
  fill2: "rgba(95,201,255,0.07)",
};

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 560 280"
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

function Arrow({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y}h56m-14-11 14 11-14 11`}
      stroke={S.soft}
      strokeWidth="2.5"
    />
  );
}

/* collect: camera -> sorted class folders */
function collect() {
  return (
    <Frame label="Photos being sorted into one folder per class">
      <rect x="30" y="86" width="120" height="96" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <circle cx="90" cy="126" r="26" stroke={S.lime} strokeWidth="2.5" />
      <circle cx="90" cy="126" r="10" fill={S.lime} stroke="none" />
      <rect x="46" y="74" width="34" height="14" rx="5" stroke={S.dim} strokeWidth="2.5" />
      <Arrow x={162} y={134} />
      <path
        d="M238 92h58l14 18h62a8 8 0 0 1 8 8v94a8 8 0 0 1-8 8H238a8 8 0 0 1-8-8V100a8 8 0 0 1 8-8Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <path d="M230 118h150" stroke={S.lime} strokeWidth="1.5" opacity="0.4" />
      <text x="252" y="160" fill={S.lime} fontSize="18" fontWeight="600" fontFamily="ui-monospace, monospace">
        photos/
      </text>
      <text x="268" y="188" fill={S.soft} fontSize="16" fontFamily="ui-monospace, monospace">
        cat/
      </text>
      <text x="268" y="214" fill={S.soft} fontSize="16" fontFamily="ui-monospace, monospace">
        hand/
      </text>
      <circle cx="252" cy="182" r="3.5" fill={S.sky} stroke="none" />
      <circle cx="252" cy="208" r="3.5" fill={S.sky} stroke="none" />
      <text x="300" y="188" fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="ui-monospace, monospace">
        62
      </text>
      <text x="300" y="214" fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="ui-monospace, monospace">
        48
      </text>
    </Frame>
  );
}

/* annotate: polygon trace + label chip */
function annotate() {
  return (
    <Frame label="A photo being annotated with a polygon and a class label">
      <rect x="30" y="50" width="220" height="180" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <path
        d="M96 168c-10-16-6-42 14-54 6-16 16-22 22-22s16 6 22 22c20 12 24 38 14 54-12 10-60 10-72 0Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <path d="M112 104 106 82l20 13M152 104l6-22-20 13" stroke={S.lime} strokeWidth="2.5" />
      {[
        [96, 168],
        [88, 122],
        [106, 82],
        [132, 92],
        [158, 82],
        [176, 122],
        [168, 168],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={S.sky} stroke="none" />
      ))}
      <path d="M168 168l24 16-10 3 7 11-9 4-7-11-7 7Z" fill={S.sky} stroke="none" />
      <Arrow x={266} y={140} />
      <rect x="336" y="104" width="184" height="72" rx="16" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <text
        x="428"
        y="136"
        textAnchor="middle"
        fill={S.sky}
        fontSize="19"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        label: cat
      </text>
      <text
        x="428"
        y="162"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        polygon - 7 pts
      </text>
    </Frame>
  );
}

/* colab: notebook cells -> organized archive */
function colab() {
  return (
    <Frame label="Colab cells running the pipeline and producing an archive">
      <rect x="30" y="30" width="240" height="220" rx="14" stroke={S.dim} strokeWidth="2.5" />
      {[52, 104, 156, 208].map((y, i) => (
        <g key={i}>
          <rect
            x="50"
            y={y}
            width="200"
            height="34"
            rx="9"
            stroke={i < 3 ? S.lime : S.sky}
            strokeWidth="2.5"
            fill={i < 3 ? S.fill : S.fill2}
          />
          <path
            d={`M64 ${y + 17}h${i < 3 ? 76 : 56}`}
            stroke={i < 3 ? S.lime : S.sky}
            strokeWidth="2.5"
            opacity="0.75"
          />
          <path d={`M226 ${y + 9}l14 8-14 8v-16Z`} fill={i < 3 ? S.lime : S.sky} stroke="none" />
        </g>
      ))}
      <Arrow x={286} y={140} />
      <rect x="356" y="94" width="174" height="92" rx="16" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M356 126h174" stroke={S.sky} strokeWidth="1.5" opacity="0.4" />
      <text
        x="443"
        y="162"
        textAnchor="middle"
        fill={S.sky}
        fontSize="17"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        organized.zip
      </text>
      <text
        x="443"
        y="208"
        textAnchor="middle"
        fill={S.soft}
        fontSize="14"
        fontFamily="ui-monospace, monospace"
      >
        sorted - cropped
      </text>
    </Frame>
  );
}

/* split-cluster: crops -> sub-class clusters + outlier */
function splitCluster() {
  return (
    <Frame label="One photo split into crops, then clustered into variants">
      <rect x="24" y="86" width="110" height="110" rx="12" stroke={S.dim} strokeWidth="2.5" />
      <circle cx="58" cy="122" r="14" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <circle cx="96" cy="158" r="14" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <Arrow x={142} y={140} />
      <rect x="206" y="98" width="40" height="52" rx="8" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <rect x="256" y="98" width="40" height="52" rx="8" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <rect x="206" y="158" width="40" height="38" rx="8" stroke={S.lime} strokeWidth="2.5" fill={S.fill} opacity="0.55" />
      <rect x="256" y="158" width="40" height="38" rx="8" stroke={S.lime} strokeWidth="2.5" fill={S.fill} opacity="0.55" />
      <Arrow x={306} y={140} />
      <circle cx="380" cy="96" r="6" fill={S.lime} stroke="none" />
      <circle cx="402" cy="110" r="6" fill={S.lime} stroke="none" />
      <circle cx="384" cy="124" r="6" fill={S.lime} stroke="none" />
      <circle cx="404" cy="140" r="6" fill={S.sky} stroke="none" />
      <circle cx="386" cy="156" r="6" fill={S.sky} stroke="none" />
      <circle cx="406" cy="172" r="6" fill={S.sky} stroke="none" />
      <circle cx="480" cy="130" r="7" fill={S.coral} stroke="none" />
      <circle cx="392" cy="118" r="36" stroke={S.lime} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="396" cy="156" r="36" stroke={S.sky} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="480" cy="130" r="20" stroke={S.coral} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.7" />
      <text
        x="392"
        y="216"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        C1 - C2 - outlier
      </text>
    </Frame>
  );
}

/* convert: folders -> YOLO dataset */
function convert() {
  return (
    <Frame label="Cluster folders converted into a YOLO training dataset">
      <rect x="26" y="96" width="120" height="88" rx="14" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text
        x="86"
        y="146"
        textAnchor="middle"
        fill={S.lime}
        fontSize="17"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        cat_C1/
      </text>
      <Arrow x={156} y={140} />
      {[92, 140, 188].map((y, i) => (
        <g key={i}>
          <rect x="220" y={y} width="66" height="34" rx="8" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
          <text
            x="253"
            y={y + 22}
            textAnchor="middle"
            fill={S.soft}
            fontSize="13"
            fontFamily="ui-monospace, monospace"
          >
            .jpg
          </text>
          <rect x="300" y={y} width="66" height="34" rx="8" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
          <text
            x="333"
            y={y + 22}
            textAnchor="middle"
            fill={S.sky}
            fontSize="13"
            fontFamily="ui-monospace, monospace"
          >
            .txt
          </text>
        </g>
      ))}
      <Arrow x={380} y={140} />
      <rect x="450" y="98" width="84" height="84" rx="14" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M466 122h52M466 138h38M466 154h52M466 170h26" stroke={S.lime} strokeWidth="2" opacity="0.6" />
      <text
        x="492"
        y="204"
        textAnchor="middle"
        fill={S.soft}
        fontSize="13"
        fontFamily="ui-monospace, monospace"
      >
        dataset.yaml
      </text>
    </Frame>
  );
}

/* train: loss curve -> exported model */
function train() {
  return (
    <Frame label="Training loss falling and the model exported for the phone">
      <path d="M40 60v170h220" stroke={S.dim} strokeWidth="2.5" />
      <path d="M46 84c44 4 60 68 88 96s68 44 132 48" stroke={S.lime} strokeWidth="3" />
      <path d="M46 130c52 12 80 60 112 80s68 24 100 24" stroke={S.sky} strokeWidth="2.5" strokeDasharray="6 6" opacity="0.8" />
      <text
        x="150"
        y="252"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        epochs
      </text>
      <Arrow x={276} y={140} />
      <rect x="346" y="92" width="100" height="100" rx="16" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M368 118h56M368 142h56M368 166h40" stroke={S.lime} strokeWidth="2.5" opacity="0.65" />
      {[112, 142, 172].map((y) => (
        <g key={y}>
          <path d={`M446 ${y}h18`} stroke={S.sky} strokeWidth="2.5" />
          <path d={`M346 ${y}h-18`} stroke={S.sky} strokeWidth="2.5" />
        </g>
      ))}
      <text
        x="396"
        y="218"
        textAnchor="middle"
        fill={S.sky}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        best.tflite
      </text>
      <rect x="496" y="104" width="42" height="76" rx="10" stroke={S.dim} strokeWidth="2.5" />
      <path d="M510 168h14" stroke={S.dim} strokeWidth="2.5" />
      <path d="M484 140h8" stroke={S.dim} strokeWidth="2.5" />
    </Frame>
  );
}

/* app: live detection on the phone */
function app() {
  return (
    <Frame label="The phone running live detection with boxes and labels">
      <rect x="216" y="16" width="120" height="248" rx="22" stroke={S.dim} strokeWidth="2.5" />
      <path d="M256 34h40" stroke={S.dim} strokeWidth="2.5" />
      <path
        d="M252 180c-8-14-4-34 12-44 5-13 13-18 18-18s13 5 18 18c16 10 20 30 12 44-10 8-50 8-60 0Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <path d="M268 122 263 104l17 11M296 122l5-18-17 11" stroke={S.lime} strokeWidth="2.5" />
      <rect x="240" y="100" width="72" height="96" rx="4" stroke={S.sky} strokeWidth="2.5" />
      <rect x="240" y="82" width="72" height="20" rx="5" fill={S.sky} stroke="none" />
      <text
        x="276"
        y="96"
        textAnchor="middle"
        fill="#1e1e24"
        fontSize="12"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        CAT 94%
      </text>
      <text
        x="160"
        y="112"
        textAnchor="end"
        fill={S.soft}
        fontSize="16"
        fontFamily="ui-monospace, monospace"
      >
        .tflite
      </text>
      <path d="M172 106h32m-10-9 10 9-10 9" stroke={S.dim} strokeWidth="2.5" />
      <text
        x="400"
        y="112"
        fill={S.soft}
        fontSize="16"
        fontFamily="ui-monospace, monospace"
      >
        classes.txt
      </text>
      <path d="M388 106h-32m10-9-10 9 10 9" stroke={S.dim} strokeWidth="2.5" />
      <circle cx="240" cy="218" r="5" fill={S.lime} stroke="none" />
      <text
        x="254"
        y="223"
        fill={S.lime}
        fontSize="13"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
        letterSpacing="2"
      >
        LIVE
      </text>
    </Frame>
  );
}

/* map: constellation overview (used mid-guide) */
function map() {
  return (
    <Frame label="The constellation map placing every image on a similarity field">
      {[
        [150, 120, S.lime],
        [190, 90, S.lime],
        [170, 160, S.lime],
        [230, 130, S.lime],
        [300, 100, S.sky],
        [330, 140, S.sky],
        [290, 170, S.sky],
        [340, 180, S.sky],
        [420, 120, S.coral],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="7" fill={c as string} stroke="none" />
      ))}
      <circle cx="180" cy="125" r="52" stroke={S.lime} strokeWidth="2" strokeDasharray="5 7" opacity="0.6" />
      <circle cx="315" cy="145" r="52" stroke={S.sky} strokeWidth="2" strokeDasharray="5 7" opacity="0.6" />
      <circle cx="420" cy="120" r="30" stroke={S.coral} strokeWidth="2" strokeDasharray="5 7" opacity="0.8" />
      <text
        x="180"
        y="215"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        cluster
      </text>
      <text
        x="315"
        y="215"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        cluster
      </text>
      <text
        x="420"
        y="176"
        textAnchor="middle"
        fill={S.coral}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        outlier
      </text>
    </Frame>
  );
}

/** Registry - referenced by [[illustration:name]] markers in the guides. */
const REGISTRY: Record<string, () => React.ReactNode> = {
  collect,
  annotate,
  colab,
  "split-cluster": splitCluster,
  map,
  convert,
  train,
  app,
};

export function getIllustration(name: string): React.ReactNode | null {
  const Scene = REGISTRY[name];
  return Scene ? <Scene /> : null;
}

export default function StepIllustration({ name }: { name: string }) {
  const node = getIllustration(name);
  if (!node) return null;
  return <div className="illo-card">{node}</div>;
}
