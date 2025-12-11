# GameShop API Endpoints Documentation

## Base URL
```
http://localhost:3000
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "id": "uuid",
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "token": "session_token"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Email and password are required"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON): See Request Body above

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "uuid",
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "token": "session_token"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON): See Request Body above

---

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Cookie: better-auth.session_token=<session_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "id": "uuid",
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "token": "session_token"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

**Postman Collection:**
- Method: `GET`
- URL: `http://localhost:3000/api/auth/me`
- Headers: 
  - `Content-Type: application/json`
  - `Cookie: better-auth.session_token=<your_session_token>`
  - Note: Get the session token from login/register response

---

### 4. Logout User
**POST** `/api/auth/logout`

**Headers:**
```
Cookie: better-auth.session_token=<session_token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Logout failed"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/logout`
- Headers:
  - `Content-Type: application/json`
  - `Cookie: better-auth.session_token=<your_session_token>`

---

### 5. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Error Response (400):**
```json
{
  "error": "Email is required"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/forgot-password`
- Headers: `Content-Type: application/json`
- Body (raw JSON): See Request Body above
- Note: Check email inbox for password reset link

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Token and password are required"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/reset-password`
- Headers: `Content-Type: application/json`
- Body (raw JSON): See Request Body above
- Note: Get the token from the password reset email link

---

## Email Endpoints

### 7. Send Test Email
**POST** `/api/send`

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "firstName": "John"
}
```

**Success Response (200):**
```json
{
  "id": "email_id"
}
```

**Error Response (400):**
```json
{
  "error": "Recipient email is required"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to send email"
}
```

**Postman Collection:**
- Method: `POST`
- URL: `http://localhost:3000/api/send`
- Headers: `Content-Type: application/json`
- Body (raw JSON): See Request Body above

---

## Better Auth Internal Endpoints

### 8. Better Auth Catch-All Handler
**GET/POST** `/api/auth/[...all]`

This route handles all Better Auth internal endpoints. You can access:
- `/api/auth/session` - Get session
- `/api/auth/sign-out` - Sign out
- `/api/auth/request-password-reset` - Request password reset (internal)
- `/api/auth/reset-password` - Reset password (internal)
- And other Better Auth endpoints

**Postman Collection:**
- Method: `GET` or `POST`
- URL: `http://localhost:3000/api/auth/<endpoint>`
- Headers: `Content-Type: application/json`
- Note: Check Better Auth documentation for specific endpoint requirements

---

## Testing Workflow

### Complete User Registration Flow:
1. **Register** → `POST /api/auth/register`
   - Save the `session.token` from response
   - Check email for welcome message

2. **Get Current User** → `GET /api/auth/me`
   - Use the session token in Cookie header

3. **Logout** → `POST /api/auth/logout`
   - Use the session token in Cookie header

### Password Reset Flow:
1. **Forgot Password** → `POST /api/auth/forgot-password`
   - Check email for reset link
   - Extract token from the reset link

2. **Reset Password** → `POST /api/auth/reset-password`
   - Use the token from email

3. **Login with New Password** → `POST /api/auth/login`

---

## Postman Environment Variables

Create a Postman environment with these variables:

```json
{
  "base_url": "http://localhost:3000",
  "session_token": "",
  "user_email": "test@example.com",
  "user_password": "TestPassword123!"
}
```

Then use in requests:
- URL: `{{base_url}}/api/auth/register`
- Cookie: `better-auth.session_token={{session_token}}`

---

## Common Headers

All requests should include:
```
Content-Type: application/json
```

Authenticated requests should include:
```
Cookie: better-auth.session_token=<your_session_token>
```

---

## Error Codes

- `200` - Success
- `201` - Created (Registration)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Not authenticated)
- `500` - Internal Server Error

---

## Notes

1. **Session Management**: After login/register, save the session token from the response and include it in subsequent requests via Cookie header.

2. **Email Testing**: For password reset, check your email inbox. The reset link will contain a token parameter.

3. **CORS**: If testing from a browser, ensure CORS is properly configured.

4. **Environment**: Make sure your `.env` file has all required variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

5. **Database**: Ensure your PostgreSQL database is running and migrations are applied.

