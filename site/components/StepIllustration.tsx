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
      <text x="330" y="188" fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="ui-monospace, monospace">
        62
      </text>
      <text x="330" y="214" fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="ui-monospace, monospace">
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

/* ── Scenes added for the reworked guides ───────────────────────── */

/* tool: choose one annotator up front (LabelMe recommended) */
function tool() {
  return (
    <Frame label="Choosing between LabelMe and CVAT before you start">
      <rect x="34" y="62" width="222" height="152" rx="18" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <circle cx="232" cy="86" r="14" fill={S.lime} stroke="none" />
      <path d="M225 86l5 5 9-11" stroke="#0d1512" strokeWidth="2.5" />
      <text x="145" y="142" textAnchor="middle" fill={S.lime} fontSize="21" fontWeight="700" fontFamily="ui-monospace, monospace">
        LabelMe
      </text>
      <text x="145" y="172" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        desktop, simplest
      </text>
      <rect x="304" y="62" width="222" height="152" rx="18" stroke={S.dim} strokeWidth="2.5" />
      <text x="415" y="142" textAnchor="middle" fill={S.soft} fontSize="21" fontWeight="700" fontFamily="ui-monospace, monospace">
        CVAT
      </text>
      <text x="415" y="172" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="15" fontFamily="ui-monospace, monospace">
        browser, for teams
      </text>
    </Frame>
  );
}

/* launch: type one word in a terminal, the app opens */
function launch() {
  return (
    <Frame label="Typing labelme in a terminal to open the annotator">
      <rect x="30" y="76" width="210" height="128" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <path d="M30 104h210" stroke={S.dim} strokeWidth="1.5" />
      <circle cx="50" cy="90" r="4" fill={S.dim} stroke="none" />
      <circle cx="64" cy="90" r="4" fill={S.dim} stroke="none" />
      <circle cx="78" cy="90" r="4" fill={S.dim} stroke="none" />
      <text x="48" y="140" fill={S.soft} fontSize="18" fontFamily="ui-monospace, monospace">
        $
      </text>
      <text x="70" y="140" fill={S.lime} fontSize="18" fontWeight="600" fontFamily="ui-monospace, monospace">
        labelme
      </text>
      <rect x="146" y="126" width="11" height="18" rx="2" fill={S.lime} stroke="none" />
      <text x="48" y="176" fill="rgba(255,255,255,0.28)" fontSize="14" fontFamily="ui-monospace, monospace">
        the window opens
      </text>
      <Arrow x={252} y={140} />
      <rect x="330" y="66" width="200" height="148" rx="16" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M330 96h200" stroke={S.lime} strokeWidth="1.5" opacity="0.4" />
      <rect x="350" y="112" width="76" height="56" rx="8" stroke={S.dim} strokeWidth="2.5" />
      <path d="M372 154c-5-8-3-21 7-27 3-8 8-11 11-11s8 3 11 11c10 6 12 19 7 27-6 5-30 5-36 0Z" stroke={S.lime} strokeWidth="2.5" />
      <rect x="440" y="112" width="74" height="26" rx="7" fill={S.lime} stroke="none" />
      <text x="477" y="130" textAnchor="middle" fill="#0d1512" fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">
        cat
      </text>
      <rect x="440" y="150" width="74" height="26" rx="7" stroke={S.sky} strokeWidth="2.5" />
      <text x="477" y="168" textAnchor="middle" fill={S.sky} fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">
        save
      </text>
    </Frame>
  );
}

/* annotated: every image paired with its own .json */
function annotated() {
  const rows: [number, string, string][] = [
    [110, "cat_001.jpg", S.lime],
    [138, "cat_001.json", S.sky],
    [174, "cat_002.jpg", S.lime],
    [202, "cat_002.json", S.sky],
  ];
  return (
    <Frame label="Each photo sitting next to its matching annotation file">
      <path
        d="M30 56h60l12 14h148a8 8 0 0 1 8 8v140a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <path d="M22 92h244" stroke={S.lime} strokeWidth="1.5" opacity="0.4" />
      {rows.map(([y, name, colour]) => (
        <g key={name}>
          <rect x="42" y={y - 12} width="20" height="20" rx="5" stroke={colour} strokeWidth="2" />
          <text x="74" y={y + 3} fill={colour} fontSize="15" fontFamily="ui-monospace, monospace">
            {name}
          </text>
        </g>
      ))}
      <Arrow x={280} y={140} />
      <circle cx="404" cy="132" r="42" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M384 132l14 14 26-30" stroke={S.lime} strokeWidth="3.5" />
      <text x="404" y="206" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        every image
      </text>
      <text x="404" y="230" textAnchor="middle" fill={S.lime} fontSize="15" fontWeight="600" fontFamily="ui-monospace, monospace">
        .jpg + .json
      </text>
    </Frame>
  );
}

