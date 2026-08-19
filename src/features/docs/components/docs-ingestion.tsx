import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsIngestion() {
  return (
    <DocsSection
      id="ingestion"
      label="Ingestion API"
      title="POST /api/v1/events/"
      sub="Authenticate with your project's API key in the X-API-Key header. The endpoint responds in milliseconds — AI analysis, alerting, and realtime delivery all happen asynchronously, so reporting an error never blocks your app."
    >
      <div className="flex flex-col gap-6">
        <DocsTable
          head={["Field", "Type", "Required", "Notes"]}
          rows={[
            [
              <Code key="1">message</Code>,
              "string",
              <StatusBadge key="s" code="yes" tone="ok" />,
              "The error message. Stored post-redaction.",
            ],
            [
              <Code key="2">stacktrace</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "Full stack trace. Secrets are scrubbed before storage or AI analysis.",
            ],
            [
              <Code key="3">level</Code>,
              "enum",
              <StatusBadge key="s" code="no" tone="default" />,
              "debug | info | warning | error | fatal — defaults to error.",
            ],
            [
              <Code key="4">environment</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "e.g. production, staging. Max 32 chars.",
            ],
            [
              <Code key="5">service</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "Which service threw it, e.g. payment-api. Max 64 chars.",
            ],
            [
              <Code key="6">endpoint</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "Request path, if applicable. Max 255 chars.",
            ],
            [
              <Code key="7">request_method</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "HTTP method. Max 16 chars.",
            ],
            [
              <Code key="8">user_id</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "Affected user, if known. Max 128 chars.",
            ],
            [
              <Code key="9">ip_address</Code>,
              "string",
              <StatusBadge key="s" code="no" tone="default" />,
              "Client IP. Max 64 chars.",
            ],
            [
              <Code key="10">metadata</Code>,
              "object",
              <StatusBadge key="s" code="no" tone="default" />,
              "Free-form JSON context.",
            ],
          ]}
        />

        <DocsTable
          head={["Status", "Meaning"]}
          rows={[
            [
              <StatusBadge key="s" code="201" tone="ok" />,
              "Created. Returns the stored event under data.event.",
            ],
            [
              <StatusBadge key="s" code="400" tone="warn" />,
              "VALIDATION_FAILED — malformed payload.",
            ],
            [
              <StatusBadge key="s" code="401" tone="danger" />,
              "NOT_AUTHENTICATED — missing or invalid X-API-Key.",
            ],
            [
              <StatusBadge key="s" code="413" tone="warn" />,
              "PAYLOAD_TOO_LARGE — payload exceeds the 100 KB cap.",
            ],
            [
              <StatusBadge key="s" code="429" tone="danger" />,
              "TOO_MANY_REQUESTS — rate limit hit; respect Retry-After.",
            ],
          ]}
        />

        <p className="text-sm leading-relaxed text-muted">
          Every response uses the envelope shape:{" "}
          <Code>{`{"success": true, "message": "...", "data": {...}}`}</Code>.
          Failures carry a stable machine-readable{" "}
          <Code>error.code</Code> instead of a human string you&apos;d have to parse.
        </p>
      </div>
    </DocsSection>
  );
}