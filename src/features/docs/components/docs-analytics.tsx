import { Callout } from "./docs-callout";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsAnalytics() {
  return (
    <>
      <DocsSection
        id="analytics"
        label="API Reference"
        title="Dashboard — overview & stats"
        sub="Read-only, JWT auth, membership-scoped via a project__in subquery so GROUP BY bucket counts never corrupt."
      >
        <DocsTable
          head={["Endpoint", "Required query"]}
          rows={[
            [
              <Code key="a">GET /api/v1/dashboard/overview/?project_id=UUID</Code>,
              <><Code>project_id</Code> — 400 <Code>error.fields.project_id</Code> if missing; foreign id narrows to empty aggregates, not a leak</>,
            ],
            [
              <Code key="a">GET /api/v1/dashboard/stats/?project_id=UUID&range=24h|7d|30d</Code>,
              <><Code>range ∈ 24h (hourly) | 7d | 30d (daily)</Code>, zero-filled gaps</>,
            ],
          ]}
        />
        <DocsCode
          label="dashboard overview & stats"
          code={`curl "https://api.trazeiq.io/api/v1/dashboard/overview/?project_id=<proj>" \\
  -H "Authorization: Bearer <jwt>"
# 200 {data:{overview:{open_incidents:{total:4, by_severity:{critical:1,high:1,medium:0,low:0}}, events_24h:128, event_trend:{percent_change:12,trend:"up"}, resolved_24h:2, top_errors:[{fingerprint,title,count,last_seen,incident_id,severity}], health:"critical"}}}

curl "https://api.trazeiq.io/api/v1/dashboard/stats/?project_id=<proj>&range=7d" \\
  -H "Authorization: Bearer <jwt>"
# 200 {data:{stats:{range:"7d", points:[{ts:"2026-09-01T00:00:00+00:00", events:12, incidents:1}, ...]}}}`}
        />
        <DocsTable
          head={["overview key", "Type / derivation"]}
          rows={[
            [<Code key="a">open_incidents.by_severity</Code>, "{critical,high,medium,low}:int — counts where status ∈ open,investigation"],
            [<Code key="a">events_24h</Code>, "int — Event count since now−24h"],
            [<Code key="a">event_trend</Code>, <><Code>{"{percent_change:int, trend:up|down|flat}"}</Code> — vs prior 24h window; zero-zero → 0/flat</>],
            [<Code key="a">resolved_24h</Code>, "int — Incident status=resolved & resolved_at ≥ window_start"],
            [<Code key="a">top_errors</Code>, "5 most-counted ErrorGroups with last_seen ≥ now−7d; each join looks up the open incident for the group"],
            [<Code key="a">health</Code>, "critical if critical>0 else degraded if high>0 else healthy"],
          ]}
        />
        <Callout variant="note" title="Cache layer">
          Both endpoints are wrapped in <Code>cached_dashboard</Code> (per-project version counters bumped on <Code>Event/Incident</Code> writes) with a safety-net TTL <Code>DASHBOARD_CACHE_TTL_SECONDS</Code> default 60 s. Logs <Code>apps.analytics.cache HIT/MISS … ms saved</Code> when <Code>LOGGING apps.analytics.cache INFO</Code>.
        </Callout>
      </DocsSection>

      <DocsSection
        id="services-health"
        label="API Reference"
        title="Services health — GET /api/v1/services/health/"
        sub="Per-service error catalog over a rolling window. Events without a service string are excluded."
      >
        <DocsTable
          head={["Query", "Required", "Notes"]}
          rows={[
            [<Code key="a">project_id</Code>, "yes", "UUID — 400 if missing"],
            [<Code key="a">range</Code>, "no", "24h|7d|30d — default 24h; invalid → 400 {range:[Must be one of…]}"],
          ]}
        />
        <DocsCode
          label="services health"
          code={`curl "https://api.trazeiq.io/api/v1/services/health/?project_id=<proj>&range=24h" \\
  -H "Authorization: Bearer <jwt>"
# 200 {data:{catalog:{range:"24h", summary:{total_services:3, events:210, critical_services:1, avg_error_rate:0.142},
#                     services:[{name:"payment-api", status:"critical", events:120, error_events:24, error_rate:0.2,
#                                fatal_events:2, error_groups:5, uptime:87, last_seen:"...", environments:[{name:"production",events:100,error_events:20}]}]}}}`}
        />
        <DocsTable
          head={["status", "Derived from"]}
          rows={[
            [<Code key="a">critical</Code>, "≥1 fatal event (level=fatal) in window"],
            [<Code key="a">degraded</Code>, "any error event (error|fatal) but no fatal"],
            [<Code key="a">healthy</Code>, "no error/fatal events at all"],
          ]}
        />
        <p className="text-sm leading-relaxed text-muted">
          <Code>uptime</Code> is <Code>round((activeHourlyBuckets − fatalBuckets)/activeBuckets × 100)</Code>; hours with zero events neither help nor hurt. Sorted <Code>critical → degraded → healthy</Code>, then by <Code>-events</Code>. Per service: <Code>events</Code>, <Code>error_events</Code> (<Code>level ∈ error,fatal</Code>), <Code>fatal_events</Code>, <Code>error_groups</Code> (distinct fingerprints), <Code>last_seen</Code>, plus environment breakdown.
        </p>
      </DocsSection>
    </>
  );
}
