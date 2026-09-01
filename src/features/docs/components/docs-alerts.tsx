import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

const webhookPayload = `{
  "title": "TypeError: Cannot read properties of undefined (reading 'id')",
  "severity": "critical",
  "status": "open",
  "link": "https://app.trazeiq.io/incidents/2f1c0a1b-...-...",
  "root_cause": "Redis connection pool exhausted — max clients reached",
  "occurrences": 42
}`;

const createRuleTabs = [
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.trazeiq.io/api/v1/alerts/rules/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <owner_jwt>" \\
  -d '{
    "project": "<project-uuid>",
    "name": "critical → #incidents",
    "condition": {"severity": "critical"},
    "channel": "webhook",
    "target": "https://hooks.example.com/trazeiq",
    "cooldown_minutes": 15
  }'
# 201 {data:{rule:{id, project:{id,name}, name, condition, channel, target, cooldown_minutes, created_at}}}`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `const { rule } = await api("/alerts/rules/", {
  method: "POST",
  body: {
    project: projectId,
    name: "critical → #incidents",
    condition: { severity: "critical" },
    channel: "webhook",
    target: "https://hooks.example.com/trazeiq",
    cooldown_minutes: 15,
  },
});`,
  },
  {
    lang: "python",
    label: "Python",
    code: `requests.post(
  "https://api.trazeiq.io/api/v1/alerts/rules/",
  headers={"Authorization": f"Bearer {token}"},
  json={
    "project": project_id,
    "name": "critical → #incidents",
    "condition": {"severity": "critical"},
    "channel": "webhook",
    "target": "https://hooks.example.com/trazeiq",
    "cooldown_minutes": 15,
  },
)`,
  },
];

export function DocsAlerts() {
  return (
    <>
      <DocsSection
        id="alerts"
        label="Integrations & Alerts"
        title="Alert rules"
        sub="A rule watches one project for matching incidents and dispatches on incident.created / incident.updated. Evaluation is async and never blocks ingestion."
      >
        <DocsTable
          head={["Endpoint", "Role", "Query / Body"]}
          rows={[
            [
              <Code key="a">GET /api/v1/alerts/rules/</Code>,
              "Any member",
              <><Code>?project=UUID</Code> — filter to one project; otherwise rules across caller&apos;s orgs</>,
            ],
            [
              <Code key="a">POST /api/v1/alerts/rules/</Code>,
              "owner/admin",
              <><Code>{`{project:UUID, name, condition, channel, target, cooldown_minutes?}`}</Code></>,
            ],
            [
              <Code key="a">PATCH /api/v1/alerts/rules/{"{id}"}/</Code>,
              "owner/admin",
              <>Partial — but <Code>project</Code> is immutable; sending it is 400</>,
            ],
            [
              <Code key="a">DELETE /api/v1/alerts/rules/{"{id}"}/</Code>,
              "owner/admin",
              <>200 <Code>Alert rule deleted.</Code></>,
            ],
            [
              <Code key="a">GET /api/v1/alerts/logs/</Code>,
              "Any member",
              <><Code>?rule=UUID & ?incident=UUID</Code> — foreign ids return empty list, never 404 leak</>,
            ],
          ]}
        />
        <DocsCode label="create a webhook rule" tabs={createRuleTabs} />
        <DocsTable
          head={["Field", "Type", "Validation"]}
          rows={[
            [<Code key="a">project</Code>, "UUID", <>Write-only on create; must be a project in caller&apos;s org. Required. <Code>404 This project does not exist.</Code> otherwise.</>],
            [<Code key="a">name</Code>, "string 1–120", "—"],
            [
              <Code key="a">condition</Code>,
              "object",
              <>Non-empty, keys ⊆ <Code>severity, status</Code>. <Code>severity ∈ critical|high|medium|low</Code>, <Code>status ∈ open|investigating|resolved|ignored</Code>. Empty or unknown key → 400 <Code>error.fields.condition</Code></>,
            ],
            [<Code key="a">channel</Code>, "enum", "email | slack | webhook"],
            [
              <Code key="a">target</Code>,
              "string ≤500",
              <>Channel-aware: <Code>email</Code> must match <Code>/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/</Code>; <Code>webhook</Code> must be valid <Code>http(s)://</Code> and pass SSRF check below; <Code>slack</Code> channel name (<Code>#alerts</Code>) passes through but <Code>https://</Code> slack webhook URLs are SSRF-checked</>,
            ],
            [<Code key="a">cooldown_minutes</Code>, "int ≥1", "Default 15 — suppresses repeat dispatches for the same (rule, incident)"],
          ]}
        />
        <Callout variant="note" title="Condition matching">
          Matching is <em>exact</em> on the incident&apos;s current <Code>severity</Code>/<Code>status</Code>: <Code>{`{"severity":"critical"}`}</Code> fires only on critical incidents; <Code>{`{"status":"open"}`}</Code> fires on any open incident regardless of severity. Combine both keys for an AND: <Code>{`{"severity":"critical","status":"open"}`}</Code>.
        </Callout>

        <SubHeading id="alerts-cooldown">Cooldown & dispatch logs</SubHeading>
        <p className="text-sm leading-relaxed text-muted">
          <Code>evaluate_incident</Code> runs from the same points that publish <Code>incident.created/updated</Code> (ingestion + incident PATCH). For each matching rule it checks{" "}
          <Code>AlertLog exists where (rule, incident, dispatched_at ≥ now − cooldown)</Code>. If a log exists, the evaluation is suppressed and <em>leaves no new log row</em> — the log is a faithful &quot;alerts actually sent&quot; record. After the window expires, the next matching event dispatches again.
        </p>
        <DocsTable
          head={["Scenario", "Logs"]}
          rows={[
            ["10 critical events in 5 min, cooldown 15 min", "Exactly 1 AlertLog — dispatched (or failed with error)"],
            ["Another event 20 min later", "Second dispatch — new AlertLog"],
            ["Two rules matching same incident", "One log per rule (per-rule cooldown)"],
          ]}
        />
        <DocsTable
          head={["Log field", "Type", "Notes"]}
          rows={[
            [<Code key="a">id</Code>, "UUID", ""],
            [<Code key="a">rule</Code>, "{id, name, channel, target}", "Snapshot at dispatch time"],
            [<Code key="a">incident</Code>, "{id, title, severity, status}", ""],
            [<Code key="a">status</Code>, "enum", "dispatched | failed — failed keeps error detail for the UI"],
            [<Code key="a">error</Code>, "string", "Empty on success; up to 500 chars on failure"],
            [<Code key="a">dispatched_at</Code>, "ISO-8601", "Ordering newest first"],
          ]}
        />
        <Callout variant="tip" title="Robustness">
          A dead webhook or missing Slack workspace does not crash the worker — the rule&apos;s <Code>AlertLog</Code> is marked <Code>failed</Code> with the error, so the delivery history view surfaces it (verified: <Code>apps/alerts/services.py:61</Code> exception → <Code>status=failed</Code>).
        </Callout>
      </DocsSection>

      <DocsSection
        id="alerts-webhook"
        label="Integrations & Alerts"
        title="Webhooks — payload, security, internals"
        sub="Plain JSON POST with no signature header. Security is at rule creation and at the transport layer, not via HMAC verification on your receiver."
      >
        <DocsCode label="outgoing webhook payload (webhook channel)" code={webhookPayload} />
        <DocsTable
          head={["Key", "Type", "Source"]}
          rows={[
            [<Code key="a">title</Code>, "string", <><Code>incident.error_group.title</Code></>],
            [<Code key="a">severity</Code>, "enum", "critical|high|medium|low — from Incident"],
            [<Code key="a">status</Code>, "enum", "open|investigating|resolved|ignored"],
            [<Code key="a">link</Code>, "string (URL)", <><Code>{`{APP_BASE_URL}/incidents/{id}`}</Code> — default <Code>http://localhost:3000</Code> in dev</>],
            [<Code key="a">root_cause</Code>, "string | null", "Latest ready AIAnalysis.root_cause, or null while pending"],
            [<Code key="a">occurrences</Code>, "int", <><Code>error_group.count</Code></>],
          ]}
        />
        <p className="text-sm leading-relaxed text-muted">
          Email and Slack render the same six fields with channel-specific formatting. Email subject:{" "}
          <Code>[TrazeIQ] {"{Severity}"} incident: {"{title}"}</Code> with a newline body including <Code>View incident: {"{link}"}</Code>. Slack webhook vs bot-token: when <Code>target</Code> starts with <Code>http(s)://</Code> it&apos;s a plain POST to that URL with{" "}
          <Code>{`{text, blocks:[...]}`}</Code> (Slack mrkdwn + link); otherwise <Code>target</Code> is a channel name (<Code>#alerts</Code>) and the server calls <Code>chat.postMessage</Code> via the org&apos;s stored bot token.
        </p>

        <SubHeading id="alerts-webhook-security">Security & SSRF defense</SubHeading>
        <DocsTable
          head={["Layer", "How"]}
          rows={[
            ["URL validation (serializer + dispatch)", "validate_dispatch_target_url: must be http(s), hostname must resolve, every resolved IP must be public — private/loopback/link-local/multicast/unspecified/reserved rejected (127.0.0.1, 10/8, 169.254/16, ::1, 0.0.0.0, …) — with DNS alias and multi-record coverage"],
            ["Redirects blocked", "Custom NoRedirect handler raises on any 3xx — a validated public URL cannot bounce onto an internal address"],
            ["Encrypted credentials", "Slack bot tokens stored via Fernet EncryptedCharField (key from SECRET_KEY, ciphertext prefix trazeiq-enc:) — not plain text"],
          ]}
        />
        <Callout variant="warning" title="No webhook signature">
          There is no <Code>X-TrazeIQ-Signature</Code> HMAC to verify. Authenticity of incoming webhook calls must be ensured by keeping your webhook URL secret (it&apos;s effectively a bearer token) and, where needed, by gating on <Code>incident.link</Code> + re-fetching the incident via an authenticated <Code>GET /api/v1/incidents/{"{id}"}/</Code> to confirm. Do not rely on IP allowlisting alone — the dispatch egress IP is not stable in hosted environments.
        </Callout>
        <DocsCode
          label="validate inside your receiver (example)"
          tabs={[
            {
              lang: "js",
              label: "Node",
              code: `// In your webhook handler: re-fetch via authenticated TrazeIQ read API to confirm
app.post("/trazeiq-webhook", async (req, res) => {
  const { title, link, severity } = req.body;
  // link = https://app.trazeiq.io/incidents/{uuid}
  const id = new URL(link).pathname.split("/").pop();
  const incident = await fetch("https://api.trazeiq.io/api/v1/incidents/" + id + "/", {
    headers: { Authorization: "Bearer " + TRAZEIQ_READ_TOKEN },
  }).then(r => r.json());
  // compare incident.data.project / severity before paging the team
  res.sendStatus(200);
});`,
            },
            {
              lang: "python",
              label: "Python",
              code: `from flask import request
import requests, os
from urllib.parse import urlparse

@app.post("/trazeiq-webhook")
def hook():
    body = request.json  # {title, severity, status, link, root_cause, occurrences}
    incident_id = urlparse(body["link"]).path.split("/")[-1]
    r = requests.get(
        f"https://api.trazeiq.io/api/v1/incidents/{incident_id}/",
        headers={"Authorization": f"Bearer {os.environ['READ_TOKEN']}"},
    )
    r.raise_for_status()
    # confirm r.json()["data"]["severity"] == body["severity"]
    return "", 200`,
            },
          ]}
        />
      </DocsSection>
    </>
  );
}
