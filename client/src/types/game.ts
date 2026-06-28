export type PlayerNumber = 1 | 2;

export type RoomStatus = "waiting" | "ready" | "in_game";

export interface PublicGameRoom {
  id: string;
  playersCount: number;
  status: RoomStatus;
}

export interface RoomCreatedPayload {
  room: PublicGameRoom;
  playerNumber: PlayerNumber;
}

export interface RoomJoinedPayload {
  room: PublicGameRoom;
  playerNumber: PlayerNumber;
}

export interface RoomReadyPayload {
  room: PublicGameRoom;
}

export interface RoomErrorPayload {
  message: string;
}
