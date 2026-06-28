import Phaser from "phaser";
import { WindSystem } from "../systems/WindSystem";

type PlayerNumber = 1 | 2;

export class GameScene extends Phaser.Scene {
  private player1!: Phaser.GameObjects.Rectangle;
  private player2!: Phaser.GameObjects.Rectangle;

  private player1Body!: Phaser.Physics.Arcade.StaticBody;
  private player2Body!: Phaser.Physics.Arcade.StaticBody;

  private aimLine!: Phaser.GameObjects.Line;
  private powerText!: Phaser.GameObjects.Text;
  private powerBarBg!: Phaser.GameObjects.Rectangle;
  private powerBarFill!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

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

  private windSystem = new WindSystem();
  private windText!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.scale;

    this.createArrowTexture();

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

    this.add.rectangle(width / 2, height - 40, width, 80, 0x374151);

    this.player1 = this.add.rectangle(160, height - 110, 48, 80, 0x3b82f6);
    this.player2 = this.add.rectangle(
      width - 160,
      height - 110,
      48,
      80,
      0xef4444,
    );

    this.physics.add.existing(this.player1, true);
    this.physics.add.existing(this.player2, true);

    this.player1Body = this.player1.body as Phaser.Physics.Arcade.StaticBody;
    this.player2Body = this.player2.body as Phaser.Physics.Arcade.StaticBody;

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

    this.powerBarBg = this.add
      .rectangle(120, 85, 200, 16, 0x374151)
      .setOrigin(0, 0.5);

    this.powerBarFill = this.add
      .rectangle(120, 85, 0, 16, 0xfacc15)
      .setOrigin(0, 0.5);

    this.windText = this.add.text(20, 50, this.windSystem.getDisplayText(), {
      fontSize: "20px",
      color: "#ffffff",
    });

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
    this.powerBarFill.width = 200 * powerRatio;

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

  private createArrowTexture() {
    if (this.textures.exists("arrow")) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0xfacc15, 1);
    graphics.fillRect(0, 0, 32, 6);
    graphics.generateTexture("arrow", 32, 6);
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

    const arrowBody = this.arrow.body as Phaser.Physics.Arcade.Body;
    arrowBody.setAllowGravity(true);
    arrowBody.setVelocity(velocityX, velocityY);
    arrowBody.setSize(32, 6);

    this.arrow.setDisplaySize(32, 6);
    this.arrow.setRotation(angle);
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
        startX: this.player1.x + 30,
        startY: this.player1.y - 20,
      };
    }

    return {
      startX: this.player2.x - 30,
      startY: this.player2.y - 20,
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

  private applyWindToArrow(delta: number) {
    if (!this.arrow) {
      return;
    }

    const body = this.arrow.body as Phaser.Physics.Arcade.Body;
    const windForceX = this.windSystem.getForceX();

    body.setVelocityX(body.velocity.x + (windForceX * delta) / 1000);
  }
}
