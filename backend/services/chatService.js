const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateResponse = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return `[Mock AI Response]: You said "${userMessage}". (Please set a valid GEMINI_API_KEY in backend/.env)`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Primary model: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn('Gemini 2.5 Flash model call failed, trying gemini-1.5-flash:', error.message);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await fallbackModel.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    } catch (fallbackError) {
      console.error('Gemini API Error:', fallbackError);
      throw new Error('Failed to generate response from Gemini API: ' + fallbackError.message);
    }
  }
};

module.exports = { generateResponse };
