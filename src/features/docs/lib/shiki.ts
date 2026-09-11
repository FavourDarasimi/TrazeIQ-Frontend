import { codeToHast, codeToHtml, createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

export const SHIKI_THEME = "github-dark";

// MDX fence label -> shiki grammar
const LANG_ALIASES: Record<string, string> = {
  curl: "bash",
  sh: "bash",
  shell: "bash",
  js: "javascript",
  node: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  yml: "yaml",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEME],
      langs: [
        "bash",
        "javascript",
        "typescript",
        "python",
        "go",
        "json",
        "yaml",
        "http",
        "text",
      ],
    });
  }
  return highlighterPromise;
}

export function resolveShikiLang(lang: string): string {
  const l = (lang || "text").toLowerCase();
  return LANG_ALIASES[l] ?? l;
}

/** Full <pre> HTML string for a snippet (used by tabbed CodeGroup). */
export async function highlightToHtml(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang: resolveShikiLang(lang),
    theme: SHIKI_THEME,
  });
}

/** Hast <pre> node for a snippet (used by the rehype plugin). */
export async function highlightToHast(code: string, lang: string) {
  const hl = await getHighlighter();
  return hl.codeToHast(code, {
    lang: resolveShikiLang(lang),
    theme: SHIKI_THEME,
  });
}

export { codeToHast, codeToHtml };
