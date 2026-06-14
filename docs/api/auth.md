# Authentication API

Base path: `/auth`

Swagger is available at `/docs` when the API is running.

## POST /auth/register

Registers a user, creates a session, and returns access and refresh tokens.

Request:

```json
{
  "email": "merchant@example.com",
  "password": "CorrectHorseBatteryStaple1!",
  "name": "Ada Merchant",
  "preferredLocale": "en-US",
  "preferredCurrency": "USD",
  "countryCode": "US",
  "timezone": "America/New_York"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "merchant@example.com",
    "name": "Ada Merchant",
    "roles": ["merchant"],
    "preferredLocale": "en-US",
    "preferredCurrency": "USD",
    "countryCode": "US",
    "timezone": "America/New_York"
  }
}
```

## POST /auth/login

Authenticates an existing active user and creates a new session.

Request:

```json
{
  "email": "merchant@example.com",
  "password": "CorrectHorseBatteryStaple1!"
}
```

## POST /auth/logout

Requires bearer access token.

Revokes the current session.

Response:

```json
{
  "success": true
}
```

## POST /auth/refresh

Rotates the refresh token and creates a new session.

Request:

```json
{
  "refreshToken": "..."
}
```

## GET /auth/me

Requires bearer access token.

Returns the current authenticated user if the access token and session are active.

## RBAC

JWT payloads include role codes. Protected endpoints can use the `@Roles()` decorator with the JWT auth guard to require specific roles.

Social login is not implemented in Sprint 1.
