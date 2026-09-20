import { HugeiconsIcon } from "@hugeicons/react";
import {
  TerminalIcon,
  FilterIcon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-line bg-bg-panel"
    >
      <Container className="py-14 sm:py-28">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps between your app and a fix"
          sub="The snippet observes, the pipeline groups, your team acts — in that order, automatically."
        />

        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          <StaggerItem className="flex flex-col rounded-2xl border border-line bg-bg p-7">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface">
                <HugeiconsIcon
                  icon={TerminalIcon}
                  size={22}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
              </span>
              <span className="font-mono text-xs text-muted">step 01</span>
            </div>
            <h3 className="mt-6 font-semibold text-ink">Send the error</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Drop the snippet into your error handler — SDKs for JS/TS and
              Python, or plain fetch. TrazeIQ redacts secrets and returns
              before your app notices.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-bg-panel p-4 font-mono text-[12px] leading-relaxed text-ink/85">
              <code>{`fetch("https://api.trazeiq.io/api/v1/events/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_API_KEY",
  },
  body: JSON.stringify({
    message: error.message,
    stacktrace: error.stack,
  }),
}).catch(() => {});
throw error;`}</code>
            </pre>
          </StaggerItem>

          <StaggerItem className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-bg p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface">
                  <HugeiconsIcon
                    icon={FilterIcon}
                    size={22}
                    color="#4F46E5"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="font-mono text-xs text-muted">step 02</span>
              </div>
              <h3 className="mt-6 font-semibold text-ink">It becomes one incident</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Events are fingerprinted on arrival and grouped by stack
                trace — thousands of repeats collapse into a single tracked
                incident with the full stack trace attached.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-bg p-5 shadow-[0_0_30px_rgba(79,70,229,0.12)]">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  Fingerprint Aggregation
                </span>
              </div>
              <p className="mt-3 font-mono text-xs leading-relaxed text-ink/80">
                fingerprint: fp_a41d92c0
                <br />
                occurrences: 4,012 events collapsed
                <br />
                <span className="text-muted">status:</span>{" "}
                <span className="text-ok">active incident #1281</span>
              </p>
            </div>
          </StaggerItem>

          <StaggerItem className="flex flex-col rounded-2xl border border-line bg-bg p-7">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface">
                <HugeiconsIcon
                  icon={Notification03Icon}
                  size={22}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
              </span>
              <span className="font-mono text-xs text-muted">step 03</span>
            </div>
            <h3 className="mt-6 font-semibold text-ink">Get notified once</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The right people get the right alarm at the right severity —
              once per incident on Slack or email, not on the 50th repeat.
            </p>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}