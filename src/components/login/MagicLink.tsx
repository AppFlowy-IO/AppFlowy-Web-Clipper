import { notify } from '@/components/shared/notify';
import { RCApplicationContext } from '@/components/app/AppContextProvider';
import { Button, CircularProgress, OutlinedInput } from '@mui/material';
import React, { useContext } from 'react';
import isEmail from 'validator/lib/isEmail';
import i18next from 'i18next';

function MagicLink ({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const httpService = useContext(RCApplicationContext)?.userHttpService;
  const handleSubmit = async () => {
    const isValidEmail = isEmail(email);

    if (!isValidEmail) {
      notify.error(i18next.t('auth.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      await httpService?.signInMagicLink({
        email,
        redirectTo,
      });
      notify.success(i18next.t('auth.magicLinkSent'));
    } catch (e) {
      notify.error(i18next.t('auth.signInError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'flex w-full flex-col items-center justify-center gap-[12px]'}>
      <OutlinedInput
        value={email}
        type={'email'}
        className={'h-[46px] w-[380px] rounded-[12px] py-[15px] px-[20px] text-base max-sm:w-full'}
        placeholder={i18next.t('auth.pleaseInputYourEmail') || 'Please input your email'}
        inputProps={{
          className: 'px-0 py-0',
        }}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        onClick={handleSubmit}
        disabled={loading}
        variant={'contained'}
        className={'flex h-[46px] w-[380px] items-center justify-center gap-2 rounded-[12px] text-base max-sm:w-full'}
      >
        {loading ? (
          <>
            <CircularProgress size={'small'} />
            {i18next.t('editor.loading')}...
          </>
        ) : (
          i18next.t('auth.continue')
        )}
      </Button>
    </div>
  );
}

export default MagicLink;
