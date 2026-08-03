import { HugeiconsIcon } from "@hugeicons/react";
import {
  TerminalIcon,
  AiSearchIcon,
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
          sub="The snippet observes, the AI diagnoses, your team acts — in that order, automatically."
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
            <h3 className="mt-6 font-semibold text-ink">SDK sends errors</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Drop the snippet into your error handler. TrazeIQ captures the
              stack trace, redacts secrets, and returns before your app
              notices.
            </p>
          </StaggerItem>

          <StaggerItem className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-bg p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface">
                  <HugeiconsIcon
                    icon={AiSearchIcon}
                    size={22}
                    color="#4F46E5"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="font-mono text-xs text-muted">step 02</span>
              </div>
              <h3 className="mt-6 font-semibold text-ink">AI analyzes</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A new pattern is enqueued for analysis. The model returns a
                root cause and a fix; results are cached per fingerprint.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-bg p-5 shadow-[0_0_30px_rgba(79,70,229,0.12)]">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={AiSearchIcon}
                  size={16}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  AI analysis
                </span>
              </div>
              <p className="mt-3 font-mono text-xs leading-relaxed text-ink/80">
                root cause: Redis connection pool exhausted
                <br />
                fix: raise maxclients, add backoff to retry path
                <br />
                <span className="text-muted">confidence:</span>{" "}
                <span className="text-ok">high</span>
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
            <h3 className="mt-6 font-semibold text-ink">Team gets notified</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The incident lands live on the dashboard, and alert rules page
              the right channel — once, with the fix already attached.
            </p>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}