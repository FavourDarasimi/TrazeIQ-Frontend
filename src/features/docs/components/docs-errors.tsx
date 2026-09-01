import { Callout } from "./docs-callout";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";

export function DocsErrors() {
  return (
    <DocsSection
      id="errors"
      label="Security & Reference"
      title="Error codes"
      sub="Every failure is {success:false, message, error:{code, fields?}}. Branch on code, never on message — messages are human and may change, codes are stable."
    >
      <DocsTable
        head={["error.code", "HTTP", "Emitted where"]}
        rows={[
          [<Code key="a">EMAIL_TAKEN</Code>, <StatusBadge key="s" code="409" tone="danger" />, "POST register/request-otp/ when address has an account; POST register/complete/ race between step 2 and 3"],
          [<Code key="a">INVALID_CREDENTIALS</Code>, <StatusBadge key="s" code="401" tone="danger" />, "POST /auth/login/ — wrong email or password (also counts toward axes lockout)"],
          [<Code key="a">EMAIL_NOT_VERIFIED</Code>, <StatusBadge key="s" code="403" tone="danger" />, "POST /auth/login/ — account exists but email_verified or is_active is false"],
          [<Code key="a">OTP_INVALID</Code>, <StatusBadge key="s" code="400" tone="warn" />, "POST register/verify-otp/ + reset-password — code does not match (including hashed compare via secrets.compare_digest)"],
          [<Code key="a">OTP_EXPIRED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "OTP past AUTH_OTP_TTL_MINUTES (default 10 min)"],
          [<Code key="a">OTP_USED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "OTP single-use: already consumed (used_at set)"],
          [<Code key="a">OTP_TOO_MANY_ATTEMPTS</Code>, <StatusBadge key="s" code="400" tone="warn" />, "5 attempts max (AUTH_OTP_MAX_ATTEMPTS) on the OTP row"],
          [<Code key="a">REGISTRATION_TOKEN_INVALID</Code>, <StatusBadge key="s" code="400" tone="warn" />, "POST register/complete/ — bad or already-used registration_token"],
          [<Code key="a">REGISTRATION_TOKEN_EXPIRED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "Registration token past 15 min (AUTH_REGISTRATION_TOKEN_TTL_MINUTES)"],
          [<Code key="a">REFRESH_TOKEN_INVALID</Code>, <StatusBadge key="s" code="401" tone="danger" />, "POST /auth/refresh/ — missing, expired, blacklisted, or already rotated refresh JWT"],
          [<Code key="a">GOOGLE_AUTH_FAILED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "POST /auth/google/ — tokeninfo verification failed (ValueError) when GOOGLE_CLIENT_ID is set"],
          [<Code key="a">ALREADY_MEMBER</Code>, <StatusBadge key="s" code="409" tone="warn" />, "POST .../invite/ — email already a member; POST /invites/{token}/accept/ — caller already a member"],
          [<Code key="a">INVITE_INVALID</Code>, <StatusBadge key="s" code="400" tone="warn" />, "POST /invites/{token}/accept/ — tokenhash not found"],
          [<Code key="a">INVITE_EXPIRED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "Invite past INVITE_TTL_MINUTES (default 7d)"],
          [<Code key="a">INVITE_USED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "Invite already used (used_at set)"],
          [<Code key="a">INVITE_EMAIL_MISMATCH</Code>, <StatusBadge key="s" code="403" tone="danger" />, "Accept invite while signed in as a different email than invite.email"],
          [<Code key="a">SLACK_NOT_CONFIGURED</Code>, <StatusBadge key="s" code="503" tone="warn" />, "POST /integrations/slack/connect/ — SLACK_CLIENT_ID/SECRET empty; also Pusher variant PUSHER_NOT_CONFIGURED"],
          [<Code key="a">SLACK_CONNECT_FAILED</Code>, <StatusBadge key="s" code="400" tone="warn" />, "Slack oauth.v2.access returned {ok:false}"],
          [<Code key="a">PUSHER_NOT_CONFIGURED</Code>, <StatusBadge key="s" code="503" tone="warn" />, "POST /pusher/auth/ — PUSHER_APP_ID/KEY/SECRET empty (literal, not in ErrorCode enum)"],
          [<Code key="a">VALIDATION_FAILED</Code>, <StatusBadge key="s" code="400" tone="warn" />, <>Every 400 from DRF serializers — carries <Code>error.fields: {"{field}"}</Code></>],
          [<Code key="a">NOT_AUTHENTICATED</Code>, <StatusBadge key="s" code="401" tone="danger" />, "Any 401 via drf_exception_handler — missing or invalid JWT / API key"],
          [<Code key="a">PERMISSION_DENIED</Code>, <StatusBadge key="s" code="403" tone="danger" />, "Any 403 — IsAuthenticated / RBAC / Pusher channel unknown / not a member"],
          [<Code key="a">NOT_FOUND</Code>, <StatusBadge key="s" code="404" tone="warn" />, "Any 404 — unknown or foreign-org id (never leaks existence)"],
          [<Code key="a">METHOD_NOT_ALLOWED</Code>, <StatusBadge key="s" code="405" tone="warn" />, "DRF method not allowed (STATUS_CODE_MAP)"],
          [<Code key="a">TOO_MANY_REQUESTS</Code>, <StatusBadge key="s" code="429" tone="danger" />, "Throttles + axes lockout; preserves Retry-After header"],
          [<Code key="a">INTERNAL_ERROR</Code>, <StatusBadge key="s" code="500" tone="danger" />, "Unhandled exception — drf_exception_handler fallback, never leaks a stack"],
          [<Code key="a">INVALID_DATE</Code>, <StatusBadge key="s" code="400" tone="warn" />, "GET /api/v1/events/?date= — bad YYYY-MM-DD (events/views.py literal)"],
          [<Code key="a">PAYLOAD_TOO_LARGE</Code>, <StatusBadge key="s" code="413" tone="warn" />, "POST /api/v1/events/ — len(message)+len(stacktrace) > EVENT_MAX_PAYLOAD_BYTES (100 KB) via PayloadTooLarge default_code"],
          [<Code key="a">ALREADY_VERIFIED</Code>, <StatusBadge key="s" code="—" tone="default" />, "Defined in ErrorCode but not emitted in current code — reserved for future re-verify guard"],
          [<Code key="a">OTP_MISSING</Code>, <StatusBadge key="s" code="—" tone="default" />, "Defined but never mapped via ErrorCode.otp — reserved; OTP flows surface OTP_INVALID instead"],
        ]}
      />
      <Callout variant="note" title="How to handle">
        401 → try <Code>POST /api/v1/auth/refresh/</Code> once (<Code>src/lib/api.ts</Code> single-flights it). 429 → respect <Code>Retry-After</Code>. <Code>VALIDATION_FAILED</Code> always has <Code>error.fields</Code> mapping field→string[]. Foreign-id 404s are intentional — don&apos;t retry with a different id to “probe.”
      </Callout>
      <DocsTable
        head={["Pattern", "Shape"]}
        rows={[
          ["Success", <Code key="a">{`{success:true, message:"...", data:{...}}`}</Code>],
          ["Failure", <Code key="a">{`{success:false, message:"...", error:{code:"...", fields?:{}}}`}</Code>],
          ["Logout 204", <><Code>204 No Content</Code> — no JSON body (clearAccess/ClearRefresh cookies)</>],
        ]}
      />
    </DocsSection>
  );
}
