export interface ContentItem {
  id: string;
  contentType: string;
  title: string;
  category: string;
  focusAreas: string[];
  contentLink: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CONTENT_TYPES = [
  "Audio",
  "Video",
  "Reading",
  "Exercise",
  "Collection",
];

export const CATEGORIES = [
  "Balance",
  "Communication",
  "Empowerment",
  "Performance",
  "Presence",
  "Purpose",
];

export const FOCUS_AREAS = [
  "Appreciation",
  "Authenticity",
  "Centeredness",
  "Collaboration",
  "Communication",
  "Conflict Management",
  "Delegation",
  "Emotional Intelligence",
  "Emotional Regulation",
  "Feedback",
  "Goal Setting",
  "Growth Mindset",
  "Mindfulness",
  "Motivation",
  "Problem Solving",
  "Resilience",
  "Time Management",
  "Values",
  "Vision",
];

const STORAGE_KEY = "mantracoach-cms-content";

export function getContent(): ContentItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getContentById(id: string): ContentItem | undefined {
  return getContent().find((item) => item.id === id);
}

export function saveContent(item: ContentItem): void {
  const items = getContent();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function deleteContent(id: string): void {
  const items = getContent().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
