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

export interface ShotPayload {
  roomId: string;
  playerNumber: PlayerNumber;
  angle: number;
  powerRatio: number;
}

export interface SyncedWindState {
  direction: "left" | "right" | "none";
  strength: number;
  level: number;
  label: string;
}

export interface TurnResultPayload {
  roomId: string;
  shooter: PlayerNumber;
  target: PlayerNumber;
  result: "hit" | "miss";
  winner?: PlayerNumber;
  windState?: SyncedWindState;
}

export interface RematchPayload {
  roomId: string;
}
