import Phaser from "phaser";

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 80, "Arrow Duel LAN", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, "Click to Start Local Game", {
        fontSize: "24px",
        color: "#d1d5db",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }
}
