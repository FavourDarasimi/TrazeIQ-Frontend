import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocShell } from "@/features/docs/components/docs-doc-shell";
import { getAllDocs, getDocMeta } from "@/features/docs/lib/docs";

// Only registry pages exist — anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getDocMeta(slug.join("/"));
  if (!meta) return {};
  return {
    title: `${meta.title} — TrazeIQ docs`,
    description: meta.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");
  const meta = getDocMeta(path);
  if (!meta) notFound();
  return <DocShell slug={path} />;
}