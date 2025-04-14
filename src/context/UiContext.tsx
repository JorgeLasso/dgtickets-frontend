import React, { createContext, ReactNode, useState } from "react";

interface UiContextProps {
  isMenuCollapsed: boolean;
  showMenu: () => void;
  hideMenu: () => void;
}

const UiContext = createContext<UiContextProps | undefined>(undefined);

interface UiProviderProps {
  children: ReactNode;
}

const UiProvider: React.FC<UiProviderProps> = ({ children }) => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const showMenu = () => {
    setIsMenuCollapsed(false);
  };

  const hideMenu = () => {
    setIsMenuCollapsed(true);
  };

  return (
    <UiContext.Provider value={{ isMenuCollapsed, showMenu, hideMenu }}>
      {children}
    </UiContext.Provider>
  );
};

export { UiProvider, UiContext };
