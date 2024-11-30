import { useEffect} from "react";
import { useContext } from "react";
import { RCApplicationContext } from "@/components/app/AppContextProvider";
import { PopupContainer } from "./PopupContainer";

export function Popup() {
  const showLoginPage = useContext(RCApplicationContext)?.showLoginPage;
  const { isAuthenticated } = useContext(RCApplicationContext) || {};

  useEffect(() => {
    if (!isAuthenticated) {
      showLoginPage?.();
    } 
  }, [isAuthenticated]);

  return (
    <div id="popup-container">
      {isAuthenticated && <PopupContainer />}
    </div>
  );

}
