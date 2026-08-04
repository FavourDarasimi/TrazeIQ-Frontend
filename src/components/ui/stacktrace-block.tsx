import { Window } from "@/components/ui/shared";

const LEVEL_LINE_COLORS: Record<string, string> = {
  fatal: "text-sev-critical",
  error: "text-sev-critical",
  warning: "text-sev-warning",
  info: "text-sev-low",
  debug: "text-sev-low",
};

function classify(line: string): "error" | "path" | "plain" {
  if (/^\S.*:\d+$/.test(line.trim())) return "path";
  if (/ at /.test(line)) return "path";
  if (/\b(File|in|raise|at)\b/.test(line) && /(\.ts|\.py|\.js|\.tsx|\.go|\.rb):\d+/.test(line)) {
    return "path";
  }
  return "plain";
}

export function StacktraceBlock({
  message,
  stacktrace,
  level,
  title,
}: {
  message: string;
  stacktrace?: string;
  level?: string;
  title?: string;
}) {
  const text = stacktrace?.trim() || message;
  const lines = text.split("\n");
  const firstLine = stacktrace?.trim() ? message : null;

  return (
    <Window
      title={title ?? `stacktrace${level ? ` · ${level}` : ""}`}
      right={
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          terminal
        </span>
      }
      bodyClassName="bg-[#000000]"
    >
      <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-[12.5px] leading-relaxed">
        {firstLine ? (
          <span className={`block ${LEVEL_LINE_COLORS[level ?? "error"] ?? "text-ink"}`}>
            {firstLine}
          </span>
        ) : null}
        {lines.map((line, index) => {
          const isMessage = !firstLine && index === 0;
          const tone = classify(line);
          const className = isMessage
            ? LEVEL_LINE_COLORS[level ?? "error"] ?? "text-ink"
            : tone === "path"
              ? "text-muted"
              : "text-ink";
          return (
            <span key={`${index}-${line.slice(0, 24)}`} className={`block ${className}`}>
              {line || "\u00a0"}
            </span>
          );
        })}
      </pre>
    </Window>
  );
}