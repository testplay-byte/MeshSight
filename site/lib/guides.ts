import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Guide = {
  slug: string;
  step: number;
  title: string;
  /** short label used in the timeline rail */
  short: string;
  /** one-liner shown on the guides index + step header */
  goal: string;
  /** curated card description */
  description: string;
  /** estimated wall-clock time for the step */
  time: string;
  /** what this step consumes */
  inputs: string[];
  /** what this step produces */
  outputs: string[];
  /** h2 headings for the in-page table of contents */
  headings: { id: string; text: string }[];
  content: string;
};

const DOCS_DIR = path.join(process.cwd(), "..", "docs");

type Meta = {
  short: string;
  description: string;
  time: string;
  inputs: string[];
  outputs: string[];
};

const META: Record<string, Meta> = {
  "01-collect-and-annotate": {
    short: "Collect & Annotate",
    description:
      "Gather varied photos and trace polygons around every object with LabelMe or CVAT.",
    time: "30–60 min",
    inputs: ["Raw photos of your objects"],
    outputs: ["ANNOTATED/ folder", "ALL.zip archive"],
  },
  "02-run-colab-pipeline": {
    short: "Run Colab Pipeline",
    description:
      "Upload the archive to Drive, run the 10 stages in Colab, download the organized dataset.",
    time: "20–40 min",
    inputs: ["ALL.zip on Google Drive", "colab/ scripts"],
    outputs: ["organized_dataset.zip", "Visual_Map.html"],
  },
  "03-split-and-cluster": {
    short: "Split & Cluster",
    description:
      "Understand the two core ideas: one crop per object, and classes split into visual variants.",
    time: "10 min read",
    inputs: ["Curiosity"],
    outputs: ["Understanding of stages 04 + 07"],
  },
  "04-convert-dataset": {
    short: "Convert to YOLO",
    description:
      "Turn the organized folders into a train/val YOLO-se dataset with dataset.yaml + classes.txt.",
    time: "5 min",
    inputs: ["organized_dataset/ folders"],
    outputs: ["yolo_dataset/", "dataset.yaml", "classes.txt", "data.zip"],
  },
  "05-train-and-export": {
    short: "Train & Export",
    description:
      "Fine-tune YOLOv8-se on the dataset in Colab and export a TFLite model the app accepts.",
    time: "15–40 min",
    inputs: ["data.zip", "dataset.yaml"],
    outputs: ["best_float32.tflite"],
  },
  "06-android-app": {
    short: "Android App",
    description:
      "Grab the CI-built APK from Releases, load your model and labels, and recognize objects live.",
    time: "5 min",
    inputs: ["APK from Releases", ".tflite + classes.txt"],
    outputs: ["Live on-device detection"],
  },
};

function extractGoal(content: string): string {
  // Goal paragraphs wrap across lines; capture until the next blank line.
  const m = content.match(/\*\*Goal:\*\*\s*((?:[^\n]+\n?)+?)(?=\n\s*\n|$)/);
  if (!m) return "";
  // Strip inline markdown (emphasis, code) — this renders as plain text.
  return m[1].replace(/[*`]/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

/** GitHub-flavored slug: lowercase, spaces→-, strip punctuation. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^## (?!#)(.+)$/); // h2 only — h3s are sub-detail
    if (m) {
      const text = m[1].replace(/[*`]/g, "").trim();
      if (text) out.push({ id: headingId(text), text });
    }
  }
  return out;
}

export function getGuides(): Guide[] {
  // Only the numbered pipeline guides (01-…md); DESIGN.md and others are
  // reference docs, not steps.
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
      description: "",
      time: "",
      inputs: [],
      outputs: [],
    };
    return {
      slug,
      step: i + 1,
      title: (data.title as string) || meta.short,
      short: meta.short,
      goal: extractGoal(content),
      description: meta.description,
      time: meta.time,
      inputs: meta.inputs,
      outputs: meta.outputs,
      headings: extractHeadings(content),
      content,
    };
  });
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}

/** GitHub URL for a repo-root-relative path (used to rewrite relative md links). */
export function githubUrl(relPath: string): string {
  const clean = relPath.replace(/^(\.\/|\.\.\/)+/, "");
  return `https://github.com/testplay-byte/MeshSight/blob/main/${clean}`;
}
