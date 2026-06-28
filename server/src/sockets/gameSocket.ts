import type { Server, Socket } from "socket.io";

import { RoomManager } from "../rooms/roomManager.js";

const roomManager = new RoomManager();

export function registerGameSocket(io: Server, socket: Socket) {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("room:create", () => {
    const room = roomManager.createRoom(socket.id);

    socket.join(room.id);

    socket.emit("room:created", {
      room: roomManager.getPublicRoom(room),
      playerNumber: 1,
    });

    console.log(`Room created: ${room.id}`);
  });

  socket.on("room:join", (payload: { roomId: string }) => {
    try {
      const roomId = payload.roomId.trim().toUpperCase();
      const room = roomManager.joinRoom(roomId, socket.id);

      socket.join(room.id);

      socket.emit("room:joined", {
        room: roomManager.getPublicRoom(room),
        playerNumber: 2,
      });

      io.to(room.id).emit("room:ready", {
        room: roomManager.getPublicRoom(room),
      });

      console.log(`Socket ${socket.id} joined room: ${room.id}`);
    } catch (error) {
      socket.emit("room:error", {
        message: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      });
    }
  });

  socket.on("disconnect", () => {
    roomManager.removePlayer(socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
  });
}
