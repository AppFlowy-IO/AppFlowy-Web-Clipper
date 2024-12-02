import LinearBuffer from '@/components/login/LinearBuffer';
import { useContext, useEffect, useState } from 'react';
import { RCApplicationContext } from '@/AppContextProvider';
import { useNavigate } from 'react-router-dom';
import { EventType } from '@/services/session';
import { emit } from '@/services/session';

function LoginAuth() {
  const httpService = useContext(RCApplicationContext)?.userHttpService;
  const [loading, setLoading] = useState<boolean>(false);
  //FIXME: show error message
  const [_, setError] = useState<string | null>(null);
  const showLoginPage = useContext(RCApplicationContext)?.showLoginPage;
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await httpService?.loginAuth(window.location.href);
        emit(EventType.SESSION_VALID);
      } catch (e: any) {
        setError(e.message);

        emit(EventType.SESSION_INVALID);
        showLoginPage?.();
      } finally {
        setLoading(false);
        navigate('/');
      }
    })();
  }, [httpService]);

  return (
    <>
      {loading ? (
        <div
          className={'flex h-screen w-screen items-center justify-center p-20'}
        >
          <LinearBuffer />
        </div>
      ) : null}
    </>
  );
}

export default LoginAuth;
