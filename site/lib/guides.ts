import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { githubUrl, headingId, mdInline } from "./md-utils";

export { githubUrl, headingId };

export type ChecklistItem = { id: string; text: string };

export type Step = {
  /** 1-based position inside the guide */
  n: number;
  /** false when the source heading wasn't `## Step N — …` (reference sections) */
  numbered: boolean;
  /** short step title, e.g. "Install LabelMe" */
  title: string;
  /** markdown body for this step (goal/markers/checklists stripped) */
  body: string;
  /** illustration registry key, if the step carries one */
  illustration?: string;
  /** tappable task list parsed from `- [ ]` lines */
  checklist: ChecklistItem[];
};

export type Guide = {
  slug: string;
  step: number;
  title: string;
  short: string;
  sub: string;
  goal: string;
  description: string;
  time: string;
  inputs: string[];
  outputs: string[];
  headings: { id: string; text: string }[];
  /** markdown before the first `## Step` — short framing shown above step 1 */
  intro: string;
  /** one screen per step */
  steps: Step[];
  totalSteps: number;
  checklistTotal: number;
};

const DOCS_DIR = path.join(process.cwd(), "..", "docs");

type Meta = {
  short: string;
  sub: string;
  description: string;
  time: string;
  inputs: string[];
  outputs: string[];
};

const META: Record<string, Meta> = {
  "01-collect-and-organize": {
    short: "Collect & Organize",
    sub: "photos",
    description:
      "Decide your classes, gather varied photos, and sort them into per-class folders.",
    time: "30–60 min",
    inputs: ["Your camera / photo sources"],
    outputs: ["photos/ folder tree", "One folder per class"],
  },
  "02-annotate": {
    short: "Annotate",
    sub: "polygons",
    description:
      "Trace polygons around every object with LabelMe or CVAT and package ALL.zip.",
    time: "60–120 min",
    inputs: ["photos/ folder tree", "LabelMe or CVAT"],
    outputs: ["ANNOTATED/ folder", "ALL.zip archive"],
  },
  "03-run-colab-pipeline": {
    short: "Run Colab Pipeline",
    sub: "10 stages",
    description:
      "Upload the archive to Drive, run the stages in Colab, download the organized dataset.",
    time: "20–40 min",
    inputs: ["ALL.zip on Google Drive", "colab/ scripts"],
    outputs: ["organized_dataset.zip", "Visual_Map.html"],
  },
  "04-split-and-cluster": {
    short: "Split & Cluster",
    sub: "variants",
    description:
      "Understand the two core ideas: one crop per object, and classes split into visual variants.",
    time: "10 min read",
    inputs: ["Curiosity"],
    outputs: ["Understanding of stages 04 + 07"],
  },
  "05-convert-dataset": {
    short: "Convert to YOLO",
    sub: "dataset",
    description:
      "Turn the organized folders into a train/val YOLO-se dataset with dataset.yaml + classes.txt.",
    time: "5 min",
    inputs: ["organized_dataset/ folders"],
    outputs: ["yolo_dataset/", "dataset.yaml", "classes.txt", "data.zip"],
  },
  "06-train-and-export": {
    short: "Train & Export",
    sub: "TFLite",
    description:
      "Fine-tune YOLOv8-se in Colab and export a .tflite model the app accepts.",
    time: "15–40 min",
    inputs: ["data.zip", "dataset.yaml"],
    outputs: ["best_float32.tflite"],
  },
  "07-android-app": {
    short: "Run on App",
    sub: "live",
    description:
      "Grab the CI-built APK from Releases, load your model and labels, and recognize objects live.",
    time: "5 min",
    inputs: ["APK from Releases", ".tflite + classes.txt"],
    outputs: ["Live on-device detection"],
  },
};

/** The homepage flow — grouped into phases, each phase a block. */
export type Phase = {
  key: string;
  label: string;
  /** guide slugs behind this phase */
  guides: string[];
  /** wide blocks get their own full row on desktop */
  wide: boolean;
  /** detail chips shown inside wide blocks */
  details: string[];
  blurb: string;
};

export const PHASES: Phase[] = [
  {
    key: "collect",
    label: "Collect & Organize",
    guides: ["01-collect-and-organize"],
    wide: false,
    details: [],
    blurb: "Photos into per-class folders",
  },
  {
    key: "annotate",
    label: "Annotate",
    guides: ["02-annotate"],
    wide: false,
    details: [],
    blurb: "Polygons with LabelMe or CVAT",
  },
  {
    key: "colab",
    label: "Run Colab Pipeline",
    guides: ["03-run-colab-pipeline"],
    wide: true,
    details: ["crop", "split", "cluster", "map"],
    blurb: "One archive in, a sorted dataset out",
  },
  {
    key: "understand",
    label: "Understand the Output",
    guides: ["04-split-and-cluster"],
    wide: true,
    details: ["crop", "split", "cluster", "outliers"],
    blurb: "What the pipeline just did — worth 10 minutes",
  },
  {
    key: "train",
    label: "Convert & Train",
    guides: ["05-convert-dataset", "06-train-and-export"],
    wide: true,
    details: ["yolo", "train", "tflite"],
    blurb: "Dataset → .tflite",
  },
  {
    key: "app",
    label: "Run on App",
    guides: ["07-android-app"],
    wide: true,
    details: [],
    blurb: "Live detection on your phone",
  },
];

