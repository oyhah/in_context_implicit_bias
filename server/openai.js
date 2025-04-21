const fs = require('fs');

require('dotenv').config();

const openai_key = process.env.OPENAI_KEY;
const chatgpt_url = 'https://api.openai.com/v1/chat/completions';

const getStatus = async (req, res) => {
	return res.status(200).json({
		status: 'success',
		message: 'Server is up and running.'
	})
}

const postSingleChat = async (req, res) => {
	const messages = req.body.prompt;
	if (!messages) return res.status(400).json({ status: 'error', message: '"prompt" body parameter is required.' });

	// default model: gpt-4o-mini
	const model = req.body.model ? req.body.model : 'gpt-4o-mini';

	// default file name: data.json
	const outputFile = req.body.file ? req.body.file : 'data.json';

	let output = {
		model: model,
		prompt: messages
	};

    fetch(chatgpt_url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'model': model,
            'messages': messages
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Response received, writing to file.');
        output.response = data?.choices[0]?.message;
        try {
        	fs.writeFileSync(`../data/${outputFile}`, JSON.stringify(output, null, 2));
        	console.log(`Successfully written to file: ../data/${outputFile}`);
        	return res.status(200).json({ status: 'success', message: `Request Successful. Response written to: ../data/${outputFile}` });
        }
        catch (error) {
        	console.error(error);
        	return res.status(500).json({ status: 'error', message: `Error writing to file: ../data/${outputFile}` });
        }
    });
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const twoNumberFixedIterationChat = async (req, res) => {
	const messages = req.body.prompt;	// include prompt to format response as '<number 1>, <number 2>'
	const loss = req.body.loss;
	let iterations = req.body.iterations; // default is 10
	let errors = [];
	if (!messages) errors.push('"prompt" body parameter is required.');
	if (!loss) errors.push('"loss" body parameter is required.');
	if (errors.length > 0) return res.status(400).json({ status: 'error', message: errors });
	
	if (!iterations) iterations = 10;

	// default model: gpt-4o-mini
	const model = req.body.model ? req.body.model : 'gpt-4o-mini';

	// default file name: data.json
	const outputFile = req.body.file ? req.body.file : 'data.json';

	let output = {
		model: model,
		prompt: messages,
		responses: []
	};

	for (let i = 0; i < iterations; i += 1) {
		console.log(`Iteration ${i+1}`);
		const response = await fetch(chatgpt_url, {
	        method: 'POST',
	        headers: {
	            'Authorization': `Bearer ${openai_key}`,
	            'Content-Type': 'application/json'
	        },
	        body: JSON.stringify({
	            'model': output.model,
	            'messages': messages
	        })
    	});
    	const data = await response.json();
    	const respString = data?.choices[0]?.message.content;
    	const num1 = parseFloat(respString.substring(0, respString.indexOf(',')));
    	const num2 = parseFloat(respString.substring(respString.indexOf(' ')));
    	const loss = eval(req.body.loss);
    	const lossVal = loss(num1,num2);
    	output.responses.push({
    		"guess": respString,
    		"score": lossVal
    	});
    	messages.push({
    		role: "assistant",
    		content: respString
    	});
    	messages.push({
    		role: "user",
    		content: `Your score was ${lossVal}. Try again.`
    	});

    	// Wait for rate-limit to expire
	    if (i < iterations - 1) {
	      console.log(`Waiting 1 minute before next fetch...`);
	      await delay(60000); // 60,000 ms = 1 minute
	    }
	}

	console.log('Response received, writing to file.');
    try {
    	fs.writeFileSync(`../data/${outputFile}`, JSON.stringify(output, null, 2));
    	console.log(`Successfully written to file: ../data/${outputFile}`);
    	return res.status(200).json({ status: 'success', message: `Request Successful. Response written to: ../data/${outputFile}` });
    }
    catch (error) {
    	console.error(error);
    	return res.status(500).json({ status: 'error', message: `Error writing to file: ../data/${outputFile}` });
    }
}


module.exports = {
	getStatus,
	postSingleChat,
	twoNumberFixedIterationChat
};