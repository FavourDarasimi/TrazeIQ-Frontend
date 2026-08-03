import { HugeiconsIcon } from "@hugeicons/react";
import {
  DangerIcon,
  SparklesIcon,
  UserIcon,
  Comment01Icon,
  CheckmarkCircleIcon,
} from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Reveal } from "@/components/ui/motion";

const entries = [
  {
    time: "10:02:01",
    Icon: DangerIcon,
    color: "text-sev-critical",
    ring: "border-sev-critical/40",
    kind: "event",
    title: "DatabaseError detected",
    body: "payments-api threw under load; 41 occurrences grouped into incident #1281.",
  },
  {
    time: "10:02:01",
    Icon: SparklesIcon,
    color: "text-accent",
    ring: "border-accent/40",
    kind: "ai_analysis",
    title: "AI analysis complete",
    body: "Root cause identified: connection pool exhausted. Fix written, confidence high.",
  },
  {
    time: "10:05:31",
    Icon: UserIcon,
    color: "text-muted",
    ring: "border-line-soft",
    kind: "status_change",
    title: "Marked investigating",
    body: "Assigned to the on-call engineer on the payments rotation.",
  },
  {
    time: "10:07:12",
    Icon: Comment01Icon,
    color: "text-muted",
    ring: "border-line-soft",
    kind: "comment",
    title: "Comment — Priya",
    body: "Pool exhaustion matches the batch job launch at 10:00. Applying the suggested fix first.",
  },
  {
    time: "10:09:40",
    Icon: CheckmarkCircleIcon,
    color: "text-ok",
    ring: "border-ok/40",
    kind: "resolved",
    title: "Resolved",
    body: "Rolled out. Error rate back to baseline within 3 minutes.",
  },
];

export function Timeline() {
  return (
    <section id="timeline" className="scroll-mt-20">
      <Container className="py-14 sm:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="flex flex-col gap-6 lg:sticky lg:top-28">
            <SectionHeader
              align="left"
              eyebrow="Incident timeline"
              title="A full story, not a stack overflow"
              sub="Every incident carries its whole history: detections, AI findings, status changes, and comments — in order, with the person responsible next to each step."
            />
            <p className="font-mono text-xs text-muted">
              timeline types: event · ai_analysis · status_change · comment
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="relative space-y-10 border-l border-line pb-2 pl-8">
            {entries.map(({ time, Icon, color, ring, kind, title, body }) => (
              <li key={title} className="relative">
                <span
                  className={`absolute -left-[47px] top-0 flex h-8 w-8 items-center justify-center rounded-full border ${ring} bg-bg`}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={1.5}
                    className={color}
                  />
                </span>
                <p className="font-mono text-[11px] text-muted">{time}</p>
                <h3 className="mt-1 font-medium text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {body}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {kind}
                </p>
              </li>
            ))}
          </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}