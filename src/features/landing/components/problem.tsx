import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow, Window } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const noiseLines = [
  { time: "09:12:08", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:08", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:09", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:09", text: "payments-api  DatabaseError: connection refused" },
];

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20">
      <Container className="grid items-start gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="min-w-0 flex flex-col gap-6">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Your users are your monitoring tool.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            When a dependency fails at 3am, a crash loop writes the same
            error thousands of times — and the first alert is a support
            ticket. TrazeIQ collapses the noise so the team sees one
            incident, not four thousand log rows.
          </p>
          <p className="flex flex-wrap items-center gap-3 font-mono text-sm text-muted">
            <span className="text-2xl text-ink">4,000</span> duplicate errors
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={16}
              color="#71717A"
              strokeWidth={1.5}
            />
            <span className="text-2xl text-ink">1</span> incident
          </p>
        </Reveal>

        <Reveal className="min-w-0 lg:pl-6" delay={0.1}>
          <Window
            title="production.log"
            bodyClassName="bg-bg font-mono text-[13px] leading-relaxed"
          >
            <div className="space-y-2.5 p-5">
              {noiseLines.map((line, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-muted">{line.time}</span>
                  <span className="shrink-0 text-sev-critical">ERROR</span>
                  <span className="min-w-0 truncate text-ink/70">{line.text}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pb-1 pt-2">
                <span className="w-24 shrink-0 text-muted">09:12:31</span>
                <span className="shrink-0 text-sev-critical">ERROR</span>
                <span className="min-w-0 truncate text-ink/70">
                  payments-api <span className="text-muted">…</span>
                </span>
              </div>
            </div>
          </Window>
          <p className="mt-3 text-center font-mono text-[10px] text-muted">
            Illustrative sample
          </p>
        </Reveal>
      </Container>
    </section>
  );
}