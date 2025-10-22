# 🚀 Plugg Gymnasie - Setup Guide

This guide will walk you through setting up everything you need to deploy your Swedish high school study app.

## 📋 What You Need to Provide

### 1. **Supabase Account & Database** (Required)
**What you need:**
- Supabase project URL (looks like: `https://yourproject.supabase.co`)
- Supabase anon key (public key)
- Supabase service role key (secret key)

**How to get it:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create a new project
4. **IMPORTANT:** Choose **EU region** (Ireland or Frankfurt)
5. Go to Settings → API
6. Copy the "Project URL" and "anon public" key
7. Copy the "service_role" key (keep this secret!)

### 2. **GitHub Account** (Required for code storage)
**What you need:**
- GitHub repository
- Repository URL

**How to get it:**
1. Go to [github.com](https://github.com)
2. Sign up for free account
3. Create a new repository called "plugg-gymnasie"
4. Upload your code (or use GitHub Desktop)

### 3. **Vercel Account** (Required for hosting)
**What you need:**
- Vercel account
- Project deployment URL

**How to get it:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Import your project from GitHub
4. Deploy automatically

### 4. **Gmail Setup** (For email notifications)
**What you need:**
- Gmail SMTP settings
- App password for Gmail

**How to get it:**
1. Enable 2-factor authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate an "App Password" for this project
4. Use Gmail SMTP settings (already configured in the code)

## 🔧 Step-by-Step Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New project"
5. Choose your organization
6. **Project name:** `plugg-gymnasie`
7. **Database password:** Choose a strong password (save it!)
8. **Region:** Choose **EU West (Ireland)** or **EU Central (Frankfurt)**
9. Click "Create new project"
10. Wait for setup to complete (2-3 minutes)

### Step 2: Get Supabase Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJhbGc...`)
   - **service_role** key (starts with `eyJhbGc...`)

### Step 3: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. **Repository name:** `plugg-gymnasie`
4. **Description:** `Swedish high school study platform`
5. **Visibility:** Public (free)
6. Click "Create repository"

### Step 4: Upload Your Code to GitHub
**Option A: Using GitHub Desktop (Easier)**
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Click "Clone a repository from the Internet"
4. Choose your `plugg-gymnasie` repository
5. Copy your project files to the cloned folder
6. Commit and push changes

**Option B: Using Git Command Line**
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/plugg-gymnasie.git
git push -u origin main
```

### Step 5: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `plugg-gymnasie` repository
5. **Framework Preset:** Next.js (should auto-detect)
6. **Root Directory:** `plugg-bot-1` (if your code is in this folder)
7. Click "Deploy"

### Step 6: Configure Environment Variables
1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
BACKUP_PASSWORD=your-strong-passphrase-20-chars-minimum
```

### Step 7: Set Up Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "Plugg Gymnasie" as the name
7. Copy the generated password (16 characters)
8. Use this password in `EMAIL_SMTP_PASS`

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Supabase project created in EU region
- [ ] GitHub repository created and code uploaded
- [ ] Vercel project deployed successfully
- [ ] Environment variables configured in Vercel
- [ ] Gmail app password generated
- [ ] Website loads at your Vercel URL
- [ ] Can create account and login
- [ ] GDPR export/delete functions work

## 🆘 Need Help?

If you get stuck at any step:
1. Check the error messages carefully
2. Make sure all environment variables are set correctly
3. Verify your Supabase project is in EU region
4. Ensure your GitHub repository is public
5. Check that Vercel deployment logs for errors

## 📞 Support

If you need help with any step, just ask! I can help you troubleshoot specific issues.
