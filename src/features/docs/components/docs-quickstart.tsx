import { DocsCode } from "./docs-code";
import { DocsSection } from "./docs-shared";

const curlSnippet = `curl -X POST https://api.trazeiq.io/api/v1/events/ \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"environment": "production", "message": "Hello TrazeIQ"}'`;

const jsSnippet = `try {
  await processPayment(order)
} catch (error) {
  await fetch("https://api.trazeiq.io/api/v1/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "YOUR_API_KEY",
    },
    body: JSON.stringify({
      message: error.message,
      stacktrace: error.stack,
      service: "payment-api",
      environment: "production",
    }),
  }).catch(() => {})
  throw error // TrazeIQ observes, it doesn't swallow
}`;

export function DocsQuickstart() {
  return (
    <DocsSection
      id="quickstart"
      label="Quickstart"
      title="Send your first event in two minutes"
      sub="No SDK to install. The integration is a plain HTTPS POST — copy the snippet into your app's error handler and you're done."
    >
      <div className="flex flex-col gap-6">
        <DocsCode label="curl — fire the first event" code={curlSnippet} />

        <ol className="flex flex-col gap-5">
          {[
            {
              step: "01",
              title: "Create a project",
              body: "Sign in and create a project from the onboarding flow. TrazeIQ generates an API key and shows it exactly once — copy it before you leave the page.",
            },
            {
              step: "02",
              title: "Drop the snippet into your error handler",
              body: "The curl snippet above is the whole integration. In a real app, wrap it in the catch block where you handle exceptions.",
            },
            {
              step: "03",
              title: "Watch incidents appear",
              body: "Repeated errors are deduplicated into a single incident, AI proposes a root cause and fix, and your team gets notified — no polling, no babysitting.",
            },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-4">
              <span className="font-mono text-sm text-accent">{step}</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <DocsCode label="fetch — from inside your app" code={jsSnippet} />
      </div>
    </DocsSection>
  );
}