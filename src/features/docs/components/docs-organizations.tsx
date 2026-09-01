import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable } from "./docs-shared";

export function DocsOrganizations() {
  return (
    <>
      <DocsSection
        id="organizations"
        label="Account & Team"
        title="Organizations"
        sub="Every project lives under an organization. The creator becomes owner via a Membership row — every later query is scoped through that membership, never through Organization.objects.all()."
      >
        <DocsTable
          head={["Endpoint", "Auth / Role", "Body / Query"]}
          rows={[
            [
              <Code key="a">POST /api/v1/organizations/</Code>,
              "IsAuthenticated",
              <><Code>{`{name:"Acme"}`}</Code> — name 1–120 chars</>,
            ],
            [
              <Code key="a">GET /api/v1/organizations/</Code>,
              "IsAuthenticated",
              <>Returns <Code>{`{organizations:[{id,name,owner,created_at}]}`}</Code> filtered by <Code>memberships__user=request.user</Code></>,
            ],
            [
              <Code key="a">GET /api/v1/organizations/{"{id}"}/</Code>,
              "IsAuthenticated · member",
              "404 if caller not a member (no existence leak)",
            ],
          ]}
        />
        <DocsCode
          label="create an organization"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/organizations/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <access_jwt>" \\
  -d '{"name":"Acme"}'
# 201 {success:true, data:{organization:{id, name, owner, created_at}}}
// also creates Membership(user, organization, role=owner) atomically`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `const { organization } = await api("/organizations/", {
  method: "POST", body: { name: "Acme" },
});
// api() from src/lib/api.ts unwraps {data}`,
            },
            {
              lang: "python",
              label: "Python",
              code: `requests.post(
  "https://api.trazeiq.io/api/v1/organizations/",
  headers={"Authorization": f"Bearer {token}"},
  json={"name": "Acme"},
)`,
            },
          ]}
        />
        <DocsTable
          head={["Field", "Type", "Notes"]}
          rows={[
            [<Code key="a">id</Code>, "UUID", "Primary key"],
            [<Code key="a">name</Code>, "string 1–120", ""],
            [<Code key="a">owner</Code>, "UUID (user_id)", "FK User PROTECT; also reflected in the owner Membership"],
            [<Code key="a">created_at</Code>, "ISO-8601", ""],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="team"
        label="Account & Team"
        title="Members & invites"
        sub="Roles: owner > admin > developer > viewer. Viewer is read-only everywhere; only owner/admin can invite, remove members, rotate keys, or manage alerts."
      >
        <SubHeading id="team-members">List & remove members</SubHeading>
        <DocsTable
          head={["Endpoint", "Role", "Response"]}
          rows={[
            [
              <Code key="a">GET /api/v1/organizations/{"{id}"}/members/</Code>,
              "Any member",
              <><Code>{`{members:[{user:email, user_id:UUID, role, created_at}]}`}</Code> — ordered by <Code>created_at,id</Code></>,
            ],
            [
              <Code key="a">DELETE /api/v1/organizations/{"{id}"}/members/{"{user_id}"}/</Code>,
              "owner/admin",
              <>200 <Code>Member removed.</Code> + audit log <Code>member_removed</Code>; 404 if membership missing</>,
            ],
          ]}
        />
        <DocsCode
          label="remove a member"
          code={`curl -X DELETE https://api.trazeiq.io/api/v1/organizations/<org>/members/<user_id>/ \\
  -H "Authorization: Bearer <access_jwt>"
# 200 {success:true, message:"Member removed.", data:{}}
# 403 {error:{code:"PERMISSION_DENIED"}} — developer/viewer
# 404 cross-org organization id (membership-scoped)`}
        />

        <SubHeading id="team-invite">Invite → accept flow</SubHeading>
        <DocsTable
          head={["Endpoint", "Role", "Body"]}
          rows={[
            [
              <Code key="a">POST /api/v1/organizations/{"{id}"}/invite/</Code>,
              "owner/admin",
              <><Code>{`{email, role:"admin"|"developer"|"viewer"}`}</Code> — owner is never invitable</>,
            ],
            [
              <Code key="a">POST /api/v1/invites/{"{token}"}/accept/</Code>,
              "IsAuthenticated (as invited email)",
              "No body; token is the URL param. Email must match invite email.",
            ],
          ]}
        />
        <DocsCode
          label="invite & accept"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/organizations/<org>/invite/ \\
  -H "Content-Type: application/json" -H "Authorization: Bearer <owner_jwt>" \\
  -d '{"email":"teammate@company.com","role":"developer"}'
# 201 {data:{invite:{id,email,role,expires_at,created_at}, invite_token:"raw-64-hex"}}
# invite_token shown exactly once; only token_hash stored, expires in INVITE_TTL_MINUTES (default 7d)
# 409 {error:{code:"ALREADY_MEMBER"}} — email already a member

curl -X POST https://api.trazeiq.io/api/v1/invites/<raw_token>/accept/ \\
  -H "Authorization: Bearer <teammate_jwt>"
# 201 {data:{membership:{organization:{id,name,owner,created_at}, role}}}
# 400 INVITE_INVALID / INVITE_EXPIRED / INVITE_USED
# 403 INVITE_EMAIL_MISMATCH — signed-in email != invite email
# 409 ALREADY_MEMBER`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `const { invite, invite_token } = await api("/organizations/" + orgId + "/invite/", {
  method: "POST", body: { email, role: "developer" },
});
const acceptUrl = \`/invite/\${invite_token}\`; // frontend: src/app/invite/[token]/page.tsx
await api(\`/invites/\${invite_token}/accept/\`, { method: "POST" });`,
            },
            {
              lang: "python",
              label: "Python",
              code: `inv = requests.post(
  f"https://api.trazeiq.io/api/v1/organizations/{org}/invite/",
  headers={"Authorization": f"Bearer {owner_token}"},
  json={"email": "mate@co.com", "role": "developer"},
).json()["data"]
token = inv["invite_token"]
requests.post(f"https://api.trazeiq.io/api/v1/invites/{token}/accept/",
  headers={"Authorization": f"Bearer {mate_token}"})`,
            },
          ]}
        />
        <Callout variant="note" title="Invite lifecycle">
          Pending invites store only <Code>token_hash</Code> (SHA-256). Re-inviting a pending email rotates the previous token (old link dies). Used/expired invites return <Code>400</Code>, not <Code>404</Code>, so the client can show “already used / expired” without probing existence.
        </Callout>
        <DocsTable
          head={["Field", "Type", "Notes"]}
          rows={[
            [<Code key="a">Invite.role</Code>, "enum", "admin | developer | viewer — never owner"],
            [<Code key="a">expires_at</Code>, "ISO-8601", <><Code>now + INVITE_TTL_MINUTES</Code> (default 10080 = 7d)</>],
            [<Code key="a">invite_token</Code>, "string", "Raw 64-hex; returned once, accept via URL param"],
          ]}
        />
      </DocsSection>
    </>
  );
}
