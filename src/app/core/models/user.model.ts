export type UserRole = 'User' | 'Admin';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
