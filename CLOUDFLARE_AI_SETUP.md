# Cloudflare AI Integration Setup

This project integrates Cloudflare AI with the Llama 3.3 8B model for mortgage underwriting analysis.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google Cloud Document AI
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=your-document-ai-processor-id

# Cloudflare AI
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "My Profile" > "API Tokens"
3. Create a new token with the following permissions:
   - Account: Workers AI:Read
   - Zone: Workers AI:Read
4. Copy the token and add it to your `.env.local` file

## API Endpoints

### Analysis
- **POST** `/api/cloudflare-ai/analyze`
- Analyzes document data using Cloudflare AI
- Returns structured underwriting analysis

## Request Format

```json
{
  "documentData": {
    "text": "Document text content...",
    "pages": [...],
    "entities": [
      {
        "type": "monthly_income",
        "mentionText": "5000",
        "confidence": 0.95
      }
    ]
  },
  "underwritingRules": "Optional custom rules..."
}
```

## Response Format

```json
{
  "dtiValue": 45.2,
  "qualification": "REQUIRES_REVIEW",
  "explanation": "Detailed explanation...",
  "confidence": 0.85,
  "riskFactors": ["High DTI ratio", "Limited credit history"],
  "recommendations": ["Consider co-signer", "Reduce debt"]
}
```

## Features

- **DTI Calculation**: Automatically calculates Debt-to-Income ratio
- **Qualification Assessment**: Determines if borrower qualifies
- **Risk Analysis**: Identifies potential risk factors
- **Recommendations**: Provides actionable recommendations
- **Error Handling**: Robust error handling and fallback responses
- **Flexible Input**: Accepts any JSON structure from Document AI

## Model Used

- **Model**: `@hf/meta-llama/meta-llama-3-8b-instruct`
- **Temperature**: 0.3 (for consistent responses)
- **Max Tokens**: 1000
- **Response Format**: JSON for structured analysis

## Integration

The AI analysis is integrated into the document processing workflow:

1. Upload tax documents
2. Extract data using Google Document AI
3. Send raw JSON data to Cloudflare AI
4. Analyze with Llama 3.3 8B model
5. Display results with qualification status

## Troubleshooting

### Common Issues

1. **API Token Error**: Ensure your Cloudflare API token has the correct permissions
2. **Model Not Found**: Verify the model name is correct
3. **Rate Limiting**: Cloudflare AI has rate limits, implement retry logic if needed
4. **JSON Parsing**: The AI response is parsed as JSON, ensure proper error handling

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=cloudflare-ai
```

## Security Notes

- Never commit API tokens to version control
- Use environment variables for all sensitive data
- Implement proper authentication for production use
- Consider rate limiting for API endpoints 