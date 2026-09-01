const endpoint = '/.netlify/functions/ai';

export async function generateWithGemini(payload, { signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('AI 请求超过 45 秒')), 45000);
  const forwardAbort = () => controller.abort(signal.reason || new Error('请求已取消'));
  if (signal) {
    if (signal.aborted) forwardAbort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('AI 请求超时或已取消，请使用本地兜底重试');
    throw new Error(`AI 网络请求失败：${error?.message || '无法连接服务'}`);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `AI 请求失败（${response.status}）`);
  return { text: data.text || '', provider: data.provider || 'online', model: data.model || '' };
}
