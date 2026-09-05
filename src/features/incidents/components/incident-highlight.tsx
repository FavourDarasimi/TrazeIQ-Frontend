import type { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wrap case-insensitive substring matches in an indigo `<mark>` per
 * Design.md (search highlights use the accent — the one permitted
 * non-AI/brand use). Returns the plain text when there is no query.
 */
export function highlightIncidentMatch(
  text: string | null | undefined,
  query: string,
): ReactNode {
  if (!text) return text ?? "";
  const term = query.trim();
  if (term === "") return text;
  const pattern = new RegExp(`(${escapeRegExp(term)})`, "gi");
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="rounded bg-accent/20 px-0.5 text-accent"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
