export type PlayerNumber = 1 | 2;

export type RoomStatus = "waiting" | "ready" | "in_game";

export interface RoomPlayer {
  socketId: string;
  playerNumber: PlayerNumber;
}

export interface GameRoom {
  id: string;
  players: RoomPlayer[];
  status: RoomStatus;
  createdAt: number;
}

export interface PublicGameRoom {
  id: string;
  playersCount: number;
  status: RoomStatus;
}
