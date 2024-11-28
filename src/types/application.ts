import { UserHttpService, UserSession } from '@/types';

export interface ApplicationContext {
  isAuthenticated: boolean;
  userHttpService: UserHttpService | undefined;
  userSession: UserSession | undefined;
  showLoginPage: (redirectTo?: string) => void;
}

export interface ApplicationConfig {
  baseUrl: string;
  gotrueUrl: string;
}
