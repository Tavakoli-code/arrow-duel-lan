import Phaser from "phaser";

import { BootScene } from "./scenes/BootScene";
import { LobbyScene } from "./scenes/LobbyScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 540,
  backgroundColor: "#1f2937",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 500,
      },
      debug: false,
    },
  },
  scene: [BootScene, LobbyScene, GameScene, ResultScene],
};

new Phaser.Game(config);
