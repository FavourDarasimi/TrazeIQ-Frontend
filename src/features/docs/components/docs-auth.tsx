import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { DocsCode } from "./docs-code";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

const otpRequestTabs = [
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.trazeiq.io/api/v1/auth/register/request-otp/ \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com"}'`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `await fetch("https://api.trazeiq.io/api/v1/auth/register/request-otp/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "you@company.com" }),
  credentials: "include",
});`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import requests
requests.post(
  "https://api.trazeiq.io/api/v1/auth/register/request-otp/",
  json={"email": "you@company.com"},
)`,
  },
];

const otpVerifyTabs = [
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.trazeiq.io/api/v1/auth/register/verify-otp/ \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","otp":"482917"}'`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `const { data } = await fetch("/api/v1/auth/register/verify-otp/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, otp }),
}).then(r => r.json());
// data.registration_token — keep in memory, never in localStorage`,
  },
  {
    lang: "python",
    label: "Python",
    code: `resp = requests.post(
  "https://api.trazeiq.io/api/v1/auth/register/verify-otp/",
  json={"email": email, "otp": "482917"},
)
registration_token = resp.json()["data"]["registration_token"]`,
  },
];

const completeTabs = [
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.trazeiq.io/api/v1/auth/register/complete/ \\
  -H "Content-Type: application/json" \\
  -d '{"registration_token":"64-hex-token","password":"correct-horse-...","confirm_password":"correct-horse-..."}' \\
  -c cookies.txt`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `await fetch("/api/v1/auth/register/complete/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ registration_token, password, confirm_password }),
  credentials: "include", // sets trazeiq_access + trazeiq_refresh
});`,
  },
  {
    lang: "python",
    label: "Python",
    code: `requests.post(
  "https://api.trazeiq.io/api/v1/auth/register/complete/",
  json={
    "registration_token": token,
    "password": "correct-horse-...",
    "confirm_password": "correct-horse-...",
  },
)`,
  },
];

export function DocsAuth() {
  return (
    <>
      <DocsSection
        id="auth-overview"
        label="Authentication"
        title="Dashboard sessions vs project API keys"
        sub="TrazeIQ has two completely separate auth surfaces. Confusing them is the most common integration mistake."
      >
        <DocsTable
          head={["Surface", "Mechanism", "Used for"]}
          rows={[
            [
              <Code key="k">Authorization: Bearer</Code>,
              "JWT in httpOnly cookies",
              "Reading data — every GET/PATCH/POST under /api/v1/* except /events/ ingestion",
            ],
            [
              <Code key="k">X-API-Key</Code>,
              "HMAC-hashed project key",
              "Writing data — only POST /api/v1/events/ (ingestion)",
            ],
          ]}
        />
        <p className="text-sm leading-relaxed text-muted">
          Dashboard auth is cookie-based after login. <Code>POST /api/v1/auth/login/</Code> returns{" "}
          <Code>{"{data: {user}}"}</Code> and sets two httpOnly cookies:{" "}
          <Code>trazeiq_access</Code> (15 min, <Code>path=/</Code>) and{" "}
          <Code>trazeiq_refresh</Code> (7 days, <Code>path=/api/v1/auth/</Code>). The access token
          is also accepted as <Code>Authorization: Bearer {`<token>`}</Code> — the backend reads the
          header first, then the cookie (<Code>apps/accounts/authentication.py</Code>). Ingestion
          never touches this; it authenticates only via <Code>X-API-Key</Code>.
        </p>
        <Callout variant="note" title="Envelope shape">
          Every response is <Code>{`{success, message, data}`}</Code> or{" "}
          <Code>{`{success:false, message, error:{code, fields?}}`}</Code>. The frontend unwraps{" "}
          <Code>data</Code> and branches on <Code>error.code</Code> via <Code>ApiError</Code> (
          <Code>src/lib/api.ts</Code>). Never parse human <Code>message</Code>.
        </Callout>
        <DocsCode
          label="GET /api/v1/auth/me/ — who am I?"
          code={`curl https://api.trazeiq.io/api/v1/auth/me/ \\
  -H "Authorization: Bearer <access_jwt>"   # or rely on the trazeiq_access cookie

