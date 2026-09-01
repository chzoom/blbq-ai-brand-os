const agents = new Map();

export function registerAgent(agent) {
  if (!agent?.id || typeof agent.run !== 'function') throw new Error('Agent 必须包含 id 和 run()');
  agents.set(agent.id, agent);
  return agent;
}

export function getAgent(id) { return agents.get(id); }
export function listAgents() { return [...agents.values()].map(({ id, label, enabled = true }) => ({ id, label, enabled })); }

export async function runAgent(id, input, options = {}) {
  const agent = getAgent(id);
  if (!agent || agent.enabled === false) throw new Error(`Agent 未启用：${id}`);
  return agent.run(input, { ...options, agents });
}

export const AgentOrchestrator = { registerAgent, getAgent, listAgents, runAgent };
