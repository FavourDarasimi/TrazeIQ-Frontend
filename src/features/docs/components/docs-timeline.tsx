import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsTimeline() {
  return (
    <DocsSection
      id="timeline"
      label="API Reference"
      title="Timeline & comments"
      sub="One chronological feed per incident — raw events plus human and system entries. PATCHing status automatically appends a status_change entry; the publish happens so Pusher stays in sync."
    >
      <SubHeading id="timeline-feed">GET /api/v1/incidents/{"{id}"}/timeline/</SubHeading>
      <DocsTable
        head={["Field", "Type", "Notes"]}
        rows={[
          [<Code key="a">kind</Code>, "enum", "event | comment | status_change | ai_analysis"],
          [<Code key="a">content</Code>, "string", "Comment body / status label / AI summary; empty for event kind"],
          [<Code key="a">actor_email</Code>, "string | null", "Who wrote it; system events have null"],
          [<Code key="a">level / message / environment / service</Code>, "string", "When kind=event: denormalized from the Event row; otherwise fallback empty string"],
          [<Code key="a">created_at</Code>, "ISO-8601", "Ordering is created_at, id — commit-history style"],
        ]}
      />
      <DocsCode
        label="timeline response"
        code={`GET /api/v1/incidents/2f1c.../timeline/ → 200 {data:{entries:[
  {id:"e1", kind:"event",          level:"error", message:"TypeError...", content:"", actor_email:null, created_at:"2026-09-01T10:02:00Z"},
  {id:"a1", kind:"ai_analysis",    content:"Redis pool exhausted", actor_email:null, created_at:"2026-09-01T10:03:00Z"},
  {id:"c1", kind:"comment",        content:"looking into this", actor_email:"you@co.com", created_at:"2026-09-01T10:04:00Z"},
  {id:"s1", kind:"status_change",  content:"open → investigating", actor_email:"you@co.com", created_at:"2026-09-01T10:05:00Z"}
]}}`}
      />
      <p className="text-sm leading-relaxed text-muted">
        The feed merges two sources: raw <Code>Event</Code> rows for the error group (<Code>kind=event</Code>) plus <Code>TimelineEntry</Code> rows. Render with a vertical line and per-kind dot/icon — per <Code>Design.md</Code> commit-history pattern: event = severity color, AI = accent-indigo, status_change/comment = muted.
      </p>

      <SubHeading id="timeline-comment">POST /api/v1/incidents/{"{id}"}/comments/</SubHeading>
      <DocsTable
        head={["Field", "Type", "Required", "Notes"]}
        rows={[
          [<Code key="a">content</Code>, "string 1–5000", <StatusBadge key="s" code="yes" tone="ok" />, "Trimmed; whitespace-only rejected; 5000-char cap"],
        ]}
      />
      <DocsCode
        label="add a comment"
        tabs={[
          {
            lang: "curl",
            label: "curl",
            code: `curl -X POST https://api.trazeiq.io/api/v1/incidents/<id>/comments/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>" \\
  -d '{"content":"root cause looks like connection pool"}'
# 201 {data:{entry:{id, kind:"comment", content:"...", actor_email:"you@co.com", created_at:"..."}}}
# also publishes incident.updated so other viewers patch live`,
          },
          {
            lang: "js",
            label: "JavaScript",
            code: `const { entry } = await api(\`/incidents/\${id}/comments/\`, {
  method: "POST", body: { content },
});
// optimistic local entry reconciled against server entry; on 403 viewer is read-only
`,
          },
          { lang: "python", label: "Python", code: `requests.post(f"https://api.trazeiq.io/api/v1/incidents/{id}/comments/", headers={"Authorization": f"Bearer {jwt}"}, json={"content": "looking"})` },
        ]}
      />
      <DocsTable
        head={["Status", "Meaning"]}
        rows={[
          [<StatusBadge key="a" code="201" tone="ok" />, <>Created — also publishes <Code>incident.updated</Code> on <Code>private-project-{"{id}"}</Code></>],
          [<StatusBadge key="a" code="400" tone="warn" />, <><Code>VALIDATION_FAILED</Code> — blank or &gt;5000 chars</>],
          [<StatusBadge key="a" code="403" tone="danger" />, <><Code>PERMISSION_DENIED</Code> — viewer role (IsIncidentDeveloperOrAbove)</>],
        ]}
      />
      <Callout variant="tip" title="Live comments">
        If your dashboard already subscribes to the project channel from <Code>Realtime</Code>, a new comment arrives as <Code>incident.updated</Code> — refetch the timeline for that incident (version-guarded) rather than long-polling.
      </Callout>

      <SubHeading id="timeline-status">Status changes — PATCH /api/v1/incidents/{"{id}"}/</SubHeading>
      <DocsTable
        head={["Field", "Type", "Values"]}
        rows={[
          [<Code key="a">status</Code>, "enum", "open | investigating | resolved | ignored"],
          [<Code key="a">severity</Code>, "enum", "critical | high | medium | low"],
          [<Code key="a">assigned_to</Code>, "UUID | null", "Must be a user in the same org; null to unassign"],
        ]}
      />
      <DocsCode
        label="update incident"
        code={`curl -X PATCH https://api.trazeiq.io/api/v1/incidents/<id>/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>" \\
  -d '{"status":"investigating","assigned_to":"<user-uuid>"}'
# 200 {data:{incident:{...}}}
// appends TimelineEntry(kind=status_change, content:"open → investigating", actor=you)
# also PATCH /api/v1/incidents/bulk/ + /bulk-update/ + /bulk-resolve/ + /bulk-assign/ — same fields in bulk wrapper {incident_ids:[1..100], status?,severity?,assigned_to?}

curl -X POST https://api.trazeiq.io/api/v1/incidents/<id>/resolve/ -H "Authorization: Bearer <jwt>"
# 200 idempotent — flip to resolved, logs status_change, fires incident.resolved, writes AuditLog incident_resolved`}
      />
      <DocsTable
        head={["Endpoint", "Body"]}
        rows={[
          [<Code key="a">POST /api/v1/incidents/{"{id}"}/resolve/</Code>, <>(no body — idempotent; repeat logs once)</>],
          [<Code key="a">POST /api/v1/incidents/bulk-resolve/</Code>, <Code key="b">{`{incident_ids:[UUID,...]}`}</Code>],
          [<Code key="a">POST /api/v1/incidents/bulk-assign/</Code>, <Code key="b">{`{incident_ids:[], assigned_to:UUID|null}`}</Code>],
        ]}
      />
    </DocsSection>
  );
}
