const express = require('express');
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const port = 3000;

// Load environment variables
const endpoint = process.env.AZURE_ENDPOINT;
const apiKey = process.env.AZURE_API_KEY;

// Azure Form Recognizer Client
const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

// Middleware to parse JSON request bodies
app.use(express.json());

// Root URL: Show a welcome message
app.get('/', (req, res) => {
    res.status(200).send('Hello, welcome to the API!');
});

// GET `/status`: Confirm API is running
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'API is running!' });
});

// POST `/download`: Download a file from a URL
app.post('/download', (req, res) => {
    const { fileUrl, fileName } = req.body;

    // Validate input
    if (!fileUrl || !fileName) {
        return res.status(400).json({ error: 'Missing fileUrl or fileName in request body.' });
    }
    if (!fileName.endsWith('.pdf')) {
        return res.status(400).json({ error: 'Invalid fileName. Only PDF files are allowed.' });
    }

    const downloadPath = `/home/abbiebortz/my-project/${fileName}`;
    const downloadCommand = `wget --no-check-certificate '${fileUrl}' -O ${downloadPath}`;
    
    exec(downloadCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading file: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download the file.' });
        }

        console.log(`File downloaded successfully: ${stdout}`);
        res.status(200).json({ message: 'File downloaded successfully.', filePath: downloadPath });
    });
});

// POST `/extract-text`: Extract text from a PDF file
app.post('/extract-text', async (req, res) => {
    const filePath = req.body.filePath;

    // Validate input
    if (!filePath) {
        return res.status(400).json({ error: 'Missing filePath in request body.' });
    }
    if (!filePath.endsWith('.pdf')) {
        return res.status(400).json({ error: 'Invalid filePath. Only PDF files are allowed.' });
    }

    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        return res.status(400).json({ error: `File does not exist at path: ${absolutePath}` });
    }

    try {
        // Create a readable stream for the file
        const fileStream = fs.createReadStream(absolutePath);
        console.log('File stream created successfully.');

        // Call Azure Form Recognizer's prebuilt-read model
        const poller = await client.beginAnalyzeDocument("prebuilt-read", fileStream);
        const result = await poller.pollUntilDone();

        if (!result.pages || result.pages.length === 0) {
            throw new Error('No content found in the file.');
        }

        // Extract text content from pages
        const content = result.pages.map(page => page.lines.map(line => line.content).join('\n')).join('\n\n');
        console.log('Extracted Content:', content);

        res.status(200).json({
            message: 'Text extracted successfully.',
            data: content,
        });
    } catch (error) {
        console.error('Error during API call:', error.message);
        res.status(500).json({
            error: 'Failed to extract text from the file.',
            details: error.message,
        });
    }
});

// Middleware to handle GET requests to POST-only routes
app.all('/download', (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Please use POST to access this endpoint.',
            example: {
                method: 'POST',
                url: '/download',
                body: { fileUrl: '<url>', fileName: '<filename.pdf>' }
            }
        });
    }
    next();
});

app.all('/extract-text', (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Please use POST to access this endpoint.',
            example: {
                method: 'POST',
                url: '/extract-text',
                body: { filePath: '<path-to-file>' }
            }
        });
    }
    next();
});

// 404 Handler for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://13.64.224.185:${port}/`);
});
