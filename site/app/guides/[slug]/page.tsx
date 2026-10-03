import type { Metadata } from "next";
import { getGuide, getGuides } from "@/lib/guides";
import GuideWizard from "@/components/GuideWizard";

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  return guide
    ? { title: `${guide.step}. ${guide.short}`, description: guide.description }
    : { title: "Guide" };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guides = getGuides();
  const guide = getGuide(slug);
  if (!guide) return null;
  return (
    <GuideWizard
      guide={guide}
      nextGuide={guides[guide.step]}
      totalGuides={guides.length}
    />
  );
}