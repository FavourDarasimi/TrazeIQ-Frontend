import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { Container, GhostButton, PrimaryButton } from "./shared";
import { Reveal } from "./motion";

export function Cta() {
  return (
    <section
      id="get-started"
      className="relative scroll-mt-20 overflow-hidden border-t border-line"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            "radial-gradient(640px 320px at 50% 100%, rgba(79,70,229,0.16), transparent 70%)",
        }}
      />
      <Container className="relative flex flex-col items-center py-16 text-center sm:py-32">
        <Reveal className="flex flex-col items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted">
          <span className="text-accent">{"//"}</span> get started
        </p>
        <h2 className="mt-6 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Start monitoring in two minutes.
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted">
          Create a project, drop the snippet into your error handler, and
          watch your first incident arrive with a fix already attached.
        </p>
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
          <GhostButton href="/login">Sign in</GhostButton>
        </div>
        <p className="mt-5 font-mono text-[11px] text-muted">
          free tier for small teams · no credit card · cancel anytime
        </p>
        </Reveal>
      </Container>
    </section>
  );
}