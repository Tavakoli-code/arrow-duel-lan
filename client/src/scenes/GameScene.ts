import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player1!: Phaser.GameObjects.Rectangle;
  private player2!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 30, "Game Scene", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        65,
        "Next: add players, arrow shooting, wind and score",
        {
          fontSize: "18px",
          color: "#d1d5db",
        },
      )
      .setOrigin(0.5);

    this.add.rectangle(width / 2, height - 40, width, 80, 0x374151);

    this.player1 = this.add.rectangle(160, height - 110, 48, 80, 0x3b82f6);
    this.player2 = this.add.rectangle(
      width - 160,
      height - 110,
      48,
      80,
      0xef4444,
    );

    this.add
      .text(this.player1.x, this.player1.y - 60, "Player 1", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(this.player2.x, this.player2.y - 60, "Player 2", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start("LobbyScene");
    });
  }
}
