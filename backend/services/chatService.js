const { GoogleGenerativeAI } = require("@google/generative-ai");

// Candidate models to attempt sequentially if primary model is unavailable
const DEFAULT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const generateResponse = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return `[Mock AI Response]: You said "${userMessage}". (Please set a valid GEMINI_API_KEY in backend/.env)`;
  }

  // Construct candidate list (custom GEMINI_MODEL env var prioritized if set)
  const candidateModels = [];
  if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim() !== "") {
    candidateModels.push(process.env.GEMINI_MODEL.trim());
  }
  for (const modelName of DEFAULT_MODELS) {
    if (!candidateModels.includes(modelName)) {
      candidateModels.push(modelName);
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(
        `Gemini model '${modelName}' failed (${error.message}). Trying next available model...`,
      );
      lastError = error;
    }
  }

  console.error("All candidate Gemini models failed. Last error:", lastError);
  throw new Error(
    `Failed to generate response from Gemini API: ${lastError ? lastError.message : "Unknown error"}`,
  );
};

module.exports = { generateResponse };
