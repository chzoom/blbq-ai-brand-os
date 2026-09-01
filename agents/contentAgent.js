import { registerAgent } from './orchestrator.js';
import { generate } from '../ai/adapter.js';

export const contentAgent = registerAgent({
  id: 'content',
  label: '内容 Agent',
  async run(input, options = {}) {
    const task = input.task || 'post';
    return generate({ task, context: input.context || {}, extra: input.extra || '', learning: input.learning || [], images: input.images || [] }, options);
  }
});
