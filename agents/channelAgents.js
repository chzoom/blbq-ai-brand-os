import { registerAgent } from './orchestrator.js';
import { generate } from '../ai/adapter.js';

const channels = [
  ['xhs', '小红书 Agent', 'xiaohongshu'],
  ['douyin', '抖音 Agent', 'douyin'],
  ['community', '社群 Agent', 'community'],
  ['moments', '朋友圈 Agent', 'moments'],
  ['marketing', '营销 Agent', 'xiaohongshu'],
  ['store', '门店 Agent', 'xiaohongshu'],
  ['analytics', '数据 Agent', 'xiaohongshu'],
  ['hot', '热点 Agent', 'xiaohongshu'],
  ['koc', 'KOC Agent', 'xiaohongshu']
];

for (const [id, label, platform] of channels) registerAgent({
  id,
  label,
  async run(input, options = {}) {
    return generate({
      task: input.task || 'post',
      context: { ...(input.context || {}), platform },
      extra: `${label}任务：${input.extra || '请根据当前上下文给出可执行方案。'}`,
      learning: input.learning || [],
      images: input.images || []
    }, options);
  }
});
