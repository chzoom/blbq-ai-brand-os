export const modelCatalog = [
  { id: 'gemini', name: 'Gemini', status: 'server-provider', fallback: 'local' },
  { id: 'beeapi', name: 'BeeAPI / OpenAI 兼容', status: 'server-provider', fallback: 'local' },
  { id: 'openai', name: 'OpenAI 兼容接口', status: 'server-provider', fallback: 'local' },
  { id: 'local', name: '本地专业引擎', status: 'local', fallback: null }
];

export const modelDefaults = { primary: 'gemini', secondary: 'local', timeoutMs: 45000 };
