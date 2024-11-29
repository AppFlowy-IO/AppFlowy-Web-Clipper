import { ReactComponent as Logo } from '@/assets/common/logo.svg';
import { useCallback, useContext, useEffect } from 'react';
import MagicLink from '@/components/login/MagicLink';
import LoginProvider from '@/components/login/LoginProvider';
import { Divider } from '@mui/material';
import i18next from 'i18next';
import { AUTH_CALLBACK_URL } from '@/services/service_impl';
import { RCApplicationContext } from '../app/AppContextProvider';
import { emit } from '@/services/session';
import { EventType } from '@/services/session';
import { useNavigate } from 'react-router-dom';
import { storage, tabs } from 'webextension-polyfill';

export function LoginPage() {
  return (
    <div className='login-page'>
      <Login redirectTo={AUTH_CALLBACK_URL} />
    </div>
  );
}

export function Login({ redirectTo }: { redirectTo: string }) {
  const httpService = useContext(RCApplicationContext)?.userHttpService;
  const showLoginPage = useContext(RCApplicationContext)?.showLoginPage;
  const navigate = useNavigate();

  const loginCallback = useCallback(
    async (url: string) => {
      try {
        await httpService?.loginAuth(url);
        emit(EventType.SESSION_VALID);
      } catch (e: any) {
        console.error(e);

        emit(EventType.SESSION_INVALID);
        showLoginPage?.();
      } finally {
        navigate('/');
      }
    },
    [httpService]
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirect to URL:', redirectTo);
    }
  }, [redirectTo]);

  async function signInWithAppFlowy() {
    await storage.local.set({
      auth_flow_active: true,
    });
    await tabs.create({
      active: true,
      url: `https://appflowy.com/`,
    });
  }

  return (
    <div className='my-6 flex flex-col items-center justify-center gap-6 px-4 sm:my-10'>
      <LogoSection />
      <div onClick={signInWithAppFlowy} className='cursor-pointer'>
        Sign in with AppFlowy
      </div>
      <MagicLink redirectTo={redirectTo} />
      <div className='flex w-full items-center justify-center gap-2 text-text-caption'>
        <Divider className='flex-1 border-line-divider' />
        {i18next.t('web.or')}
        <Divider className='flex-1 border-line-divider' />
      </div>
      <LoginProvider redirectTo={redirectTo} callback={loginCallback} />
      <TermsSection />
    </div>
  );
}

function LogoSection() {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-4'>
      <Logo className='h-10 w-10' />
      <div className='text-[20px] font-semibold sm:text-[24px]'>
        {i18next.t('web.welcomeTo')} AppFlowy
      </div>
    </div>
  );
}

function TermsSection() {
  return (
    <div className='mt-6 w-full max-w-[300px] overflow-hidden whitespace-pre-wrap break-words text-center text-[12px] tracking-[0.36px] text-text-caption sm:mt-10'>
      <span>{i18next.t('web.signInAgreement')} </span>
      <a
        href='https://appflowy.io/terms'
        target='_blank'
        className='text-fill-default underline'
      >
        {i18next.t('web.termOfUse')}
      </a>{' '}
      {i18next.t('web.and')}{' '}
      <a
        href='https://appflowy.io/privacy'
        target='_blank'
        className='text-fill-default underline'
      >
        {i18next.t('web.privacyPolicy')}
      </a>
      .
    </div>
  );
}
