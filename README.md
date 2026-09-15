# Finance Tracker

## AI assistant setup

The Overview page includes a Finance AI chat view. The browser sends chat requests to `/api/assistant`, which forwards them to OpenAI without exposing the API key.

For a Vercel deployment:

1. Deploy this repository to Vercel.
2. Add an environment variable named `OPENAI_API_KEY` in the Vercel project settings.
3. Redeploy the project.

The optional `OPENAI_MODEL` variable defaults to `gpt-4o-mini`.

For local testing, set `OPENAI_API_KEY` in your terminal and run `node server.js`, then open `http://localhost:3000`.

The assistant will show a configuration message until `OPENAI_API_KEY` is available. Opening the HTML directly with a `file://` URL can display the chat UI, but it cannot reach the `/api/assistant` endpoint.
