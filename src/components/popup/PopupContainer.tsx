import { PopupBody } from './PopupBody.tsx';
import { PopupHeader } from './PopupHeader';

export function PopupContainer() {
  return (
    <div id='flex items-center justify-center flex-wrap p-26'>
      <div className='mr-26 flex flex-shrink-0 items-center text-gray-600'>
        <span className='text-10xl font-semibold'>
          <PopupHeader />
          <PopupBody />
        </span>
      </div>
    </div>
  );
}
