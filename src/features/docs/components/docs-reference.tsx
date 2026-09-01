import { Callout } from "./docs-callout";
import { Code, DocsSection } from "./docs-shared";

export function DocsReference() {
  return (
    <DocsSection
      id="reference"
      label="Security & Reference"
      title="Full API reference"
      sub="This page is the integration guide. The exhaustive, schema-level spec lives in the live OpenAPI docs."
    >
      <Callout variant="note" title="Live, versioned docs">
        The source of truth for every field, enum, and response envelope — derived from <Code>drf-spectacular</Code> via <Code>ENABLE_API_SCHEMA</Code> (on in dev, off in prod unless explicitly enabled):
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/api/v1/docs/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Swagger — <Code>/api/v1/docs/</Code>
          </a>
          <a
            href="/api/v1/redoc/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ReDoc — <Code>/api/v1/redoc/</Code>
          </a>
          <a
            href="/api/v1/schema/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            OpenAPI JSON — <Code>/api/v1/schema/</Code>
          </a>
        </div>
      </Callout>
      <div className="rounded-lg border border-line bg-bg-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Base</p>
        <p className="mt-1 font-mono text-sm text-ink">https://api.trazeiq.io/api/v1</p>
        <div className="mt-3 flex flex-col gap-1 font-mono text-xs text-muted">
          <span>Auth: <Code>Authorization: Bearer {"<access_jwt>"}</Code> or <Code>trazeiq_access</Code> cookie + <Code>credentials: &quot;include&quot;</Code></span>
          <span>Ingestion: <Code>X-API-Key: {"<trazeiq_...>"}</Code></span>
          <span>Realtime: <Code>private-project-{"{uuid}"}</Code> via <Code>POST /pusher/auth/</Code></span>
          <span>Version: <Code>{"{API_BASE: /api/v1}"}</Code> — pinned from day one per Agent.md</span>
        </div>
      </div>
    </DocsSection>
  );
}
