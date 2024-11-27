import { UserSession, UserHttpService } from '@/types';

export interface ApplicationContext {
  isAuthenticated: boolean;
  httpService: UserHttpService | undefined;
  userSession: UserSession | undefined;
  showLoginPage: (redirectTo?: string) => void;
}

export interface ApplicationConfig {
  baseUrl: string;
  gotrueUrl: string;
}
