# Finance Tracker

## AI assistant setup

The Overview page includes a Finance AI chat view. The browser sends chat requests to `/api/assistant`, which forwards them to Google Gemini without exposing the API key.

For a Vercel deployment:

1. Deploy this repository to Vercel.
2. Add an environment variable named `GEMINI_API_KEY` in the Vercel project settings. Create the key in Google AI Studio.
3. Redeploy the project.

The optional `GEMINI_MODEL` variable defaults to `gemini-3.5-flash-lite`, a lightweight model suitable for the free tier.

For local testing, set `GEMINI_API_KEY` in your terminal and run `node server.js`, then open `http://localhost:3000`.

The assistant will show a configuration message until `GEMINI_API_KEY` is available. A `429` response means the Gemini free-tier quota has been reached. Opening the HTML directly with a `file://` URL can display the chat UI, but it cannot reach the `/api/assistant` endpoint.
