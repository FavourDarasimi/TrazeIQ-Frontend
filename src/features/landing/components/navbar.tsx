"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/shared";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

const links = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "/docs" },
];

export function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a href={href} className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-ink" />
      </span>
      <span className="font-mono text-[15px] font-semibold tracking-tight text-ink">
        traze<span className="text-accent">iq</span>
      </span>
    </a>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { status } = useAuth();
  const authenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={authenticated ? ROUTES.dashboard : ROUTES.login}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            {authenticated ? "Dashboard" : "Sign in"}
          </a>
          <a
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
          >
            Start Monitoring
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink md:hidden"
        >
          <HugeiconsIcon
            icon={open ? Cancel01Icon : Menu01Icon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      </Container>

      {open ? (
        <div className="border-t border-line bg-bg-panel md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              <a
                href={authenticated ? ROUTES.dashboard : ROUTES.login}
                className="rounded-lg border border-line px-3 py-2.5 text-center text-sm text-ink"
              >
                {authenticated ? "Dashboard" : "Sign in"}
              </a>
              <a
                href="/register"
                className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-medium text-ink"
              >
                Start Monitoring
              </a>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