/* zip: the class folders themselves become the archive */
function zip() {
  return (
    <Frame label="Zipping the class folders into ALL.zip with no wrapper folder">
      <path d="M30 76h50l12 16h78a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V84a8 8 0 0 1 8-8Z" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text x="98" y="112" textAnchor="middle" fill={S.lime} fontSize="16" fontFamily="ui-monospace, monospace">
        cat/
      </text>
      <path d="M30 156h50l12 16h78a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8v-58a8 8 0 0 1 8-8Z" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <text x="98" y="192" textAnchor="middle" fill={S.sky} fontSize="16" fontFamily="ui-monospace, monospace">
        hand/
      </text>
      <Arrow x={216} y={140} />
      <rect x="312" y="70" width="196" height="140" rx="16" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M344 82v30m0 14v26m0 14v32" stroke={S.lime} strokeWidth="2.5" opacity="0.6" />
      <rect x="334" y="112" width="20" height="10" rx="4" fill={S.lime} stroke="none" />
      <rect x="334" y="152" width="20" height="10" rx="4" fill={S.lime} stroke="none" />
      <text x="410" y="188" textAnchor="middle" fill={S.lime} fontSize="19" fontWeight="600" fontFamily="ui-monospace, monospace">
        ALL.zip
      </text>
      <text x="410" y="238" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        no wrapper folder
      </text>
    </Frame>
  );
}

/* drive: the archive lands on Google Drive */
function drive() {
  return (
    <Frame label="Uploading the archive to a folder on Google Drive">
      <rect x="30" y="96" width="126" height="88" rx="14" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M76 140h34m-11-10 11 10-11 10" stroke={S.sky} strokeWidth="2.5" />
      <text x="93" y="206" textAnchor="middle" fill={S.sky} fontSize="15" fontFamily="ui-monospace, monospace">
        ALL.zip
      </text>
      <Arrow x={176} y={140} />
      <path
        d="M300 128a30 30 0 0 1 30-30 40 40 0 0 1 76 6 28 28 0 0 1 4 56H306a16 16 0 0 1-6-32Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <text x="368" y="200" textAnchor="middle" fill={S.lime} fontSize="16" fontWeight="600" fontFamily="ui-monospace, monospace">
        MyDrive
      </text>
      <text x="368" y="224" textAnchor="middle" fill={S.soft} fontSize="14" fontFamily="ui-monospace, monospace">
        DATA/
      </text>
      <circle cx="470" cy="96" r="15" fill={S.lime} stroke="none" />
      <path d="M462 96l6 6 10-12" stroke="#0d1512" strokeWidth="2.5" />
    </Frame>
  );
}

/* cells: eleven stages collapse into one copy-paste cell */
function cells() {
  return (
    <Frame label="Replacing eleven separate cells with a single copy-paste cell">
      <rect x="26" y="66" width="152" height="34" rx="9" stroke={S.dim} strokeWidth="2.5" />
      <rect x="26" y="110" width="152" height="34" rx="9" stroke={S.dim} strokeWidth="2.5" />
      <rect x="26" y="154" width="152" height="34" rx="9" stroke={S.dim} strokeWidth="2.5" />
      <path d="M46 80h84M46 124h60M46 168h72" stroke={S.soft} strokeWidth="2.5" opacity="0.5" />
      <path d="M196 62l-14 130" stroke={S.coral} strokeWidth="3" />
      <text x="102" y="220" textAnchor="middle" fill={S.coral} fontSize="15" fontWeight="600" fontFamily="ui-monospace, monospace">
        11 cells
      </text>
      <Arrow x={196} y={126} />
      <rect x="296" y="60" width="234" height="132" rx="14" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M318 86h72M318 108h168M318 130h96M318 152h140" stroke={S.lime} strokeWidth="2.5" opacity="0.7" />
      <rect x="404" y="72" width="104" height="24" rx="7" fill={S.lime} stroke="none" />
      <text x="456" y="89" textAnchor="middle" fill="#0d1512" fontSize="13" fontWeight="700" fontFamily="ui-monospace, monospace">
        run all
      </text>
      <text x="413" y="220" textAnchor="middle" fill={S.lime} fontSize="15" fontWeight="600" fontFamily="ui-monospace, monospace">
        1 cell
      </text>
    </Frame>
  );
}

/* classes: a loose brainstorm list narrowed to two short lowercase names */
function classes() {
  const rows: [number, string, boolean][] = [
    [118, "cat", true],
    [148, "dog", false],
    [178, "hand", true],
    [208, "Cat_V2", false],
  ];
  return (
    <Frame label="Choosing a short list of object class names">
      <rect x="26" y="54" width="222" height="172" rx="16" stroke={S.dim} strokeWidth="2.5" />
      <text x="46" y="84" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        candidate names
      </text>
      {rows.map(([y, name, keep]) => (
        <g key={name}>
          <text
            x="76"
            y={y}
            fill={keep ? S.lime : "rgba(255,255,255,0.26)"}
            fontSize="16"
            fontFamily="ui-monospace, monospace"
          >
            {name}
          </text>
          {keep ? (
            <g>
              <circle cx="50" cy={y - 5} r="8" fill={S.lime} stroke="none" />
              <path d={`M45.5 ${y - 5}l3 3 5-6`} stroke="#0d1512" strokeWidth="2.5" />
            </g>
          ) : (
            <path d={`M74 ${y - 5}h${name.length * 9.6 + 4}`} stroke={S.coral} strokeWidth="2" />
          )}
        </g>
      ))}
      <Arrow x={262} y={140} />
      <rect x="344" y="92" width="176" height="46" rx="14" fill={S.lime} stroke="none" />
      <text
        x="432"
        y="122"
        textAnchor="middle"
        fill="#0d1512"
        fontSize="18"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        cat
      </text>
      <rect x="344" y="162" width="176" height="46" rx="14" fill={S.lime} stroke="none" />
      <text
        x="432"
        y="192"
        textAnchor="middle"
        fill="#0d1512"
        fontSize="18"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        hand
      </text>
      <text
        x="432"
        y="240"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        lowercase, one word
      </text>
    </Frame>
  );
}

