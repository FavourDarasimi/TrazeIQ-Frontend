import type { IncidentSeverity, IncidentStatus } from "@/types";

const SEVERITY_STYLES: Record<IncidentSeverity, string> = {
  critical: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
  high: "border-sev-high/30 bg-sev-high/10 text-sev-high",
  medium: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  low: "border-sev-low/30 bg-sev-low/10 text-sev-low",
};

const SEVERITY_DOTS: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
};

const STATUS_STYLES: Record<IncidentStatus, string> = {
  open: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
  investigating: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  resolved: "border-ok/30 bg-ok/10 text-ok",
  ignored: "border-line bg-surface text-muted",
};

const STATUS_DOTS: Record<IncidentStatus, string> = {
  open: "bg-sev-critical",
  investigating: "bg-sev-warning",
  resolved: "bg-ok",
  ignored: "bg-muted",
};

function Badge({
  label,
  styles,
  dot,
  ariaLabel,
}: {
  label: string;
  styles: string;
  dot: string;
  ariaLabel: string;
}) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <Badge
      label={severity}
      styles={SEVERITY_STYLES[severity]}
      dot={SEVERITY_DOTS[severity]}
      ariaLabel={`Severity: ${severity}`}
    />
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge
      label={status}
      styles={STATUS_STYLES[status]}
      dot={STATUS_DOTS[status]}
      ariaLabel={`Status: ${status}`}
    />
  );
}