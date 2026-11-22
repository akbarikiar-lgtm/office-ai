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
if (!data.agents) data.agents = {};
if (!data.tasks) data.tasks = [];
if (Object.keys(data.agents).length === 0) {
  data.agents = {
    agent1: { name: 'agent1', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } },
    agent2: { name: 'agent2', status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } }
  };
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

app.post('/api/agents', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  if (data.agents[name]) return res.status(409).json({ error: 'exists' });
  data.agents[name] = { name, status: 'idle', task: null, pos: { x: 0, y: 0, z: 0 } };
  saveData(data);
  res.json(data.agents[name]);
});

app.delete('/api/agents/:name', (req, res) => {
  const name = req.params.name;
  if (!data.agents[name]) return res.status(404).json({ error: 'not found' });
  delete data.agents[name];
  saveData(data);
  res.json({ ok: true });
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

// Free/cheap LLM providers: Groq, Gemini, OpenAI
app.post('/api/llm', async (req, res) => {
  const { prompt } = req.body || {};
  // Groq (free tier, OpenAI-compatible)
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groq}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      return res.json({ reply: d.choices?.[0]?.message?.content || 'no reply', provider: 'groq' });
    } catch (e) { console.error('groq failed', e); }
  }
  // Gemini (free tier)
  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const d = await r.json();
      const reply = d.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.json({ reply: reply || 'no reply', provider: 'gemini' });
    } catch (e) { console.error('gemini failed', e); }
  }
  // OpenAI
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openai}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      return res.json({ reply: d.choices?.[0]?.message?.content || 'no reply', provider: 'openai' });
    } catch (e) { console.error('openai failed', e); }
  }
  res.json({ reply: 'No LLM configured. Set GROQ_API_KEY (free), GEMINI_API_KEY (free), or OPENAI_API_KEY.', provider: 'none' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Office AI server on http://localhost:' + port));
