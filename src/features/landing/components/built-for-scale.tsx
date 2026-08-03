import { HugeiconsIcon } from "@hugeicons/react";
import {
  ZapIcon,
  FingerPrintIcon,
  ServerStackIcon,
  DatabaseSyncIcon,
  Clock01Icon,
  ChartLineIcon,
} from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const points = [
  {
    Icon: ZapIcon,
    title: "Millisecond ingestion",
    body: "Events persist before you finish the request. AI and alerting run on Celery queues — never on the hot path.",
  },
  {
    Icon: FingerPrintIcon,
    title: "Fingerprint-first dedup",
    body: "Normalize the error, hash the signature, increment the group. A crash loop can't multiply rows or AI calls.",
  },
  {
    Icon: ServerStackIcon,
    title: "Stateless by design",
    body: "JWT auth and no server-side sessions. Add app instances behind a load balancer and scale horizontally.",
  },
  {
    Icon: DatabaseSyncIcon,
    title: "Cached AI analysis",
    body: "Analysis is stored per fingerprint with a TTL. Repeats re-read the cache instead of re-paying the model.",
  },
  {
    Icon: Clock01Icon,
    title: "Rate-limited queues",
    body: "AI and alert work is throttled per queue. Bursts queue instead of bursting past free-tier limits.",
  },
  {
    Icon: ChartLineIcon,
    title: "Indexes where it hurts",
    body: "Composite indexes on (project, fingerprint) and (project, created_at) keep lookups flat as events grow.",
  },
];

export function BuiltForScale() {
  return (
    <section id="scale" className="scroll-mt-20">
      <Container className="py-14 sm:py-28">
        <SectionHeader
          eyebrow="Built for scale"
          title="Designed like it'll grow, priced like it won't"
          sub="The decisions that keep TrazeIQ fast at ten events per hour are the same ones that keep it fast at ten thousand."
        />
        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {points.map(({ title, body, Icon }) => (
            <StaggerItem key={title} className="bg-bg p-7">
              <HugeiconsIcon
                icon={Icon}
                size={22}
                color="#FAFAFA"
                strokeWidth={1.5}
              />
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}