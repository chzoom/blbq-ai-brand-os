import { registerAgent } from './orchestrator.js';
import { loadBrandKnowledge } from '../knowledge/index.js';

export const brandAgent = registerAgent({
  id: 'brand',
  label: '品牌 Agent',
  async run(input) { return { text: await loadBrandKnowledge(input?.extraFiles || []), source: 'knowledge' }; }
});
