const env = require("../config/env");

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_e) {
    return null;
  }
}

function extractText(responseJson) {
  const candidate = responseJson?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n").trim();
}

async function callGemini(prompt) {
  if (!env.geminiApiKey) {
    return null;
  }

  const model = env.geminiModel || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1800,
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      // eslint-disable-next-line no-console
      console.warn(`Gemini unavailable (${response.status}). Falling back.`, body);
      return null;
    }

    const data = await response.json();
    const text = extractText(data);
    if (!text) return null;

    const parsed = safeJsonParse(text);
    if (parsed) return parsed;

    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      const parsedFenced = safeJsonParse(fenced[1]);
      if (parsedFenced) return parsedFenced;
    }

    return { ai_raw_text: text };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Gemini call failed. Falling back.", error?.message || error);
    return null;
  }
}

module.exports = { callGemini };

