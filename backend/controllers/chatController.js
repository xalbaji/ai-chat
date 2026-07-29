const { generateResponse } = require('../services/chatService');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const reply = await generateResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error('Error handling chat request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { handleChat };
