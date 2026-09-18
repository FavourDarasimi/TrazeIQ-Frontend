import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsLimits() {
  return (
    <DocsSection
      id="limits"
      label="Limits"
      title="Payloads and rate limits"
      sub="These defaults keep ingestion fast and system performance predictable under high load."
    >
      <DocsTable
        head={["Limit", "Default", "Enforced as"]}
        rows={[
          ["Payload size", "100 KB per event (len(message)+len(stacktrace))", <StatusBadge key="s" code="413" tone="warn" />],
          ["Per-project rate", "1,000 events/minute (configurable per project via events_per_minute)", <StatusBadge key="s" code="429" tone="danger" />],
          ["Per-IP rate", "5,000 events/minute", <StatusBadge key="s" code="429" tone="danger" />],
          ["Ingestion latency", "Milliseconds, flat under load", "fast edge ingestion"],
        ]}
      />
      <p className="text-sm leading-relaxed text-muted">
        Throttled requests include a <Code>Retry-After</Code> header and the standard <Code>TOO_MANY_REQUESTS</Code> code. A crash loop sending the same error hundreds of times a second increments one <Code>ErrorGroup</Code> and reuses the open incident — the flood is deduplicated before it touches storage or alert channels.
      </p>

      <SubHeading id="limits-rate-details">Rate-limit internals</SubHeading>
      <DocsTable
        head={["Throttle", "Key", "Backend"]}
        rows={[
          ["POST /api/v1/events/ per-IP", <Code key="a">client IP</Code>, "RedisWindowThrottle (atomic cache.incr fixed window) — global EVENT_THROTTLE_IP"],
          ["POST /api/v1/events/ per-key", <Code key="a">project api_key_hash</Code>, "Per-project Project.events_per_minute overrides global EVENT_THROTTLE_KEY"],
          ["Auth endpoints", "per-IP per-scope", "AuthScopedRateThrottle reading AUTH_THROTTLE_* (e.g. auth_login 60/min)"],
          ["Login lockout", "per (IP,email)", "django-axes failure limit 5, cooloff 15 min, manual fire on INVALID_CREDENTIALS"],
        ]}
      />
      <Callout variant="tip" title="Tuning">
        A single high-volume project&apos;s <Code>events_per_minute</Code> override lives on the project row (server-side — the project POST/PATCH endpoints don&apos;t accept it) so the global cap stays untouched. In prod, set <Code>DJANGO_REDIS_URL</Code> so throttles and per-email OTP caps share Redis across workers; without it, <Code>LocMemCache</Code> under-counts.
      </Callout>
    </DocsSection>
  );
}
