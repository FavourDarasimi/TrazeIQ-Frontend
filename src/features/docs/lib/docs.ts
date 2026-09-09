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
export function getDocBody(slugString: string): string | null {
  const file = path.join(CONTENT_DIR, ...slugString.split("/")) + ".mdx";
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  return parseFrontmatter(raw).body;
}
