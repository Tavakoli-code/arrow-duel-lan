import Phaser from "phaser";

import { connectSocket, socket } from "../multiplayer/socket";
import type {
  RoomCreatedPayload,
  RoomErrorPayload,
  RoomJoinedPayload,
  RoomReadyPayload,
} from "../types/game";

export class LobbyScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private roomText!: Phaser.GameObjects.Text;
  private playerNumber?: 1 | 2;
  private roomId?: string;

  constructor() {
    super("LobbyScene");
  }

  create() {
    const { width, height } = this.scale;

    this.cleanupSocketListeners();
    connectSocket();

    this.add
      .text(width / 2, height / 2 - 170, "Arrow Duel LAN", {
        fontSize: "52px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 115, "Local Wi-Fi Archery Duel", {
        fontSize: "22px",
        color: "#d1d5db",
      })
      .setOrigin(0.5);

    this.createButton(width / 2, height / 2 - 40, "Create LAN Room", () => {
      this.setStatus("Creating room...");
      socket.emit("room:create");
    });

    this.createButton(width / 2, height / 2 + 30, "Join LAN Room", () => {
      const roomId = window.prompt("Enter room code:");

      if (!roomId) {
        return;
      }

      this.setStatus(`Joining room ${roomId.toUpperCase()}...`);
      socket.emit("room:join", {
        roomId,
      });
    });

    this.createButton(
      width / 2,
      height / 2 + 100,
      "Start Local Test Game",
      () => {
        this.scene.start("GameScene", {
          mode: "local",
        });
      },
    );

    this.roomText = this.add
      .text(width / 2, height / 2 + 170, "", {
        fontSize: "24px",
        color: "#facc15",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(
        width / 2,
        height / 2 + 215,
        "Connect to the same Wi-Fi and create or join a room.",
        {
          fontSize: "18px",
          color: "#d1d5db",
        },
      )
      .setOrigin(0.5);

    this.registerSocketListeners();
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ) {
    const buttonBg = this.add
      .rectangle(x, y, 280, 48, 0x2563eb)
      .setInteractive({
        useHandCursor: true,
      });

    const buttonText = this.add
      .text(x, y, label, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x1d4ed8);
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x2563eb);
    });

    buttonBg.on("pointerdown", onClick);
    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on("pointerdown", onClick);
  }

  private registerSocketListeners() {
    socket.on("connect", () => {
      this.setStatus(`Connected to LAN server: ${socket.id}`);
    });

    socket.on("connect_error", () => {
      this.setStatus(
        "Could not connect to server. Make sure server is running on port 3001.",
      );
    });

    socket.on("room:created", (payload: RoomCreatedPayload) => {
      this.roomId = payload.room.id;
      this.playerNumber = payload.playerNumber;

      this.roomText.setText(`Room Code: ${payload.room.id}`);
      this.setStatus("Room created. Ask Player 2 to join using this code.");
    });

    socket.on("room:joined", (payload: RoomJoinedPayload) => {
      this.roomId = payload.room.id;
      this.playerNumber = payload.playerNumber;

      this.roomText.setText(`Joined Room: ${payload.room.id}`);
      this.setStatus("Joined room. Waiting for match to start...");
    });

    socket.on("room:ready", (payload: RoomReadyPayload) => {
      this.roomId = payload.room.id;

      this.setStatus("Both players connected. Starting match...");

      this.time.delayedCall(700, () => {
        this.scene.start("GameScene", {
          mode: "lan",
          roomId: this.roomId,
          playerNumber: this.playerNumber,
        });
      });
    });

    socket.on("room:error", (payload: RoomErrorPayload) => {
      this.setStatus(`Room error: ${payload.message}`);
    });
  }

  private cleanupSocketListeners() {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("room:created");
    socket.off("room:joined");
    socket.off("room:ready");
    socket.off("room:error");
  }

  private setStatus(message: string) {
    if (!this.statusText) {
      return;
    }

    this.statusText.setText(message);
  }
}
