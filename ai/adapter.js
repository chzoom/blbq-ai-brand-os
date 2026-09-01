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
    const response = await generateWithGemini(enriched, { signal });
    const text = typeof response === 'string' ? response : response.text;
    const provider = typeof response === 'string' ? 'online' : (response.provider || 'online');
    window.dispatchEvent(new CustomEvent('blbq:ai-status', { detail: { source: 'online', provider, model: response.model || '' } }));
    return { text, source: provider, provider, model: response.model || '' };
  } catch (error) {
    window.dispatchEvent(new CustomEvent('blbq:ai-status', { detail: { source: 'error', provider: 'online', error } }));
    if (payload.context?.mode !== 'auto') throw error;
    const text = generateWithLocal(payload.task, { reroll: false });
    return { text, source: 'local', error };
  }
}

export async function analyze(payload, options = {}) {
  return generate({ ...payload, task: payload.task || 'diagnose' }, options);
}

export async function vision(payload, options = {}) {
  return generate({ ...payload, task: payload.task || 'breakdown', images: payload.images || [] }, options);
}

export async function embed(payload) {
  const value = String(payload?.text || payload || '');
  return { vector: [...new TextEncoder().encode(value.slice(0, 512))].slice(0, 64), source: 'local-compatible' };
}

const AI = { generate, analyze, vision, embed };
if (typeof window !== 'undefined') window.BLBQAI = AI;
export default AI;
