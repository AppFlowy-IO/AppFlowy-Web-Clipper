import { ReactComponent as Logo } from '@/assets/common/logo.svg';
import { useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RCApplicationContext } from '@/components/app/AppContextProvider';
import MagicLink from '@/components/login/MagicLink';
import LoginProvider from '@/components/login/LoginProvider';
import { Divider } from '@mui/material';
import i18next from 'i18next';

export function LoginPage() {
  const redirectTo = useLoginRedirect();
  return (
    <div className="login-page">
        <Login redirectTo={redirectTo} />
    </div>
  );
}

export function useLoginRedirect() {
  const [search] = useSearchParams();
  const redirectTo = search.get('redirectTo') || '';
  const isAuthenticated = useContext(RCApplicationContext)?.isAuthenticated || false;

  useEffect(() => {
    if (
      isAuthenticated &&
      redirectTo &&
      decodeURIComponent(redirectTo) !== window.location.href
    ) {
      window.location.href = decodeURIComponent(redirectTo);
    }
  }, [isAuthenticated, redirectTo]);

  return redirectTo;
}

export function Login({ redirectTo }: { redirectTo: string }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirect to URL:', redirectTo);
    }
  }, [redirectTo]);

  return (
    <div className="my-6 sm:my-10 flex flex-col items-center justify-center gap-6 px-4">
      <LogoSection />
      <MagicLink redirectTo={redirectTo} />
      <div className="flex w-full items-center justify-center gap-2 text-text-caption">
        <Divider className="flex-1 border-line-divider" />
        {i18next.t('web.or')}
        <Divider className="flex-1 border-line-divider" />
      </div>
      <LoginProvider redirectTo={redirectTo} />
      <TermsSection />
    </div>
  );
}

function LogoSection() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <Logo className="h-10 w-10" />
      <div className="text-[20px] sm:text-[24px] font-semibold">
        {i18next.t('web.welcomeTo')} AppFlowy
      </div>
    </div>
  );
}

function TermsSection() {
  return (
    <div className="mt-6 sm:mt-10 w-full max-w-[300px] overflow-hidden whitespace-pre-wrap break-words text-center text-[12px] tracking-[0.36px] text-text-caption">
      <span>{i18next.t('web.signInAgreement')} </span>
      <a
        href="https://appflowy.io/terms"
        target="_blank"
        className="text-fill-default underline"
      >
        {i18next.t('web.termOfUse')}
      </a>{' '}
      {i18next.t('web.and')}{' '}
      <a
        href="https://appflowy.io/privacy"
        target="_blank"
        className="text-fill-default underline"
      >
        {i18next.t('web.privacyPolicy')}
      </a>
      .
    </div>
  );
}