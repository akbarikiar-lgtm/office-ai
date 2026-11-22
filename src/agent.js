// Agent state machine. Used by client demo and mirrored by backend.

export class Agent {
  constructor(name, role = 'assistant') {
    this.name = name;
    this.role = role;
    this.status = 'idle';
    this.task = null;
    this.result = null;
    this.history = [];
    this.pos = { x: 0, y: 0, z: 0 };
  }

  assign(task) {
    this.task = task;
    this.status = 'working';
  }

  complete(result) {
    this.status = 'idle';
    this.task = null;
    this.result = result;
    if (result) this.history.push({ role: 'assistant', content: result });
    return result;
  }

  toJSON() {
    return { name: this.name, role: this.role, status: this.status, task: this.task, result: this.result, history: this.history, pos: this.pos };
  }
}

export function createAgents(names = ['agent1', 'agent2']) {
  return names.map(n => new Agent(n));
}
