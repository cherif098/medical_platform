import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const socket = io(backendUrl, {
  transports: ["websocket"],
  autoConnect: true 
});

socket.on("connect", () => console.log(" WebSocket connecté !"));
socket.on("disconnect", () => console.log("WebSocket déconnecté !"));

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};