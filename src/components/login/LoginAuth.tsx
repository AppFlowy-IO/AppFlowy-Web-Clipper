import { NormalModal } from '@/components/shared/modal';
import LinearBuffer from '@/components/login/LinearBuffer';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ErrorIcon } from '@/assets/common/error.svg';
import i18next from 'i18next';
import { RCApplicationContext } from '@/components/app/AppContextProvider';

function LoginAuth () {
  const httpService = useContext(RCApplicationContext)?.httpService;
  const userSession = useContext(RCApplicationContext)?.userSession;
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openLoginModal = useContext(RCApplicationContext)?.showLoginPage;

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await httpService?.loginAuth(window.location.href);
        // eslint-disable-next-line
      } catch (e: any) {
        setError(e.message);
        setModalOpened(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [httpService]);
  const navigate = useNavigate();

  return <>
    {loading ? (
      <div className={'flex h-screen w-screen items-center justify-center p-20'}>
        <LinearBuffer />
      </div>
    ) : null}
    <NormalModal
      PaperProps={{
        sx: {
          minWidth: 400,
        },
      }}
      onCancel={() => {
        setModalOpened(false);
        navigate('/');
      }}
      closable={false}
      cancelText={i18next.t('button.backToHome') || 'Back to'}
      onOk={() => {
        openLoginModal?.(userSession?.getRedirectTo() || window.location.origin);
      }}
      okText={i18next.t('button.tryAgain') || 'Try again'}
      title={<div className={'text-left font-bold flex gap-2 items-center'}>
        <ErrorIcon className={'w-5 h-5 text-function-error'} />
        Login failed
      </div>}
      open={modalOpened}
    >
      <div className={'text-text-title flex flex-col text-sm gap-1 whitespace-pre-wrap break-words'}>
        {error}
      </div>
    </NormalModal>
  </>;
}

export default LoginAuth;
