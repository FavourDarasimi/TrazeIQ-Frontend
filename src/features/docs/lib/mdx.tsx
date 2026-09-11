import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { getDocBody } from "./docs";
import { rehypeShiki } from "./rehype-shiki";
import { HeadingAnchor } from "../components/docs-anchor";
import { Callout } from "../components/docs-callout";
import { CodeGroup } from "../components/docs-code-group";
import { Step, Steps } from "../components/docs-steps";
import { ParamTable, ResponseExample } from "../components/docs-reference-new";

function DocsH2({ id, children }: { id?: string; children: React.ReactNode }) {
  if (!id) return <h2 className="text-2xl font-semibold tracking-tight text-ink">{children}</h2>;
  return (
    <h2 id={id} className="group flex scroll-mt-28 items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
      <span>{children}</span>
      <HeadingAnchor id={id} label={String(children)} />
    </h2>
  );
}

function DocsH3({ id, children }: { id?: string; children: React.ReactNode }) {
  if (!id) return <h3 className="text-sm font-semibold tracking-tight text-ink">{children}</h3>;
  return (
    <h3 id={id} className="group flex scroll-mt-28 items-center gap-2 text-base font-semibold tracking-tight text-ink">
      <span className="underline decoration-transparent underline-offset-4 group-hover:decoration-line-soft">
        {children}
      </span>
      <HeadingAnchor id={id} label={String(children)} />
    </h3>
  );
}

const mdxComponents = {
  h2: DocsH2,
  h3: DocsH3,
  CodeGroup,
  Steps,
  Step,
  Callout,
  ParamTable,
  ResponseExample,
};

function stripImports(body: string): string {
  return body
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("import "))
    .join("\n");
}

/**
 * Render an MDX doc body to React. Component imports are stripped from the
 * source — everything authors need is provided via the components map, so
 * content authors never touch React or import paths.
 */
export async function MdxBody({ slug }: { slug: string }) {
  const body = getDocBody(slug);
  if (!body) return null;

  const { content } = await compileMDX({
    source: stripImports(body),
    options: {
      // Allow JS expressions in component props (tabs={[...]},
      // params={[...]}) — content is internal, and dangerous-call
      // filtering stays on. Without this, next-mdx-remote strips every
      // non-string attribute and CodeGroup/ParamTable get undefined.
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // rehypeSlug gives h2/h3 their ids; rehypeShiki highlights
        // standalone fenced blocks (github-dark), skipping CodeGroup.
        rehypePlugins: [rehypeSlug, rehypeShiki],
      },
    },
    components: mdxComponents,
  });

  return (
    <div className="mdx-body flex flex-col gap-6 text-[15px] leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-soft [&_a]:underline-offset-2 hover:[&_a]:decoration-ink [&_h2]:mt-4 [&_h3]:mt-2 [&_li]:text-muted [&_ol:not(.relative)]:flex [&_ol:not(.relative)]:list-decimal [&_ol:not(.relative)]:flex-col [&_ol:not(.relative)]:gap-2 [&_ol:not(.relative)]:pl-6 [&_p]:text-muted [&_strong]:text-ink [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-surface [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[12.5px] [&_:not(pre)>code]:text-ink">
      {content}
    </div>
  );
}
