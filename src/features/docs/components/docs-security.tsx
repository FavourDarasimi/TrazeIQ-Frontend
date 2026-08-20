import { DocsSection } from "./docs-shared";

const items = [
  {
    title: "Keys are hashed, never stored raw",
    body: "Your API key is shown once at creation and stored as a hash. Lost it? Rotate it — the old key dies instantly.",
  },
  {
    title: "Secrets are redacted on ingest",
    body: "SECRET_KEY=, DATABASE_URL=, password=, bearer tokens, and JWTs are scrubbed from stacktraces before storage or AI submission. A monitoring tool should never become the leak vector.",
  },
  {
    title: "Tenant isolation everywhere",
    body: "Every read endpoint scopes queries to your organization. A cross-organization id returns 404, not a permission error — no existence leaks.",
  },
  {
    title: "Error content is untrusted",
    body: "Stacktraces are rendered as data and the AI is instructed to treat them strictly as data, so a crafted error message can't inject instructions into your own pipeline.",
  },
  {
    title: "Realtime uses private channels",
    body: "Pusher subscriptions authenticate server-side per project; the Pusher secret never reaches the browser.",
  },
];

export function DocsSecurity() {
  return (
    <DocsSection
      id="security"
      label="Security"
      title="Built to not be the thing that leaks"
      sub="The monitoring tool sees every stacktrace your app throws — that privilege comes with constraints."
    >
      <ul className="flex flex-col gap-5">
        {items.map(({ title, body }) => (
          <li key={title} className="flex flex-col gap-1">
            <p className="flex items-center gap-3 text-sm font-medium text-ink">
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
              {title}
            </p>
            <p className="pl-4 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </DocsSection>
  );
}