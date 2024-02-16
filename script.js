const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const OpenAI = require('openai');

const app = express();

dotenv.config(); // Load environment variables from .env file

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

let conversationHistory = []; // Store conversation history

app.set('view engine', 'ejs'); // Set EJS as the templating engine

//set up static files
app.use(express.static('public'));


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

app.post('/generate-image', async (req, res) => {
  const userInput = req.body.imageinput;
  console.log(userInput);

  try {
    // Make the request to generate the image
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: userInput,
      n: 1,
      size: '1024x1024',
    });

    console.log(response.data);

    if (response.data && response.data.length > 0) {
      const image_url = response.data[0].url;
      console.log(image_url);

      // Send the image URL as a response
      res.send(image_url)
    } else {
      res.status(400).json({
        success: false,
        error: "Image URL not found in the response",
      });
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(400).json({
      success: false,
      error: "The image could not be generated",
    });
  }
});


app.post('/clear-conversation', (req, res) => {
  conversationHistory = [];
  res.send('Conversation history cleared');
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
