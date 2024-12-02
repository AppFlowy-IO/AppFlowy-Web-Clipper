import { RCApplicationContext } from '@/components/app/AppContextProvider';
import { Button, Collapse, Divider } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import { ReactComponent as GoogleSvg } from '@/assets/login/google.svg';
import { ReactComponent as GithubSvg } from '@/assets/login/github.svg';
import { ReactComponent as DiscordSvg } from '@/assets/login/discord.svg';
import { ReactComponent as AppleSvg } from '@/assets/login/apple.svg';
import i18next from 'i18next';

function LoginProvider({
  redirectTo,
  callback,
}: {
  redirectTo: string;
  callback: (url: string) => Promise<void>;
}) {
  const [expand, setExpand] = React.useState(false);
  const options = useMemo(
    () => [
      {
        label: i18next.t('auth.continueWithGoogle'),
        Icon: GoogleSvg,
        value: 'google',
      },
      {
        label: i18next.t('auth.continueWithApple'),
        Icon: AppleSvg,
        value: 'apple',
      },
      {
        label: i18next.t('auth.continueWithGithub'),
        value: 'github',
        Icon: GithubSvg,
      },
      {
        label: i18next.t('auth.continueWithDiscord'),
        value: 'discord',
        Icon: DiscordSvg,
      },
    ],
    []
  );
  const userService = useContext(RCApplicationContext)?.userHttpService;

  const handleClick = useCallback(
    async (option: string) => {
      try {
        let url;
        switch (option) {
          case 'google':
            url = await userService?.signInGoogle({ redirectTo });
            break;
          case 'apple':
            url = await userService?.signInApple({ redirectTo });
            break;
          case 'github':
            url = await userService?.signInGithub({ redirectTo });
            break;
          case 'discord':
            url = await userService?.signInDiscord({ redirectTo });
            break;
        }
        if (url) {
          await callback(url);
        }
      } catch (e) {
        // TODO: handle error
        console.error(e);
      }
    },
    [userService, redirectTo]
  );

  const renderOption = useCallback(
    (option: (typeof options)[0]) => {
      return (
        <Button
          key={option.value}
          color={'inherit'}
          variant={'outlined'}
          onClick={() => handleClick(option.value)}
          className={`flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[12px] border border-line-divider text-sm font-medium  text-text-title max-sm:w-full`}
        >
          <option.Icon className={'h-[24px] w-[24px]'} />
          <div className={'w-auto whitespace-pre'}>{option.label}</div>
        </Button>
      );
    },
    [handleClick]
  );

  return (
    <div
      className={'flex w-full flex-col items-center justify-center gap-[10px]'}
    >
      {options.slice(0, 2).map(renderOption)}
      {!expand && (
        <Button
          color={'inherit'}
          size={'small'}
          onClick={() => setExpand(!expand)}
          className={
            'flex w-full items-center gap-2 text-sm font-medium text-text-caption hover:bg-transparent hover:text-text-title'
          }
        >
          <Divider className={'flex-1'} />
          {i18next.t('auth.moreOptions')}
          <Divider className={'flex-1'} />
        </Button>
      )}

      <Collapse className={'w-full'} in={expand}>
        <div className={'flex w-full flex-col gap-[10px]'}>
          {options.slice(2).map(renderOption)}
        </div>
      </Collapse>
    </div>
  );
}

export default LoginProvider;
