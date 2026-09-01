import { Callout } from "./docs-callout";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsAudit() {
  return (
    <DocsSection
      id="audit"
      label="Security & Reference"
      title="Audit log"
      sub="Owner/admin only. A tenant audit trail across the orgs you administer, ordered newest first."
    >
      <DocsTable
        head={["Endpoint", "Query", "Auth"]}
        rows={[
          [
            <Code key="a">GET /api/v1/audit-logs/</Code>,
            <><Code>?organization=UUID</Code> — when supplied, limits to that org (still access-checked)</>,
            "IsAuthenticated + IsOrgOwnerOrAdminAny — developer with no admin org is 403",
          ],
        ]}
      />
      <DocsCode
        label="list audit logs"
        code={`curl "https://api.trazeiq.io/api/v1/audit-logs/?organization=<org-uuid>" \\
  -H "Authorization: Bearer <admin_jwt>"
# 200 {data:{audit_logs:[{id, organization:UUID, actor:UUID, actor_email:string, action, target, created_at}]}}
# 200 across all admins when ?organization omitted: every org where caller is owner/admin
# 403 {error:{code:"PERMISSION_DENIED", message:"Permission denied."}} — viewer/developer
# 403 {error:{message:"Not permitted for this organization."}} — organization filter outside caller's admin orgs`}
      />
      <DocsTable
        head={["Field", "Type", "Notes"]}
        rows={[
          [<Code key="a">organization</Code>, "UUID", ""],
          [<Code key="a">actor</Code>, "UUID", "Who did it"],
          [<Code key="a">actor_email</Code>, "string", "Source actor.email for display"],
          [<Code key="a">action</Code>, "enum", "key_rotated | member_removed | incident_resolved | incidents_bulk_updated"],
          [<Code key="a">target</Code>, "string 255", 'Human target, e.g. "Rotated API key for project \'payment-api\'"'],
          [<Code key="a">created_at</Code>, "ISO-8601", "Ordering newest first"],
        ]}
      />
      <Callout variant="note" title="When logs are written">
        <Code>key_rotated</Code> on <Code>POST …/rotate-key/</Code>,{" "}
        <Code>member_removed</Code> on <Code>DELETE …/members/{"{user_id}"}/</Code>,{" "}
        <Code>incident_resolved</Code> and <Code>incidents_bulk_updated</Code> on the incident resolve / bulk-update paths. No separate pagination — the selector orders by{" "}
        <Code>-created_at</Code> and the frontend pages client-side.
      </Callout>
    </DocsSection>
  );
}
