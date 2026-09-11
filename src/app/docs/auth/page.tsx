import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocShell } from "@/features/docs/components/docs-doc-shell";
import { getDocMeta } from "@/features/docs/lib/docs";
import { MdxBody } from "@/features/docs/lib/mdx";

const SLUG = "auth";

export function generateMetadata(): Metadata {
  const meta = getDocMeta(SLUG);
  return {
    title: meta ? `${meta.title} — TrazeIQ Docs` : "TrazeIQ Docs",
    description: meta?.description ?? "",
  };
}

export default async function DocsAuthPage() {
  if (!getDocMeta(SLUG)) notFound();
  return (
    <DocShell slug={SLUG}>
      <MdxBody slug={SLUG} />
    </DocShell>
  );
}
