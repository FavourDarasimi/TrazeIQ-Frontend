import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsProjects() {
  return (
    <>
      <DocsSection
        id="projects"
        label="Account & Team"
        title="Projects"
        sub="A project is the thing you monitor. Its API key is generated once and shown once — later reads expose only the prefix."
      >
        <DocsTable
          head={["Endpoint", "Role", "Notes"]}
          rows={[
            [
              <Code key="a">GET /api/v1/projects/</Code>,
              "IsAuthenticated",
              <><Code>{`{projects:[{id,organization,name,api_key_prefix,environment,events_per_minute,created_at}]}`}</Code></>,
            ],
            [
              <Code key="a">POST /api/v1/projects/</Code>,
              "owner/admin",
              <><Code>{`{name, organization?:UUID, environment?:string, events_per_minute?:int}`}</Code> — when <Code>organization</Code> omitted, uses caller&apos;s first org</>,
            ],
            [
              <Code key="a">GET /api/v1/projects/{"{id}"}/</Code>,
              "member",
              "404 cross-org",
            ],
            [
              <Code key="a">PATCH /api/v1/projects/{"{id}"}/</Code>,
              "owner/admin",
              <><Code>{`{name?, environment?, events_per_minute?}`}</Code> — partial, 1 ≤ events_per_minute ≤ 1_000_000</>,
            ],
            [
              <Code key="a">DELETE /api/v1/projects/{"{id}"}/</Code>,
              "owner/admin",
              "204 No Content (envelope with 204 still shaped as success)",
            ],
          ]}
        />
        <DocsCode
          label="create a project"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/projects/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <access_jwt>" \\
  -d '{"name":"payment-api","environment":"production","events_per_minute":1000}'
# 201 {data:{project:{id, organization, name, api_key_prefix, environment, events_per_minute, created_at},
#            api_key:"trazeiq_...32-url-safe...", integration_snippet:"curl -X POST ... -H X-API-Key: ..."}}`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `const { project, api_key, integration_snippet } = await api("/projects/", {
  method: "POST", body: { name: "payment-api", environment: "production" },
});
// api_key shown exactly once — store it in your host app's env, not in TrazeIQ again`,
            },
            {
              lang: "python",
              label: "Python",
              code: `resp = requests.post(
  "https://api.trazeiq.io/api/v1/projects/",
  headers={"Authorization": f"Bearer {token}"},
  json={"name": "payment-api", "environment": "production"},
)
api_key = resp.json()["data"]["api_key"]`,
            },
          ]}
        />
        <DocsTable
          head={["Field", "Type", "Storage"]}
          rows={[
            [<Code key="a">name</Code>, "string 1–120", "—"],
            [<Code key="a">environment</Code>, "string ≤32", 'default "production"'],
            [<Code key="a">events_per_minute</Code>, "int 1–1_000_000", "Per-project throttle override; default 1000 (overrides EVENT_THROTTLE_KEY 1000/min)"],
            [<Code key="a">api_key_prefix</Code>, "string 8 chars", 'First 8 of raw key, e.g. "trazeiq_" prefix slice; display-only'],
            [<Code key="a">api_key_hash</Code>, "string (64 hex)", "HMAC-SHA256 over raw key keyed by API_KEY_HASH_SECRET|SECRET_KEY — never returned"],
          ]}
        />
        <Callout variant="note" title="Integration snippet">
          <Code>integration_snippet</Code> is a ready-to-paste{" "}
          <Code>curl -X POST … -H &quot;X-API-Key: {"{raw}"}&quot;</Code> with a tiny JSON body. It&apos;s the same endpoint the dashboard&apos;s onboarding flow shows. No SDK to install.
        </Callout>

        <SubHeading id="projects-rotate">Rotate API key — POST /api/v1/projects/{"{id}"}/rotate-key/</SubHeading>
        <p className="text-sm leading-relaxed text-muted">
          Owner/admin only. Generates a fresh <Code>trazeiq_ + 32-url-safe</Code> key, stores its HMAC hash + new prefix, returns the raw key once, and invalidates the previous key immediately. An <Code>AuditLog</Code> row <Code>key_rotated</Code> is written with actor and timestamp.
        </p>
        <DocsCode
          label="rotate key"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/projects/<id>/rotate-key/ \\
  -H "Authorization: Bearer <owner_jwt>"
# 200 {data:{project:{id, api_key_prefix:"newpref..."}, api_key:"trazeiq_new...", integration_snippet:"..."}}
# Old X-API-Key now 401 NOT_AUTHENTICATED on POST /api/v1/events/`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `const { api_key: newKey } = await api(\`/projects/\${projectId}/rotate-key/\`, { method: "POST" });
// update the host app's TRAZEIQ_API_KEY immediately — the old one is dead`,
            },
            {
              lang: "python",
              label: "Python",
              code: `new = requests.post(
  f"https://api.trazeiq.io/api/v1/projects/{pid}/rotate-key/",
  headers={"Authorization": f"Bearer {owner_token}"},
).json()["data"]["api_key"]`,
            },
          ]}
        />
        <Callout variant="warning" title="Old key dies instantly">
          There is no grace period. Rotate during a maintenance window or prime the new key alongside the old one in your deploy, then switch the env var and redeploy. A lost <Code>api_key</Code> cannot be recovered — rotate again.
        </Callout>
        <DocsTable
          head={["Status", "Meaning"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, "Rotated; body carries new api_key once"],
            [<StatusBadge key="a" code="403" tone="danger" />, <><Code>PERMISSION_DENIED</Code> — developer/viewer</>],
            [<StatusBadge key="a" code="404" tone="warn" />, <><Code>NOT_FOUND</Code> — unknown or foreign org project</>],
          ]}
        />
      </DocsSection>
    </>
  );
}
