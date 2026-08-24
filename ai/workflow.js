import { generate } from './adapter.js';

export async function generateNoteWorkflow(context, options = {}) {
  const base = { context, learning: options.learning || [], images: [] };
  const titles = await generate({ ...base, task: 'titles', extra: options.extra || '' });
  const post = await generate({ ...base, task: 'post', extra: `标题结果：\n${titles.text}` });
  const tags = await generate({ ...base, task: 'tags', extra: `标题：\n${titles.text}\n\n正文：\n${post.text}` });
  const replies = await generate({ ...base, task: 'replies', extra: `正文：\n${post.text}` });
  return { titles, post, tags, replies };
}

function formatWorkflow(result) {
  return Object.entries(result).map(([key, value]) => {
    const labels = { titles: '标题', post: '正文', tags: '标签', replies: '评论回复' };
    return `【${labels[key]}】\n${value.text}`;
  }).join('\n\n');
}

window.runWorkflow = async function runWorkflow() {
  const button = document.querySelector('[data-workflow]');
  if (button) { button.disabled = true; button.textContent = '正在生成整套笔记…'; }
  try {
    const result = await generateNoteWorkflow(window.ctx(), { learning: window.getLearn?.() });
    const text = formatWorkflow(result);
    window.setResult?.('createResult', text);
    window.renderV15ResultRail?.(text, { task: '一键生成笔记' });
    window.toast?.('整套笔记已生成');
  } catch (error) {
    window.toast?.(error.message || '工作流生成失败');
  } finally {
    if (button) { button.disabled = false; button.textContent = '一键生成笔记'; }
  }
};
