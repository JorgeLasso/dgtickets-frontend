export const connectToWebSockets = () => {
  const socket = new WebSocket("ws://localhost:3000/ws");

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
