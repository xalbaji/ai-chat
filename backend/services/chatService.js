const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ VALID models as of August 2026 — removed all dead/404 models
// Ordered by: cheapest/fastest first → premium last
const DEFAULT_MODELS = [
  "gemini-3.5-flash-lite",   // very cheap, very fast
  "gemini-3.1-flash-lite",   // ultra-cheap fallback
  "gemini-3.7-flash",        // newest GA
  "gemini-3.6-flash",        // good balance
  "gemini-3.5-flash",        // high quality
  "gemini-2.5-flash-lite",   // older but still valid
  "gemini-2.5-flash",        // older but still valid
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generateResponse = async (userMessage, imageFile = null, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Mock mode for missing key
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return {
      type: "text",
      reply: `[Mock AI Response]: You said "${userMessage}". (Please set a valid GEMINI_API_KEY in backend/.env)`,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // ─── IMAGE GENERATION (Imagen) ───
  const isImagePrompt =
    !imageFile &&
    /\b(generate|create|draw|make|render)\b.*\b(image|photo|picture|art|illustration)\b/i.test(
      userMessage || ""
    );

  if (isImagePrompt) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const imgResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: userMessage }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            outputMimeType: "image/jpeg",
          },
        }),
      });

      const imgData = await imgResponse.json();

      if (!imgResponse.ok) {
        throw new Error(imgData.error?.message || `HTTP ${imgResponse.status}`);
      }

      const base64Image = imgData.predictions?.[0]?.bytesBase64Encoded;
      if (base64Image) {
        return {
          type: "image",
          reply: `Here is your generated image for: "${userMessage}"`,
          generatedImage: `data:image/jpeg;base64,${base64Image}`,
        };
      }
    } catch (imgError) {
      console.warn("Imagen generation failed, falling back to Gemini text models:", imgError.message);
    }
  }

  // ─── BUILD CANDIDATE MODEL LIST ───
  const candidateModels = [];
  if (process.env.GEMINI_MODEL?.trim()) {
    candidateModels.push(process.env.GEMINI_MODEL.trim());
  }
  for (const m of DEFAULT_MODELS) {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  }

  // ─── FORMAT HISTORY ───
  const formattedHistory = history
    .filter((msg) => msg && typeof msg.content === "string" && msg.content.trim().length > 0)
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content.trim() }],
    }));

  // ─── BUILD CURRENT TURN ───
  const currentParts = [];
  if (imageFile) {
    currentParts.push({
      inlineData: {
        data: imageFile.buffer.toString("base64"),
        mimeType: imageFile.mimetype,
      },
    });
  }
  if (userMessage?.trim()) {
    currentParts.push(userMessage.trim());
  }
  if (imageFile && currentParts.length === 1) {
    currentParts.push("Describe this image in detail.");
  }

  // ─── TRY MODELS SEQUENTIALLY ───
  let lastError = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const modelName = candidateModels[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      let responseText = "";

      if (imageFile) {
        const result = await model.generateContent(currentParts);
        responseText = (await result.response).text();
      } else {
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(userMessage || "Hello");
        responseText = (await result.response).text();
      }

      if (responseText?.trim()) {
        return { type: "text", reply: responseText.trim() };
      }
    } catch (error) {
      lastError = error;
      const msg = error.message || "";
      const isQuota = error.status === 429 || msg.includes("quota") || msg.includes("Too Many Requests");
      const isDead = error.status === 404 || msg.includes("not found") || msg.includes("no longer available");

      if (isQuota) {
        console.log(`[Quota] ${modelName} exhausted — trying next...`);
      } else if (isDead) {
        console.log(`[Dead] ${modelName} is deprecated — skipping...`);
      } else {
        console.log(`[Error] ${modelName}: ${msg}`);
      }

      // Small delay before next model to avoid burst-rate limits
      if (i < candidateModels.length - 1) await sleep(500);
    }
  }

  // ─── ALL MODELS FAILED ───
  console.error("All candidate Gemini models failed. Last error:", lastError);

  // Return a friendly message instead of throwing, so the frontend can display it
  const isQuotaExhausted = lastError?.message?.includes("quota") || lastError?.status === 429;
  if (isQuotaExhausted) {
    return {
      type: "text",
      reply:
        "⏳ You've reached the daily free limit on all available Gemini models.\n\n" +
        "Please wait ~24 hours for the quota to reset, or upgrade to a paid plan at ai.google.dev.",
    };
  }

  return {
    type: "text",
    reply: "❌ Something went wrong while connecting to the AI. Please try again in a moment.",
  };
};

module.exports = { generateResponse };