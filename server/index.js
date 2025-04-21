const express = require('express');
const OpenAIController = require('./openai');

const app = express();
app.use(express.json());

require('dotenv').config();

const PORT = process.env.PORT || 3000;

// routes
app.get('/status', OpenAIController.getStatus);

app.post('/openai/chat', OpenAIController.postSingleChat);

app.post('/openai/looping', OpenAIController.twoNumberFixedIterationChat);

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