/* variety: one object shot again and again at new sizes and angles */
function variety() {
  const CAT =
    "M-36 43c-10-16-6-42 14-54 6-16 16-22 22-22s16 6 22 22c20 12 24 38 14 54-12 10-60 10-72 0Z";
  const EARS = "M-20-21-26-43l20 13M20-21l6-22-20 13";
  const shots: [number, number, number, number][] = [
    [82, 104, 0.36, 0],
    [214, 104, 0.58, -14],
    [348, 100, 0.46, 12],
    [478, 96, 0.3, -8],
  ];
  return (
    <Frame label="One object photographed repeatedly from different angles and distances">
      {[26, 158, 290, 422].map((x) => (
        <rect key={x} x={x} y="44" width="112" height="116" rx="12" stroke={S.dim} strokeWidth="2.5" />
      ))}
      {shots.map(([x, y, s, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <path d={CAT} stroke={S.lime} strokeWidth={2.5 / s} fill={S.fill} />
          <path d={EARS} stroke={S.lime} strokeWidth={2.5 / s} />
        </g>
      ))}
      <text
        x="280"
        y="192"
        textAnchor="middle"
        fill={S.lime}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        angles + distance
      </text>
      <text
        x="280"
        y="218"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        same object
      </text>
    </Frame>
  );
}

/* install: pip install labelme in a terminal, the app window arrives */
function install() {
  return (
    <Frame label="Installing LabelMe with pip, then the app window appears">
      <rect x="26" y="76" width="276" height="128" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <path d="M26 104h276" stroke={S.dim} strokeWidth="1.5" />
      <circle cx="46" cy="90" r="4" fill={S.dim} stroke="none" />
      <circle cx="60" cy="90" r="4" fill={S.dim} stroke="none" />
      <circle cx="74" cy="90" r="4" fill={S.dim} stroke="none" />
      <text x="44" y="140" fill={S.soft} fontSize="17" fontFamily="ui-monospace, monospace">
        $
      </text>
      <text x="70" y="140" fill={S.soft} fontSize="17" fontFamily="ui-monospace, monospace">
        pip install
      </text>
      <text x="208" y="140" fill={S.lime} fontSize="17" fontWeight="600" fontFamily="ui-monospace, monospace">
        labelme
      </text>
      <text x="44" y="176" fill="rgba(255,255,255,0.28)" fontSize="14" fontFamily="ui-monospace, monospace">
        installing...
      </text>
      <rect x="44" y="186" width="230" height="7" rx="3.5" stroke={S.dim} strokeWidth="1.5" />
      <rect x="44" y="186" width="150" height="7" rx="3.5" fill={S.lime} stroke="none" />
      <Arrow x={316} y={140} />
      <rect x="388" y="70" width="146" height="144" rx="16" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M388 100h146" stroke={S.lime} strokeWidth="1.5" opacity="0.4" />
      <text
        x="461"
        y="90"
        textAnchor="middle"
        fill={S.lime}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        labelme
      </text>
      <circle cx="461" cy="142" r="18" fill={S.lime} stroke="none" />
      <path d="M452 142l7 7 13-16" stroke="#0d1512" strokeWidth="3" />
      <text
        x="461"
        y="192"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        installed
      </text>
    </Frame>
  );
}

/* workingcopy: the locked master photos/ folder copied into ANNOTATED/ */
function workingcopy() {
  return (
    <Frame label="The master photos folder copied into a separate annotated folder">
      <path
        d="M34 96h44l12 16h86a8 8 0 0 1 8 8v74a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8v-90a8 8 0 0 1 8-8Z"
        stroke={S.dim}
        strokeWidth="2.5"
      />
      <path d="M26 130h158" stroke={S.dim} strokeWidth="1.5" opacity="0.5" />
      <rect x="40" y="150" width="22" height="17" rx="4" stroke={S.dim} strokeWidth="2" />
      <path d="M45 150v-6a6 6 0 0 1 12 0v6" stroke={S.dim} strokeWidth="2" />
      <text x="76" y="166" fill={S.soft} fontSize="17" fontWeight="600" fontFamily="ui-monospace, monospace">
        photos/
      </text>
      <text x="76" y="190" fill="rgba(255,255,255,0.3)" fontSize="14" fontFamily="ui-monospace, monospace">
        master
      </text>
      <Arrow x={200} y={150} />
      <path
        d="M272 58h58l16 20h180a8 8 0 0 1 8 8v152a8 8 0 0 1-8 8H272a8 8 0 0 1-8-8V66a8 8 0 0 1 8-8Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <path d="M264 112h270" stroke={S.lime} strokeWidth="1.5" opacity="0.4" />
      <text x="284" y="100" fill={S.lime} fontSize="17" fontWeight="600" fontFamily="ui-monospace, monospace">
        ANNOTATED/
      </text>
      <rect x="284" y="124" width="118" height="62" rx="10" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text
        x="343"
        y="159"
        textAnchor="middle"
        fill={S.lime}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        cat/
      </text>
      <rect x="414" y="124" width="118" height="62" rx="10" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text
        x="473"
        y="159"
        textAnchor="middle"
        fill={S.lime}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        hand/
      </text>
      <text
        x="399"
        y="216"
        textAnchor="middle"
        fill={S.soft}
        fontSize="15"
        fontFamily="ui-monospace, monospace"
      >
        annotate here
      </text>
    </Frame>
  );
}

/* stages: the run log, each stage printing its own result */
function stages() {
  const rows: [string, string, string][] = [
    ["04", "crops", "128"],
    ["07", "clusters", "9"],
    ["08", "folders", "14"],
  ];
  return (
    <Frame label="A run log where each pipeline stage prints its own result">
      <rect x="30" y="44" width="430" height="170" rx="16" stroke={S.dim} strokeWidth="2.5" />
      <path d="M30 92h430" stroke={S.dim} strokeWidth="1.5" />
      <text x="52" y="76" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        stage report
      </text>
      <path d="M52 139h386M52 173h386" stroke={S.dim} strokeWidth="1.5" opacity="0.4" />
      {rows.map(([n, name, count], i) => {
        const y = 122 + i * 34;
        return (
          <g key={n}>
            <text x="52" y={y} fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="ui-monospace, monospace">
              {n}
            </text>
            <text x="86" y={y} fill={S.soft} fontSize="16" fontFamily="ui-monospace, monospace">
              {name}
            </text>
            <text
              x="390"
              y={y}
              textAnchor="end"
              fill={S.lime}
              fontSize="16"
              fontWeight="600"
              fontFamily="ui-monospace, monospace"
            >
              {count}
            </text>
            <circle cx="418" cy={y - 6} r="9" fill={S.lime} stroke="none" />
            <path d={`M413.5 ${y - 6}l3.5 3.5 7-8.5`} stroke="#0d1512" strokeWidth="2.5" />
          </g>
        );
      })}
      <circle cx="506" cy="130" r="30" fill={S.lime} stroke="none" />
      <path d="M491 130l10 10 19-23" stroke="#0d1512" strokeWidth="3.5" />
      <text
        x="506"
        y="192"
        textAnchor="middle"
        fill={S.lime}
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        PASS
      </text>
    </Frame>
  );
}

/* knobs: one setting turned, the clusters regroup */
function knobs() {
  const dials = [
    { label: "neighbors", x: 146 },
    { label: "min size", x: 214 },
    { label: "min group", x: 180 },
  ];
  return (
    <Frame label="Turning one clustering setting to split the data into fewer or more groups">
      <text x="30" y="60" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        config.py
      </text>
      {dials.map((d, i) => {
        const y = 104 + i * 44;
        const live = i === 1;
        return (
          <g key={d.label}>
            <text x="30" y={y} fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
              {d.label}
            </text>
            <path d={`M126 ${y - 6}h110`} stroke={S.dim} strokeWidth="2.5" />
            <path d={`M126 ${y - 14}v16M236 ${y - 14}v16`} stroke={S.dim} strokeWidth="1.5" />
            <circle
              cx={d.x}
              cy={y - 6}
              r="8"
              stroke={live ? S.lime : S.soft}
              strokeWidth="2.5"
              fill={live ? S.lime : "none"}
            />
          </g>
        );
      })}
      <circle cx="214" cy="142" r="16" stroke={S.lime} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.7" />
      <Arrow x={254} y={140} />
      <circle cx="348" cy="110" r="6" fill={S.lime} stroke="none" />
      <circle cx="362" cy="104" r="6" fill={S.lime} stroke="none" />
      <circle cx="356" cy="124" r="6" fill={S.lime} stroke="none" />
      <circle cx="386" cy="152" r="6" fill={S.sky} stroke="none" />
      <circle cx="398" cy="160" r="6" fill={S.sky} stroke="none" />
      <circle cx="378" cy="172" r="6" fill={S.sky} stroke="none" />
      <circle cx="355" cy="116" r="24" stroke={S.lime} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="387" cy="162" r="26" stroke={S.sky} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="452" cy="106" r="5" fill={S.lime} stroke="none" />
      <circle cx="466" cy="112" r="5" fill={S.lime} stroke="none" />
      <circle cx="494" cy="102" r="5" fill={S.sky} stroke="none" />
      <circle cx="506" cy="112" r="5" fill={S.sky} stroke="none" />
      <circle cx="452" cy="166" r="5" fill={S.sky} stroke="none" />
      <circle cx="466" cy="172" r="5" fill={S.sky} stroke="none" />
      <circle cx="494" cy="168" r="5" fill={S.lime} stroke="none" />
      <circle cx="506" cy="160" r="5" fill={S.lime} stroke="none" />
      <circle cx="459" cy="109" r="16" stroke={S.lime} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="500" cy="107" r="16" stroke={S.sky} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="459" cy="169" r="16" stroke={S.sky} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="500" cy="164" r="16" stroke={S.lime} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
      <text x="366" y="214" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        2 groups
      </text>
      <text
        x="482"
        y="214"
        textAnchor="middle"
        fill={S.lime}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        4 groups
      </text>
    </Frame>
  );
}

/* dataset: the YOLO folder layout the converter writes */
function dataset() {
  const items = [
    { y: 73, chip: S.lime, name: "images/", note: "train/ val/" },
    { y: 117, chip: S.sky, name: "labels/", note: "train/ val/" },
    { y: 161, chip: S.soft, name: "dataset.yaml", note: "class names" },
    { y: 205, chip: S.soft, name: "classes.txt", note: "same order" },
  ];
  return (
    <Frame label="The images, labels and dataset.yaml a training run needs">
      <path
        d="M36 114h52l12 14h84a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8v-38a8 8 0 0 1 8-8Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      <text
        x="110"
        y="148"
        textAnchor="middle"
        fill={S.lime}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        yolo_dataset/
      </text>
      <path d="M192 141h16M208 73v132" stroke={S.soft} strokeWidth="1.5" />
      {items.map((it) => (
        <g key={it.name}>
          <path d={`M208 ${it.y}h22`} stroke={S.soft} strokeWidth="1.5" />
          <rect x="230" y={it.y - 10} width="20" height="20" rx="5" stroke={it.chip} strokeWidth="2" />
          <text
            x="262"
            y={it.y + 6}
            fill={it.chip}
            fontSize={it.name.length > 8 ? "16" : "18"}
            fontWeight="600"
            fontFamily="ui-monospace, monospace"
          >
            {it.name}
          </text>
          <text x="406" y={it.y + 6} fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
            {it.note}
          </text>
        </g>
      ))}
      <text x="280" y="248" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        what training reads
      </text>
    </Frame>
  );
}

/* epochs: the loss falls, then settles on a plateau */
function epochs() {
  return (
    <Frame label="The training loss falling over epochs and settling on a low plateau">
      <text x="76" y="44" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        loss
      </text>
      <path d="M76 56v168M76 224h408" stroke={S.dim} strokeWidth="2.5" />
      <path
        d="M84 104C126 124 150 166 174 184C206 204 240 212 276 214C334 215 400 215 470 215"
        stroke={S.sky}
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.8"
      />
      <path d="M84 78C124 100 148 148 172 168C204 194 238 202 272 204C330 206 400 206 470 206" stroke={S.lime} strokeWidth="3" />
      <circle cx="134" cy="124" r="4" fill={S.lime} stroke="none" />
      <circle cx="272" cy="204" r="4" fill={S.lime} stroke="none" />
      <circle cx="366" cy="206" r="4" fill={S.lime} stroke="none" />
      <path d="M272 204v20" stroke={S.soft} strokeWidth="1.5" strokeDasharray="3 5" opacity="0.7" />
      <text x="376" y="188" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        plateau
      </text>
      <text x="280" y="250" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        epochs
      </text>
    </Frame>
  );
}

/* export: best.pt through the flags into a .tflite on the phone */
function exportScene() {
  return (
    <Frame label="Converting best.pt into a TFLite model for the phone">
      <rect x="26" y="96" width="112" height="88" rx="16" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <path d="M46 124h72M46 148h48M46 172h60" stroke={S.lime} strokeWidth="2.5" opacity="0.6" />
      <text
        x="82"
        y="210"
        textAnchor="middle"
        fill={S.lime}
        fontSize="17"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        best.pt
      </text>
      <Arrow x={150} y={140} />
      <rect x="218" y="72" width="142" height="136" rx="16" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M232 88h114" stroke={S.sky} strokeWidth="1.5" opacity="0.4" />
      <circle cx="238" cy="108" r="3.5" fill={S.sky} stroke="none" />
      <text x="252" y="108" fill={S.coral} fontSize="15" fontWeight="700" fontFamily="ui-monospace, monospace">
        nms=False
      </text>
      <circle cx="238" cy="144" r="3.5" fill={S.sky} stroke="none" />
      <text x="252" y="144" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        half=False
      </text>
      <circle cx="238" cy="180" r="3.5" fill={S.sky} stroke="none" />
      <text x="252" y="180" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        int8=False
      </text>
      <text x="289" y="234" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        critical flags
      </text>
      <Arrow x={372} y={140} />
      <rect x="440" y="44" width="100" height="192" rx="20" stroke={S.dim} strokeWidth="2.5" />
      <path d="M474 60h32" stroke={S.dim} strokeWidth="2.5" />
      <rect x="448" y="112" width="88" height="56" rx="10" fill={S.lime} stroke="none" />
      <text
        x="492"
        y="146"
        textAnchor="middle"
        fill="#0d1512"
        fontSize="16"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        .tflite
      </text>
      <text x="490" y="208" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        loaded
      </text>
    </Frame>
  );
}

/* loadmodel: the two files go in, Obj 0 becomes a real class */
function loadmodel() {
  return (
    <Frame label="Loading the model and class labels, turning Obj 0 into a real class name">
      <rect x="26" y="76" width="134" height="50" rx="12" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text
        x="93"
        y="108"
        textAnchor="middle"
        fill={S.lime}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        best.tflite
      </text>
      <rect x="26" y="150" width="134" height="50" rx="12" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <text
        x="93"
        y="182"
        textAnchor="middle"
        fill={S.sky}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        classes.txt
      </text>
      <Arrow x={176} y={140} />
      <rect x="244" y="40" width="96" height="200" rx="20" stroke={S.dim} strokeWidth="2.5" />
      <path d="M276 56h32" stroke={S.dim} strokeWidth="2.5" />
      <circle cx="264" cy="116" r="4.5" fill={S.lime} stroke="none" />
      <text x="278" y="122" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        model
      </text>
      <circle cx="264" cy="162" r="4.5" fill={S.sky} stroke="none" />
      <text x="278" y="168" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        labels
      </text>
      <rect x="350" y="94" width="74" height="48" rx="12" stroke={S.dim} strokeWidth="2.5" />
      <text x="387" y="123" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        Obj 0
      </text>
      <path d="M432 118h24m-9-8 9 8-9 8" stroke={S.soft} strokeWidth="2.5" />
      <rect x="466" y="94" width="74" height="48" rx="12" fill={S.lime} stroke="none" />
      <text
        x="503"
        y="124"
        textAnchor="middle"
        fill="#0d1512"
        fontSize="16"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        cat_C1
      </text>
      <text
        x="540"
        y="176"
        textAnchor="end"
        fill={S.lime}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        real names
      </text>
    </Frame>
  );
}

/* split: one photo of two objects becomes two cropped images */
function split() {
  const CAT =
    "M-36 43c-10-16-6-42 14-54 6-16 16-22 22-22s16 6 22 22c20 12 24 38 14 54-12 10-60 10-72 0Z";
  const EARS = "M-20-21-26-43l20 13M20-21l6-22-20 13";
  const HAND =
    "M-30 6c-5-18 3-28 14-28h32c11 0 19 10 14 28-4 13-9 22-30 22s-26-9-30-22ZM-14-22v-16M-4-22v-19M7-22v-19M18-22v-15M-29 2l-15-9";
  return (
    <Frame label="One photo of two objects becoming two separate cropped images">
      <rect x="30" y="52" width="200" height="168" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <g transform="translate(92 116) scale(0.64)">
        <path d={CAT} stroke={S.lime} strokeWidth={2.5 / 0.64} fill={S.fill} />
        <path d={EARS} stroke={S.lime} strokeWidth={2.5 / 0.64} />
      </g>
      <g transform="translate(180 158) scale(0.62)">
        <path d={HAND} stroke={S.lime} strokeWidth={2.5 / 0.62} fill={S.fill} />
      </g>
      <Arrow x={246} y={136} />
      <rect x="318" y="62" width="96" height="96" rx="12" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <g transform="translate(366 110) scale(0.8)">
        <path d={CAT} stroke={S.sky} strokeWidth={2.5 / 0.8} fill={S.fill2} />
        <path d={EARS} stroke={S.sky} strokeWidth={2.5 / 0.8} />
      </g>
      <rect x="428" y="62" width="96" height="96" rx="12" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <g transform="translate(482 116) scale(0.78)">
        <path d={HAND} stroke={S.sky} strokeWidth={2.5 / 0.78} fill={S.fill2} />
      </g>
      <text x="130" y="246" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        one photo
      </text>
      <text
        x="366"
        y="190"
        textAnchor="middle"
        fill={S.sky}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        cat
      </text>
      <text
        x="476"
        y="190"
        textAnchor="middle"
        fill={S.sky}
        fontSize="16"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        hand
      </text>
      <text x="421" y="246" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        one object each
      </text>
    </Frame>
  );
}

/* cluster: crops of one label regrouped into visual variants plus one outlier */
function cluster() {
  const loose: [number, number][] = [
    [44, 62],
    [80, 52],
    [116, 74],
    [40, 102],
    [78, 92],
    [118, 106],
    [56, 138],
    [96, 130],
    [130, 144],
  ];
  const c1: [number, number][] = [
    [280, 78],
    [318, 70],
    [350, 88],
    [298, 112],
  ];
  const c2: [number, number][] = [
    [412, 74],
    [450, 84],
    [412, 112],
    [452, 118],
  ];
  return (
    <Frame label="Crops of one label grouped into visual variant clusters with one outlier">
      {loose.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="16" height="16" rx="4" stroke={S.soft} strokeWidth="2" fill="none" />
      ))}
      <text x="88" y="198" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        same label
      </text>
      <Arrow x={182} y={108} />
      <rect
        x="258"
        y="58"
        width="120"
        height="92"
        rx="14"
        stroke={S.lime}
        strokeWidth="1.5"
        strokeDasharray="5 7"
        fill={S.fill}
      />
      {c1.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="16" height="16" rx="4" fill={S.lime} stroke="none" />
      ))}
      <rect
        x="390"
        y="58"
        width="120"
        height="92"
        rx="14"
        stroke={S.sky}
        strokeWidth="1.5"
        strokeDasharray="5 7"
        fill={S.fill2}
      />
      {c2.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="16" height="16" rx="4" fill={S.sky} stroke="none" />
      ))}
      <text
        x="318"
        y="180"
        textAnchor="middle"
        fill={S.lime}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        cat_C1
      </text>
      <text
        x="450"
        y="180"
        textAnchor="middle"
        fill={S.sky}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        cat_C2
      </text>
      <circle cx="504" cy="210" r="19" stroke={S.coral} strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
      <rect x="495" y="201" width="18" height="18" rx="4" fill={S.coral} stroke="none" />
      <text x="504" y="250" textAnchor="middle" fill={S.coral} fontSize="15" fontFamily="ui-monospace, monospace">
        outlier
      </text>
    </Frame>
  );
}

