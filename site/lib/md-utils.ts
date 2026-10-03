/**
 * Markdown helpers that are safe in both server and client components.
 * (Node-only code lives in lib/guides.ts, which reads the docs folder.)
 */

/** GitHub-flavored slug: lowercase, spaces→-, strip punctuation. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** GitHub URL for a repo-root-relative path (used to rewrite relative md links). */
export function githubUrl(relPath: string): string {
  const clean = relPath.replace(/^(\.\/|\.\.\/)+/, "");
  return `https://github.com/testplay-byte/MeshSight/blob/main/${clean}`;
}

/**
 * Flatten inline markdown to plain text.
 * Checklist items are lifted out of the markdown source and rendered as bare
 * strings in the wizard, so without this a row would literally show the
 * backticks and asterisks the author typed.
 */
export function mdInline(src: string): string {
  return src
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}