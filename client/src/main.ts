import Phaser from "phaser";

import { BootScene } from "./scenes/BootScene";
import { LobbyScene } from "./scenes/LobbyScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#1f2937",
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: "game",
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
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
