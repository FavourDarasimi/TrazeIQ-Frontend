import fs from "node:fs";
import path from "node:path";

export type DocMeta = {
  slug: string[];
  slugString: string;
  title: string;
  description: string;
  section: string;
  order: number;
};

export type DocGroup = { section: string; items: DocMeta[] };

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return { meta, body: match[2] };
}

function walk(dir: string, base: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.name.endsWith(".mdx")) out.push(path.relative(base, full));
  }
  return out;
}

export function getAllDocs(): DocMeta[] {
  const files = walk(CONTENT_DIR, CONTENT_DIR);
  const docs: DocMeta[] = files.map((rel) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, rel), "utf8");
    const { meta } = parseFrontmatter(raw);
    const slug = rel.replace(/\.mdx$/, "").split(path.sep);
    return {
      slug,
      slugString: slug.join("/"),
      title: meta.title ?? slug[slug.length - 1],
      description: meta.description ?? "",
      section: meta.section ?? "Docs",
      order: Number(meta.order ?? 99),
    };
  });
  docs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return docs;
}

export function getDocGroups(): DocGroup[] {
  const groups = new Map<string, DocMeta[]>();
  for (const doc of getAllDocs()) {
    if (!groups.has(doc.section)) groups.set(doc.section, []);
    groups.get(doc.section)!.push(doc);
  }
  return [...groups.entries()].map(([section, items]) => ({ section, items }));
}

export function getDocMeta(slugString: string): DocMeta | null {
  return getAllDocs().find((d) => d.slugString === slugString) ?? null;
}

export function getPrevNext(slugString: string): { prev: DocMeta | null; next: DocMeta | null } {
  const docs = getAllDocs();
  const i = docs.findIndex((d) => d.slugString === slugString);
  if (i === -1) return { prev: null, next: null };
  return { prev: docs[i - 1] ?? null, next: docs[i + 1] ?? null };
}
export type DocHeading = { id: string; text: string; depth: 2 | 3 };

export type SearchEntry = {
  slug: string;
  anchor: string;
  title: string;
  section: string;
  kind: "page" | "heading";
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Strip fenced code + imports so heading regexes only see prose. */
function proseOnly(body: string): string {
  return body
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("import "))
    .join("\n")
    .replace(/```[\s\S]*?```/g, "");
}

/** h2/h3 headings of an MDX body (mirrors rehype-slug ids). */
export function getHeadings(slugString: string): DocHeading[] {
  const body = getDocBody(slugString);
  if (!body) return [];
  const out: DocHeading[] = [];
  for (const line of proseOnly(body).split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const text = m[2].replace(/\*\*/g, "").trim();
    if (!text) continue;
    out.push({ id: slugify(text), text, depth: m[1].length === 2 ? 2 : 3 });
  }
  return out;
}

/** Page titles + headings index for the local cmd+K palette. */
export function getSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const doc of getAllDocs()) {
    entries.push({
      slug: doc.slugString,
      anchor: "",
      title: doc.title,
      section: doc.section,
      kind: "page",
    });
    for (const h of getHeadings(doc.slugString)) {
      entries.push({
        slug: doc.slugString,
        anchor: h.id,
        title: h.text,
        section: doc.section,
        kind: "heading",
      });
    }
  }
  return entries;
}
export function getDocBody(slugString: string): string | null {
  const file = path.join(CONTENT_DIR, ...slugString.split("/")) + ".mdx";
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  return parseFrontmatter(raw).body;
}
