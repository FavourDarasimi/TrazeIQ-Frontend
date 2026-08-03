import { HugeiconsIcon } from "@hugeicons/react";
import { WifiOffIcon, Search01Icon, InvoiceIcon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow, Window } from "./shared";
import { Reveal } from "./motion";

const noiseLines = [
  { time: "09:12:08", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:08", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:09", text: "payments-api  DatabaseError: connection refused" },
  { time: "09:12:09", text: "payments-api  DatabaseError: connection refused" },
];

const pains = [
  {
    Icon: Search01Icon,
    title: "Root-cause hunts eat afternoons",
    body: "The one line you need is buried under four hundred identical rows of the same stack trace.",
  },
  {
    Icon: WifiOffIcon,
    title: "You find out from users",
    body: "No alert fires. A support ticket, a frustrated reply, a bad review — that's your incident report.",
  },
  {
    Icon: InvoiceIcon,
    title: "The fix costs more than the bug",
    body: "Enterprise APM pricing is priced for teams with headcount. Small teams get nothing in between.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20">
      <Container className="grid items-start gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Your users are your monitoring tool.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            When a dependency fails at 3am, a crash loop writes the same error
            thousands of times. Nobody groups it, nobody analyzes it, and
            nobody tells the right person — until someone complains.
          </p>
          <div className="flex flex-col gap-6">
            {pains.map(({ title, body, Icon }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                  <HugeiconsIcon
                    icon={Icon}
                    size={20}
                    color="#71717A"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="lg:pl-6" delay={0.1}>
          <Window
            title="production.log"
            bodyClassName="bg-bg font-mono text-[13px] leading-relaxed"
          >
            <div className="space-y-2.5 p-5">
              {noiseLines.map((line, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-muted">{line.time}</span>
                  <span className="shrink-0 text-sev-critical">ERROR</span>
                  <span className="truncate text-ink/70">{line.text}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pb-1 pt-2">
                <span className="w-24 shrink-0 text-muted">09:12:31</span>
                <span className="shrink-0 text-sev-critical">ERROR</span>
                <span className="truncate text-ink/70">
                  payments-api <span className="text-muted">…</span>
                </span>
              </div>
            </div>
          </Window>
          <p className="mt-3 text-center font-mono text-[10px] text-muted">
            the same error, for the 4,000th time
          </p>
          <div className="mt-8 rounded-xl border border-line bg-surface p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Costs of the status quo
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-mono text-2xl text-ink">4,000+</p>
                <p className="mt-1 text-[11px] text-muted">
                  duplicate events per crash loop
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl text-ink">90%</p>
                <p className="mt-1 text-[11px] text-muted">
                  of incidents reach users first
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl text-ink">1/10</p>
                <p className="mt-1 text-[11px] text-muted">
                  the cost of enterprise APM
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}