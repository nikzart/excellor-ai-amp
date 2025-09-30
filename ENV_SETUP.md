# Environment Variables Setup

## Important Security Note

⚠️ **The `.env` file contains API credentials and is git-ignored for security.**

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://xandar.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key_here
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-large
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large
AZURE_API_VERSION=2024-02-01

# Chat API Configuration (OpenAI Compatible)
CHAT_API_ENDPOINT=https://8qall2o4vhgof70e.ai-plugin.io/chat/completions
CHAT_API_KEY=your_chat_api_key_here

# Server Configuration
PORT=3001
```

## Getting API Keys

### Azure OpenAI
1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Copy the endpoint URL and API key
4. Ensure you have the `text-embedding-3-large` deployment created

### Chat API
1. Obtain your OpenAI-compatible API key
2. Ensure it supports streaming mode

## Security Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Keep API keys secure and rotate regularly
- ✅ Use environment-specific `.env` files for different deployments
- ✅ For production, use secure secret management services

## Verification

After setting up your `.env` file:

1. Start the server: `npm run server`
2. Check for successful startup message
3. Test the health endpoint: `curl http://localhost:3001/health`

If you see errors, verify:
- API keys are correct
- No extra spaces or quotes in values
- File is named exactly `.env` (not `.env.txt`)
- File is in the root directory

---

**Note**: The `.env` file is already git-ignored to prevent accidental commits of sensitive data.
