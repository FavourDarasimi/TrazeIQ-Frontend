import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsLimits() {
  return (
    <DocsSection
      id="limits"
      label="Limits"
      title="Payloads, rate limits, AI budget"
      sub="These defaults keep ingestion fast and the free-tier AI pipeline inside its rate limits. If you hit a wall, the numbers below explain what's happening."
    >
      <DocsTable
        head={["Limit", "Default", "Enforced as"]}
        rows={[
          [
            "Payload size",
            "100 KB per event",
            <StatusBadge key="s" code="413" tone="warn" />,
          ],
          [
            "Per-project rate",
            "1,000 events/minute (configurable per project)",
            <StatusBadge key="s" code="429" tone="danger" />,
          ],
          [
            "Per-IP rate",
            "5,000 events/minute",
            <StatusBadge key="s" code="429" tone="danger" />,
          ],
          [
            "AI analysis",
            "Once per new incident, cached 6 hours",
            "async, never blocks ingestion",
          ],
          [
            "Ingestion latency",
            "Milliseconds, flat under load",
            "no inline AI / alert / realtime calls",
          ],
        ]}
      />
      <p className="text-sm leading-relaxed text-muted">
        Throttled requests include a <Code>Retry-After</Code> header and the
        standard <Code>TOO_MANY_REQUESTS</Code> code. A crash loop sending the
        same error hundreds of times a second increments one{" "}
        <Code>ErrorGroup</Code> and reuses the open incident — the flood is
        deduplicated before it touches storage, the AI queue, or alert
        channels.
      </p>
    </DocsSection>
  );
}