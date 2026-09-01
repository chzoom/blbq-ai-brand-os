const PREFIX = 'BLBQ_OS_';

export const dataStore = {
  get(key, fallback = null) {
    try { const raw = localStorage.getItem(`${PREFIX}${key}`); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value)); } catch {} return value; },
  remove(key) { try { localStorage.removeItem(`${PREFIX}${key}`); } catch {} },
  append(key, value, limit = 200) { const list = this.get(key, []); return this.set(key, [value, ...list].slice(0, limit)); }
};
