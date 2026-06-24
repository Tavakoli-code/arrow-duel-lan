# Arrow Duel LAN

Arrow Duel LAN is a 2D browser-based local multiplayer shooting game.

Two players connect from computers on the same Wi-Fi network and fight in a turn-based arrow duel. Each player controls a character and shoots arrows using angle and power. The first player to hit the opponent 5 times wins.

## Core Features

- 2-player local network multiplayer
- Browser-based gameplay
- Turn-based arrow shooting
- Power-based shooting mechanic
- Wind system affecting arrow direction
- Score system up to 5 hits
- Increasing difficulty after each successful hit

## Gameplay Concept

Each round has two players. Players take turns aiming and shooting arrows. A player must choose the correct angle and power to hit the opponent.

After every successful hit, the game becomes harder for both players. Wind strength increases, aim prediction becomes shorter, and arrow control becomes more challenging.

## Tech Stack

- Phaser.js
- TypeScript
- Node.js
- Express
- Socket.IO
- Vite

## Planned MVP

1. Create local multiplayer room
2. Join from another computer on the same Wi-Fi
3. Start 2-player match
4. Aim arrow using mouse
5. Hold to charge power
6. Release to shoot
7. Apply wind effect to arrow
8. Detect successful hit
9. First player with 5 hits wins
