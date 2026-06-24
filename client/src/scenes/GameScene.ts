import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player1!: Phaser.GameObjects.Rectangle;
  private player2!: Phaser.GameObjects.Rectangle;

  private aimLine!: Phaser.GameObjects.Line;
  private powerText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  private isCharging = false;
  private power = 0;
  private maxPower = 900;
  private powerChargeSpeed = 700;

  private arrow?: Phaser.Physics.Arcade.Image;

  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 30, "Arrow Duel LAN", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.instructionText = this.add
      .text(
        width / 2,
        65,
        "Player 1: Aim with mouse, hold click to charge, release to shoot",
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

    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xffffff).setOrigin(0, 0);
    this.powerText = this.add.text(20, 20, "Power: 0%", {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.input.on("pointerdown", () => {
      if (this.arrow) {
        return;
      }

      this.isCharging = true;
      this.power = 0;
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.isCharging || this.arrow) {
        return;
      }

      this.isCharging = false;
      this.shootArrow(pointer.worldX, pointer.worldY);
    });

    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start("LobbyScene");
    });
  }

  update(time: number, delta: number) {
    this.updateAimLine();

    if (this.isCharging) {
      this.power += (this.powerChargeSpeed * delta) / 1000;

      if (this.power > this.maxPower) {
        this.power = this.maxPower;
      }
    }

    const powerPercent = Math.round((this.power / this.maxPower) * 100);
    this.powerText.setText(`Power: ${powerPercent}%`);

    if (this.arrow && this.arrow.y > this.scale.height + 100) {
      this.arrow.destroy();
      this.arrow = undefined;
      this.power = 0;
    }
  }

  private updateAimLine() {
    const pointer = this.input.activePointer;

    const startX = this.player1.x + 30;
    const startY = this.player1.y - 20;

    const endX = pointer.worldX;
    const endY = pointer.worldY;

    this.aimLine.setTo(startX, startY, endX, endY);
  }

  private shootArrow(targetX: number, targetY: number) {
    const startX = this.player1.x + 30;
    const startY = this.player1.y - 20;

    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);

    const velocityX = Math.cos(angle) * this.power;
    const velocityY = Math.sin(angle) * this.power;

    this.arrow = this.physics.add.image(startX, startY, "");

    const arrowBody = this.arrow.body as Phaser.Physics.Arcade.Body;
    arrowBody.setAllowGravity(true);
    arrowBody.setVelocity(velocityX, velocityY);
    arrowBody.setSize(24, 6);

    this.arrow.setDisplaySize(32, 6);
    this.arrow.setTint(0xfacc15);

    this.arrow.setRotation(angle);
  }
}
