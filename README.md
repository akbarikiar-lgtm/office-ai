# Office AI

A 3D office map where AI agents work and can be given commands.
The frontend is a Three.js scene; long-running agent work should run on a server
so it continues even when your laptop is off.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Structure

- `index.html` - 3D office scene + command input
- `src/agent.js` - simple agent state machine (client-side demo)

## Next steps

- Add a backend (Node/Python) for persistent agents.
- Connect an LLM API for real agent reasoning.
- Deploy backend to a cloud host (Vercel, Railway, etc.).
