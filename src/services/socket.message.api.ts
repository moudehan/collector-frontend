import { io, Socket } from "socket.io-client";
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
