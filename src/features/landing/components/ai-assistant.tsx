import { HugeiconsIcon } from "@hugeicons/react";
import { AiSearchIcon, CheckmarkCircleIcon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow, Window } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const checks = [
  "One analysis per new pattern — cached per fingerprint",
  "Root cause, concrete fix, and a confidence level",
  "Re-run only when the last analysis goes stale",
  "Error content is treated as data, never instructions",
];

export function AIAssistant() {
  return (
    <section
      id="ai-assistant"
      className="scroll-mt-20 border-y border-line bg-bg-panel"
    >
      <Container className="grid items-center gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="min-w-0 flex flex-col gap-6">
          <Eyebrow>AI Incident Copilot</Eyebrow>
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Not just {"\u201Csomething went wrong\u201D"} — the diagnosis
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            When a new pattern lands, a free-tier model reads the stack trace
            and writes the root cause an engineer would have written after an
            hour of digging. It&apos;s the first thing the on-call person sees.
          </p>
          <ul className="flex flex-col gap-3">
            {checks.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={CheckmarkCircleIcon}
                  size={18}
                  color="#10B981"
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-sm leading-relaxed text-ink/80">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="min-w-0 lg:pl-6" delay={0.1}>
          <Window
            title="incident #1281 · AI analysis"
            bodyClassName="bg-bg p-6"
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={AiSearchIcon}
                size={18}
                color="#4F46E5"
                strokeWidth={1.5}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                AI Incident Copilot
              </span>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                root cause
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                The connection pool in{" "}
                <span className="font-mono text-ink/80">payments-api</span>{" "}
                was exhausted during a batch job: 400 workers each held a
                client while waiting on the same slow query.
              </p>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                suggested fix
              </p>
              <p className="mt-2 font-mono text-[13px] leading-relaxed text-ink/85">
                raise maxclients 50 → 200
                <br />
                add jittered retry + circuit breaker to the batch path
                <br />
                alert on pool-usage &gt; 80% for 5 minutes
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                confidence
              </span>
              <span className="flex items-center gap-1.5 rounded border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
                <span className="h-1 w-1 rounded-full bg-ok" />
                HIGH
              </span>
            </div>
          </Window>
        </Reveal>
      </Container>
    </section>
  );
}