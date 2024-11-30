import { runtime, storage, tabs } from 'webextension-polyfill';
import browser from 'webextension-polyfill';


export function PopupBody() {
  

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
            browser.runtime.sendMessage({ action: 'refreshActiveTab' }).then((tab_data: any) => {
              // @ts-ignore
              chrome.sidePanel.setOptions({
                path: '/index.html#/side-panel',
              });
              // @ts-ignore
              chrome.sidePanel.open({ tabId: tab_data.id });

            window.close();
            });
          }}
        >
          Side panel
        </span>
      </div>
    </div>
  );
}
