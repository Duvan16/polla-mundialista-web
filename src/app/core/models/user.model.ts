export type UserRole = 'User' | 'Admin';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  token: string;
}
