import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircleIcon, TerminalIcon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow, GhostButton, Window } from "./shared";
import { Reveal } from "./motion";

export function DevSdk() {
  return (
    <section
      id="developer-sdk"
      className="scroll-mt-20 border-y border-line bg-bg-panel"
    >
      <Container className="grid items-center gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6">
          <Eyebrow>Developer SDK</Eyebrow>
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Two minutes to integrate. Drop in the snippet.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            TrazeIQ observes — it never swallows your exceptions or blocks your
            request. The ingestion path answers in milliseconds and delegates
            AI and alerting to background workers.
          </p>
          <ul className="flex flex-col gap-3 border-l border-line pl-5">
            <li className="text-sm leading-relaxed text-ink/80">
              API key shown <span className="font-mono">once</span>, hashed at
              rest, rotatable whenever you need.
            </li>
            <li className="text-sm leading-relaxed text-ink/80">
              Secrets scrubbed from stack traces before they touch storage or
              the AI.
            </li>
            <li className="text-sm leading-relaxed text-ink/80">
              Payloads are capped and rate-limited — a misbehaving client
              can&apos;t flood the store.
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
              returns in ~5ms
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-muted">
              <HugeiconsIcon
                icon={CheckmarkCircleIcon}
                size={16}
                color="#10B981"
                strokeWidth={1.5}
              />
              plain HTTPS — any language
            </div>
          </div>
          <p className="font-mono text-[11px] text-muted">
            packaged SDKs on the roadmap — the HTTP contract works today
          </p>
        </Reveal>

        <Reveal className="lg:pl-6" delay={0.1}>
          <Window
            title="error-handler.js · add this to your app"
            bodyClassName="bg-bg p-5 sm:p-6"
          >
            <pre className="overflow-x-auto font-mono text-[12.5px] leading-[1.7] text-ink/85">
              <code>
                <div>
                  <span className="text-muted">
                    {"// inside your error handler"}
                  </span>
                </div>
                <div>
                  <span className="text-muted">try</span> {"{"}
                </div>
                <div>
                  {"  "}
                  <span className="text-muted">await</span>{" "}
                  processPayment(order)
                </div>
                <div>
                  {"}"} <span className="text-muted">catch</span> (error) {"{"}
                </div>
                <div>
                  {"  "}
                  <span className="text-accent">fetch</span>(
                  {'"https://api.trazeiq.com/api/v1/events/"'}, {"{"}
                </div>
                <div>
                  {"    "}method: {'"POST"'},
                </div>
                <div>
                  {"    "}headers: {"{"}
                </div>
                <div>
                  {"      "}
                  {'"Content-Type": '}
                  {'"application/json"'},
                </div>
                <div>
                  {"      "}
                  {'"X-API-Key": '}
                  process.env.TRAZEIQ_API_KEY
                </div>
                <div>
                  {"    "}
                  {"}"},
                </div>
                <div>
                  {"    "}body: JSON.stringify({"{"}
                </div>
                <div>
                  {"      "}message: error.message,
                </div>
                <div>
                  {"      "}stacktrace: error.stack,
                </div>
                <div>
                  {"      "}service: {'"payment-api"'},
                </div>
                <div>
                  {"      "}environment: {'"production"'}
                </div>
                <div>
                  {"    "}
                  {"}"})
                </div>
                <div>
                  {"  "}
                  {"}"})
                </div>
                <div>
                  {"  "}
                  <span className="text-muted">throw</span> error{" "}
                  <span className="text-muted">
                    {"// TrazeIQ observes it, doesn't swallow it"}
                  </span>
                </div>
                <div>
                  {"}"}
                </div>
              </code>
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
              configured with X-API-Key — rotated server-side
            </p>
            <GhostButton href="#get-started">Get the snippet</GhostButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}