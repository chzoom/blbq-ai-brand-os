const AI_ENDPOINT = '/.netlify/functions/ai';

export async function requestAI(payload, { signal } = {}) {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `AI 请求失败（${response.status}）`);
  return data.text || '';
}

export async function requestWithFallback(payload, localFallback, options) {
  try {
    return { text: await requestAI(payload, options), source: 'gemini' };
  } catch (error) {
    if (typeof localFallback !== 'function') throw error;
    return { text: await localFallback(error), source: 'local', error };
  }
}

window.BLBQAI = { requestAI, requestWithFallback };
