import { remember } from './memory.js';

export function learnFromResult({ type, content, note = '', score = null, context = {} }) {
  if (!content) return null;
  return remember({ kind: type || 'content', content, note, score, context });
}
