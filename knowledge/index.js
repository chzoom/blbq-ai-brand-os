const files = ['brand.md', 'position.md', 'stores.md', 'menu.md', 'target.md', 'accounts.md', 'xiaohongshu.md', 'delivery.md'];
const cache = new Map();

async function read(path) {
  if (cache.has(path)) return cache.get(path);
  const result = fetch(path, { cache: 'no-store' }).then((r) => r.ok ? r.text() : '').catch(() => '');
  cache.set(path, result);
  return result;
}

export async function loadBrandKnowledge(extraFiles = []) {
  const entries = await Promise.all([...files, ...extraFiles].filter((v, i, a) => a.indexOf(v) === i).map(async (file) => [file, await read(`knowledge/${file}`)]));
  return entries.filter(([, value]) => value).map(([file, value]) => `【${file}】\n${value}`).join('\n\n');
}

export const knowledgeFiles = files;
