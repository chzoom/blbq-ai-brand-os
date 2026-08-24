const promptFiles = {
  titles: 'title.md',
  post: 'article.md',
  tags: 'tag.md',
  replies: 'comment.md',
  diagnose: 'diagnose.md',
  breakdown: 'analysis.md',
  rewrite: 'rewrite.md'
};

const knowledgeFiles = ['brand.md', 'stores.md', 'menu.md', 'position.md', 'target.md', 'xiaohongshu.md'];
const cache = new Map();

async function readText(path) {
  if (cache.has(path)) return cache.get(path);
  const request = fetch(path).then((response) => response.ok ? response.text() : '').catch(() => '');
  cache.set(path, request);
  return request;
}

export async function loadPrompt(task) {
  return readText(`/prompts/${promptFiles[task] || 'article.md'}`);
}

export async function loadKnowledge() {
  const entries = await Promise.all(knowledgeFiles.map(async (file) => [file, await readText(`/knowledge/${file}`)]));
  return entries.filter(([, content]) => content).map(([file, content]) => `【${file}】\n${content}`).join('\n\n');
}
