import { HugeiconsIcon } from "@hugeicons/react";
import {
  FingerPrintIcon,
  AiSearchIcon,
  ActivityIcon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const features = [
  {
    Icon: FingerPrintIcon,
    title: "Error grouping",
    body: "Fingerprinted at the edge. A crash loop collapses into one ErrorGroup — one row per pattern, not one per request.",
  },
  {
    Icon: AiSearchIcon,
    title: "AI root cause analysis",
    body: "Every new incident gets a root cause and a concrete fix, written by a free-tier model and cached per fingerprint.",
  },
  {
    Icon: ActivityIcon,
    title: "Realtime dashboard",
    body: "Incidents push to the browser the moment they land. No refresh, no polling, no stale numbers.",
  },
  {
    Icon: Notification03Icon,
    title: "Alert routing",
    body: "Rules with cooldowns page the team on Slack or email when severity crosses a threshold — once per incident, not per event.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <Container className="py-14 sm:py-28">
        <SectionHeader
          eyebrow="Features"
          title="Everything a small team needs to sleep through the night"
          sub="Four capabilities, no enterprise license. The parts of Datadog your team actually uses, rebuilt for teams of two to twenty."
        />
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map(({ title, body, Icon }) => (
            <StaggerItem
              key={title}
              className="group rounded-2xl border border-line bg-surface p-7 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-bg-panel transition-colors group-hover:border-accent/40">
                <HugeiconsIcon
                  icon={Icon}
                  size={22}
                  color="#4F46E5"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}