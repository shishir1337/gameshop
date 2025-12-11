# Exact Steps to Fix Google OAuth Redirect URI

## The Error
```
redirect_uri=http://localhost:3000/api/auth/oauth2/callback/google
Error 400: redirect_uri_mismatch
```

## Exact Steps to Fix

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **correct project** (the one with your OAuth credentials)

### Step 2: Navigate to Credentials
1. Click the **hamburger menu** (☰) in the top left
2. Go to **APIs & Services** > **Credentials**
3. OR directly go to: https://console.cloud.google.com/apis/credentials

### Step 3: Find Your OAuth Client
1. Look for **OAuth 2.0 Client IDs** section
2. Find the client with ID: `496424952394-bdnmn6uatfdnevnhf97vk8kh6hd0gunt.apps.googleusercontent.com`
3. Click on the **pencil icon** (✏️) or the client name to edit

### Step 4: Add the Redirect URI
1. Scroll down to **Authorized redirect URIs** section
2. Click **+ ADD URI** button
3. **Copy and paste EXACTLY this** (no spaces, no typos):
   ```
   http://localhost:3000/api/auth/oauth2/callback/google
   ```
4. **Important**: 
   - Must start with `http://` (not `https://`)
   - Must include `:3000` port
   - Must be exactly `/api/auth/oauth2/callback/google` (not `/callback/google`)
   - No trailing slash
   - No spaces before or after

### Step 5: Save
1. Click **SAVE** button at the bottom
2. Wait 1-2 minutes for changes to propagate

### Step 6: Verify
1. Go back to your app
2. Try logging in with Google again
3. It should work now!

## Common Mistakes to Avoid

❌ **Wrong**: `http://localhost:3000/api/auth/callback/google` (missing `/oauth2/`)
❌ **Wrong**: `https://localhost:3000/api/auth/oauth2/callback/google` (using https)
❌ **Wrong**: `http://localhost/api/auth/oauth2/callback/google` (missing port)
❌ **Wrong**: `http://localhost:3000/api/auth/oauth2/callback/google/` (trailing slash)
✅ **Correct**: `http://localhost:3000/api/auth/oauth2/callback/google`

## Visual Guide

Your **Authorized redirect URIs** section should look like this:

```
Authorized redirect URIs
┌─────────────────────────────────────────────────────────────┐
│ http://localhost:3000/api/auth/oauth2/callback/google      │
└─────────────────────────────────────────────────────────────┘
```

## Still Not Working?

1. **Double-check**: Copy the exact URI from the error message and paste it
2. **Clear browser cache**: Sometimes browsers cache OAuth errors
3. **Wait 2-3 minutes**: Google's changes can take a moment to propagate
4. **Check you're editing the right client**: Make sure it's the one with your Client ID
5. **Try incognito mode**: To rule out browser cache issues

## For Production

When you deploy, add this URI too:
```
https://yourdomain.com/api/auth/oauth2/callback/google
```

Replace `yourdomain.com` with your actual domain.

