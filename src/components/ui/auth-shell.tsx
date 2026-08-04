import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-[0_0_24px_rgba(79,70,229,0.35)]">
              <span className="h-2 w-2 rounded-full bg-ink" />
            </span>
            <span className="font-mono text-lg font-semibold tracking-tight text-ink">
              traze<span className="text-accent">iq</span>
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-bg-panel p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] sm:p-8">
          {children}
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </main>
  );
}