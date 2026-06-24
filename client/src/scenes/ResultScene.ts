import Phaser from "phaser";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(data: { winner?: string }) {
    const { width, height } = this.scale;

    const winner = data.winner ?? "Unknown Player";

    this.add
      .text(width / 2, height / 2 - 50, `${winner} Wins!`, {
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 30, "Click to return to lobby", {
        fontSize: "22px",
        color: "#d1d5db",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("LobbyScene");
    });
  }
}
