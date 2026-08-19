import { Code, DocsSection } from "./docs-shared";

const steps = [
  {
    title: "Redact",
    body: "Obvious secrets — SECRET_KEY=, DATABASE_URL=, password=, bearer tokens, JWTs — are scrubbed from the message and stacktrace before anything touches the database or the AI prompt.",
  },
  {
    title: "Fingerprint",
    body: "The error is normalized (line numbers, memory addresses, and UUIDs stripped) and hashed with its type and top stack frames. Identical crashes produce identical fingerprints.",
  },
  {
    title: "Group",
    body: "The fingerprint maps to an ErrorGroup — a fact about your codebase: how often this error happens, first seen, last seen. A crash loop increments one group instead of flooding storage.",
  },
  {
    title: "Incident",
    body: "Each group gets one open Incident — the trackable ticket: severity, status, assignment, comments, timeline. Resolve it and a later recurrence reopens a fresh incident against the same group.",
  },
  {
    title: "Analyze",
    body: "AI analysis runs once per new incident (cached for 6 hours), never per occurrence. A prompt-injection guard makes the model treat error text strictly as data.",
  },
  {
    title: "Deliver",
    body: "The dashboard updates live via a private Pusher channel, and alert rules dispatch to Slack, email, or a webhook — cooldown-aware, so a recurring incident never spams the channel.",
  },
];

export function DocsPipeline() {
  return (
    <DocsSection
      id="pipeline"
      label="Concepts"
      title="From raw error to tracked incident"
      sub="Every event passes through the same pipeline. Understanding it explains why the dashboard looks the way it does."
    >
      <ol className="flex flex-col gap-5">
        {steps.map(({ title, body }, i) => (
          <li key={title} className="flex gap-4">
            <span className="font-mono text-sm text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-sm leading-relaxed text-muted">
        The one thing to keep straight: an{" "}
        <Code>ErrorGroup</Code> is a fact about the codebase, an{" "}
        <Code>Incident</Code> is the workflow around it. They&apos;re separate on
        purpose — history survives reopening.
      </p>
    </DocsSection>
  );
}