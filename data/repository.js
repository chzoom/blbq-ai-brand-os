import { dataStore } from './storage.js';

export const repository = {
  assets: () => dataStore.get('content-assets', []),
  saveAsset(asset) { return dataStore.append('content-assets', { ...asset, savedAt: new Date().toISOString() }); },
  metrics: () => dataStore.get('metrics', []),
  saveMetrics(metrics) { return dataStore.append('metrics', { ...metrics, savedAt: new Date().toISOString() }); },
  memories: () => dataStore.get('learning-memory', []),
  saveMemory(memory) { return dataStore.append('learning-memory', { ...memory, savedAt: new Date().toISOString() }); }
};
