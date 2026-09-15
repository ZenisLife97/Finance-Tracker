const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({
      error: "AI is not configured yet. Add OPENAI_API_KEY to your deployment environment."
    });
  }

  const { message, history = [], financeData = {} } = request.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return response.status(400).json({ error: "A message is required." });
  }

  const safeHistory = Array.isArray(history)
    ? history.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-10)
    : [];

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: "You are Finance AI, a careful and friendly personal finance assistant. Answer using the user's finance data when relevant. Use the currency already formatted in the data. Be concise, explain calculations plainly, never invent missing facts, and do not present yourself as a licensed financial adviser. If the data is insufficient, say what is missing."
        },
        {
          role: "user",
          content: `Here is the user's current local finance data:\n${JSON.stringify(financeData)}`
        },
        ...safeHistory,
        { role: "user", content: message.trim() }
      ]
    })
  });

  const result = await completion.json();
  if (!completion.ok) {
    return response.status(502).json({ error: result.error?.message || "OpenAI could not answer right now." });
  }

  const reply = result.choices?.[0]?.message?.content?.trim();
  if (!reply) return response.status(502).json({ error: "OpenAI returned an empty response." });
  return response.status(200).json({ reply });
}
