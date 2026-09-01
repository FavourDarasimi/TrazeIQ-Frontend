import { Callout } from "./docs-callout";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsRealtime() {
  return (
    <DocsSection
      id="realtime"
      label="Integrations & Alerts"
      title="Realtime — Pusher private channels"
      sub="For custom dashboards that want live incident flow instead of polling. Private channels per project, server-signed."
    >
      <DocsTable
        head={["Endpoint", "Method", "Parser"]}
        rows={[
          [
            <Code key="a">POST /api/v1/pusher/auth/</Code>,
            "POST",
            "JSON or application/x-www-form-urlencoded (pusher-js sends form)",
          ],
        ]}
      />
      <DocsTable
        head={["Field", "Type", "Required", "Notes"]}
        rows={[
          [<Code key="a">channel_name</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, <><Code>private-project-{"{uuid}"}</Code> — regex <Code>^private-project-{`[0-9a-f]{8}-...`}$</Code> (case-insensitive)</>],
          [<Code key="a">socket_id</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "From pusher-js connection"],
        ]}
      />
      <DocsCode
        label="auth — pusher-js custom handler"
        tabs={[
          {
            lang: "js",
            label: "JavaScript",
            code: `import Pusher from "pusher-js";

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: "mt1",
  authEndpoint: "https://api.trazeiq.io/api/v1/pusher/auth/",
  auth: {
    headers: { Authorization: \`Bearer \${accessJwt}\` },
    // or rely on the trazeiq_access cookie via credentials: "include"
  },
  // For cookie-based auth, use a custom handler so the envelope and 401 refresh apply:
  // authorizer: (channel) => ({
  //   authorize(socketId, callback) {
  //     fetch("/api/v1/pusher/auth/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", Authorization: \`Bearer \${jwt}\` },
  //       body: JSON.stringify({ channel_name: channel.name, socket_id: socketId }),
  //     }).then(r => r.json()).then(({ data }) => callback(null, data)).catch(e => callback(e, null));
  //   }
  // })
});

const ch = pusher.subscribe(\`private-project-\${projectId}\`);
ch.bind("incident.created", (payload) => prependIncident(payload));
ch.bind("incident.updated", (payload) => patchIncident(payload));
ch.bind("ai_analysis.ready", (payload) => patchAnalysis(payload));
ch.bind("incident.resolved", (payload) => markResolved(payload));`,
          },
          {
            lang: "curl",
            label: "curl",
            code: `curl -X POST https://api.trazeiq.io/api/v1/pusher/auth/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <access_jwt>" \\
  -d '{"channel_name":"private-project-2f1c0a1b-...-...","socket_id":"1234.5678"}'
# 200 {success:true, message:"OK", data:{auth:"<key>:<hmac-signature>"}}
# 400 {error:{code:"VALIDATION_FAILED", fields:{channel_name, socket_id}}}
# 403 {error:{code:"PERMISSION_DENIED"}} — unknown channel or not a project member
# 503 {error:{code:"PUSHER_NOT_CONFIGURED"}} — PUSHER_APP_ID/KEY/SECRET empty`,
          },
          {
            lang: "python",
            label: "Python",
            code: `import requests, hmac, hashlib
# Server-side verify: compute pusher signature and compare
# Typically you don't replicate this — the browser just forwards pusher-js's socket_id
requests.post(
  "https://api.trazeiq.io/api/v1/pusher/auth/",
  headers={"Authorization": f"Bearer {jwt}"},
  json={"channel_name": f"private-project-{pid}", "socket_id": socket_id},
)`,
          },
        ]}
      />
      <DocsTable
        head={["Event", "When"]}
        rows={[
          [<Code key="a">incident.created</Code>, "New ErrorGroup → new Incident (ingestion)"],
          [<Code key="a">incident.updated</Code>, "Incident patched (severity/status/assignment) or new event for existing open incident; also on POST …/comments/"],
          [<Code key="a">ai_analysis.ready</Code>, "Celery task analyze_incident completes with ready analysis + TimelineEntry"],
          [<Code key="a">incident.resolved</Code>, "POST …/resolve/ flips status + logs status_change"],
        ]}
      />
      <Callout variant="note" title="Channel naming">
        Only <Code>private-project-{"{uuid}"}</Code> is valid. The UUID must be a project the caller belongs to — otherwise the response is <Code>403 PERMISSION_DENIED</Code> with no existence leak. The Pusher secret never leaves the server; the browser only ever receives the signed <Code>auth</Code> string.
      </Callout>
      <p className="text-sm leading-relaxed text-muted">
        Publishing is best-effort with a 2 s timeout (<Code>PUSHER_PUBLISH_TIMEOUT_SECONDS</Code>); a slow or unreachable Pusher never slows ingestion. The client&apos;s <Code>RealtimeProvider</Code> (<Code>src/providers/realtime-provider.tsx</Code>) lazily loads <Code>pusher-js</Code> only on the client, re-subscribes on project switch (dropping stale events via a ref guard), and degrades gracefully when <Code>NEXT_PUBLIC_PUSHER_KEY</Code> is unset.
      </p>
    </DocsSection>
  );
}
