# Production Deployment Guide

This guide explains how to deploy the application to production on bolt.host.

## Environment Variables Configuration

The application requires environment variables to be configured in production. These variables are **NOT** automatically copied from the `.env` file.

### Required Variables for bolt.host

You must configure these environment variables in your bolt.host project settings:

1. **VITE_SUPABASE_URL**
   - Value: `https://hsipbqpsvduidpqyznav.supabase.co`
   - Description: Your Supabase project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXBicXBzdmR1aWRwcXl6bmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQ5NzEsImV4cCI6MjA4MTE5MDk3MX0.P6_q98nSMdKe0Lf_bndv_TaFM_D_eKnvWOjjxhTAnbI`
   - Description: Your Supabase anonymous key (public key)

### How to Configure on bolt.host

1. Go to your project dashboard on bolt.host
2. Navigate to Settings or Environment Variables section
3. Add each variable with its name and value
4. Save the configuration
5. Redeploy your application

## Common Issues

### Blank Screen After Deployment

If you see a blank screen after deployment, it's likely that the environment variables are not configured. The application now shows a helpful error message instead of a blank screen.

**Solution:** Ensure all required environment variables are set in bolt.host settings.

### Supabase Connection Errors

If you see connection errors:
1. Verify the `VITE_SUPABASE_URL` is correct
2. Verify the `VITE_SUPABASE_ANON_KEY` is correct
3. Check that your Supabase project is active

## Security Notes

- The Supabase anonymous key is safe to expose in the frontend
- API keys for external services (like Gemini) should NEVER be in frontend code
- All sensitive operations should go through Supabase Edge Functions
- GEMINI_API_KEY should only be configured in Supabase Edge Functions settings

## Verification Checklist

Before deploying to production, verify:

- [ ] VITE_SUPABASE_URL is set in bolt.host environment variables
- [ ] VITE_SUPABASE_ANON_KEY is set in bolt.host environment variables
- [ ] Build completes successfully (`npm run build`)
- [ ] No hardcoded secrets in the codebase
- [ ] Supabase Edge Functions have their secrets configured (GEMINI_API_KEY)

## Support

If you continue to have issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are correctly spelled
3. Ensure no trailing spaces in environment variable values
4. Try a fresh deployment after configuration changes
