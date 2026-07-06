import type { GameRoom, PlayerNumber, PublicGameRoom } from "../types/game.js";

export class RoomManager {
  private rooms = new Map<string, GameRoom>();

  createRoom(socketId: string): GameRoom {
    const roomId = this.generateRoomId();

    const room: GameRoom = {
      id: roomId,
      players: [
        {
          socketId,
          playerNumber: 1,
        },
      ],
      status: "waiting",
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);

    return room;
  }

  joinRoom(roomId: string, socketId: string): GameRoom {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    if (room.players.length >= 2) {
      throw new Error("ROOM_FULL");
    }

    const alreadyJoined = room.players.some(
      (player) => player.socketId === socketId,
    );

    if (alreadyJoined) {
      return room;
    }

    const playerNumber: PlayerNumber = 2;

    room.players.push({
      socketId,
      playerNumber,
    });

    room.status = "ready";

    return room;
  }

  removePlayer(socketId: string): void {
    for (const [roomId, room] of this.rooms.entries()) {
      const remainingPlayers = room.players.filter(
        (player) => player.socketId !== socketId,
      );

      if (remainingPlayers.length === room.players.length) {
        continue;
      }

      if (remainingPlayers.length === 0) {
        this.rooms.delete(roomId);
        return;
      }

      room.players = remainingPlayers;
      room.status = "waiting";
      this.rooms.set(roomId, room);
      return;
    }
  }

  getPublicRoom(room: GameRoom): PublicGameRoom {
    return {
      id: room.id,
      playersCount: room.players.length,
      status: room.status,
    };
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  findRoomBySocketId(socketId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      const isInRoom = room.players.some(
        (player) => player.socketId === socketId,
      );

      if (isInRoom) {
        return room;
      }
    }

    return undefined;
  }
}
