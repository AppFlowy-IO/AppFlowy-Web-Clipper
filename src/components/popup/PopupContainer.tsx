import { PopupBody } from "./PopupBody.tsx";
import { PopupHeader } from "./PopupHeader";

export function PopupContainer() {
  return (
    <div id="flex items-center justify-center flex-wrap p-26">
      <div className="flex items-center flex-shrink-0 text-gray-600 mr-26">
        <span className="font-semibold text-10xl">
          <PopupHeader />
          <PopupBody />
      </span>
      </div>
    </div>
  );
}