function extractGoal(content: string): string {
  const m = content.match(/\*\*Goal:\*\*\s*((?:[^\n]+\n?)+?)(?=\n\s*\n|$)/);
  if (!m) return "";
  return m[1].replace(/[*`]/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^##[ \t]+(?!#)(.+)$/);
    if (m) {
      const text = m[1].replace(/[*`]/g, "").trim();
      out.push({ id: headingId(text), text });
    }
  }
  return out;
}

/** Split a guide into wizard screens: one per `##` section. */
function parseSteps(content: string): { intro: string; steps: Step[] } {
  // Everything before the first `##` is framing, shown above step 1.
  const firstHeading = content.search(/^##[ \t]+/m);
  const intro = (firstHeading === -1 ? content : content.slice(0, firstHeading)).trim();

  // Sections split on `##`; index 0 is the framing text, the rest are screens.
  const sections = content
    .split(/^##[ \t]+/m)
    .slice(1)
    .filter((s) => s.trim());

  const steps: Step[] = sections.map((sec, i) => {
    const nl = sec.indexOf("\n");
    const heading = (nl === -1 ? sec : sec.slice(0, nl)).trim();
    let body = nl === -1 ? "" : sec.slice(nl + 1);
    const stepNo = heading.match(/^Step\s+(\d+)/i);

    // `## Step 3 — Do the thing` → "Do the thing". The separator is required so
    // `## Step 7 (optional) — Pre-crop locally` keeps its qualifier instead of
    // collapsing to "(optional) — Pre-crop locally". Sections that aren't
    // numbered steps (reference material in guides 04/07) keep their title.
    const title = heading
      .replace(/^Step\s+\d+\s*[-—:]\s*/i, "")
      .replace(/[*`]/g, "")
      .trim();
    const numbered = Boolean(stepNo);
    const n = stepNo ? Number(stepNo[1]) : i + 1;

    // pull illustration marker out
    let illustration: string | undefined;
    const marker = body.match(/\[\[illustration:([a-z-]+)\]\]/);
    if (marker) {
      illustration = marker[1];
      body = body.replace(marker[0], "");
    }

    // pull `- [ ] task` lines out into a tappable checklist
    const checklist: ChecklistItem[] = [];
    body = body
      .split("\n")
      .filter((line) => {
        const m = line.match(/^\s*[-*]\s+\[\s?\]\s+(.+)$/);
        if (m) {
          checklist.push({
            id: `${i}-${checklist.length}`,
            text: mdInline(m[1]),
          });
          return false;
        }
        return true;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return { n, numbered, title, body, illustration, checklist };
  });

  // An illustration marker before the first step belongs to step 1.
  let introClean = intro;
  const introMarker = intro.match(/\[\[illustration:([a-z-]+)\]\]/);
  if (introMarker && steps.length) {
    introClean = intro.replace(introMarker[0], "").trim();
    if (!steps[0].illustration) steps[0].illustration = introMarker[1];
  }

  return { intro: introClean, steps };
}

export function getGuides(): Guide[] {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => /^\d{2}-.*\.md$/.test(f))
    .sort();

  return files.map((f, i) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, f), "utf-8");
    const { data, content } = matter(raw);
    const slug = f.replace(/\.md$/, "");
    const meta = META[slug] ?? {
      short: slug,
      sub: "",
      description: "",
      time: "",
      inputs: [],
      outputs: [],
    };
    const goal = extractGoal(content);
    // Drop the doc's `# Title` line first (it duplicates the frontmatter title
    // and the wizard renders its own h1), otherwise the Goal strip below can't
    // match and the raw `**Goal:**` paragraph leaks into step 1's body.
    const stripped = content
      .replace(/^\s*#\s+.*\n+/, "")
      .replace(/^\s*\*\*Goal:\*\*[^\n]*(?:\n[^\n]+)*?\n\s*\n/, "")
      .trimStart();
    const { intro, steps } = parseSteps(stripped);

    return {
      slug,
      step: i + 1,
      title: (data.title as string) || meta.short,
      short: meta.short,
      sub: meta.sub,
      goal,
      description: meta.description,
      time: meta.time,
      inputs: meta.inputs,
      outputs: meta.outputs,
      headings: extractHeadings(content),
      intro,
      steps,
      totalSteps: steps.length,
      checklistTotal: steps.reduce((n, s) => n + s.checklist.length, 0),
    };
  });
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}
