import { useEffect, useState } from 'react';
import { runtime, storage, tabs } from 'webextension-polyfill';

export function PopupBody() {
  const [user_data, set_user_data] = useState<any>(null);
  const [active_tab_data, set_active_tab_data] = useState<any>(null);
  useEffect(() => {
    async function check_auth() {
      let storage_data: any = await storage.local.get(['token']);
      if (storage_data && storage_data.token) {
        let user_data = JSON.parse(storage_data.token).user;
        set_user_data(user_data);
      }
    }
    check_auth();
  }, []);
  useEffect(() => {
    function load_active_tab_data() {
      // @ts-ignore
      chrome.runtime.sendMessage(
        { name: 'get_active_tab_data' },
        (tab_data: any) => {
          set_active_tab_data(tab_data);
        }
      );
    }
    load_active_tab_data();
  }, []);

  return (
    <div className='flex h-full flex-col gap-20 overflow-auto'>
      <div className='flex flex-col gap-10'>
        <span className='text-10xl font-semibold'>
          Hello AppFlowy Web Clipper
        </span>{' '}
        <span
          className='text-10xl cursor-pointer font-semibold'
          onClick={() => {
            storage.local.clear().then(() => {
              location.reload();
            });
          }}
        >
          Log out
        </span>
        <span
          className='text-10xl cursor-pointer font-semibold'
          onClick={() => {
            tabs.create({
              url: runtime.getURL('/index.html#/settings'),
            });
          }}
        >
          Settings
        </span>
        <span
          className='text-10xl cursor-pointer font-semibold'
          onClick={() => {
            // @ts-ignore
            chrome.sidePanel.setOptions({
              tabId: active_tab_data.id,
              path: '/index.html#/side-panel',
              enabled: true,
            });
            // @ts-ignore
            chrome.sidePanel.open({ tabId: active_tab_data.id });
          }}
        >
          Side panel
        </span>
        <pre className='text-10xl font-semibold'>
          {JSON.stringify(user_data, null, '\t')}
        </pre>
        <pre className='text-10xl font-semibold'>
          {JSON.stringify(active_tab_data, null, '\t')}
        </pre>
      </div>
    </div>
  );
}
