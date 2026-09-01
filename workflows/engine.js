const workflows = new Map();

export function registerWorkflow(workflow) {
  if (!workflow?.id || typeof workflow.run !== 'function') throw new Error('Workflow 必须包含 id 和 run()');
  workflows.set(workflow.id, workflow);
  return workflow;
}
export function getWorkflow(id) { return workflows.get(id); }
export function listWorkflows() { return [...workflows.values()].map(({ id, label, enabled = true }) => ({ id, label, enabled })); }
export async function runWorkflow(id, input, options = {}) {
  const workflow = getWorkflow(id);
  if (!workflow || workflow.enabled === false) throw new Error(`Workflow 未启用：${id}`);
  return workflow.run(input, options);
}
export const WorkflowEngine = { registerWorkflow, getWorkflow, listWorkflows, runWorkflow };
