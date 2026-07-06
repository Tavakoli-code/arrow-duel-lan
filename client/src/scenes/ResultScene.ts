import Phaser from "phaser";
import { socket } from "../multiplayer/socket";
import { RematchPayload } from "../types/game";

type GameMode = "local" | "lan";
type PlayerNumber = 1 | 2;

interface ResultSceneData {
  winner?: string;
  mode?: GameMode;
  roomId?: string;
  playerNumber?: PlayerNumber;
}

export class ResultScene extends Phaser.Scene {
  private mode: GameMode = "local";
  private roomId?: string;
  private playerNumber?: PlayerNumber;
  private waitingText?: Phaser.GameObjects.Text;

  constructor() {
    super("ResultScene");
  }

  init(data: ResultSceneData) {
    this.mode = data.mode ?? "local";
    this.roomId = data.roomId;
    this.playerNumber = data.playerNumber;
  }

  create(data: ResultSceneData) {
    const { width, height } = this.scale;

    const winner = data.winner ?? "Unknown Player";

    this.add.rectangle(width / 2, height / 2, width, height, 0x111827);

    this.add
      .text(width / 2, height / 2 - 140, "Match Finished", {
        fontSize: "34px",
        color: "#d1d5db",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 80, `${winner} Wins!`, {
        fontSize: "56px",
        color: "#facc15",
      })
      .setOrigin(0.5);

    socket.off("game:rematch", this.handleRematch);
    socket.on("game:rematch", this.handleRematch);

    this.events.once("shutdown", () => {
      socket.off("game:rematch", this.handleRematch);
    });

    this.createButton(width / 2, height / 2 + 20, "Play Again", () => {
      if (this.mode === "lan" && this.roomId) {
        socket.emit("game:rematch", {
          roomId: this.roomId,
        });

        this.waitingText?.setText("Starting rematch for both players...");
        return;
      }

      this.startRematch();
    });

    this.createButton(width / 2, height / 2 + 90, "Back to Lobby", () => {
      this.scene.start("LobbyScene");
    });

    this.waitingText = this.add
      .text(width / 2, height / 2 + 145, "", {
        fontSize: "18px",
        color: "#facc15",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 160, "Press ESC to return to lobby", {
        fontSize: "18px",
        color: "#9ca3af",
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start("LobbyScene");
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ) {
    const buttonBg = this.add
      .rectangle(x, y, 260, 52, 0x2563eb)
      .setInteractive({
        useHandCursor: true,
      });

    const buttonText = this.add
      .text(x, y, label, {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true,
      });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x1d4ed8);
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x2563eb);
    });

    buttonBg.on("pointerdown", onClick);
    buttonText.on("pointerdown", onClick);
  }

  private handleRematch = (payload: RematchPayload) => {
    if (payload.roomId !== this.roomId) {
      return;
    }

    this.startRematch();
  };

  private startRematch() {
    this.scene.start("GameScene", {
      mode: this.mode,
      roomId: this.roomId,
      playerNumber: this.playerNumber,
    });
  }
}
