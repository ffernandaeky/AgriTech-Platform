export interface TopicItem {
  label: string;
  slug: string;
}

export function titleCaseTopic(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function slugifyTopic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTopic(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function uniqueTopics(values: Array<string | null | undefined>): TopicItem[] {
  const topics = new Map<string, TopicItem>();

  values.forEach((value) => {
    if (!value) return;
    const label = titleCaseTopic(value);
    const slug = slugifyTopic(label);
    if (!slug) return;
    topics.set(slug, { label, slug });
  });

  return Array.from(topics.values()).sort((a, b) => a.label.localeCompare(b.label));
}
