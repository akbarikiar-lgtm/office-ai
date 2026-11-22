const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {}
  return { agents: {}, tasks: [] };
}

function saveData(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch (e) { console.error('save failed', e); }
}

let data = loadData();
if (!data.agents || Object.keys(data.agents).length === 0) {
  data.agents = {
    agent1: { name: 'agent1', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } },
    agent2: { name: 'agent2', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } }
  };
  data.tasks = [];
  saveData(data);
}

function processTasks() {
  const now = Date.now();
  data.tasks.forEach(t => {
    if (t.status === 'queued') {
      t.status = 'working';
      t.startedAt = now;
      const a = data.agents[t.agent];
      if (a) { a.status = 'working'; a.task = t.command; }
    }
    if (t.status === 'working' && t.startedAt && now - t.startedAt > 4000) {
      t.status = 'done';
      t.finishedAt = now;
      const a = data.agents[t.agent];
      if (a) { a.status = 'idle'; a.task = null; }
    }
  });
  saveData(data);
}
setInterval(processTasks, 1000);

app.get('/api/agents', (req, res) => {
  res.json(Object.values(data.agents));
});

app.get('/api/tasks', (req, res) => {
  res.json(data.tasks.slice(-50));
});

app.post('/api/command', (req, res) => {
  const { agent, command } = req.body || {};
  const a = data.agents[agent];
  if (!a) return res.status(404).json({ error: 'agent not found' });
  const task = { id: Date.now().toString(36), agent, command, status: 'queued', createdAt: Date.now() };
  data.tasks.push(task);
  saveData(data);
  res.json(task);
});

app.post('/api/llm', async (req, res) => {
  const { prompt } = req.body || {};
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.json({ reply: 'LLM not configured. Set OPENAI_API_KEY.' });
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    res.json({ reply: d.choices?.[0]?.message?.content || 'no reply' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Office AI server on http://localhost:' + port));
