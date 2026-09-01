import { registerWorkflow } from './engine.js';
import { runAgent } from '../agents/orchestrator.js';
import '../agents/contentAgent.js';

export const xhsWorkflow = registerWorkflow({
  id: 'xhs-note',
  label: '小红书完整笔记工作流',
  async run(input, options = {}) {
    const base = { ...input, context: { ...(input.context || {}), platform: 'xiaohongshu' } };
    const titles = await runAgent('content', { ...base, task: 'titles', extra: `${input.extra || ''}\n先给出标题策略。` }, options);
    const post = await runAgent('content', { ...base, task: 'post', extra: `标题结果：\n${titles.text}` }, options);
    const tags = await runAgent('content', { ...base, task: 'tags', extra: `标题：\n${titles.text}\n\n正文：\n${post.text}` }, options);
    const replies = await runAgent('content', { ...base, task: 'replies', extra: `正文：\n${post.text}` }, options);
    return { titles, post, tags, replies, workflow: 'xhs-note' };
  }
});
