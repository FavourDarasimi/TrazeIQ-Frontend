import { HugeiconsIcon } from "@hugeicons/react";
import {
  KeyIcon,
  ShieldKeyIcon,
  LockIcon,
  NotificationSquareIcon,
  DatabaseIcon,
  AlienIcon,
} from "@hugeicons/core-free-icons";

import { Container, Eyebrow } from "./shared";
import { Reveal, Stagger, StaggerItem } from "./motion";

const items = [
  {
    Icon: KeyIcon,
    title: "Keys hashed at rest",
    body: "API keys are stored as hashes, shown exactly once, and rotatable on demand.",
  },
  {
    Icon: ShieldKeyIcon,
    title: "Secret redaction",
    body: "SECRET_KEY=, tokens, and JWTs are scrubbed from stack traces before storage or AI.",
  },
  {
    Icon: LockIcon,
    title: "Tenant isolation",
    body: "Every query is scoped to your organization — covered by tests, not just a permission class.",
  },
  {
    Icon: NotificationSquareIcon,
    title: "Private realtime channels",
    body: "Pusher channel access is authorized server-side per project. Secrets never reach the browser.",
  },
  {
    Icon: DatabaseIcon,
    title: "Encrypted credentials",
    body: "Slack and OAuth tokens are encrypted at rest, never stored in plaintext.",
  },
  {
    Icon: AlienIcon,
    title: "Prompt-injection defense",
    body: "Error content is treated as data. Instructions buried in a stack trace don't execute.",
  },
];

export function Security() {
  return (
    <section
      id="security"
      className="scroll-mt-20 border-y border-line bg-bg-panel"
    >
      <Container className="grid items-start gap-12 py-14 sm:py-28 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6">
          <Eyebrow>Security</Eyebrow>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            A monitoring tool that can&apos;t leak
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted">
            Stack traces are the most erratic payload on your network — they
            smuggle credentials, tokens, and attacker-controlled strings. So
            the pipeline treats every error as hostile input from the moment it
            arrives.
          </p>
          <div className="rounded-2xl border border-line bg-bg p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Redaction guarantees
            </p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-ink/80">
              <span className="text-muted">$</span> grep -rn{" "}
              {"\"SECRET_KEY\\|sk-\""} .trazeiq
              <br />
              <span className="text-ok">0 matches</span> — keys never leave
              the env file
            </p>
          </div>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2">
          {items.map(({ title, body, Icon }) => (
            <StaggerItem
              key={title}
              className="rounded-xl border border-line bg-bg p-5"
            >
              <div className="flex items-center gap-2 text-ink">
                <HugeiconsIcon
                  icon={Icon}
                  size={18}
                  color="#4F46E5"
                  strokeWidth={1.5}
                  className="shrink-0"
                />
                <h3 className="text-sm font-medium">{title}</h3>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}