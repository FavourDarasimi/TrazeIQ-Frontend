import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/motion";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1500px] px-4 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
      <span className="text-accent">{"//"}</span> {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
}) {
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-4 ${alignCls}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="max-w-2xl text-balance text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {sub ? (
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted">
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}

export function Window({
  title,
  right,
  children,
  bodyClassName = "",
  className = "",
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-bg-panel shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line bg-bg-panel px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-soft" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-soft" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-soft" />
          </div>
          <span className="font-mono text-xs text-muted">{title}</span>
        </div>
        {right}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function PrimaryButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </a>
  );
}

export function GhostButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-transparent px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </a>
  );
}