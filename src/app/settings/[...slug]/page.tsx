"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants";

export default function SettingsCatchAll() {
  return (
    <EmptyState
      title="Settings page not found"
      body="The settings section you’re looking for doesn’t exist. Check the URL or return to the settings overview."
      action={
        <Link
          href={ROUTES.settings}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
        >
          Back to settings
        </Link>
      }
    />
  );
}
