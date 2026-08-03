import { HugeiconsIcon } from "@hugeicons/react";
import {
  ActivityIcon,
  DatabaseIcon,
  ServerStackIcon,
  ZapIcon,
  NotificationSquareIcon,
  AiSearchIcon,
} from "@hugeicons/core-free-icons";

import { Container, Eyebrow } from "@/components/ui/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const stack = [
  {
    name: "Next.js",
    role: "realtime dashboard & app",
    Icon: ActivityIcon,
  },
{
    name: "Django REST",
    role: "ingestion API",
    Icon: ServerStackIcon,
  },
  {
    name: "PostgreSQL",
    role: "event + incident store",
    Icon: DatabaseIcon,
  },
  {
    name: "Celery + Redis",
    role: "async pipeline",
    Icon: ZapIcon,
  },
  {
    name: "Pusher",
    role: "live channel per project",
    Icon: NotificationSquareIcon,
  },
  {
    name: "OpenRouter",
    role: "free-tier LLM analysis",
    Icon: AiSearchIcon,
  },
];

export function TechStack() {
  return (
    <section className="border-t border-line bg-bg-panel">
      <Container className="py-16 sm:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
<Reveal className="md:max-w-xs">
            <Eyebrow>Built on</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              The stack behind the feed
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6 md:max-w-none md:flex-1">
            {stack.map(({ name, role, Icon }) => (
              <StaggerItem key={name} className="bg-bg-panel p-5">
                <HugeiconsIcon
                  icon={Icon}
                  size={20}
                  color="#FAFAFA"
                  strokeWidth={1.5}
                />
                <p className="mt-3 font-mono text-sm text-ink">{name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {role}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}