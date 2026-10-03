import type { Metadata } from "next";
import GuideBrowser from "@/components/GuideBrowser";
import { getGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "The MeshSight workflow, start to finish — seven steps from raw photos to live detection on your phone.",
};

export default function GuidesPage() {
  const guides = getGuides();
  return <GuideBrowser guides={guides} />;
}
