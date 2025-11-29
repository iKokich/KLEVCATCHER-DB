const STORAGE_KEY = 'sigma_rule_bookmarks';

export function readBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(bookmarks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new CustomEvent('bookmarks:updated', { detail: bookmarks }));
}

export function toggleBookmark(rule) {
  const current = readBookmarks();
  const exists = current.some((item) => item.id === rule.id);
  const next = exists
    ? current.filter((item) => item.id !== rule.id)
    : [{ id: rule.id, name: rule.name }, ...current];
  persist(next);
  return next;
}

export function isBookmarked(ruleId) {
  return readBookmarks().some((item) => item.id === ruleId);
}

export function clearBookmarks() {
  persist([]);
}

