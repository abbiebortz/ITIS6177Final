# ITIS6177Final API Documentation
ITIS6177 Final API Documentation
Abstract
The ITIS6177 Final API serves as a tool to extract text from PDF documents, using Azure Form Recognizer capabilities. This API provides endpoints for processing locally stored PDFs or files retrieved from external URLs. Designed with error handling and data sanitization, it ensures reliable performance and secure handling of sensitive data.

Introduction

With the growing need for automated document processing, the ITIS6177 Final API provides a streamlined way to extract structured text content from PDF files. By utilizing Azure's Form Recognizer service, the API offers high accuracy in text extraction while ensuring secure and efficient operations. This document outlines the API's functionality, implementation, and usage guidelines, providing a comprehensive reference for developers and users.
Features and Capabilities

The API includes the following features:
Status Monitoring: A dedicated endpoint to verify the API's operational status.
Local File Processing: Extract text from PDF files stored on the server.
URL-Based File Processing: Download files from external URLs and process them for text extraction.
Error Handling: Comprehensive error messages for method mismatches, missing files, or failed Azure API calls.
Data Sanitization: Ensures all inputs are validated to prevent security vulnerabilities.
Scalability: Uses PM2 to ensure continuous uptime for production environments.

Methodology
System Architecture
The API architecture follows a client-server model:
Client: Submits requests using curl, Postman, or other HTTP tools.
Server: Processes requests and interacts with the Azure Form Recognizer API for text extraction.
Azure Form Recognizer: Provides the backend service for document analysis.


API Endpoints
GET /status
Purpose: Checks if the API is operational.
Example Usage:
bash
Copy code:
curl -X GET http://13.64.224.185:3000/status

Expected Response:
json
Copy code:
{
  "message": "API is running!"
}

POST /extract-text
Purpose: Extracts text from a local PDF file.
Request Body:
json
Copy code:
{
  "filePath": "/home/abbiebortz/my-project/test.pdf"
}

Example Usage:
bash
Copy code:
curl -X POST http://13.64.224.185:3000/extract-text \
-H "Content-Type: application/json" \
-d '{"filePath":"/home/abbiebortz/my-project/test.pdf"}'

Expected Response (Success):
json
Copy code:
{
  "message": "Text extracted successfully.",
  "data": "Extracted text content."
}

POST /extract-text-url
Purpose: Downloads a file from a given URL and extracts its text content.
Request Body:
json
Copy code:
{
  "fileUrl": "https://example.com/sample.pdf",
  "fileName": "Sample.pdf"
}

Example Usage:
bash
Copy code:
curl -X POST http://13.64.224.185:3000/extract-text-url \
-H "Content-Type: application/json" \
-d '{"fileUrl":"https://example.com/sample.pdf","fileName":"Sample.pdf"}'

Expected Response (Success):
json
Copy code:
{
  "message": "Text extracted successfully.",
  "data": "Extracted text content."
}

Error Handling and Data Validation
Invalid Method Requests:
If a POST endpoint is accessed via GET (or vice versa), the response provides clear guidance.
Example Response:
json
Copy code:
{
  "error": "Invalid method. Please use POST instead of GET for this endpoint."
}


File Not Found:
When a file path is invalid or the file is missing, an appropriate error is returned.
Example Response:
json
Copy code:
{
  "error": "Failed to extract text from the file.",
  "details": "File not found."
}


Azure API Errors:
If Azure's Form Recognizer service fails, the error details are logged and returned to the client.
Example Response:
json
Copy code:
{
  "error": "Failed to connect to Azure API.",
  "details": "Invalid API key or endpoint."
}


Implementation Details
Environment Variables:
The API key and endpoint are stored in an .env file to ensure security.
Example .env file:
makefile
Copy code:
AZURE_API_KEY=your-azure-api-key
AZURE_ENDPOINT=your-azure-endpoint


File Processing Workflow:
Validates the file path or URL.
Processes the file locally or downloads it via extract-text-url.
Sends the file to Azure Form Recognizer for text extraction.
Returns extracted text to the client.

Error Logging:
Logs all errors for debugging and troubleshooting.

PM2 Deployment:
PM2 is used for process management. Start the server using:
bash
Copy code
pm2 start app.js
Evaluation
Testing

The API has been tested using:
Local PDFs stored in the my-project directory.
Files downloaded from external URLs.
Various tools, including curl, Postman, and direct browser access.
Edge Cases Handled
Missing or invalid file paths.
Invalid API credentials.
Inappropriate method usage.
Photos
Extracting Data and Downloading a PDF

Conclusion
The ITIS6177 Final API is a secure and efficient solution for text extraction from PDF documents. By adhering to best practices in API development, the project demonstrates strong design principles and practical utility.

References
Azure Form Recognizer Documentation
Node.js Documentation
PM2 Documentation
