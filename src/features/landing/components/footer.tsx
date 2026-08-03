import { Container } from "@/components/ui/shared";
import { Logo } from "./navbar";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "#dashboard" },
      { label: "AI Assistant", href: "#ai-assistant" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-panel">
      <Container className="py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The AI nervous system for your applications.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 sm:gap-16">
            {columns.map(({ heading, links }) => (
              <div key={heading}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  {heading}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-ink/80 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-muted">
            © {new Date().getFullYear()} TrazeIQ · error intelligence for
            small teams
          </p>
          <p className="font-mono text-[11px] text-muted">
            built on open-source free tiers — from the start
          </p>
        </div>
      </Container>
    </footer>
  );
}