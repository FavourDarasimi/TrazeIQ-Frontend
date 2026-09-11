import { CodeTabSwitcher } from "./docs-code-tabs";
import { highlightToHtml } from "../lib/shiki";
import type { DocsCodeTab } from "./docs-code";

const TAB_LABELS: Record<string, string> = {
  curl: "cURL",
  js: "JavaScript",
  node: "Node",
  python: "Python",
  go: "Go",
  json: "JSON",
  bash: "Shell",
};

/**
 * Server CodeGroup: Shiki-highlights every tab at render time
 * (github-dark), then hands pre-rendered HTML to the client tab switcher.
 * Tab state is global — switching one block switches all blocks page-wide.
 *
 * MDX usage:
 *   <CodeGroup label="fire the first event" tabs={[{lang, label?, code}]} />
 * `label` per tab is optional; it defaults from the lang map above.
 */
export async function CodeGroup(props: {
  label: string;
  tabs: Array<{ lang: string; label?: string; code: string }>;
}) {
  const { label, tabs } = props;
  const highlighted = await Promise.all(
    (tabs as DocsCodeTab[]).map(async (tab) => ({
      lang: tab.lang,
      label: tab.label || TAB_LABELS[tab.lang] || tab.lang,
      code: tab.code,
      html: await highlightToHtml(tab.code, tab.lang),
    }))
  );
  return <CodeTabSwitcher label={label} tabs={highlighted} />;
}
