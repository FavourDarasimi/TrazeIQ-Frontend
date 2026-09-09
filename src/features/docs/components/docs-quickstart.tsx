import { Callout } from "./docs-callout";
import { DocsCode } from "./docs-code";
import { DocsSection } from "./docs-shared";
import { Step, Steps } from "./docs-steps";

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

const goSnippet = `package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func report(err error) {
	body, _ := json.Marshal(map[string]string{"message": err.Error(), "environment": "production"})
	req, _ := http.NewRequest("POST", "https://api.trazeiq.io/api/v1/events/", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", "YOUR_API_KEY")
	http.DefaultClient.Do(req)
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
        <DocsCode
          label="fire the first event"
          tabs={[
            { lang: "curl", label: "curl", code: curlSnippet },
            { lang: "js", label: "JavaScript", code: jsSnippet },
            {
              lang: "python",
              label: "Python",
              code: `import requests, traceback
try:
    process_payment(order)
except Exception as e:
    requests.post(
        "https://api.trazeiq.io/api/v1/events/",
        headers={"Content-Type": "application/json", "X-API-Key": "YOUR_API_KEY"},
        json={"message": str(e), "stacktrace": traceback.format_exc(), "service": "payment-api", "environment": "production"},
        timeout=2,
    )
    raise`,
            },
            {
              lang: "node",
              label: "Node",
              code: jsSnippet,
            },
            {
              lang: "go",
              label: "Go",
              code: goSnippet,
            },
          ]}
        />

        <Steps>
          <Step title="Create a project">
            Sign in → create an Organization (you become owner) → create a Project. TrazeIQ generates an API key
            shown exactly once with an integration snippet — copy it before you leave the page. Later reads show
            only the key prefix.
          </Step>
          <Step title="Drop the snippet into your error handler">
            The snippet above is the whole integration. In a real app, wrap it in the catch block where you handle
            exceptions. The endpoint responds in milliseconds.
          </Step>
          <Step title="Watch incidents appear">
            Repeated errors are deduplicated into a single ErrorGroup → one open Incident, AI proposes a root cause
            and fix (once per incident, cached 6h), and alert rules / Pusher / notifications fan out — no polling,
            no babysitting. Rotate the key anytime at <Code>POST /projects/{"{id}"}/rotate-key/</Code>.
          </Step>
        </Steps>

        <Callout variant="note" title="Two auth surfaces">
          Dashboard reads (all <Code>GET /api/v1/*</Code> except ingestion) use your session JWT (<Code>Authorization: Bearer</Code> or <Code>trazeiq_access</Code> cookie). Ingestion <Code>POST /api/v1/events/</Code> uses <Code>X-API-Key</Code> only. Don&apos;t send both — they authenticate different principals.
        </Callout>
      </div>
    </DocsSection>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface px-1 py-0.5 font-mono text-[12px] text-ink">{children}</code>
  );
}
