const fs = require('fs');

// TODO: get key from .env file
const openai_key = '';
const chatgpt_url = 'https://api.openai.com/v1/chat/completions';

const getStatus = async (req, res) => {
	return res.status(200).json({
		status: 'success',
		message: 'Server is up and running.'
	})
}

const postSingleChat = async (req, res) => {
	const messages = req.body.prompt;
	if (!messages) return res.status(400).json({ status: 'error', message: '"messages" body parameter is required.' });

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

module.exports = {
	getStatus,
	postSingleChat
};