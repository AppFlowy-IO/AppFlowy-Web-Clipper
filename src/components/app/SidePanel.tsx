import { useContext, useEffect } from "react";
import { RCApplicationContext } from "./AppContextProvider";
import browser from 'webextension-polyfill';
export function SidePanel() {
  const currentTabId = useContext(RCApplicationContext)?.currentTabId;

  useEffect(() => {
     browser.runtime.sendMessage({ action: 'sidePanelOpened' });
  }, []);


  return (
    <div id='flex items-center justify-center flex-wrap p-26'>
      <div className='mr-26 flex flex-shrink-0 items-center text-gray-600'>
        <div className='text-10xl font-semibold'>SidePanel</div>
        <div className='text-10xl font-semibold'>Current tab id: {currentTabId}</div>
      </div>
    </div>
  );
}
