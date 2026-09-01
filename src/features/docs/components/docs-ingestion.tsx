import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";
import { DocsCode } from "./docs-code";

const requestBody = `{
  "message": "TypeError: Cannot read properties of undefined (reading 'id')",
  "stacktrace": "at processPayment (/app/src/payments.js:42:17)\\n    at handler (/app/src/routes.js:9:5)",
  "level": "error",
  "environment": "production",
  "service": "payment-api",
  "endpoint": "/v1/orders",
  "request_method": "POST",
  "user_id": "usr_8f2c",
  "ip_address": "203.0.113.10",
  "metadata": { "order_id": "ord_71b3", "attempt": 2 },
  "breadcrumbs": []
}`;

const ingestionTabs = [
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.trazeiq.io/api/v1/events/ \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: trazeiq_...32-url-safe..." \\
  -d '${requestBody}'
# 201 {success:true, data:{event:{id, project, error_group, message, stacktrace, level, environment, service, fingerprint, created_at}}}`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `try {
  await processPayment(order)
} catch (error) {
  fetch("https://api.trazeiq.io/api/v1/events/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": "trazeiq_..." },
    body: JSON.stringify({
      message: error.message,          // required
      stacktrace: error.stack ?? "",   // secrets auto-redacted
      level: "error",                  // debug|info|warning|error|fatal
      environment: "production",
      service: "payment-api",
      endpoint: "/v1/orders",
      request_method: "POST",
      metadata: { order_id: order.id },
      breadcrumbs: [],
    }),
  }).catch(() => {});
  throw error;
}`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import requests
try:
    process_payment(order)
except Exception as exc:
    requests.post(
        "https://api.trazeiq.io/api/v1/events/",
        headers={"Content-Type": "application/json", "X-API-Key": "trazeiq_..."},
        json={
            "message": str(exc),
            "stacktrace": traceback.format_exc(),
            "environment": "production",
            "service": "payment-api",
        },
        timeout=2,
    )
    raise`,
  },
  {
    lang: "node",
    label: "Node",
    code: `// Express error handler
app.use(async (err, req, res, next) => {
  await fetch("https://api.trazeiq.io/api/v1/events/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.TRAZEIQ_API_KEY! },
    body: JSON.stringify({
      message: err.message,
      stacktrace: err.stack,
      service: "api",
      environment: process.env.NODE_ENV,
      endpoint: req.path,
      request_method: req.method,
    }),
  }).catch(() => {});
  next(err);
});`,
  },
];

export function DocsIngestion() {
  return (
    <DocsSection
      id="ingestion"
      label="Ingestion API"
      title="POST /api/v1/events/"
      sub="Authenticate with your project's API key in the X-API-Key header. The endpoint responds in milliseconds — AI analysis, alerting, and realtime delivery all happen asynchronously, so reporting an error never blocks your app."
    >
      <div className="flex flex-col gap-6">
        <DocsCode label="POST /api/v1/events/ — fire an event" tabs={ingestionTabs} />

        <SubHeading id="ingestion-fields">Fields</SubHeading>
        <DocsTable
          head={["Field", "Type", "Required", "Notes"]}
          rows={[
            [<Code key="1">message</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "The error message. Stored post-redaction."],
            [<Code key="2">stacktrace</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Full stack trace. Secrets scrubbed before storage or AI prompt."],
            [<Code key="3">level</Code>, "enum", <StatusBadge key="s" code="no" tone="default" />, "debug | info | warning | error | fatal — defaults to error."],
            [<Code key="4">environment</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "e.g. production, staging. Max 32 chars."],
            [<Code key="5">service</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Which service threw it, e.g. payment-api. Max 64 chars."],
            [<Code key="6">endpoint</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Request path, if applicable. Max 255 chars."],
            [<Code key="7">request_method</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "HTTP method. Max 16 chars."],
            [<Code key="8">user_id</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Affected user, if known. Max 128 chars."],
            [<Code key="9">ip_address</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Client IP. Max 64 chars."],
            [<Code key="10">metadata</Code>, "object", <StatusBadge key="s" code="no" tone="default" />, "Free-form JSON context. Default {}."],
            [<Code key="11">breadcrumbs</Code>, "array", <StatusBadge key="s" code="no" tone="default" />, "List — default []. Shown in timeline detail."],
          ]}
        />
        <Callout variant="warning" title="Payload cap">
          If <Code>len(message)+len(stacktrace) &gt; EVENT_MAX_PAYLOAD_BYTES</Code> (default 100 KB), the request is rejected with <Code>413 PAYLOAD_TOO_LARGE</Code> before any DB work. Trim giant stacktraces client-side — large frames add little signal and burn budget.
        </Callout>

        <SubHeading id="ingestion-responses">Responses & throttling</SubHeading>
        <DocsTable
          head={["Status", "Meaning"]}
          rows={[
            [<StatusBadge key="s" code="201" tone="ok" />, "Created. Returns the stored event under data.event (including fingerprint and redacted stacktrace)."],
            [<StatusBadge key="s" code="400" tone="warn" />, <><Code>VALIDATION_FAILED</Code> — malformed payload; check error.fields</>],
            [<StatusBadge key="s" code="401" tone="danger" />, <><Code>NOT_AUTHENTICATED</Code> — missing or invalid X-API-Key (hashed via HMAC with API_KEY_HASH_SECRET)</>],
            [<StatusBadge key="s" code="413" tone="warn" />, <><Code>PAYLOAD_TOO_LARGE</Code> — payload exceeds the 100 KB cap</>],
            [<StatusBadge key="s" code="429" tone="danger" />, <><Code>TOO_MANY_REQUESTS</Code> — per-IP 5,000/min + per-project 1,000/min (or Project.events_per_minute); respect Retry-After</>],
          ]}
        />

        <p className="text-sm leading-relaxed text-muted">
          Every response uses the envelope shape: <Code>{`{"success": true, "message": "...", "data": {...}}`}</Code>. Failures carry a stable machine-readable <Code>error.code</Code> instead of a human string you&apos;d have to parse.
        </p>
        <Callout variant="tip" title="Dedup is automatic">
          Sending the same error 50 times produces exactly one <Code>ErrorGroup</Code> with <Code>count=50</Code> and one open <Code>Incident</Code> — the fingerprint normalizes line numbers, memory addresses, and UUIDs, then hashes error type + top frames, raced via a unique constraint on <Code>(project, fingerprint)</Code>.
        </Callout>
      </div>
    </DocsSection>
  );
}