// 200 {success:true, data:{user:{email, name, email_verified, auth_provider}}}
// 401 {success:false, error:{code:"NOT_AUTHENTICATED"}}`}
        />
      </DocsSection>

      <DocsSection
        id="auth-otp"
        label="Authentication"
        title="OTP registration — 3 steps, no dormant accounts"
        sub="The email is proven before a password is ever accepted. No User row exists until the final step succeeds."
      >
        <SubHeading id="auth-otp-request">Step 1 — POST /api/v1/auth/register/request-otp/</SubHeading>
        <DocsTable
          head={["Field", "Type", "Notes"]}
          rows={[
            [<Code key="a">email</Code>, "string (email)", "Lowercased + trimmed server-side"],
          ]}
        />
        <DocsCode label="request — email → 6-digit code" tabs={otpRequestTabs} />
        <DocsTable
          head={["Status", "Meaning"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, "Code sent. Always 200 even on resend — previous live code is voided."],
            [<StatusBadge key="a" code="409" tone="danger" />, <><Code>EMAIL_TAKEN</Code> — address already has an account; switch UI to login.</>],
            [<StatusBadge key="a" code="429" tone="danger" />, <><Code>TOO_MANY_REQUESTS</Code> — throttle 10/min per IP + hard cap 3 codes / 15 min per email (cache key <Code>register:email_cap:{"{email}"}</Code>).</>],
          ]}
        />
        <Callout variant="tip" title="Dev bypass">
          When <Code>AUTH_DEV_OTP</Code> is set (default <Code>000000</Code> in dev), that code is accepted for any pending OTP until real email delivery is wired. Console email backend in dev prints the code to the server log.
        </Callout>

        <SubHeading id="auth-otp-verify">Step 2 — POST /api/v1/auth/register/verify-otp/</SubHeading>
        <DocsTable
          head={["Field", "Type", "Required"]}
          rows={[
            [<Code key="a">email</Code>, "email", <StatusBadge key="s" code="yes" tone="ok" />],
            [<Code key="a">otp</Code>, "string (6 chars)", <StatusBadge key="s" code="yes" tone="ok" />],
          ]}
        />
        <DocsCode label="verify — code → registration_token" tabs={otpVerifyTabs} />
        <DocsTable
          head={["Status", "Code", "When"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, <Code key="b">—</Code>, <><Code>{`{data:{registration_token:"64-hex"}}`}</Code> — show once, hold in memory.</>],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">OTP_INVALID</Code>, "Wrong code."],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">OTP_EXPIRED</Code>, "TTL 10 min (AUTH_OTP_TTL_MINUTES)."],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">OTP_USED</Code>, "Code already consumed."],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">OTP_TOO_MANY_ATTEMPTS</Code>, "5 attempts max (AUTH_OTP_MAX_ATTEMPTS)."],
            [<StatusBadge key="a" code="429" tone="danger" />, <Code key="b">TOO_MANY_REQUESTS</Code>, "30/min per IP (AUTH_THROTTLE_REGISTER_VERIFY)."],
          ]}
        />
        <Callout variant="warning" title="Single-use token">
          <Code>registration_token</Code> is 64 hex chars; only its SHA-256 hash is stored with a 15 min TTL (<Code>RegistrationToken</Code>). It is returned exactly once and consumed on complete — replaying it is <Code>REGISTRATION_TOKEN_INVALID</Code>.
        </Callout>

        <SubHeading id="auth-otp-complete">Step 3 — POST /api/v1/auth/register/complete/</SubHeading>
        <DocsTable
          head={["Field", "Type", "Required", "Notes"]}
          rows={[
            [<Code key="a">registration_token</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "The 64-hex from step 2"],
            [<Code key="a">password</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "≥8 chars + Django validators"],
            [<Code key="a">confirm_password</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />, "Must match password"],
          ]}
        />
        <DocsCode label="complete — token + password → signed in" tabs={completeTabs} />
        <DocsTable
          head={["Status", "Code", "Meaning"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, <Code key="b">—</Code>, <><Code>{`{data:{user:{email,name,email_verified,auth_provider}}}`}</Code> + sets both cookies; redirect to onboarding.</>],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">REGISTRATION_TOKEN_INVALID</Code>, "Bad or already used token."],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">REGISTRATION_TOKEN_EXPIRED</Code>, "15 min window elapsed (AUTH_REGISTRATION_TOKEN_TTL_MINUTES)."],
            [<StatusBadge key="a" code="400" tone="warn" />, <Code key="b">VALIDATION_FAILED</Code>, <><Code>error.fields.password</Code> / <Code>confirm_password</Code></>],
            [<StatusBadge key="a" code="409" tone="danger" />, <Code key="b">EMAIL_TAKEN</Code>, "Race: email registered between step 2 and 3."],
            [<StatusBadge key="a" code="429" tone="danger" />, <Code key="b">TOO_MANY_REQUESTS</Code>, "20/min per IP."],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="auth-session"
        label="Authentication"
        title="Login, refresh, logout, me"
        sub="Short-lived access, long-lived refresh, both httpOnly. The client keeps the refresh via credentials:include and rotates on 401."
      >
        <SubHeading id="auth-session-login">POST /api/v1/auth/login/</SubHeading>
        <DocsTable
          head={["Field", "Type", "Required"]}
          rows={[
            [<Code key="a">email</Code>, "email", <StatusBadge key="s" code="yes" tone="ok" />],
            [<Code key="a">password</Code>, "string", <StatusBadge key="s" code="yes" tone="ok" />],
          ]}
        />
        <DocsCode
          label="login"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","password":"..."}' -c cookies.txt
