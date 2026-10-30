import {
  docEntries,
  docSections,
  type DocEntry,
  type DocHeading,
} from "../doc-registry";

export type { DocHeading };

export type DocMeta = {
  slug: string;
  title: string;
  description: string;
  section: string;
  sectionLabel: string;
  /** Global reading order across the whole site (prev/next follows it). */
  order: number;
};

export type DocGroup = {
  section: string;
  label: string;
  description: string;
  items: DocMeta[];
};

export type SearchEntry = {
  slug: string;
  anchor: string;
  title: string;
  section: string;
  kind: "page" | "heading";
};

const sectionById = new Map(docSections.map((s) => [s.id, s]));

/** Entries in reading order: section order, then page order. */
function sortedEntries(): DocEntry[] {
  return [...docEntries].sort(
    (a, b) =>
      (sectionById.get(a.section)?.order ?? 99) -
        (sectionById.get(b.section)?.order ?? 99) ||
      a.order - b.order ||
      a.title.localeCompare(b.title)
  );
}

function toMeta(entry: DocEntry, index: number): DocMeta {
  const section = sectionById.get(entry.section);
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    section: entry.section,
    sectionLabel: section?.label ?? "Docs",
    order: index,
  };
}

export function getAllDocs(): DocMeta[] {
  return sortedEntries().map(toMeta);
}

export function getDocGroups(): DocGroup[] {
  const groups: DocGroup[] = [];
  for (const section of [...docSections].sort((a, b) => a.order - b.order)) {
    groups.push({
      section: section.id,
      label: section.label,
      description: section.description,
      items: getAllDocs().filter((d) => d.section === section.id),
    });
  }
  return groups.filter((g) => g.items.length > 0);
}

export function getDocMeta(slug: string): DocMeta | null {
  return getAllDocs().find((d) => d.slug === slug) ?? null;
}

export function getPrevNext(slug: string): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const docs = getAllDocs();
  const i = docs.findIndex((d) => d.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: docs[i - 1] ?? null, next: docs[i + 1] ?? null };
}

/** The stub headings for a page's "On this page" rail. */
export function getHeadings(slug: string): DocHeading[] {
  return docEntries.find((d) => d.slug === slug)?.headings ?? [];
}

/** Page titles + heading anchors for the local cmd+K palette. */
export function getSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const entry of sortedEntries()) {
    const label = sectionById.get(entry.section)?.label ?? "Docs";
    entries.push({
      slug: entry.slug,
      anchor: "",
      title: entry.title,
      section: label,
      kind: "page",
    });
    for (const heading of entry.headings) {
      entries.push({
        slug: entry.slug,
        anchor: heading.id,
        title: heading.text,
        section: label,
        kind: "heading",
      });
    }
  }
  return entries;
}
