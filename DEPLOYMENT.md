# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   In Vercel Dashboard, add these environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GOOGLE_GENAI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Environment Variables Setup

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials.

## Important Notes

- The `.env.local` file is gitignored and won't be deployed
- Add all environment variables in Vercel Dashboard
- Vercel automatically handles Next.js optimization
- Your app will be available at `https://your-project.vercel.app`

## Troubleshooting

If build fails:
1. Check all environment variables are set in Vercel
2. Ensure `package.json` has correct build script
3. Check build logs in Vercel Dashboard
4. Make sure all dependencies are in `package.json`
