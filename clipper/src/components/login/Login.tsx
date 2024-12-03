import { ReactComponent as Logo } from '@/assets/common/logo.svg';
import { useEffect } from 'react';
import { Button } from '@mui/material';
import i18next from 'i18next';
import { AUTH_CALLBACK_URL } from '@/services/service_impl';
import { tabs } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

export function LoginPage() {
  return (
    <div className='login-page'>
      <Login redirectTo={AUTH_CALLBACK_URL} />
    </div>
  );
}

export function Login({ redirectTo }: { redirectTo: string }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirect to URL:', redirectTo);
    }

    console.log('Token:', localStorage.getItem('token'));
  }, [redirectTo]);

  async function signInWithAppFlowy() {
    await browser.storage.local.set({
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

      <Button
        onClick={signInWithAppFlowy}
        variant={'contained'}
        className={
          'flex h-[46px] w-[380px] items-center justify-center gap-2 rounded-[12px] text-base max-sm:w-full'
        }
      >
        {i18next.t('auth.signInWithAppFlowy')}
      </Button>
    </div>
  );
}

function LogoSection() {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-4'>
      <Logo className='h-10 w-10' />
      <div className='text-[20px] font-semibold sm:text-[24px]'>
        {i18next.t('auth.welcomeTo')} AppFlowy
      </div>
    </div>
  );
}

//@ts-ignore
function TermsSection() {
  return (
    <div className='text-text-caption mt-6 w-full max-w-[300px] overflow-hidden whitespace-pre-wrap break-words text-center text-[12px] tracking-[0.36px] sm:mt-10'>
      <span>{i18next.t('auth.signInAgreement')} </span>
      <a
        href='https://appflowy.io/terms'
        target='_blank'
        className='text-fill-default underline'
      >
        {i18next.t('auth.termOfUse')}
      </a>{' '}
      {i18next.t('auth.and')}{' '}
      <a
        href='https://appflowy.io/privacy'
        target='_blank'
        className='text-fill-default underline'
      >
        {i18next.t('auth.privacyPolicy')}
      </a>
      .
    </div>
  );
}
