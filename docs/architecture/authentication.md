# Authentication Architecture

Sprint 1 establishes the Prontera Commerce identity and authentication foundation.

## Stack

- NestJS API.
- Prisma data access.
- PostgreSQL persistence.
- JWT access and refresh tokens.
- Argon2id password and refresh token hashing.

## Identity Model

Authentication uses:

- `User`: account identity, password hash, status, and global preferences.
- `Role`: RBAC role catalog.
- `UserRole`: user-to-role assignments.
- `Session`: refresh token session record with revocation and expiry.

User global preferences include:

- `preferredLocale`
- `preferredCurrency`
- `countryCode`
- `timeZone`

## Token Model

Access tokens are short-lived JWTs used for API authorization.

Refresh tokens are long-lived JWTs tied to a `Session` row. The raw refresh token is never stored; only an Argon2id hash is persisted.

Refresh token rotation works by:

1. Verifying the refresh JWT signature.
2. Loading the active session.
3. Verifying the submitted token against the stored hash.
4. Revoking the old session.
5. Issuing a new access token, refresh token, and session.

## RBAC

RBAC is role-code based. Guards can enforce roles with the `@Roles()` decorator and JWT authentication.

Default registration assigns the `merchant` role unless a role code is supplied by a trusted internal flow.

## Security Notes

- Passwords are hashed with Argon2id.
- Refresh tokens are hashed before persistence.
- Expired or revoked sessions cannot refresh or access `/auth/me`.
- DTO validation strips unknown input and rejects non-whitelisted fields.
- Swagger documents bearer authentication and auth DTOs.
- Social login is intentionally out of scope for Sprint 1.
