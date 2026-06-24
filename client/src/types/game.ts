export type PlayerSide = "left" | "right";

export interface ShotConfig {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  power: number;
  side: PlayerSide;
}
