import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Alert01Icon,
  TerminalIcon,
  ServerStackIcon,
  AiSearchIcon,
  Settings01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { Container, SectionHeader, Window } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const nav = [
  { label: "Overview", Icon: Home01Icon, active: false },
  { label: "Incidents", Icon: Alert01Icon, active: true, badge: "12" },
  { label: "Logs", Icon: TerminalIcon, active: false },
  { label: "Services", Icon: ServerStackIcon, active: false },
  { label: "AI Assistant", Icon: AiSearchIcon, active: false },
  { label: "Settings", Icon: Settings01Icon, active: false },
];

const metrics = [
  { label: "Open incidents", value: "24", delta: "↑ 12% this week" },
  { label: "Errors / min", value: "312", delta: "↓ 8% this week" },
  { label: "Resolved today", value: "1,283", delta: "38 min median MTTR" },
  { label: "AI analyses", value: "96%", delta: "high-confidence" },
];

const rows = [
  {
    sev: "critical",
    sevClass: "text-sev-critical",
    title: "Redis connection pool exhausted",
    service: "payments-api",
    status: "investigating",
    statusClass: "border-sev-warning/50 text-sev-warning",
    seen: "2m ago",
  },
  {
    sev: "high",
    sevClass: "text-sev-high",
    title: "DatabaseError: connection refused",
    service: "workers-api",
    status: "open",
    statusClass: "border-accent/50 text-accent",
    seen: "9m ago",
  },
  {
    sev: "medium",
    sevClass: "text-sev-warning",
    title: "Slow query: orders_full_scan",
    service: "analytics-api",
    status: "open",
    statusClass: "border-accent/50 text-accent",
    seen: "31m ago",
  },
  {
    sev: "low",
    sevClass: "text-sev-low",
    title: "422 validation on /v1/checkout",
    service: "checkout-api",
    status: "resolved",
    statusClass: "border-ok/50 text-ok",
    seen: "1h ago",
  },
];

export function DashboardPreview() {
  return (
    <section id="dashboard" className="scroll-mt-20">
      <Container className="py-14 sm:py-28">
        <SectionHeader
          eyebrow="Dashboard preview"
          title="The command center your on-call actually wants"
          sub="Status, severity, and history on one screen. Everything below is the real product — sample data."
        />

        <Reveal className="mt-14">
          <Window
            title="trazeiq · command center"
            right={
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-ok">
                <span className="h-1.5 w-1.5 animate-[breathe_3s_ease-in-out_infinite] rounded-full bg-ok" />
                LIVE
              </span>
            }
          >
            <div className="flex">
              <aside className="hidden w-48 shrink-0 flex-col gap-1 border-r border-line bg-bg-panel p-4 md:flex">
                <p className="mb-3 px-2 font-mono text-[11px] font-semibold text-ink">
                  traze<span className="text-accent">iq</span>
                </p>
                {nav.map(({ label, Icon, active, badge }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 ${
                      active
                        ? "border-l-2 border-accent bg-white/5 text-ink"
                        : "border-l-2 border-transparent text-muted"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      size={16}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 text-[11px]">{label}</span>
                    {badge ? (
                      <span className="rounded bg-sev-critical/15 px-1.5 py-0.5 font-mono text-[9px] text-sev-critical">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                ))}
              </aside>

              <div className="min-w-0 flex-1 bg-bg-panel p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Incidents
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      payments-api · production
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-line bg-bg px-2.5 py-1.5">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      size={14}
                      color="#71717A"
                      strokeWidth={1.5}
                    />
                    <span className="font-mono text-[10px] text-muted">
                      search incidents…
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {metrics.map(({ label, value, delta }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-line bg-bg p-4"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                        {label}
                      </p>
                      <p className="mt-2 font-mono text-xl text-ink sm:text-2xl">
                        {value}
                      </p>
                      <p className="mt-1 text-[10px] text-muted">{delta}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-line">
                  {rows.map((row) => (
                    <div
                      key={row.title}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-bg px-4 py-3 last:border-b-0 sm:flex-nowrap"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${row.sevClass}`}
                      />
                      <p className="min-w-0 flex-1 truncate text-[11px] text-ink/90">
                        {row.title}
                      </p>
                      <span className="hidden font-mono text-[10px] text-muted lg:block">
                        {row.service}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                      <span className="w-12 text-right font-mono text-[10px] text-muted">
                        {row.seen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Window>
        </Reveal>
      </Container>
    </section>
  );
}