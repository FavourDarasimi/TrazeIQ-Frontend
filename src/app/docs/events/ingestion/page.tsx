import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocShell } from "@/features/docs/components/docs-doc-shell";
import { DocsIngestion } from "@/features/docs/components/docs-ingestion";
import { getDocMeta } from "@/features/docs/lib/docs";

const SLUG = "events/ingestion";

export function generateMetadata(): Metadata {
  const meta = getDocMeta(SLUG);
  return {
    title: meta ? `${meta.title} — TrazeIQ Docs` : "TrazeIQ Docs",
    description: meta?.description ?? "",
  };
}

export default function DocsIngestionPage() {
  if (!getDocMeta(SLUG)) notFound();
  return (
    <DocShell slug={SLUG}>
      <DocsIngestion />
    </DocShell>
  );
}
