import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsReadApi() {
  return (
    <>
      <DocsSection
        id="read-api"
        label="Read API"
        title="Pull data back out — events and incidents"
        sub="Read endpoints use your session (JWT), never the project API key, and are scoped to your organization — a cross-organization id resolves to 404 with no existence leak."
      >
        <SubHeading id="read-api-events">Events — GET /api/v1/events/</SubHeading>
        <DocsTable
          head={["Param", "Type", "Notes"]}
          rows={[
            [<Code key="a">level</Code>, "enum", "debug | info | warning | error | fatal"],
            [<Code key="a">environment</Code>, "string", "e.g. production"],
            [<Code key="a">service</Code>, "string", "e.g. payment-api"],
            [<Code key="a">date</Code>, "YYYY-MM-DD", <>Bad value → 400 <Code>INVALID_DATE</Code></>],
            [<Code key="a">search</Code>, "string", "Free-text over message/fingerprint/service/environment/endpoint"],
            [<Code key="a">page</Code>, "int", "Default 1"],
            [<Code key="a">page_size</Code>, "int", "Default 50, max 100"],
          ]}
        />
        <DocsCode
          label="list events"
          code={`GET /api/v1/events/?level=error&environment=production&service=payment-api&date=2026-09-01&search=TypeError&page=1&page_size=50
Authorization: Bearer <access_jwt>

200 {success:true, data:{events:[{id, project, error_group, message, stacktrace, level, environment, service, endpoint, request_method, user_id, ip_address, metadata, breadcrumbs, fingerprint, created_at}], pagination:{page, page_size, total, pages, has_next, has_previous}}}
GET /api/v1/events/{id}/ → 200 {data:{event}}  or 404 cross-org`}
        />

        <SubHeading id="read-api-incidents">Incidents — the workflow around a group</SubHeading>
        <DocsTable
          head={["Endpoint", "Purpose"]}
          rows={[
            [<Code key="1">GET /api/v1/incidents/</Code>, "List incidents. Filters: ?status=open|investigating|resolved|ignored, ?severity=critical|high|medium|low, ?project=UUID, ?search= (substring across error-group title + event message/service/endpoint)"],
            [<Code key="2">GET /api/v1/incidents/{"{id}"}/</Code>, "Incident detail — {id, project:{id,name,environment}, error_group:{id,fingerprint,title,count,first_seen,last_seen}, severity, status, assigned_to:UUID|null, assigned_to_email:string|null, created_at, resolved_at, latest_event:{id,message,stacktrace,level,environment,service,endpoint,created_at}|null}"],
            [<Code key="3">GET /api/v1/incidents/{"{id}"}/timeline/</Code>, "Chronological feed (see Timeline section) — events, comments, status changes"],
            [<Code key="4">PATCH /api/v1/incidents/{"{id}"}/</Code>, "Update {status?, severity?, assigned_to?:UUID|null} — developer+; assigned_to must be in same org; appends a status_change entry when the status actually changes; publishes incident.updated"],
            [<Code key="5">POST /api/v1/incidents/{"{id}"}/comments/</Code>, "Add comment {content:1–5000} — see Timeline"],
          ]}
        />
        <DocsCode
          label="incidents — list & detail"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl "https://api.trazeiq.io/api/v1/incidents/?status=open&severity=critical&project=<proj>" \\
  -H "Authorization: Bearer <jwt>"
# 200 {data:{incidents:[...]}}

curl https://api.trazeiq.io/api/v1/incidents/<id>/ -H "Authorization: Bearer <jwt>"
# 200 {data:{incident:{...}}}`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `const { incidents } = await api("/incidents/?status=open&severity=critical");
const { incident } = await api(\`/incidents/\${id}/\`);`,
            },
          ]}
        />

        <SubHeading id="read-api-bulk">Bulk — POST /api/v1/incidents/bulk*/</SubHeading>
        <DocsTable
          head={["Endpoint", "Body"]}
          rows={[
            [<Code key="a">POST /api/v1/incidents/bulk/</Code>, <Code key="b">{`{ids|incident_ids:[UUID], action|status|severity|assigned_to}`}</Code> + " — generic bulk (legacy)"],
            [<Code key="a">POST /api/v1/incidents/bulk-update/</Code>, <Code key="b">{`{incident_ids:[1..100], status?, severity?, assigned_to?:UUID|null}`}</Code> + " — at least one update required; writes audit incidents_bulk_updated"],
            [<Code key="a">POST /api/v1/incidents/bulk-resolve/</Code>, <Code key="b">{`{incident_ids:[UUID]}`}</Code>],
            [<Code key="a">POST /api/v1/incidents/bulk-ignore/</Code>, <Code key="b">{`{incident_ids:[UUID]}`}</Code> + " — archive counterpart to resolve"],
            [<Code key="a">POST /api/v1/incidents/bulk-assign/</Code>, <Code key="b">{`{incident_ids:[], assigned_to:UUID|null}`}</Code>],
          ]}
        />
        <Callout variant="note" title="Bulk responses">
          Every bulk endpoint returns <Code>{`{updated_count, updated_ids:[UUID], skipped_ids:[UUID], incidents:[...]}`}</Code> — <Code>skipped_ids</Code> are requested IDs that don&apos;t exist or aren&apos;t visible to the caller (unknown and foreign IDs are indistinguishable by design). Audit entries list the touched incident IDs.
        </Callout>
        <DocsCode
          label="bulk update"
          code={`curl -X POST https://api.trazeiq.io/api/v1/incidents/bulk-update/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>" \\
  -d '{"incident_ids":["2f1c...","3a2b..."],"status":"resolved"}'`}
        />
      </DocsSection>
    </>
  );
}
