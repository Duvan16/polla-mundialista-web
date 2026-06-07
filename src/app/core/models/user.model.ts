export type UserRole = 'User' | 'Admin';

/** Authenticated user shape returned by /auth/login and /auth/register. Persisted to localStorage. */
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  /** Short-lived JWT; attached as Bearer by the JWT interceptor. */
  accessToken: string;
  /** ISO 8601 expiry date of the access token. */
  accessTokenExpiresAt: string;
  /** Opaque token used to silently obtain a new access token on 401. */
  refreshToken: string;
  /** ISO 8601 expiry date of the refresh token. */
  refreshTokenExpiresAt: string;
}