/* convertflow: the converter script turning organized_dataset into yolo_dataset */
function convertflow() {
  const src: [string, string][] = [
    [".jpg", S.lime],
    [".json", S.sky],
  ];
  const dst: [string, string][] = [
    ["images/", S.sky],
    ["labels/", S.lime],
  ];
  return (
    <Frame label="The organized dataset folders passing through the converter into a YOLO dataset">
      <path
        d="M28 76h40l14 16h92a8 8 0 0 1 8 8v92a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V84a8 8 0 0 1 8-8Z"
        stroke={S.lime}
        strokeWidth="2.5"
        fill={S.fill}
      />
      {src.map(([t, c], i) => (
        <g key={t}>
          <rect x={32 + i * 76} y={114 + i * 40} width="64" height="32" rx="8" stroke={c} strokeWidth="2" />
          <text
            x={64 + i * 76}
            y={134 + i * 40}
            textAnchor="middle"
            fill={c}
            fontSize="15"
            fontFamily="ui-monospace, monospace"
          >
            {t}
          </text>
        </g>
      ))}
      <Arrow x={191} y={138} />
      <rect x="256" y="76" width="92" height="124" rx="14" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M290 122l24 16-24 16Z" fill={S.sky} stroke="none" />
      <Arrow x={357} y={138} />
      <path
        d="M430 76h34l12 16h56a8 8 0 0 1 8 8v92a8 8 0 0 1-8 8h-102a8 8 0 0 1-8-8V84a8 8 0 0 1 8-8Z"
        stroke={S.sky}
        strokeWidth="2.5"
        fill={S.fill2}
      />
      {dst.map(([t, c], i) => (
        <g key={t}>
          <rect x="438" y={114 + i * 40} width="86" height="32" rx="8" stroke={c} strokeWidth="2" />
          <text
            x="481"
            y={134 + i * 40}
            textAnchor="middle"
            fill={c}
            fontSize="15"
            fontFamily="ui-monospace, monospace"
          >
            {t}
          </text>
        </g>
      ))}
      <text
        x="101"
        y="228"
        textAnchor="middle"
        fill={S.lime}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        organized_dataset
      </text>
      <text
        x="302"
        y="228"
        textAnchor="middle"
        fill={S.sky}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        convert.py
      </text>
      <text
        x="481"
        y="228"
        textAnchor="middle"
        fill={S.sky}
        fontSize="15"
        fontWeight="600"
        fontFamily="ui-monospace, monospace"
      >
        yolo_dataset
      </text>
    </Frame>
  );
}

