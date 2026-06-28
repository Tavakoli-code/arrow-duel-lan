import Phaser from "phaser";

import { WindSystem } from "../systems/WindSystem";

type PlayerNumber = 1 | 2;

export class GameScene extends Phaser.Scene {
  private player1Hitbox!: Phaser.GameObjects.Rectangle;
  private player2Hitbox!: Phaser.GameObjects.Rectangle;

  private player1Visual!: Phaser.GameObjects.Image;
  private player2Visual!: Phaser.GameObjects.Image;

  private player1Body!: Phaser.Physics.Arcade.StaticBody;
  private player2Body!: Phaser.Physics.Arcade.StaticBody;

  private aimLine!: Phaser.GameObjects.Line;
  private powerText!: Phaser.GameObjects.Text;
  private windText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  private powerBarBg!: Phaser.GameObjects.Rectangle;
  private powerBarFill!: Phaser.GameObjects.Rectangle;

  private windSystem = new WindSystem();

  private currentPlayer: PlayerNumber = 1;

  private isCharging = false;
  private isResolvingTurn = false;

  private power = 0;
  private maxPower = 900;
  private powerChargeSpeed = 700;

  private player1Score = 0;
  private player2Score = 0;
  private winningScore = 5;

  private arrow?: Phaser.Physics.Arcade.Image;

  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.scale;

    this.createGeneratedTextures();

