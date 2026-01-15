# Deployment Instructions

## Prerequisites
- Replace Supabase credentials in `.env.local` with your actual values
- Install Vercel CLI: `npm i -g vercel`

## Deploy to Vercel

### Method 1: Using Vercel CLI
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy from project directory
cd "/Users/almondreign/Desktop/Revieree.co"
vercel --prod

# 3. When prompted, set environment variables:
# VITE_SUPABASE_URL: your-actual-supabase-url
# VITE_SUPABASE_ANON_KEY: your-actual-supabase-anon-key
```

### Method 2: Using Vercel Dashboard
1. Push code to GitHub repository
2. Connect repository to Vercel at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Environment Variables
Replace the placeholder values in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase
```

## Important Notes
- `.env.local` is for local development only
- Production environment variables must be set in Vercel
- Supabase must have proper RLS policies and tables configured

## Post-Deployment
- Update Supabase CORS settings to include your Vercel domain
- Test admin user creation and product management
- Verify notifications are working