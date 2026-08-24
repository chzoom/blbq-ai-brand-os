export function generateWithLocal(task, { reroll = false } = {}) {
  if (['diagnose', 'breakdown'].includes(task) && typeof window.localAnalyzeGenerate === 'function') {
    return window.localAnalyzeGenerate(reroll);
  }
  if (typeof window.localGenerate === 'function') return window.localGenerate(task, reroll);
  throw new Error('本地引擎尚未加载');
}
