import React, { createContext, ReactNode } from "react";
import { notification } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextProps {
  openNotification: (
    type: NotificationType,
    message: string,
    description: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    type: NotificationType,
    message: string,
    description: string
  ) => {
    api[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  return (
    <NotificationContext.Provider value={{ openNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationProvider, NotificationContext };