# 200 {data:{user}} + Set-Cookie: trazeiq_access (15m, /) + trazeiq_refresh (7d, /api/v1/auth/)`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `await fetch("/api/v1/auth/login/", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  credentials: "include",
});`,
            },
            { lang: "python", label: "Python", code: `requests.post("https://api.trazeiq.io/api/v1/auth/login/", json={"email": email, "password": pw})` },
          ]}
        />
        <DocsTable
          head={["Status", "Code", "Notes"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, <Code key="b">—</Code>, "Returns user + sets cookies."],
            [<StatusBadge key="a" code="401" tone="danger" />, <Code key="b">INVALID_CREDENTIALS</Code>, "Wrong email or password. Counts toward axes lockout."],
            [<StatusBadge key="a" code="403" tone="danger" />, <Code key="b">EMAIL_NOT_VERIFIED</Code>, "Unverified or inactive account."],
            [<StatusBadge key="a" code="429" tone="danger" />, <Code key="b">TOO_MANY_REQUESTS</Code>, "Per-IP 60/min + account lockout after 5 failures per (IP,email) for 15 min (axes). Includes Retry-After."],
          ]}
        />
        <Callout variant="warning" title="Brute-force lockout">
          Lockout is per <Code>(IP, email)</Code> pair, not per IP alone (<Code>AXES_USERNAME_FORM_FIELD=email</Code>). A successful login clears that pair&apos;s failures; the 429 includes <Code>Retry-After: 900</Code>.
        </Callout>

        <SubHeading id="auth-session-refresh">POST /api/v1/auth/refresh/</SubHeading>
        <p className="text-sm leading-relaxed text-muted">
          No body. Reads <Code>trazeiq_refresh</Code> httpOnly cookie, blacklists it (single-use rotation), issues a fresh pair. The frontend&apos;s <Code>lib/api.ts</Code> single-flights this on 401 so parallel failures don&apos;t blacklist each other.
        </p>
        <DocsCode
          label="refresh (cookie only)"
          code={`curl -X POST https://api.trazeiq.io/api/v1/auth/refresh/ -b cookies.txt -c cookies.txt
