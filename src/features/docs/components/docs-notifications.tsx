import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsNotifications() {
  return (
    <DocsSection
      id="notifications"
      label="Integrations & Alerts"
      title="Notifications & preferences"
      sub="Self-scoped inbox — a user can only ever read or mutate their own rows. IsAuthenticated is the whole permission story."
    >
      <SubHeading id="notifications-list">List & counts</SubHeading>
      <DocsTable
        head={["Endpoint", "Query", "Response"]}
        rows={[
          [
            <Code key="a">GET /api/v1/notifications/</Code>,
            <><Code>?limit=1..200 (default 50) & ?offset=0..</Code></>,
            <><Code>{`{notifications:[{id, incident:{id,title,severity,status}|null, kind, title, body, is_read, read_at, created_at}], unread_count}`}</Code></>,
          ],
          [
            <Code key="a">GET /api/v1/notifications/unread-count/</Code>,
            "—",
            <><Code>{`{unread_count:int}`}</Code> — cheap badge poll</>,
          ],
        ]}
      />
      <DocsCode
        label="list inbox"
        code={`curl "https://api.trazeiq.io/api/v1/notifications/?limit=20&offset=0" \\
  -H "Authorization: Bearer <access_jwt>"
# 200 {success:true, data:{notifications:[...], unread_count:3}}
# kind ∈ incident_created | incident_assigned | incident_updated | incident_commented | incident_resolved | system`}
      />
      <DocsTable
        head={["kind", "When created"]}
        rows={[
          [<Code key="a">incident_created</Code>, "New incident for the project"],
          [<Code key="a">incident_assigned</Code>, "Incident assigned_to changes to this user"],
          [<Code key="a">incident_updated</Code>, "Status/severity patched"],
          [<Code key="a">incident_commented</Code>, "Comment added to an incident the user watches"],
          [<Code key="a">incident_resolved</Code>, "Incident resolved"],
          [<Code key="a">system</Code>, "Internal notices (e.g. key rotation hints)"],
        ]}
      />

      <SubHeading id="notifications-read">Mark read</SubHeading>
      <DocsTable
        head={["Endpoint", "Body", "Response"]}
        rows={[
          [
            <Code key="a">POST /api/v1/notifications/read/</Code>,
            <><Code>{`{ids?: UUID[]}`}</Code> — when omitted or empty, every unread row is marked read at once</>,
            <><Code>{`{marked:int, unread_count:int}`}</Code> — marked is the bulk-update count; read_at set to now</>,
          ],
        ]}
      />
      <DocsCode
        label="mark read"
        tabs={[
          {
            lang: "curl",
            label: "curl",
            code: `curl -X POST https://api.trazeiq.io/api/v1/notifications/read/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <access_jwt>" \\
  -d '{"ids":["c0a1...","d1b2..."]}'
# 200 {data:{marked:2, unread_count:1}}

curl -X POST https://api.trazeiq.io/api/v1/notifications/read/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <access_jwt>" \\
  -d '{}'
# 200 {data:{marked:4, unread_count:0}} — mark all`,
          },
          {
            lang: "js",
            label: "JavaScript",
            code: `await api("/notifications/read/", { method: "POST", body: { ids: selected } });
// omit ids to clear the whole inbox
await api("/notifications/read/", { method: "POST", body: {} });`,
          },
          { lang: "python", label: "Python", code: `requests.post("https://api.trazeiq.io/api/v1/notifications/read/", headers={"Authorization": f"Bearer {jwt}"}, json={"ids": ids})` },
        ]}
      />

      <SubHeading id="notifications-prefs">Alert preferences — GET/PATCH /api/v1/notifications/preferences/</SubHeading>
      <p className="text-sm leading-relaxed text-muted">
        Per-user knobs that materialize with defaults on first read. PATCH is partial — send only the toggles you&apos;re flipping.
      </p>
      <DocsTable
        head={["Field", "Type", "Default", "Meaning"]}
        rows={[
          [<Code key="a">only_assigned_to_me</Code>, "bool", "false", "When true, only notifications for incidents assigned to me"],
          [<Code key="a">notify_on_new_incidents</Code>, "bool", "true", "incident_created"],
          [<Code key="a">notify_on_status_changes</Code>, "bool", "true", "incident_updated / incident_resolved"],
          [<Code key="a">notify_on_comments</Code>, "bool", "true", "incident_commented"],
          [<Code key="a">updated_at</Code>, "ISO-8601", "—", "Read-only"],
        ]}
      />
      <DocsCode
        label="preferences"
        tabs={[
          {
            lang: "curl",
            label: "curl",
            code: `curl https://api.trazeiq.io/api/v1/notifications/preferences/ \\
  -H "Authorization: Bearer <access_jwt>"
# 200 {data:{preferences:{only_assigned_to_me:false, notify_on_new_incidents:true, ... , updated_at:"..."}}}

curl -X PATCH https://api.trazeiq.io/api/v1/notifications/preferences/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <access_jwt>" \\
  -d '{"only_assigned_to_me":true,"notify_on_comments":false}'
# 200 {data:{preferences:{...}}}`,
          },
          {
            lang: "js",
            label: "JavaScript",
            code: `const { preferences } = await api("/notifications/preferences/");
await api("/notifications/preferences/", { method: "PATCH", body: { only_assigned_to_me: true } });`,
          },
          { lang: "python", label: "Python", code: `requests.get("https://api.trazeiq.io/api/v1/notifications/preferences/", headers={"Authorization": f"Bearer {jwt}"})\nrequests.patch("https://api.trazeiq.io/api/v1/notifications/preferences/", headers={"Authorization": f"Bearer {jwt}"}, json={"notify_on_comments": False})` },
        ]}
      />
      <Callout variant="tip" title="No org-wide auth">
        Notification endpoints don&apos;t check team membership — they check <Code>recipient=request.user</Code> only. A user from another org can never list or clear your inbox, even if they know a notification id.
      </Callout>
    </DocsSection>
  );
}
