import { io } from "socket.io-client";

const serverUrl = `${window.location.protocol}//${window.location.hostname}:4000`;

export const socket = io(serverUrl, {
  autoConnect: false,
  transports: ["websocket"],
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
