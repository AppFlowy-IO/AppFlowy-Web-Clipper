import { createContext, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { ApplicationConfig } from '@/types';
import { ClientServicesImpl, UserSessionImpl } from '@/services/user';
import { ApplicationContext } from '@/types';
import { hasToken } from '@/services/session';
import { on } from '@/services/session/event';
import { EventType } from '@/services/session/event';
import {  LoginPage } from '@/components/login';


export const RCApplicationContext = createContext<
  ApplicationContext | undefined
>(undefined);

function ApplicationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config] = useState<ApplicationConfig>({
    baseUrl: import.meta.env.VITE_AF_BASE_URL || 'https://test.appflowy.cloud',
    gotrueUrl: import.meta.env.VITE_AF_GOTRUE_URL || 'https://test.appflowy.cloud/gotrue',
  });
  const serviceImpl = useMemo(() => new ClientServicesImpl(config), [config]);
  const userSession = useMemo(() => new UserSessionImpl(), []);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasToken());

  const [loginOpen, setLoginOpen] = useState(false);
  const showLoginPage = useCallback((redirectTo?: string) => {

    if (process.env.NODE_ENV === 'development') {
      console.log('Redirect to URL:', redirectTo);
    }

    setLoginOpen(true);
  }, []);

  useEffect(() => {
    return on(EventType.SESSION_INVALID, () => {
      setIsAuthenticated(false);
    });
  }, []);
  
  useEffect(() => {
    return on(EventType.SESSION_VALID, () => {
      setIsAuthenticated(true);
    });
  }, []);

  return (
    <RCApplicationContext.Provider
      value={{
        isAuthenticated,
        httpService: serviceImpl,
        userSession: userSession,
        showLoginPage: showLoginPage,
      }}
    >
      {children}
      {loginOpen && (
        <Suspense>
          <LoginPage />
        </Suspense>
      )}
    </RCApplicationContext.Provider>
  );
}
export default ApplicationContextProvider;
