"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { HeaderActions } from "@/components/ui/header-actions";

export function AppHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg-panel/95 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <HugeiconsIcon
            icon={Menu01Icon}
            size={22}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      </div>
      <HeaderActions />
    </header>
  );
}