/* sanity: counting files against labels before training, one mismatch flagged */
function sanity() {
  const rows: [number, string, string, boolean][] = [
    [114, "images/train", "184", false],
    [148, "labels/train", "183", true],
    [182, "images/val", "21", false],
    [216, "labels/val", "21", false],
  ];
  return (
    <Frame label="Checking the image and label counts before training with one mismatch flagged">
      <rect x="30" y="52" width="270" height="176" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <text x="50" y="80" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        yolo_dataset/
      </text>
      <path d="M42 92h246" stroke={S.dim} strokeWidth="1.5" />
      <rect x="42" y="132" width="248" height="28" rx="8" stroke={S.coral} strokeWidth="2" opacity="0.75" />
      {rows.map(([y, name, count, bad]) => (
        <g key={name}>
          <text x="50" y={y} fill={bad ? S.coral : S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
            {name}
          </text>
          <text
            x="278"
            y={y}
            textAnchor="end"
            fill={bad ? S.coral : S.lime}
            fontSize="15"
            fontWeight="600"
            fontFamily="ui-monospace, monospace"
          >
            {count}
          </text>
        </g>
      ))}
      <Arrow x={308} y={140} />
      <circle cx="430" cy="132" r="56" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M470 172l30 30" stroke={S.sky} strokeWidth="2.5" />
      <circle cx="430" cy="100" r="14" fill={S.coral} stroke="none" />
      <path d="M430 93v9" stroke="#0d1512" strokeWidth="2.5" />
      <circle cx="430" cy="107" r="2" fill="#0d1512" stroke="none" />
      <text
        x="430"
        y="146"
        textAnchor="middle"
        fill={S.lime}
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        184
      </text>
      <text
        x="430"
        y="176"
        textAnchor="middle"
        fill={S.coral}
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        183
      </text>
      <text x="430" y="246" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        1 file missing
      </text>
    </Frame>
  );
}

/* notebook: a Colab notebook with the T4 GPU runtime selected */
function notebook() {
  const runtimes: [number, number, string, boolean][] = [
    [52, 66, "None", false],
    [128, 120, "T4 GPU", true],
    [258, 64, "TPU", false],
  ];
  return (
    <Frame label="A Colab notebook with the T4 GPU runtime selected in the runtime picker">
      <rect x="30" y="46" width="310" height="188" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <path d="M30 76h310" stroke={S.dim} strokeWidth="1.5" />
      <circle cx="52" cy="61" r="4" fill={S.dim} stroke="none" />
      <circle cx="68" cy="61" r="4" fill={S.dim} stroke="none" />
      <circle cx="84" cy="61" r="4" fill={S.dim} stroke="none" />
      <text x="104" y="66" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        notebook.ipynb
      </text>
      <text x="52" y="104" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        Runtime
      </text>
      {runtimes.map(([x, w, name, on]) => (
        <g key={name}>
          <rect
            x={x}
            y="118"
            width={w}
            height="36"
            rx="10"
            stroke={on ? S.lime : S.dim}
            strokeWidth="2.5"
            fill={on ? S.lime : "none"}
          />
          {on && (
            <g>
              <circle cx={x + 22} cy="136" r="11" fill="#0d1512" stroke="none" />
              <path d={`M${x + 17.5} 136l3 3 6-7`} stroke={S.lime} strokeWidth="2.5" />
            </g>
          )}
          <text
            x={x + w / 2 + (on ? 20 : 0)}
            y="142"
            textAnchor="middle"
            fill={on ? "#0d1512" : S.soft}
            fontSize="15"
            fontWeight={on ? 700 : 400}
            fontFamily="ui-monospace, monospace"
          >
            {name}
          </text>
        </g>
      ))}
      <rect x="52" y="176" width="246" height="44" rx="10" stroke={S.dim} strokeWidth="2.5" />
      <path d="M74 198h100" stroke={S.soft} strokeWidth="2.5" opacity="0.6" />
      <path d="M266 186l16 11-16 11Z" fill={S.soft} stroke="none" />
      <Arrow x={356} y={140} />
      <path
        d="M442 92v10M474 92v10M506 92v10M442 164v10M474 164v10M506 164v10M422 112h10M422 144h10M516 112h10M516 144h10"
        stroke={S.lime}
        strokeWidth="2"
      />
      <rect x="430" y="100" width="88" height="64" rx="12" stroke={S.lime} strokeWidth="2.5" fill={S.fill} />
      <text
        x="474"
        y="140"
        textAnchor="middle"
        fill={S.lime}
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        T4
      </text>
      <text x="474" y="200" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        GPU ready
      </text>
    </Frame>
  );
}

/* apk: CI builds the APK, the download lands on the phone */
function apk() {
  return (
    <Frame label="CI building an APK that is downloaded and installed on the phone">
      <rect x="26" y="56" width="196" height="168" rx="14" stroke={S.dim} strokeWidth="2.5" />
      <text x="46" y="86" fill={S.soft} fontSize="15" fontWeight="600" fontFamily="ui-monospace, monospace">
        CI build
      </text>
      <path d="M38 100h172" stroke={S.dim} strokeWidth="1.5" />
      <path d="M46 122h118M46 144h86M46 166h120" stroke={S.soft} strokeWidth="2.5" opacity="0.45" />
      <circle cx="204" cy="166" r="9" fill={S.lime} stroke="none" />
      <path d="M199.5 166l3 3 6-7" stroke="#0d1512" strokeWidth="2.5" />
      <text x="124" y="252" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        built for you
      </text>
      <Arrow x={238} y={140} />
      <rect x="310" y="112" width="116" height="56" rx="14" stroke={S.sky} strokeWidth="2.5" fill={S.fill2} />
      <path d="M330 128v22m-9-9 9 9 9-9" stroke={S.soft} strokeWidth="2.5" />
      <text
        x="392"
        y="144"
        textAnchor="middle"
        fill={S.sky}
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        .apk
      </text>
      <text x="368" y="194" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        latest build
      </text>
      <rect x="440" y="40" width="86" height="200" rx="18" stroke={S.dim} strokeWidth="2.5" />
      <path d="M470 56h26" stroke={S.dim} strokeWidth="2.5" />
      <rect x="452" y="92" width="62" height="62" rx="14" fill={S.lime} stroke="none" />
      <path d="M470 124l11 11 20-24" stroke="#0d1512" strokeWidth="3" />
      <path d="M458 176h50M458 192h32" stroke={S.dim} strokeWidth="2.5" />
      <text x="483" y="254" textAnchor="middle" fill={S.soft} fontSize="15" fontFamily="ui-monospace, monospace">
        install
      </text>
    </Frame>
  );
}

/** Registry - referenced by [[illustration:name]] markers in the guides. */
const REGISTRY: Record<string, () => React.ReactNode> = {
  collect,
  classes,
  variety,
  tool,
  install,
  launch,
  workingcopy,
  annotate,
  annotated,
  zip,
  drive,
  cells,
  stages,
  colab,
  "split-cluster": splitCluster,
  split,
  cluster,
  knobs,
  map,
  convert,
  convertflow,
  dataset,
  sanity,
  train,
  notebook,
  epochs,
  export: exportScene,
  app,
  loadmodel,
  apk,
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
