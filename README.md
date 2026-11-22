# Office AI

A 3D office map where AI agents work and can be given commands.
Agents persist on the server (data.json) so work continues even when your laptop is off,
as long as the server host is running.

## Run locally

npm install
npm start

Then open http://localhost:3000

## Create agents

Use the UI to add agents by name. They are stored on the server.

## Free LLM APIs

Set one of these environment variables:
- GROQ_API_KEY (free tier) - https://console.groq.com
- GEMINI_API_KEY (free tier) - https://aistudio.google.com
- OPENAI_API_KEY (paid) - https://platform.openai.com

## Deploy

Deploy to a Node host (Railway, Render, Fly.io). Set PORT and an API key.
For 24/7 operation, host on a cloud server.
