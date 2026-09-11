import { highlightToHast } from "@/features/docs/lib/shiki";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown> & {
    className?: string[];
  };
  children?: HastNode[];
  value?: string;
};

const SKIP_ANCESTORS = new Set(["CodeGroup", "ResponseExample"]);

function collectText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (!node.children) return "";
  return node.children.map(collectText).join("");
}

function langFromCodeNode(node: HastNode): string {
  const classes = node.properties?.className ?? [];
  for (const c of classes) {
    if (c.startsWith("language-")) return c.slice("language-".length);
  }
  return "text";
}

function jsxName(node: HastNode): string | null {
  // MDX JSX nodes surface as mdxJsxFlowElement / mdxJsxTextElement with `name`.
  const name = (node as HastNode & { name?: string }).name;
  return typeof name === "string" ? name : null;
}

async function visit(node: HastNode, ancestors: string[]): Promise<void> {
  const name = node.tagName ?? jsxName(node) ?? "";
  const next = [...ancestors, name];

  if (
    node.tagName === "pre" &&
    node.children?.length === 1 &&
    node.children[0].tagName === "code" &&
    !ancestors.some((a) => SKIP_ANCESTORS.has(a))
  ) {
    const codeNode = node.children[0];
    const raw = collectText(codeNode).replace(/\n$/, "");
    const highlighted = (await highlightToHast(raw, langFromCodeNode(codeNode))) as unknown as HastNode;
    // Keep the <pre> wrapper (styled by our `pre` component); swap in
    // shiki's highlighted <code> children.
    const hlCode = highlighted.children?.find((c) => c.tagName === "code");
    if (hlCode) {
      node.properties = {
        ...(node.properties ?? {}),
        className: [...((node.properties?.className as string[]) ?? []), "shiki"],
        style: (highlighted.properties as Record<string, unknown>)?.style,
      };
      node.children = [hlCode];
    }
    return;
  }

  if (node.children) {
    for (const child of node.children) {
      await visit(child, next);
    }
  }
}

/**
 * Rehype plugin: Shiki-highlight standalone fenced code blocks with the
 * github-dark theme. Blocks nested inside <CodeGroup>/<ResponseExample>
 * are skipped — those components highlight their own snippets server-side.
 */
export function rehypeShiki() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (tree: any) => {
    await visit(tree as HastNode, []);
  };
}
