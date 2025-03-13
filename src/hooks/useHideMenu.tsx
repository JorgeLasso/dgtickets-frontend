import { useContext, useEffect } from "react";
import { UiContext } from "../context/UiContext";

const useHideMenu = (hide: boolean) => {
  const { showMenu, hideMenu } = useContext(UiContext)!;

  useEffect(() => {
    if (hide) {
      hideMenu();
    } else {
      showMenu();
    }
  }, [hide, hideMenu, showMenu]);
};

export default useHideMenu;
