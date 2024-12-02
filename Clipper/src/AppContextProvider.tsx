import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from 'react';
import { ApplicationConfig } from '@/types';
import { ClientServicesImpl, UserSessionImpl } from '@/services/service_impl';
import { ApplicationContext } from '@/types';
import { hasToken } from '@/services/session';
import { on } from '@/services/session/event';
import { EventType } from '@/services/session/event';
import { LoginPage } from '@/components/login';
import browser from 'webextension-polyfill';

export const RCApplicationContext = createContext<
  ApplicationContext | undefined
>(undefined);

type MessageListener = (
  request: any,
  sender: browser.Runtime.MessageSender,
  sendResponse: (response?: any) => void
) => true | undefined;

function ApplicationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config] = useState<ApplicationConfig>({
    baseUrl: import.meta.env.VITE_AF_BASE_URL || 'https://test.appflowy.cloud',
    gotrueUrl:
      import.meta.env.VITE_AF_GOTRUE_URL ||
      'https://test.appflowy.cloud/gotrue',
  });
  const serviceImpl = useMemo(() => new ClientServicesImpl(config), [config]);
  const userSession = useMemo(() => new UserSessionImpl(), []);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTabId, setCurrentTabId] = useState<number | undefined>();

  const [loginOpen, setLoginOpen] = useState(false);
  const showLoginPage = useCallback((redirectTo?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirect to URL:', redirectTo);
    }

    setLoginOpen(true);
  }, []);

  useEffect(() => {
    async function check_auth() {
      let isAuthenticated = await hasToken();
      console.log('isAuthenticated', isAuthenticated);
      setIsAuthenticated(isAuthenticated);
    }
    check_auth();
  }, []);

  useEffect(() => {
    return on(EventType.SESSION_INVALID, () => {
      console.log('isAuthenticated', false);
      setIsAuthenticated(false);
    });
  }, []);

  useEffect(() => {
    return on(EventType.SESSION_VALID, () => {
      console.log('isAuthenticated', true);
      setIsAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    let listener: MessageListener | undefined;
    if (isAuthenticated) {
      console.log('setting up application listener');
      listener = setupMessageListeners();
      browser.runtime.onMessage.addListener(listener);
    }

    return () => {
      if (listener) {
        console.log('removing application listener');
        browser.runtime.onMessage.removeListener(listener);
      }
    };
  }, [isAuthenticated]);

  function setupMessageListeners(): MessageListener {
    const listener = (
      request: any,
      _sender: browser.Runtime.MessageSender,
      _sendResponse: (response?: any) => void
    ): true | undefined => {
      if (request.action === 'tabUrlChanged') {
        if (request.tabId === currentTabId) {
          if (currentTabId !== undefined) {
            console.log('tabUrlChanged', currentTabId);
          }
        }
      } else if (request.action === 'activeTabChanged') {
        setCurrentTabId(request.tabId);
        if (request.isValidUrl) {
          if (currentTabId !== undefined) {
            console.log('activeTabChanged', currentTabId);
          }
        } else if (request.isBlankPage) {
          console.log('isBlankPage', currentTabId);
        }
      }
      return undefined;
    };
    return listener;
  }

  return (
    <RCApplicationContext.Provider
      value={{
        isAuthenticated,
        currentTabId,
        userHttpService: serviceImpl,
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
