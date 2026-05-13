const KEY = "koreanglow:reading_history";
const SESSION_KEY = "koreanglow:session_id";
const MAX = 20;

export type HistoryEntry = {
  slug: string;
  category: string | null;
  tags: string[];
  ts: number;
};

export function getReadingHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pushReadingHistory(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const list = getReadingHistory().filter((e) => e.slug !== entry.slug);
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function scoreRecommendations<T extends { slug: string; category: string | null; tags: string[] | null }>(
  posts: T[],
  history: HistoryEntry[],
): T[] {
  if (history.length === 0) return posts;
  const catWeight: Record<string, number> = {};
  const tagWeight: Record<string, number> = {};
  history.forEach((h, idx) => {
    const recency = 1 / (idx + 1);
    if (h.category) catWeight[h.category] = (catWeight[h.category] || 0) + recency * 2;
    (h.tags || []).forEach((t) => {
      tagWeight[t] = (tagWeight[t] || 0) + recency;
    });
  });
  const seen = new Set(history.map((h) => h.slug));
  return [...posts]
    .filter((p) => !seen.has(p.slug))
    .map((p) => {
      let s = 0;
      if (p.category && catWeight[p.category]) s += catWeight[p.category];
      (p.tags || []).forEach((t) => {
        if (tagWeight[t]) s += tagWeight[t];
      });
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}