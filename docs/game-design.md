# Game Design Document

## Game Name

Arrow Duel LAN

## Genre

2D local multiplayer shooting game

## Platform

Browser

## Multiplayer Type

Local network multiplayer using Wi-Fi/LAN.

## Match Rules

- 2 players per match
- Each player has one character
- Players shoot arrows at each other
- First player to hit the opponent 5 times wins
- Game becomes harder after each successful hit

## Shooting Mechanic

The shooting system uses angle and power.

Player input:

- Move mouse to aim
- Hold mouse button to increase power
- Release mouse button to shoot

Arrow behavior:

- Arrow follows projectile physics
- Gravity pulls arrow down
- Wind pushes arrow horizontally
- Stronger wind means harder aiming

## Wind System

Wind affects arrow movement.

Difficulty levels:

| Total Hits | Wind Difficulty |
| ---------- | --------------- |
| 0          | No wind         |
| 1          | Light wind      |
| 2          | Medium wind     |
| 3          | Strong wind     |
| 4+         | Unstable wind   |

Wind properties:

- Direction: left or right
- Strength: increases after hits
- Optional later: wind changes during a shot

## Win Condition

The first player to reach 5 successful hits wins the match.

## MVP Features

- Lobby screen
- Create/join room
- Two player connection
- Turn system
- Arrow shooting
- Wind effect
- Hit detection
- Scoreboard
- Winner screen

## Future Features

- Obstacles
- Different maps
- Character skins
- Special arrows
- Sound effects
- Mobile browser support
- Online multiplayer
