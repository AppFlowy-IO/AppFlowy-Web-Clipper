import { useEffect, useState } from 'react';
import { storage } from 'webextension-polyfill';

export function PopupContent() {
  const [user_data, set_user_data] = useState<any>(null);
  useEffect(() => {
    async function check_auth() {
      let storage_data: any = await storage.local.get(['token']);
      let user_data = JSON.parse(storage_data.token).user;
      set_user_data(user_data);
    }
    check_auth();
  }, []);

  return (
    <div className='flex flex-col gap-20'>
      <div className='flex flex-col gap-10'>
        <span className='text-10xl font-semibold'>
          Hello AppFlowy Web Clipper
        </span>
        <pre className='text-10xl font-semibold'>
          {JSON.stringify(user_data, null, '\t')}
        </pre>
      </div>
    </div>
  );
}
