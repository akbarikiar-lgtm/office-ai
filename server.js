const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory agent state (replace with DB for persistence)
const agents = {
  agent1: { name: 'agent1', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } },
  agent2: { name: 'agent2', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } }
};

app.get('/api/agents', (req, res) => {
  res.json(Object.values(agents));
});

app.post('/api/command', (req, res) => {
  const { agent, command } = req.body || {};
  const a = agents[agent];
  if (!a) return res.status(404).json({ error: 'agent not found' });
  a.status = 'working';
  a.task = command;
  // TODO: enqueue real work (LLM, tools) here
  setTimeout(() => { a.status = 'idle'; a.task = null; }, 3000);
  res.json(a);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Office AI server on http://localhost:' + port));
