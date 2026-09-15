const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (request, response) => {
  if (request.url === "/api/assistant" && request.method === "POST") {
    return handleAssistant(request, response);
  }

  if (request.method !== "GET") {
    response.writeHead(405);
    return response.end("Method not allowed");
  }

  const requestedPath = decodeURIComponent(request.url.split("?")[0]);
  const relativePath = requestedPath === "/" ? "/index.html" : requestedPath;
  const filePath = path.resolve(root, `.${relativePath}`);
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  try {
    const file = await fs.promises.readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

async function handleAssistant(request, response) {
  if (!process.env.GEMINI_API_KEY) {
    return sendJson(response, 503, { error: "AI is not configured. Set GEMINI_API_KEY before starting the server." });
  }

  try {
    const body = JSON.parse(await readBody(request));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return sendJson(response, 400, { error: "A message is required." });

    const history = Array.isArray(body.history)
      ? body.history.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-10)
      : [];
    const completion = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are Finance AI, a careful and friendly personal finance assistant. Answer using the user's finance data when relevant. Use the currency already formatted in the data. Be concise, explain calculations plainly, never invent missing facts, and do not present yourself as a licensed financial adviser." }]
        },
        contents: [
          { role: "user", parts: [{ text: `Here is the user's current local finance data:\n${JSON.stringify(body.financeData || {})}` }] },
          ...history.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }]
          })),
          { role: "user", parts: [{ text: message }] }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
      })
    });
    const result = await completion.json();
    if (!completion.ok) {
      const errorMessage = result.error?.message || (completion.status === 429
        ? "The Gemini free-tier limit has been reached. Please try again later."
        : "Gemini could not answer right now.");
      return sendJson(response, 502, { error: errorMessage });
    }
    const reply = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!reply) return sendJson(response, 502, { error: "Gemini returned an empty response." });
    return sendJson(response, 200, { reply });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "The assistant request failed." });
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

server.listen(port, () => {
  console.log(`Finance Tracker running at http://localhost:${port}`);
});