import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { Container, GhostButton, PrimaryButton, Window } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const feedLines = [
  {
    time: "09:41:12",
    tag: "ERROR",
    tagClass: "text-sev-critical",
    text: "payments-api  DatabaseError: connection refused",
  },
  {
    time: "09:41:13",
    tag: "GROUPED",
    tagClass: "text-muted",
    text: "payments-api  → incident #1281 · occurrence #4,012",
  },
  {
    time: "09:41:20",
    tag: "AI",
    tagClass: "text-accent",
    text: "payments-api  root cause: connection pool exhausted · high",
  },
  {
    time: "09:41:31",
    tag: "LIVE",
    tagClass: "text-ok",
    text: "payments-api  incident #1281 delivered to your dashboard",
  },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(720px 380px at 50% 0%, rgba(79,70,229,0.16), transparent 70%)",
        }}
      />
      <Container className="relative flex flex-col items-center pb-20 pt-24 text-center sm:pt-32">
        <Reveal delay={0.05}>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted">
            <span className="text-accent">{"//"}</span> AI incident response
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Detect. Understand. <span className="text-accent">Fix.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            TrazeIQ watches your production errors, groups the noise into a
            single incident, and hands your team the root cause — before the
            first customer complains.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <PrimaryButton href="/register">
              Start Monitoring
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            </PrimaryButton>
            <GhostButton href="#dashboard">View Demo</GhostButton>
          </div>
        </Reveal>

        <Reveal delay={0.36}>
          <p className="mt-4 font-mono text-[11px] text-muted">
            free tier for small teams · no credit card · set up in 2 minutes
          </p>
        </Reveal>

        <Reveal delay={0.45} className="mt-14 w-full max-w-3xl">
          <Window
            title="trazeiq · live feed"
            bodyClassName="font-mono text-[12px] sm:text-[13px] leading-relaxed"
            className="text-left"
          >
            <div className="space-y-2.5 p-5 sm:p-6">
              {feedLines.map((line, i) => (
                <div
                  key={i}
                  className="feed-line flex flex-col gap-1 sm:flex-row sm:gap-3"
                  style={{ animationDelay: `${0.4 + i * 0.5}s` }}
                >
                  <span className="shrink-0 text-muted">{line.time}</span>
                  <span
                    className={`shrink-0 font-semibold ${line.tagClass}`}
                  >
                    {line.tag}
                  </span>
                  <span className="truncate text-ink/80">{line.text}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-muted">09:41:33</span>
                <span className="text-accent">ai</span>
                <span className="flex-1 text-ink/80">
                  analyzing pattern #2 …
                </span>
                <span className="h-4 w-2 animate-[caret-blink_1.1s_step-end_infinite] bg-accent" />
              </div>
            </div>
          </Window>
          <p className="mt-3 text-center font-mono text-[10px] text-muted">
            sample data — real feed from the product
          </p>
        </Reveal>
      </Container>
    </section>
  );
}