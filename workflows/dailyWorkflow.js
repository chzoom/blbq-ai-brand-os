import { registerWorkflow } from './engine.js';
import { runAgent } from '../agents/orchestrator.js';
import '../agents/ceoAgent.js';

export const dailyWorkflow = registerWorkflow({
  id: 'daily-operations',
  label: '每日运营工作流',
  async run(input, options = {}) {
    return runAgent('ceo', {
      context: input.context || {},
      goal: input.goal || '安排今天的内容、营销和复盘任务',
      learning: input.learning || [],
      extra: '不要声称掌握未提供的实时热点；列出需要人工确认的事实。'
    }, options);
  }
});
