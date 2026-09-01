import { Callout } from "./docs-callout";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsSlack() {
  return (
    <DocsSection
      id="slack"
      label="Integrations & Alerts"
      title="Slack — OAuth connect & status"
      sub="One workspace per organization. Tokens are encrypted at rest; reconnecting replaces the stored token."
    >
      <DocsTable
        head={["Endpoint", "Method", "Role"]}
        rows={[
          [
            <Code key="a">POST /api/v1/integrations/slack/connect/</Code>,
            "POST",
            "owner/admin — body organization selects which org to connect",
          ],
          [
            <Code key="a">GET /api/v1/integrations/slack/status/?organization=UUID</Code>,
            "GET",
            "Any member — 404 if caller not in that org",
          ],
        ]}
      />
      <DocsCode
        label="connect a workspace"
        tabs={[
          {
            lang: "curl",
            label: "curl",
            code: `curl -X POST https://api.trazeiq.io/api/v1/integrations/slack/connect/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <owner_jwt>" \\
  -d '{"organization":"<org-uuid>","code":"slack-oauth-code","redirect_uri":"https://app.trazeiq.io/integrations/slack/callback"}'
# 200 {success:true, data:{connected:true, team_name:"Acme"}}
# 400 {error:{code:"SLACK_CONNECT_FAILED", fields?}} — Slack rejected the code
# 503 {error:{code:"SLACK_NOT_CONFIGURED"}} — server has no SLACK_CLIENT_ID/SECRET`,
          },
          {
            lang: "js",
            label: "JavaScript",
            code: `// Browser dance: popup → https://slack.com/oauth/v2/authorize?client_id=... → redirect to /integrations/slack/callback?code=...
// Callback page postMessages the code back, then:
const { connected, team_name } = await api("/integrations/slack/connect/", {
  method: "POST",
  body: { organization: orgId, code, redirect_uri: window.location.origin + "/integrations/slack/callback" },
});`,
          },
          {
            lang: "python",
            label: "Python",
            code: `requests.post(
  "https://api.trazeiq.io/api/v1/integrations/slack/connect/",
  headers={"Authorization": f"Bearer {owner_token}"},
  json={"organization": org_id, "code": code},
)`,
          },
        ]}
      />
      <DocsTable
        head={["Field", "Type", "Required", "Notes"]}
        rows={[
          [<Code key="a">organization</Code>, "UUID", <StatusBadge key="s" code="yes" tone="ok" />, "Which org to connect; must be caller’s org"],
          [<Code key="a">code</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "OAuth code from Slack redirect"],
          [<Code key="a">redirect_uri</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Must match the authorize redirect when supplied"],
        ]}
      />
      <DocsCode
        label="check status"
        code={`curl "https://api.trazeiq.io/api/v1/integrations/slack/status/?organization=<org-uuid>" \\
  -H "Authorization: Bearer <any_member_jwt>"
# 200 {data:{connected:true, team_name:"Acme"}}  or {connected:false, team_name:null}
# 400 VALIDATION_FAILED — organization missing or not a UUID
# 404 — foreign org or unknown`}
      />
      <Callout variant="note" title="How the UI wires it">
        <Code>src/features/settings/components/alert-settings-page.tsx</Code> opens the Slack authorize URL in a popup (from <Code>NEXT_PUBLIC_SLACK_CLIENT_ID</Code>), <Code>src/app/integrations/slack/callback/page.tsx</Code> captures{" "}
        <Code>code</Code> and postMessages it back, and the parent calls <Code>POST …/slack/connect/</Code>. Connection status comes from <Code>GET …/slack/status/</Code>; a <Code>503 SLACK_NOT_CONFIGURED</Code> is surfaced as “not configured in this environment.”
      </Callout>
      <p className="text-sm leading-relaxed text-muted">
        The access token is stored via <Code>apps/integrations/fields.py</Code> Fernet <Code>EncryptedCharField</Code> (ciphertext prefix <Code>trazeiq-enc:</Code>, key derived from <Code>SECRET_KEY</Code>). Only the token hash was ever considered — raw ciphertext is not logged or returned. Slack dispatch via{" "}
        <Code>chat.postMessage</Code> uses that token; webhook-style rules POST directly to the rule&apos;s <Code>target</Code> URL without needing a stored token.
      </p>
    </DocsSection>
  );
}
