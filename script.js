import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

const app = express();

dotenv.config(); // Load environment variables from .env file

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

let conversationHistory = []; // Store conversation history

app.set('view engine', 'ejs'); // Set EJS as the templating engine
// Set up your Express app, views, and middleware here

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/send-message', async (req, res) => {
  const userInput = req.body.userInput;

  try {
    const messages = [
      ...conversationHistory, // Include previous conversation
      { role: 'user', content: userInput },
      {role: 'system', content: 'Comrade Zeusman AI Assistant is typing'},
      { role: 'assistant', content: 'Hey, I am Comrade Zeusman AI Assistant. How can I help you today?' }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });

    const aiResponse = completion.choices[0].message.content;

    // Update conversation history
    conversationHistory = [...conversationHistory, { role: 'assistant', content: aiResponse }];

    res.send(aiResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing your request');
  }
});

app.post('/clear-conversation', (req, res) => {
  conversationHistory = [];
  res.send('Conversation history cleared');
});


// Set up other routes and configurations for your Express app

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
