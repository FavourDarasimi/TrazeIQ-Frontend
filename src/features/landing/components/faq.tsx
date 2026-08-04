import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const faqs = [
  {
    q: "Does TrazeIQ replace Datadog or New Relic?",
    a: "For the core job — error collection, grouping, incident tracking, and alerting — yes, for a fraction of the cost. It's not an enterprise APM: it doesn't do distributed tracing, dashboards for every metric, or per-seat enterprise licensing. It does the part small teams actually use: 'what broke, why, and who needs to know'.",
  },
  {
    q: "Is the AI really free?",
    a: "The analysis runs on OpenRouter's free-tier models. Because analysis is cached per fingerprint and re-run only when stale (default 6 hours), one incident costs one call — not one per event. A crash loop that writes 10,000 events still triggers a single analysis.",
  },
  {
    q: "Will error reporting slow down my app?",
    a: "No. The ingestion endpoint responds in milliseconds and does everything synchronously only up to persistence. AI calls and alert dispatch run on background workers, so a slow or rate-limited model never blocks your request path.",
  },
  {
    q: "What happens if the AI is down or rate-limited?",
    a: "Your events are still ingested, grouped, and stored. The analysis task retries with exponential backoff on rate limits, and the dashboard shows a clear pending state. You can always re-trigger analysis manually from the incident page.",
  },
  {
    q: "How do you keep my stack traces safe?",
    a: "Secrets are redacted before anything is persisted, keys are hashed, integration credentials are encrypted at rest, and every query is scoped to your organization. The AI prompt is also framed to treat error text as data, so a crafted stack trace can't inject instructions.",
  },
  {
    q: "Do I have to host anything?",
    a: "No. TrazeIQ is a hosted platform — you just POST errors from your error handler to the ingestion endpoint. If you'd rather self-host, the backend (Django + PostgreSQL + Celery) is designed to be runnable on a single small box.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20">
      <Container className="py-14 sm:py-28">
        <Reveal>
          <SectionHeader
            eyebrow="FAQ"
            title="Questions, answered before you ask"
          />
        </Reveal>
        <Stagger className="mx-auto mt-12 max-w-3xl">
          {faqs.map(({ q, a }) => (
            <StaggerItem key={q}>
              <details className="group border-b border-line first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-ink">{q}</span>
                  <HugeiconsIcon
                    icon={ChevronDownIcon}
                    size={18}
                    color="#71717A"
                    strokeWidth={1.5}
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="pb-6 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}