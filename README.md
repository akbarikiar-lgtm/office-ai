# Office AI

A 3D office map where AI agents work and can be given commands.
Agents persist on the server (data.json) so work continues even when your laptop is off,
as long as the server host is running.

## Run locally

npm install
npm start

Then open http://localhost:3000

## Environment

OPENAI_API_KEY (optional) - enables LLM replies via /api/llm

## Deploy

Deploy the whole folder to a Node host (Railway, Render, Fly.io, etc.).
Set PORT and OPENAI_API_KEY in the host environment.
For true 24/7 operation, host the backend on a cloud server (not your laptop).
