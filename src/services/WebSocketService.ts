import { BASE_WS_URL } from "./api";

export const connectToWebSockets = () => {
  const socket = new WebSocket(BASE_WS_URL);

  socket.onopen = () => {
    console.log("Connected");
  };

  socket.onclose = () => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("Reconnecting...");
      connectToWebSockets();
    }, 1500);
  };

  return socket;
};
