import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

import { Container, SectionHeader } from "@/components/ui/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const faqs = [
  {
    q: "Does TrazeIQ replace Datadog or New Relic?",
    a: "For the core job — error collection, grouping, incident tracking, and alerting — yes, for a fraction of the cost. It's not an enterprise APM: it doesn't do distributed tracing or per-seat enterprise licensing. It does the part small teams actually use: 'what broke, where, and who needs to know'.",
  },
  {
    q: "Will error reporting slow down my app?",
    a: "No. TrazeIQ provides non-blocking zero-dependency SDKs for Node/TypeScript and Python that fire-and-forget each event with a short timeout (2s default), no retries — and capture calls never throw, so a monitoring failure can't break your app.",
  },
  {
    q: "How do you keep my stack traces safe?",
    a: "Secrets (tokens, API keys, passwords) are automatically redacted before anything is persisted, keys are hashed, integration credentials are encrypted at rest, and every query is strictly scoped to your organization.",
  },
  {
    q: "Do I have to host anything?",
    a: "No. TrazeIQ is a hosted platform — you just POST errors from your application to the ingestion endpoint. If you'd rather self-host, the backend (Django REST + PostgreSQL) is lightweight and designed to run on a single small instance.",
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