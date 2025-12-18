# AI Assistant Setup Guide

The AI chat assistant features use Google Gemini API. Follow these steps to configure it properly.

## Environment Variable Configuration

### For Supabase Edge Functions

The edge functions require a `GEMINI_API_KEY` environment variable to be set in your Supabase project.

**Steps:**

1. Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Add the environment variable to your Supabase project:
   - Go to your Supabase Dashboard
   - Navigate to Project Settings > Edge Functions
   - Add a new secret:
     - Name: `GEMINI_API_KEY`
     - Value: Your Google Gemini API key (starts with `AIza...`)

3. Redeploy the edge functions after adding the secret:
   - The functions will automatically use the new environment variable
   - No code changes are required

## Features

The AI assistant is specialized in:

- **Winning Products**: Identification and analysis of winning products
- **Niche Strategies**: Recommendations for profitable niches
- **Marketing**: Facebook Ads, TikTok Ads advice
- **Metrics**: AOV, margin, CTR, CPA analysis
- **Copywriting**: Suggestions for ads and descriptions

## Edge Functions Using Gemini API

- `ai-chat-assistant` - Specialized dropshipping assistant
- `ai-chat` - General AI chat functionality

Both functions will return an error if the `GEMINI_API_KEY` is not configured.

## Security Notice

The API key is now stored securely as an environment variable and is never exposed in the codebase. This prevents:
- Accidental exposure in version control
- Security scanner failures during deployment
- Unauthorized API usage

## Troubleshooting

If the AI assistant is not working:
1. Verify that `GEMINI_API_KEY` is set in Supabase Edge Functions settings
2. Check the edge function logs in Supabase for specific errors
3. Ensure the API key is valid and has not exceeded quota limits
