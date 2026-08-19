import { Footer } from "@/features/landing/components/footer";
import { Logo } from "@/features/landing/components/navbar";
import { Container, Eyebrow } from "@/components/ui/shared";

import { DocsIngestion } from "./docs-ingestion";
import { DocsLimits } from "./docs-limits";
import { DocsPipeline } from "./docs-pipeline";
import { DocsQuickstart } from "./docs-quickstart";
import { DocsReadApi } from "./docs-read-api";
import { DocsSecurity } from "./docs-security";

const toc = [
  { label: "Quickstart", href: "#quickstart" },
  { label: "Ingestion API", href: "#ingestion" },
  { label: "Concepts", href: "#pipeline" },
  { label: "Read API", href: "#read-api" },
  { label: "Limits", href: "#limits" },
  { label: "Security", href: "#security" },
];

export function DocsPage() {
  return (
    <main className="bg-bg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <nav className="hidden items-center gap-8 md:flex">
            {toc.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Sign in
            </a>
            <a
              href="/register"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
            >
              Start Monitoring
            </a>
          </div>
        </Container>
      </header>

      <Container className="max-w-3xl py-16">
        <div className="flex flex-col gap-4">
          <Eyebrow>Documentation</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Error intelligence, wired in minutes.
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            TrazeIQ watches your production errors, groups the repeats, gets an
            AI root cause and fix, and tells your team — before a customer
            does. This page is the whole integration guide.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <DocsQuickstart />
          <DocsIngestion />
          <DocsPipeline />
          <DocsReadApi />
          <DocsLimits />
          <DocsSecurity />
        </div>
      </Container>

      <Footer />
    </main>
  );
}