# 200 {data:{user}} + new cookies
# 401 {error:{code:"REFRESH_TOKEN_INVALID"}} — invalid, expired, or already rotated`}
        />

        <SubHeading id="auth-session-logout">POST /api/v1/auth/logout/ & GET /api/v1/auth/me/</SubHeading>
        <DocsCode
          label="logout & me"
          code={`curl -X POST https://api.trazeiq.io/api/v1/auth/logout/ -b cookies.txt
# 204 No Content — blacklists refresh, clears both cookies

curl https://api.trazeiq.io/api/v1/auth/me/ -b cookies.txt
# 200 {data:{user:{email, name, email_verified, auth_provider:"email"|"google"}}}
# 401 {error:{code:"NOT_AUTHENTICATED"}} — missing/expired access JWT`}
        />
        <DocsTable
          head={["Endpoint", "Auth", "Throttle"]}
          rows={[
            [<Code key="a">POST /auth/login/</Code>, "AllowAny", "auth_login 60/min"],
            [<Code key="a">POST /auth/refresh/</Code>, "AllowAny (cookie)", "auth_refresh 30/min"],
            [<Code key="a">POST /auth/logout/</Code>, "AllowAny (cookie)", "—"],
            [<Code key="a">GET /auth/me/</Code>, "IsAuthenticated", "—"],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="auth-google"
        label="Authentication"
        title="Google OAuth"
        sub="Stub in dev, tokeninfo-verified in prod — same cookie session as password login."
      >
        <DocsCode
          label="POST /api/v1/auth/google/"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/auth/google/ \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","name":"You","id_token":"eyJ..."}' -c cookies.txt`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `await fetch("/api/v1/auth/google/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, name, id_token }),
  credentials: "include",
});`,
            },
            { lang: "python", label: "Python", code: `requests.post("https://api.trazeiq.io/api/v1/auth/google/", json={"email": email, "id_token": token})` },
          ]}
        />
        <DocsTable
          head={["Field", "Type", "Required", "Notes"]}
          rows={[
            [<Code key="a">email</Code>, "email", <StatusBadge key="s" code="yes" tone="ok" />, "Lowercased server-side"],
            [<Code key="a">name</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Display name; blank allowed"],
            [<Code key="a">id_token</Code>, "string", <StatusBadge key="s" code="no" tone="default" />, "Google id_token — verified only when GOOGLE_CLIENT_ID is set"],
          ]}
        />
        <p className="text-sm leading-relaxed text-muted">
          When <Code>GOOGLE_CLIENT_ID</Code> is empty (dev), the email is trusted directly. When set, the backend calls{" "}
          <Code>https://oauth2.googleapis.com/tokeninfo?id_token=...</Code>, checks <Code>aud == CLIENT_ID</Code> and{" "}
          <Code>email_verified</Code>, then uses the token payload&apos;s <Code>email/sub/name</Code>. Find-or-create by{" "}
          <Code>google_sub</Code> then by <Code>email</Code>; existing accounts are promoted to{" "}
          <Code>auth_provider=google, email_verified=true</Code>.
        </p>
        <DocsTable
          head={["Status", "Code"]}
          rows={[
            [<StatusBadge key="a" code="200" tone="ok" />, <><Code>—</Code> — signed in, same cookies as login</>],
            [<StatusBadge key="a" code="400" tone="warn" />, <><Code>GOOGLE_AUTH_FAILED</Code> — token verification failed</>],
            [<StatusBadge key="a" code="429" tone="danger" />, <><Code>TOO_MANY_REQUESTS</Code> — 20/min per IP</>],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="auth-password"
        label="Authentication"
        title="Forgot & reset password"
        sub="No account enumeration. Reset flow uses the same OTP table with purpose password_reset."
      >
        <DocsTable
          head={["Endpoint", "Body", "Response"]}
          rows={[
            [<Code key="a">POST /api/v1/auth/forgot-password/</Code>, <Code key="b">{`{email}`}</Code>, <>200 always — <Code>If this account exists, a reset code was sent.</Code></>],
            [<Code key="a">POST /api/v1/auth/reset-password/</Code>, <Code key="b">{`{email, otp:"6", new_password}`}</Code>, <>200 <Code>Password reset complete.</Code> or 400 OTP code</>],
          ]}
        />
        <DocsCode
          label="reset flow"
          tabs={[
            {
              lang: "curl",
              label: "curl",
              code: `curl -X POST https://api.trazeiq.io/api/v1/auth/forgot-password/ \\
  -H "Content-Type: application/json" -d '{"email":"you@company.com"}'

curl -X POST https://api.trazeiq.io/api/v1/auth/reset-password/ \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","otp":"482917","new_password":"new-strong-pw"}'`,
            },
            {
              lang: "js",
              label: "JavaScript",
              code: `await fetch("/api/v1/auth/forgot-password/", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});
await fetch("/api/v1/auth/reset-password/", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, otp, new_password }),
});`,
            },
            { lang: "python", label: "Python", code: `requests.post("https://api.trazeiq.io/api/v1/auth/forgot-password/", json={"email": email})\nrequests.post("https://api.trazeiq.io/api/v1/auth/reset-password/", json={"email": email, "otp": otp, "new_password": pw})` },
          ]}
        />
        <p className="text-sm leading-relaxed text-muted">
          Reset consumes the code, sets the new password, marks <Code>email_verified=true, is_active=true</Code>, and voids any other outstanding reset codes so the old password stops working immediately.
        </p>
        <DocsTable
          head={["Throttle", "Rate"]}
          rows={[
            ["POST forgot-password", "10/min per IP (auth_forgot)"],
            ["POST reset-password", "20/min per IP (auth_reset)"],
          ]}
        />
      </DocsSection>
    </>
  );
}
