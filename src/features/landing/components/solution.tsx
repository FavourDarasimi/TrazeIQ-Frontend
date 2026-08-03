import { HugeiconsIcon } from "@hugeicons/react";
import { TerminalIcon, AiSearchIcon, Notification03Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { Container, Eyebrow } from "@/components/ui/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const steps = [
  {
    Icon: TerminalIcon,
    title: "Ingest",
    body: "Errors hit the SDK and are fingerprinted on arrival — redacted, deduplicated, persisted in milliseconds.",
  },
  {
    Icon: AiSearchIcon,
    title: "Analyze",
    body: "One AI call per new pattern, cached per fingerprint. It never runs on the request path.",
  },
  {
    Icon: Notification03Icon,
    title: "Route",
    body: "The right people get the right alarm at the right severity, once — not on the 50th repeat.",
  },
];

export function Solution() {
  return (
    <section className="border-y border-line bg-bg-panel">
      <Container className="py-14 sm:py-28">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Eyebrow>The solution</Eyebrow>
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Same error. Handled once.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            TrazeIQ is an error-intelligence layer for your backend. It turns
            ten thousand identical pixels of noise into one incident with an
            AI-written diagnosis attached.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {steps.map(({ title, body, Icon }, i) => (
            <StaggerItem key={title} className="relative bg-bg p-7">
              <span className="font-mono text-xs text-muted">
                step {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface">
                <HugeiconsIcon
                  icon={Icon}
                  size={22}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mt-5 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              {i < steps.length - 1 ? (
                <div className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={18}
                    color="#71717A"
                    strokeWidth={1.5}
                  />
                </div>
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10 flex flex-col items-center gap-2 font-mono text-xs text-muted sm:flex-row sm:justify-center sm:gap-3">
          <span>10,000 raw events</span>
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            color="#71717A"
            strokeWidth={1.5}
            className="rotate-90 sm:rotate-0"
          />
          <span className="text-ink">
            → 1 incident · root cause · suggested fix
          </span>
          <HugeiconsIcon
            icon={Notification03Icon}
            size={14}
            color="#71717A"
            strokeWidth={1.5}
          />
          <span>on Slack, once</span>
        </Reveal>
      </Container>
    </section>
  );
}