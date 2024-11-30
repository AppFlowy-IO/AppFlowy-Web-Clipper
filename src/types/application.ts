import { UserHttpService, UserSession } from '@/types';

export interface ApplicationContext {
  isAuthenticated: boolean;
  userHttpService: UserHttpService | undefined;
  userSession: UserSession | undefined;
  currentTabId: number | undefined;
  showLoginPage: (redirectTo?: string) => void;
}

export interface ApplicationConfig {
  baseUrl: string;
  gotrueUrl: string;
}
