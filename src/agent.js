// Simple agent state machine (client-side demo).
// For persistent 24/7 agents, move this logic to a backend service.

export class Agent {
  constructor(name, role = 'assistant') {
    this.name = name;
    this.role = role;
    this.status = 'idle';
    this.task = null;
  }

  assign(task) {
    this.task = task;
    this.status = 'working';
  }

  complete(result) {
    this.status = 'idle';
    this.task = null;
    return result;
  }

  toJSON() {
    return { name: this.name, role: this.role, status: this.status, task: this.task };
  }
}

export function createAgents(names = ['agent1', 'agent2']) {
  return names.map(n => new Agent(n));
}
