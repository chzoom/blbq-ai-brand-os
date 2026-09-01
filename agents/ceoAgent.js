import { registerAgent } from './orchestrator.js';
import { generate } from '../ai/adapter.js';

export const ceoAgent = registerAgent({
  id: 'ceo',
  label: 'AI 运营总监',
  async run(input, options = {}) {
    const context = input.context || {};
    return generate({
      task: 'post',
      context,
      extra: `你是饱里宝气 AI 运营总监。\n目标：${input.goal || '安排今天最重要的运营动作'}\n请输出：判断、优先级、执行步骤、适合账号、需要核实的事实。${input.extra || ''}`,
      learning: input.learning || []
    }, options);
  }
});
