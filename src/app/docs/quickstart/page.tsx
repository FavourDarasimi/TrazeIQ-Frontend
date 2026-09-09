import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocShell } from "@/features/docs/components/docs-doc-shell";
import { DocsQuickstart } from "@/features/docs/components/docs-quickstart";
import { getDocMeta } from "@/features/docs/lib/docs";

const SLUG = "quickstart";

export function generateMetadata(): Metadata {
  const meta = getDocMeta(SLUG);
  return {
    title: meta ? `${meta.title} — TrazeIQ Docs` : "TrazeIQ Docs",
    description: meta?.description ?? "",
  };
}

export default function DocsQuickstartPage() {
  if (!getDocMeta(SLUG)) notFound();
  return (
    <DocShell slug={SLUG}>
      <DocsQuickstart />
    </DocShell>
  );
}
