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
  content: string;
};

const DOCS_DIR = path.join(process.cwd(), "..", "docs");

const META: Record<string, { short: string; description: string }> = {
  "01-collect-and-annotate": {
    short: "Collect & Annotate",
    description:
      "Gather varied photos and trace polygons around every object with LabelMe or CVAT.",
  },
  "02-run-colab-pipeline": {
    short: "Run Colab Pipeline",
    description:
      "Upload the archive to Drive, run the 10 stages in Colab, download the organized dataset.",
  },
  "03-split-and-cluster": {
    short: "Split & Cluster",
    description:
      "Understand the two core ideas: one crop per object, and classes split into visual variants.",
  },
  "04-convert-dataset": {
    short: "Convert to YOLO",
    description:
      "Turn the organized folders into a train/val YOLO-se dataset with dataset.yaml + classes.txt.",
  },
  "05-train-and-export": {
    short: "Train & Export",
    description:
      "Fine-tune YOLOv8-se on the dataset in Colab and export a TFLite model the app accepts.",
  },
  "06-android-app": {
    short: "Android App",
    description:
      "Grab the CI-built APK, load your model and labels, and recognize your objects live.",
  },
};

function extractGoal(content: string): string {
  // Goal paragraphs wrap across lines; capture until the next blank line.
  const m = content.match(/\*\*Goal:\*\*\s*((?:[^\n]+\n?)+?)(?=\n\s*\n|$)/);
  return m ? m[1].replace(/\n/g, " ").replace(/\s+/g, " ").trim() : "";
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
    const meta = META[slug] ?? { short: slug, description: "" };
    return {
      slug,
      step: i + 1,
      title: (data.title as string) || meta.short,
      short: meta.short,
      goal: extractGoal(content),
      description: meta.description,
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
