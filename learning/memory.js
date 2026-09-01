import { repository } from '../data/repository.js';

export function remember(item) { return repository.saveMemory({ ...item, kind: item.kind || 'content' }); }
export function recall({ kind, limit = 20 } = {}) { return repository.memories().filter((item) => !kind || item.kind === kind).slice(0, limit); }
