import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsReadApi() {
  return (
    <DocsSection
      id="read-api"
      label="Read API"
      title="Pull data back out"
      sub="Read endpoints use your session (JWT), not the project API key, and are scoped to your organization — a cross-organization id resolves to 404."
    >
      <DocsTable
        head={["Endpoint", "Purpose"]}
        rows={[
          [
            <Code key="1">GET /api/v1/events/</Code>,
            "List events. Filters: level, environment, service, date.",
          ],
          [
            <Code key="2">GET /api/v1/events/{"{id}"}/</Code>,
            "One raw event, including the post-redaction stacktrace.",
          ],
          [
            <Code key="3">GET /api/v1/incidents/</Code>,
            "List incidents. Filters: status, severity, project.",
          ],
          [
            <Code key="4">GET /api/v1/incidents/{"{id}"}/</Code>,
            "Incident detail — error group summary plus the latest event.",
          ],
          [
            <Code key="5">GET /api/v1/incidents/{"{id}"}/timeline/</Code>,
            "Chronological feed: events, comments, status changes, AI analyses.",
          ],
          [
            <Code key="6">PATCH /api/v1/incidents/{"{id}"}/</Code>,
            "Update status, severity, or assignment.",
          ],
          [
            <Code key="7">POST /api/v1/incidents/{"{id}"}/comments/</Code>,
            "Add a comment to the timeline.",
          ],
          [
            <Code key="8">GET /api/v1/incidents/{"{id}"}/analysis/</Code>,
            "Latest AI root cause + suggested fix.",
          ],
          [
            <Code key="9">POST /api/v1/incidents/{"{id}"}/analyze/</Code>,
            "Manually re-run AI analysis, bypassing the cache window.",
          ],
          [
            <Code key="10">GET /api/v1/dashboard/overview/?project_id=</Code>,
            "Open incidents, 24h event trend, top recurring errors.",
          ],
          [
            <Code key="11">GET /api/v1/dashboard/stats/?range=24h|7d|30d</Code>,
            "Time-series buckets for charts.",
          ],
          [
            <Code key="12">GET /api/v1/alerts/rules/</Code>,
            "List alert rules for the project.",
          ],
          [
            <Code key="13">GET /api/v1/alerts/logs/</Code>,
            "Alert delivery history — dispatched and failed.",
          ],
        ]}
      />
    </DocsSection>
  );
}