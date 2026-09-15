const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({
      error: "AI is not configured yet. Add GEMINI_API_KEY to your deployment environment."
    });
  }

  const { message, history = [], financeData = {} } = request.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return response.status(400).json({ error: "A message is required." });
  }

  const safeHistory = Array.isArray(history)
    ? history.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-10)
    : [];

  const completion = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "You are Finance AI, a careful and friendly personal finance assistant. Answer using the user's finance data when relevant. Use the currency already formatted in the data. Be concise, explain calculations plainly, never invent missing facts, and do not present yourself as a licensed financial adviser. If the data is insufficient, say what is missing." }]
      },
      contents: [
        { role: "user", parts: [{ text: `Here is the user's current local finance data:\n${JSON.stringify(financeData)}` }] },
        ...safeHistory.map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }]
        })),
        { role: "user", parts: [{ text: message.trim() }] }
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
    })
  });

  const result = await completion.json();
  if (!completion.ok) {
    const errorMessage = result.error?.message || (completion.status === 429
      ? "The Gemini free-tier limit has been reached. Please try again later."
      : "Gemini could not answer right now.");
    return response.status(502).json({ error: errorMessage });
  }

  const reply = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!reply) return response.status(502).json({ error: "Gemini returned an empty response." });
  return response.status(200).json({ reply });
}
