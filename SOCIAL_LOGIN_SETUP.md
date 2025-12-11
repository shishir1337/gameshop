# Social Login Setup Guide

This guide will help you set up Google and Facebook OAuth for social login in your application.

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- Your application's callback URLs

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "GameShop")
5. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name: GameShop (or your app name)
     - User support email: your email
     - Developer contact email: your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Click **Save and Continue**
   - Add test users (optional for development)
   - Click **Save and Continue**
   - Review and click **Back to Dashboard**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: GameShop Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/oauth2/callback/google` (for development)
     - `https://yourdomain.com/api/auth/oauth2/callback/google` (for production)
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**
   - Add them to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```

### Step 4: Important Notes for Google

- **OAuth Consent Screen**: Must be configured before creating credentials
- **Authorized Redirect URIs**: Must match exactly (including protocol and port)
- **Scopes**: The app requests `email` and `profile` scopes
- **Verification**: For production, you may need to verify your app with Google

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as the app type
4. Fill in:
   - App Display Name: GameShop (or your app name)
   - App Contact Email: your email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **Add a Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** as the platform
4. Enter your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
5. Click **Save**

### Step 3: Configure Facebook Login Settings

1. Go to **Facebook Login** > **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   - `http://localhost:3000/api/auth/oauth2/callback/facebook` (for development)
   - `https://yourdomain.com/api/auth/oauth2/callback/facebook` (for production)
3. Click **Save Changes**

### Step 4: Configure App Settings

1. Go to **Settings** > **Basic**
2. Add **App Domains**:
   - `localhost` (for development)
   - `yourdomain.com` (for production)
3. Add **Privacy Policy URL** (required for production)
4. Add **Terms of Service URL** (required for production)
5. Click **Save Changes**

### Step 5: Get App Credentials

1. In **Settings** > **Basic**, you'll find:
   - **App ID** (this is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (click **Show** to reveal, this is your `FACEBOOK_CLIENT_SECRET`)
2. Add them to your `.env` file:
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

### Step 6: Configure Permissions

1. Go to **Facebook Login** > **Permissions and Features**
2. Ensure these permissions are available:
   - `email` (default)
   - `public_profile` (default)

### Step 7: Important Notes for Facebook

- **App Review**: For production, you may need to submit your app for review
- **Test Mode**: Your app starts in "Development Mode" - only you and test users can use it
- **Privacy Policy**: Required for production apps
- **Redirect URIs**: Must match exactly (including protocol and port)

---

## Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## Testing

1. **Start your development server**:
   ```bash
   pnpm dev
   ```

2. **Test Google Login**:
   - Go to `http://localhost:3000/login`
   - Click "Google" button
   - You should be redirected to Google's consent screen
   - After authorization, you'll be redirected back to your app

3. **Test Facebook Login**:
   - Go to `http://localhost:3000/login`
   - Click "Facebook" button
   - You should be redirected to Facebook's login screen
   - After authorization, you'll be redirected back to your app

## Troubleshooting

### Google OAuth Issues

- **"redirect_uri_mismatch"**: Check that your redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- **"access_denied"**: Make sure OAuth consent screen is configured
- **"invalid_client"**: Verify your Client ID and Secret are correct

### Facebook OAuth Issues

- **"Invalid OAuth access token"**: Check your App Secret
- **"Redirect URI mismatch"**: Verify redirect URIs match exactly in Facebook settings
- **"App not in development mode"**: Add test users in Facebook App Settings > Roles > Test Users

## Production Checklist

### Google
- [ ] OAuth consent screen published
- [ ] App verified (if required)
- [ ] Production redirect URI added
- [ ] Scopes approved

### Facebook
- [ ] App moved out of Development Mode
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] App Review completed (if required)
- [ ] Production redirect URI added

## Security Notes

- **Never commit** `.env` file to version control
- **Rotate secrets** if they're accidentally exposed
- **Use HTTPS** in production
- **Limit redirect URIs** to your actual domains only
- **Monitor** OAuth usage in both Google and Facebook dashboards

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure redirect URIs match exactly in both providers' dashboards

