"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircleIcon, TerminalIcon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow, GhostButton, Window } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const snippets = [
  {
    id: "js-sdk",
    label: "JS / TS SDK",
    title: "npm install trazeiq",
    code: `// npm install trazeiq
import { init, captureException } from "trazeiq";

init({
  apiKey: process.env.TRAZEIQ_API_KEY,
  environment: "production",
  service: "payment-api",
});

try {
  await processPayment(order);
} catch (error) {
  await captureException(error); // never throws, 2s timeout max
  throw error; // TrazeIQ observes, doesn't swallow
}`,
  },
  {
    id: "python-sdk",
    label: "Python SDK",
    title: "pip install trazeiq",
    code: `# pip install trazeiq
import trazeiq

trazeiq.init(
    api_key=os.getenv("TRAZEIQ_API_KEY"),
    environment="production",
    service="payment-api",
)

try:
    process_payment(order)
except Exception:
    trazeiq.capture_exception()  # never raises, zero dependencies
    raise`,
  },
  {
    id: "raw-http",
    label: "Plain Fetch / cURL",
    title: "POST /api/v1/events/",
    code: `// Any language / plain fetch
try {
  await processPayment(order);
} catch (error) {
  await fetch("https://api.trazeiq.io/api/v1/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.TRAZEIQ_API_KEY,
    },
    body: JSON.stringify({
      message: error.message,
      stacktrace: error.stack,
      service: "payment-api",
      environment: "production",
    }),
  }).catch(() => {});
  throw error;
}`,
  },
];

export function DevIntegration() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section
      id="developer-integration"
      className="scroll-mt-20 border-y border-line bg-bg-panel"
    >
      <Container className="grid items-center gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="min-w-0 flex flex-col gap-6">
          <Eyebrow>SDKs & Direct Ingestion</Eyebrow>
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Two minutes to integrate. Zero dependencies.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            TrazeIQ provides official lightweight SDKs for JavaScript/TypeScript
            (<code className="font-mono text-accent">npm install trazeiq</code>) and Python
            (<code className="font-mono text-accent">pip install trazeiq</code>), plus direct HTTP POST support for any language.
          </p>
          <ul className="flex flex-col gap-3 border-l border-line pl-5">
            <li className="text-sm leading-relaxed text-ink/80">
              <strong>Never crashes host app:</strong> Network and HTTP errors are caught and swallowed.
            </li>
            <li className="text-sm leading-relaxed text-ink/80">
              <strong>Non-blocking:</strong> 2-second default timeout with zero retries on the hot path.
            </li>
            <li className="text-sm leading-relaxed text-ink/80">
              <strong>Server-side redaction:</strong> Passwords, tokens, and authorization headers scrubbed automatically.
            </li>
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-muted">
              <HugeiconsIcon
                icon={CheckmarkCircleIcon}
                size={16}
                color="#10B981"
                strokeWidth={1.5}
              />
              zero third-party dependencies
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-muted">
              <HugeiconsIcon
                icon={CheckmarkCircleIcon}
                size={16}
                color="#10B981"
                strokeWidth={1.5}
              />
              returns in ~5ms
            </div>
          </div>
          <p className="font-mono text-[11px] text-muted">
            available on npm (trazeiq) & PyPI (trazeiq) · plain HTTPS supported in all languages
          </p>
        </Reveal>

        <Reveal className="min-w-0 lg:pl-6" delay={0.1}>
          <div className="mb-3 flex flex-wrap gap-2">
            {snippets.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                  activeTab === idx
                    ? "bg-accent text-ink font-medium"
                    : "bg-surface text-muted hover:text-ink hover:bg-surface/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Window
            title={snippets[activeTab].title}
            bodyClassName="bg-bg p-5 sm:p-6"
          >
            <pre className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-[1.7] text-ink/85">
              <code>{snippets[activeTab].code}</code>
            </pre>
          </Window>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <HugeiconsIcon
                icon={TerminalIcon}
                size={14}
                color="#71717A"
                strokeWidth={1.5}
              />
              configured with X-API-Key — rotated anytime
            </p>
            <GhostButton href="/docs#sdks">Explore SDK docs</GhostButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}