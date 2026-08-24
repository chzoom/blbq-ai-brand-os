const PREFIX = 'BLBQ_V15_';

function keyFor(key) {
  return key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
}

export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(keyFor(key));
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
    return value;
  },
  remove(key) {
    localStorage.removeItem(keyFor(key));
  },
  export(keys = []) {
    return JSON.stringify(Object.fromEntries(keys.map((key) => [key, this.get(key)])), null, 2);
  },
  import(serialized) {
    const values = JSON.parse(serialized);
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('存储数据格式不正确');
    Object.entries(values).forEach(([key, value]) => this.set(key, value));
    return values;
  }
};

window.BLBQStorage = storage;
