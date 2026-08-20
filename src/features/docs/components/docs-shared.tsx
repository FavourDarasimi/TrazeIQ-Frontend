import type { ReactNode } from "react";

export function DocsSection({
  id,
  label,
  title,
  sub,
  children,
}: {
  id: string;
  label: string;
  title: string;
  sub?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-10">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          {label}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {sub ? <p className="max-w-2xl text-base leading-relaxed text-muted">{sub}</p> : null}
      </div>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function DocsTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-bg-panel">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-ink/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[12.5px] text-ink">
      {children}
    </code>
  );
}

export function StatusBadge({
  code,
  tone = "default",
}: {
  code: string;
  tone?: "ok" | "warn" | "danger" | "default";
}) {
  const toneClass = {
    ok: "text-ok border-ok/40",
    warn: "text-sev-warning border-sev-warning/40",
    danger: "text-sev-critical border-sev-critical/40",
    default: "text-muted border-line",
  }[tone];
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[11.5px] ${toneClass}`}
    >
      {code}
    </span>
  );
}