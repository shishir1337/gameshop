# Google OAuth Redirect URI Fix

## Issue
You're getting `redirect_uri_mismatch` error because the redirect URI in Google Cloud Console doesn't match what Better Auth is using.

## Solution

Better Auth's Generic OAuth plugin uses this callback path structure:
```
/api/auth/oauth2/callback/{providerId}
```

So for Google, it's:
```
http://localhost:3000/api/auth/oauth2/callback/google
```

## Steps to Fix

### 1. Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**

### 2. Edit Your OAuth 2.0 Client
1. Click on your OAuth 2.0 Client ID
2. Scroll down to **Authorized redirect URIs**
3. **Remove** the incorrect URI if you added: `http://localhost:3000/api/auth/callback/google`
4. **Add** the correct URI:
   ```
   http://localhost:3000/api/auth/oauth2/callback/google
   ```
5. Click **Save**

### 3. For Production
When deploying to production, add:
```
https://yourdomain.com/api/auth/oauth2/callback/google
```

## Important Notes

- The path is `/api/auth/oauth2/callback/google` (not `/api/auth/callback/google`)
- Must include the protocol (`http://` or `https://`)
- Must include the port number for localhost (`:3000`)
- Must match exactly (case-sensitive)

## Verify

After updating, try logging in with Google again. The redirect URI should now match.

