# in_context_implicit_bias

## server

This folder contains a server to locally run, with endpoints to make LLM calls and store the data.
This allows more controlled and methodic data generation, especially given the long prompts we will likely use.

### How to run

Create file ```server/.env``` with content ```OPENAI_KEY=<your key>``` to be used by the program.

In the ```server``` folder, run ```npm start```. This would host the server. The default port is 3000.

Make a get request to ```http://127.0.0.1:3000/status``` to test that the server is running.

To call an OpenAI service and store the results, make a post request to ```http://127.0.0.1:3000/openai/chat``` with the following body parameters:
- prompt (required): the prompt to send
- model (optinal): the model to call. The default is ```gpt-4o-mini```
- file (optional): filename to store to. All output files are stored in the ```data``` folder. The default is ```data.json```

### To-Do:

1. Implement an endpoint to make multiple calls with the same prompt and store the results aggregated.
2. Implement other models besides OpenAI.
