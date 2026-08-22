"use client";

/* Hallmark · macrostructure: monument (numeral-led single scene) · tone: technical-minimal
 * theme: design-system locked (Design.md — monochrome + indigo accent)
 * nav/footer: none — chrome-less artifact · motion: single feed-in, settles
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { GhostButton, PrimaryButton } from "@/components/ui/shared";
import { ROUTES } from "@/constants";

const TRACE_MAX_CHARS = 64;

// During static prerender usePathname() is null; the real path appears once
// the client hydrates. Long paths truncate so the line can't wrap forever.
function tracePath(pathname: string | null): string {
  if (!pathname) return "/…";
  return pathname.length > TRACE_MAX_CHARS
    ? `${pathname.slice(0, TRACE_MAX_CHARS)}…`
    : pathname;
}

export default function NotFound() {
  const path = tracePath(usePathname());

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6">
          <Link
            href={ROUTES.home}
            className="inline-block text-base font-semibold tracking-tight text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Traze<span className="border-b-2 border-accent text-accent">IQ</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
        <p
          aria-hidden
          className={`animate-[feed-in_0.35s_ease-out_both] font-mono text-[clamp(6rem,30vw,11rem)] font-medium leading-none tracking-tighter text-ink select-none motion-reduce:animate-none`}
        >
          404
        </p>

        <h1 className="animate-[feed-in_0.35s_ease-out_both] text-balance text-2xl font-semibold tracking-tight text-ink [animation-delay:80ms] [overflow-wrap:anywhere] motion-reduce:animate-none sm:text-3xl">
          Route not found.
        </h1>
        <p className="-mt-3 min-w-0 animate-[feed-in_0.35s_ease-out_both] text-pretty leading-relaxed text-muted [animation-delay:140ms] break-words motion-reduce:animate-none">
          Nothing lives at <span className="font-mono text-[13px]">{path}</span>.
        </p>

        <div className="mt-6 flex animate-[feed-in_0.35s_ease-out_both] flex-col gap-3 [animation-delay:220ms] motion-reduce:animate-none sm:flex-row">
          <PrimaryButton
            href={ROUTES.dashboard}
            className="w-full whitespace-nowrap focus-visible:outline-offset-4 sm:w-auto"
          >
            Return to dashboard
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="currentColor" strokeWidth={1.5} />
          </PrimaryButton>
          <GhostButton
            href={ROUTES.docs}
            className="w-full whitespace-nowrap focus-visible:outline-offset-4 sm:w-auto"
          >
            Read the docs
          </GhostButton>
        </div>
      </main>

      <footer className="border-t border-line text-center">
        <div className="mx-auto w-full max-w-xl px-4 py-4 font-mono text-[11px] text-muted sm:px-6">
          HTTP 404 · we catch app errors — not typos
        </div>
      </footer>
    </div>
  );
}
