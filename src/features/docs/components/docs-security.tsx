import { Callout } from "./docs-callout";
import { Code, DocsSection, DocsTable } from "./docs-shared";

const items = [
  {
    title: "Keys are hashed, never stored raw",
    body: "Your API key is shown once at creation (POST /projects/ and POST …/rotate-key/) and stored as HMAC-SHA256 keyed by API_KEY_HASH_SECRET|SECRET_KEY. Later reads expose only api_key_prefix (first 8 chars). Lost it? Rotate it — the old key dies instantly and an audit log row is written.",
  },
  {
    title: "Secrets are redacted on ingest",
    body: "SECRET_KEY=, DATABASE_URL=, password=, bearer tokens, and JWTs are scrubbed from message+stacktrace before storage or AI submission (redact_secrets → before fingerprint/group). A monitoring tool should never become the leak vector.",
  },
  {
    title: "Tenant isolation everywhere",
    body: "Every read endpoint scopes queries to your organization via memberships__user=request.user. A cross-organization id returns 404, not 403 — no existence leaks — verified with org-scoping tests on every app.",
  },
  {
    title: "Error content is untrusted",
    body: "Stacktraces are rendered as data and the AI system prompt instructs the model to treat message+stacktrace strictly as DATA, never as instructions — a crafted \"ignore previous instructions\" payload stays in the strict {root_cause,suggested_fix,confidence} shape (parser retry once, then mark failed, never crash the worker).",
  },
  {
    title: "Realtime uses private channels only",
    body: "Only private-project-{uuid} exists (regex ^private-project-[0-9a-f]{8}-...$). Auth is server-side via POST /pusher/auth/ with membership check; the Pusher secret never reaches the browser and publishing is best-effort with a 2 s timeout.",
  },
  {
    title: "Integration credentials encrypted at rest",
    body: "Slack bot tokens are stored via Fernet EncryptedCharField (trazeiq-enc: prefix, key from SECRET_KEY). Webhook targets are validated + NoRedirect, and DNS resolution blocks private/reserved IPs — SSRF cannot bounce via redirect.",
  },
];

export function DocsSecurity() {
  return (
    <DocsSection
      id="security"
      label="Security"
      title="Built to not be the thing that leaks"
      sub="The monitoring tool sees every stacktrace your app throws — that privilege comes with constraints. Checklist mirrors Security-and-Scalability-Checklist.md."
    >
      <ul className="flex flex-col gap-5">
        {items.map(({ title, body }) => (
          <li key={title} className="flex flex-col gap-1">
            <p className="flex items-center gap-3 text-sm font-medium text-ink">
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
              {title}
            </p>
            <p className="pl-4 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>

      <DocsTable
        head={["Concern", "How TrazeIQ handles it"]}
        rows={[
          ["Auth cookies", "trazeiq_access 15m path=/ + trazeiq_refresh 7d path=/api/v1/auth/, httpOnly (+ Secure+SameSite in prod), never in body except user shape"],
          ["CORS", "django-cors-headers locked to DJANGO_CORS_ALLOWED_ORIGINS (default http://localhost:3000) with credentials"],
          ["Rate limits", "Auth: per-scope per-IP + axes per (IP,email) lockout 5/15min; Ingestion: per-IP 5000/min + per-project 1000/min (or Project.events_per_minute) via RedisWindowThrottle (atomic cache.incr)"],
          ["Payload cap", "EVENT_MAX_PAYLOAD_BYTES default 100 KB → 413 PAYLOAD_TOO_LARGE with boundary tests (cap OK, cap+1 rejected)"],
          ["API docs exposure", "drf-spectacular schema on only where ENABLE_API_SCHEMA=true (dev on, prod off)"],
          ["HSTS / DEBUG", "Hardened in prod.py: DEBUG=False, ALLOWED_HOSTS locked, database CONN_MAX_AGE, Secure cookies, secrets only via env"],
        ]}
      />
      <Callout variant="warning" title="Never log the raw key">
        The raw <Code>api_key</Code> and <Code>registration_token</Code> are shown once. If you print them to a job log, the log store becomes the secret store. Copy them into your host app&apos;s env/secrets manager and close the page.
      </Callout>
    </DocsSection>
  );
}
