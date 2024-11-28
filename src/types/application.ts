import { UserSession, UserAuthService } from '@/types';

export interface ApplicationContext {
  isAuthenticated: boolean;
  httpService: UserAuthService | undefined;
  userSession: UserSession | undefined;
  showLoginPage: (redirectTo?: string) => void;
}

export interface ApplicationConfig {
  baseUrl: string;
  gotrueUrl: string;
}
