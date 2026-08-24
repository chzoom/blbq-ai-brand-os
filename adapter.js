import { loadKnowledge, loadPrompt } from './promptLoader.js';
import { generateWithGemini } from './gemini.js';
import { generateWithLocal } from './local.js';

function contextPayload(payload) {
  return {
    ...payload,
    extra: payload.extra || '',
    images: payload.images || [],
    learning: payload.learning || []
  };
}

export async function generate(payload, { signal } = {}) {
  if (payload.context?.mode === 'local') {
    return { text: generateWithLocal(payload.task, { reroll: false }), source: 'local' };
  }
  const [prompt, knowledge] = await Promise.all([
    loadPrompt(payload.task).catch(() => ''),
    loadKnowledge().catch(() => '')
  ]);
  const enriched = contextPayload({
    ...payload,
    extra: `${payload.extra || ''}\n\n任务 Prompt：\n${prompt}\n\n品牌知识库：\n${knowledge}`
  });

  try {
    const text = await generateWithGemini(enriched, { signal });
    window.dispatchEvent(new CustomEvent('blbq:ai-status', { detail: { source: 'gemini' } }));
    return { text, source: 'gemini' };
  } catch (error) {
    window.dispatchEvent(new CustomEvent('blbq:ai-status', { detail: { source: 'error', error } }));
    if (payload.context?.mode !== 'auto') throw error;
    const text = generateWithLocal(payload.task, { reroll: false });
    return { text, source: 'local', error };
  }
}

window.BLBQAI = { generate };