    this.add
      .text(width / 2, 30, "Arrow Duel LAN", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.instructionText = this.add
      .text(width / 2, 65, "", {
        fontSize: "18px",
        color: "#d1d5db",
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(width / 2, 100, "", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.powerText = this.add.text(24, 24, "Power: 0%", {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.windText = this.add.text(24, 54, this.windSystem.getDisplayText(), {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.powerBarBg = this.add
      .rectangle(24, 90, 220, 18, 0x374151)
      .setOrigin(0, 0.5);

    this.powerBarFill = this.add
      .rectangle(24, 90, 220, 18, 0xfacc15)
      .setOrigin(0, 0.5);

    this.powerBarFill.scaleX = 0;

    const groundHeight = 90;
    const groundY = height - groundHeight / 2;
    const groundTop = height - groundHeight;

    this.add.rectangle(width / 2, groundY, width, groundHeight, 0x374151);

    const playerY = groundTop - 55;

    this.player1Hitbox = this.add.rectangle(170, playerY, 70, 110, 0x000000, 0);
    this.player2Hitbox = this.add.rectangle(
      width - 170,
      playerY,
      70,
      110,
      0x000000,
      0,
    );

    this.physics.add.existing(this.player1Hitbox, true);
    this.physics.add.existing(this.player2Hitbox, true);

    this.player1Body = this.player1Hitbox
      .body as Phaser.Physics.Arcade.StaticBody;
    this.player2Body = this.player2Hitbox
      .body as Phaser.Physics.Arcade.StaticBody;

    this.player1Visual = this.add
      .image(this.player1Hitbox.x, this.player1Hitbox.y, "archer-blue")
      .setDisplaySize(96, 128);

    this.player2Visual = this.add
      .image(this.player2Hitbox.x, this.player2Hitbox.y, "archer-red")
      .setDisplaySize(96, 128)
      .setFlipX(true);

    this.add
      .text(this.player1Hitbox.x, this.player1Hitbox.y - 82, "Player 1", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(this.player2Hitbox.x, this.player2Hitbox.y - 82, "Player 2", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xffffff).setOrigin(0, 0);

    this.updateScoreText();
    this.updateInstructionText();

    this.input.on("pointerdown", () => {
      if (this.arrow || this.isResolvingTurn) {
        return;
      }

      this.isCharging = true;
      this.power = 0;
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.isCharging || this.arrow || this.isResolvingTurn) {
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

    const powerRatio = this.power / this.maxPower;
    const powerPercent = Math.round(powerRatio * 100);

    this.powerText.setText(`Power: ${powerPercent}%`);
    this.powerBarFill.scaleX = powerRatio;

    if (this.arrow) {
      this.applyWindToArrow(delta);
      this.updateArrowRotation();
      this.checkArrowHit();

      if (
        this.arrow &&
        (this.arrow.y > this.scale.height + 100 ||
          this.arrow.x > this.scale.width + 100 ||
          this.arrow.x < -100)
      ) {
        this.handleMiss();
      }
    }
  }

  private createGeneratedTextures() {
    this.createArcherTexture("archer-blue", 0x3b82f6, 0x93c5fd);
    this.createArcherTexture("archer-red", 0xef4444, 0xfca5a5);
    this.createArrowTexture();
  }

  private createArcherTexture(
    key: string,
    mainColor: number,
    accentColor: number,
  ) {
    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.add.graphics();

    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(48, 118, 64, 14);

    graphics.lineStyle(8, mainColor, 1);
    graphics.lineBetween(42, 86, 34, 112);
    graphics.lineBetween(54, 86, 62, 112);

    graphics.lineStyle(6, 0x111827, 1);
    graphics.lineBetween(30, 114, 42, 114);
    graphics.lineBetween(58, 114, 70, 114);

    graphics.fillStyle(mainColor, 1);
    graphics.fillRoundedRect(34, 48, 28, 44, 10);

    graphics.lineStyle(4, accentColor, 1);
    graphics.lineBetween(36, 62, 62, 80);

    graphics.fillStyle(0xf8d7aa, 1);
    graphics.fillCircle(48, 32, 15);

    graphics.fillStyle(0x111827, 1);
    graphics.fillRoundedRect(35, 18, 26, 10, 4);

    graphics.lineStyle(7, 0xf8d7aa, 1);
    graphics.lineBetween(58, 58, 75, 66);
    graphics.lineBetween(38, 58, 30, 74);

    graphics.lineStyle(4, 0x8b5a2b, 1);
    graphics.strokeEllipse(78, 64, 18, 74);

    graphics.lineStyle(2, 0xe5e7eb, 1);
    graphics.lineBetween(78, 27, 78, 101);

    graphics.lineStyle(2, 0xfacc15, 1);
    graphics.lineBetween(54, 64, 88, 64);

    graphics.fillStyle(0xfacc15, 1);
    graphics.fillTriangle(88, 58, 96, 64, 88, 70);

    graphics.generateTexture(key, 96, 128);
    graphics.destroy();
  }

  private createArrowTexture() {
    if (this.textures.exists("arrow")) {
      return;
    }

    const graphics = this.add.graphics();

    graphics.lineStyle(4, 0xfacc15, 1);
    graphics.lineBetween(4, 6, 48, 6);

    graphics.fillStyle(0xf59e0b, 1);
    graphics.fillTriangle(48, 0, 60, 6, 48, 12);

    graphics.fillStyle(0xe5e7eb, 1);
    graphics.fillTriangle(4, 6, 0, 1, 12, 5);
    graphics.fillTriangle(4, 6, 0, 11, 12, 7);

    graphics.generateTexture("arrow", 60, 12);
    graphics.destroy();
  }

  private updateAimLine() {
    if (this.arrow || this.isResolvingTurn) {
      this.aimLine.setVisible(false);
      return;
    }

    this.aimLine.setVisible(true);

    const pointer = this.input.activePointer;
    const { startX, startY } = this.getCurrentShotStart();

    const distance = Phaser.Math.Distance.Between(
      startX,
      startY,
      pointer.worldX,
      pointer.worldY,
    );
    const windLevel = this.windSystem.getState().level;
    const maxGuideLength = Math.max(70, 160 - windLevel * 18);
    const guideLength = Math.min(distance, maxGuideLength);

    const angle = Phaser.Math.Angle.Between(
      startX,
      startY,
      pointer.worldX,
      pointer.worldY,
    );

    const endX = startX + Math.cos(angle) * guideLength;
    const endY = startY + Math.sin(angle) * guideLength;

    this.aimLine.setTo(startX, startY, endX, endY);
  }

  private shootArrow(targetX: number, targetY: number) {
    const { startX, startY } = this.getCurrentShotStart();

    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);

    const velocityX = Math.cos(angle) * this.power;
    const velocityY = Math.sin(angle) * this.power;

    this.arrow = this.physics.add.image(startX, startY, "arrow");
    this.arrow.setOrigin(0.5, 0.5);
    this.arrow.setRotation(angle);

    const arrowBody = this.arrow.body as Phaser.Physics.Arcade.Body;
    arrowBody.setAllowGravity(true);
    arrowBody.setVelocity(velocityX, velocityY);
    arrowBody.setSize(54, 8);
  }

  private applyWindToArrow(delta: number) {
    if (!this.arrow) {
      return;
    }

    const body = this.arrow.body as Phaser.Physics.Arcade.Body;
    const windForceX = this.windSystem.getForceX();

    body.setVelocityX(body.velocity.x + (windForceX * delta) / 1000);
  }

  private updateArrowRotation() {
    if (!this.arrow) {
      return;
    }

    const body = this.arrow.body as Phaser.Physics.Arcade.Body;

    if (body.velocity.length() > 10) {
      this.arrow.setRotation(Math.atan2(body.velocity.y, body.velocity.x));
    }
  }

  private checkArrowHit() {
    if (!this.arrow) {
      return;
    }

    const arrowBody = this.arrow.body as Phaser.Physics.Arcade.Body;
    const targetBody =
      this.currentPlayer === 1 ? this.player2Body : this.player1Body;

    const arrowBounds = new Phaser.Geom.Rectangle(
      arrowBody.x,
      arrowBody.y,
      arrowBody.width,
      arrowBody.height,
    );

    const targetBounds = new Phaser.Geom.Rectangle(
      targetBody.x,
      targetBody.y,
      targetBody.width,
      targetBody.height,
    );

    const didHitTarget = Phaser.Geom.Intersects.RectangleToRectangle(
      arrowBounds,
      targetBounds,
    );

    if (!didHitTarget) {
      return;
    }

    const shooter = this.currentPlayer;
    const target = shooter === 1 ? 2 : 1;

    if (shooter === 1) {
      this.player1Score += 1;
    } else {
      this.player2Score += 1;
    }

    this.updateScoreText();

    const windState = this.windSystem.increaseDifficulty();
    this.windText.setText(this.windSystem.getDisplayText());

    this.showStatusMessage(
      `Player ${shooter} hit Player ${target}! Wind is now ${windState.label}`,
    );

    this.destroyArrow();

    if (this.getCurrentPlayerScore() >= this.winningScore) {
      this.scene.start("ResultScene", {
        winner: `Player ${shooter}`,
      });
      return;
    }

    this.endTurnAfterDelay();
  }

  private handleMiss() {
    this.showStatusMessage(`Player ${this.currentPlayer} missed!`);
    this.destroyArrow();
    this.endTurnAfterDelay();
  }

  private endTurnAfterDelay() {
    this.isResolvingTurn = true;

    this.time.delayedCall(800, () => {
      this.switchTurn();
      this.isResolvingTurn = false;
    });
  }

  private switchTurn() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.power = 0;
    this.updateInstructionText();
  }

  private getCurrentShotStart() {
    if (this.currentPlayer === 1) {
      return {
        startX: this.player1Hitbox.x + 44,
        startY: this.player1Hitbox.y - 24,
      };
    }

    return {
      startX: this.player2Hitbox.x - 44,
      startY: this.player2Hitbox.y - 24,
    };
  }

  private getCurrentPlayerScore() {
    return this.currentPlayer === 1 ? this.player1Score : this.player2Score;
  }

  private updateScoreText() {
    this.scoreText.setText(
      `Player 1: ${this.player1Score}  |  Player 2: ${this.player2Score}`,
    );
  }

  private updateInstructionText() {
    this.instructionText.setText(
      `Player ${this.currentPlayer}: Aim with mouse, hold click to charge, release to shoot`,
    );
  }

  private showStatusMessage(message: string) {
    const { width } = this.scale;

    const statusText = this.add
      .text(width / 2, 145, message, {
        fontSize: "22px",
        color: "#facc15",
      })
      .setOrigin(0.5);

    this.time.delayedCall(700, () => {
      statusText.destroy();
    });
  }

  private destroyArrow() {
    if (!this.arrow) {
      return;
    }

    this.arrow.destroy();
    this.arrow = undefined;
    this.power = 0;
  }
}
