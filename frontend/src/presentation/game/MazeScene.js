import Phaser from "phaser";
import { LEVELS } from "./levelData";
import { setStars } from "./starStorage";

const TILE_SIZE = 24;

export default class MazeScene extends Phaser.Scene {
  constructor(config = {}) {
    super({ key: "MazeScene", ...config });
    this.levelId = config.levelId || 1;
    this.levelData = LEVELS[this.levelId] || LEVELS[1];
    this.onComplete = config.onComplete;
    this.onGameOver = config.onGameOver;
  }

  preload() {
    this.ensureColorTexture("wall", "#0b1021");
    this.ensureColorTexture("floor", "#0f2748");
    this.ensureColorTexture("player", "#facc15");
    this.ensureColorTexture("exit", "#34d399");
    this.ensureColorTexture("trap", "#ef4444");
    this.ensureColorTexture("enemy", "#38bdf8");
    this.ensureColorTexture("coin", "#fbbf24");
  }

  ensureColorTexture(key, color) {
    if (this.textures.exists(key)) return;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    const phColor = Phaser.Display.Color.HexStringToColor(color).color;
    gfx.fillStyle(phColor, 1);
    gfx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    gfx.generateTexture(key, TILE_SIZE, TILE_SIZE);
    gfx.destroy();
  }

  create() {
    this.pattern = this.levelData.pattern;
    this.levelName = this.levelData.name;
    this.difficulty = this.levelData.difficulty;
    this.timeLimit = this.levelData.timeLimit || 300;
    this.cameras.main.setBackgroundColor("#050b16");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.walls = this.physics.add.staticGroup();
    this.floors = this.physics.add.staticGroup();
    this.traps = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.coins = this.physics.add.staticGroup();

    this.completed = false;
    this.gameOver = false;
    this.hp = this.levelData.hp || 3;
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoins = 0;
    this.startTime = this.time.now;
    this.lastHitTime = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 150;

    const rows = this.pattern.length;
    const cols = this.pattern[0].length;
    const offsetX = (this.game.config.width - cols * TILE_SIZE) / 2;
    const offsetY = (this.game.config.height - rows * TILE_SIZE) / 2;
    this.gridOffset = { x: offsetX, y: offsetY };
    this.mazeRows = rows;
    this.mazeCols = cols;

    this.startPos = { x: 0, y: 0 };
    this.gridPos = { x: 0, y: 0 };
    this.startGrid = null;
    this.exitGrid = null;
    this.visitedHighlights = new Map();

    this.pattern.forEach((row, y) => {
      [...row].forEach((char, x) => {
        const worldX = offsetX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = offsetY + y * TILE_SIZE + TILE_SIZE / 2;

        if (char !== "#") {
          this.floors.create(worldX, worldY, "floor").setDepth(-2);
        }

        if (char === "#") {
          this.walls.create(worldX, worldY, "wall").setDepth(-1);
        } else if (char === "P") {
          this.player = this.physics.add.sprite(worldX, worldY, "player");
          this.player.setCollideWorldBounds(true);
          this.player.setCircle(TILE_SIZE / 2 - 2);
          this.player.setBounce(0.05);
          this.startPos = { x: worldX, y: worldY };
          this.gridPos = { x, y };
          this.startGrid = { x, y };
        } else if (char === "E") {
          this.exit = this.physics.add.staticSprite(worldX, worldY, "exit");
          this.exit.setScale(1.2);
          this.exitGrid = { x, y };
          this.tweens.add({
            targets: this.exit,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1,
          });
          const ring = this.add
            .circle(worldX, worldY, TILE_SIZE * 0.7, 0x34d399, 0.18)
            .setDepth(-0.3);
          this.tweens.add({
            targets: ring,
            scale: 1.4,
            alpha: 0,
            duration: 1600,
            repeat: -1,
            ease: "Sine.easeOut",
          });
        } else if (char === "T") {
          const trap = this.traps.create(worldX, worldY, "trap");
          trap.setScale(0.9);
          this.tweens.add({
            targets: trap,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1,
          });
        } else if (char === "M") {
          const enemy = this.physics.add.sprite(worldX, worldY, "enemy");
          enemy.setImmovable(true);
          enemy.setCircle(TILE_SIZE / 2 - 2);
          this.enemies.add(enemy);
          this.tweens.add({
            targets: enemy,
            x: worldX + TILE_SIZE * 4,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        } else if (char === "C") {
          const coin = this.coins.create(worldX, worldY, "coin");
          coin.setScale(0.8);
          this.totalCoins++;
          this.tweens.add({
            targets: coin,
            y: worldY - 5,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      });
    });

    if (this.player) {
      this.physics.add.collider(this.player, this.walls);
      this.physics.add.collider(this.player, this.enemies, () =>
        this.handleTrapHit()
      );
      this.physics.add.overlap(this.player, this.traps, () =>
        this.handleTrapHit()
      );
      this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        this.collectCoin(coin);
      });
    }

    if (this.exit && this.player) {
      this.physics.add.overlap(this.player, this.exit, () => {
        this.onExitReached();
      });
    }

    this.speed = 180;

    this.createHUD();
    this.createPathHints();
    if (this.startGrid) {
      this.markVisited(this.startGrid.x, this.startGrid.y);
    }
  }

  createHUD() {
    this.hpText = this.add
      .text(12, 8, `HP: ${this.hp}`, {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "10px",
        color: "#f9fafb",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.scoreText = this.add
      .text(12, 22, "SCORE: 0", {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "10px",
        color: "#facc15",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.coinsText = this.add
      .text(12, 36, "COINS: 0/0", {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "10px",
        color: "#fbbf24",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.posText = this.add
      .text(12, 50, "POS: 0,0", {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "10px",
        color: "#a5b4fc",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.timerText = this.add
      .text(this.game.config.width - 12, 8, "TIME: 0", {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "10px",
        color: "#34d399",
      })
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(100);
  }

  update() {
    if (!this.player || this.completed || this.gameOver) return;

    const now = this.time.now;
    const elapsed = Math.floor((now - this.startTime) / 1000);
    const remaining = Math.max(0, this.timeLimit - elapsed);
    
    if (this.timerText) {
      this.timerText.setText(`TIME: ${remaining}`);
      if (remaining <= 10) {
        this.timerText.setColor("#ef4444");
      } else {
        this.timerText.setColor("#34d399");
      }
    }

    if (remaining <= 0 && !this.gameOver) {
      this.onTimeUp();
      return;
    }

    this.updatePlayerGridPosition();

    if (now - this.lastMoveTime < this.moveDelay) return;

    let moved = false;

    if (this.cursors.left.isDown) {
      this.tryMove(-1, 0);
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.tryMove(1, 0);
      moved = true;
    } else if (this.cursors.up.isDown) {
      this.tryMove(0, -1);
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.tryMove(0, 1);
      moved = true;
    }

    if (moved) {
      this.lastMoveTime = now;
    }
  }

  tryMove(dx, dy) {
    const rows = this.pattern.length;
    const cols = this.pattern[0].length;
    const newX = this.gridPos.x + dx;
    const newY = this.gridPos.y + dy;

    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return;

    const targetChar = this.pattern[newY][newX];
    if (targetChar === "#") return;

    const offsetX = (this.game.config.width - cols * TILE_SIZE) / 2;
    const offsetY = (this.game.config.height - rows * TILE_SIZE) / 2;
    const worldX = offsetX + newX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = offsetY + newY * TILE_SIZE + TILE_SIZE / 2;

    this.gridPos.x = newX;
    this.gridPos.y = newY;
    this.markVisited(newX, newY);

    this.tweens.add({
      targets: this.player,
      x: worldX,
      y: worldY,
      duration: 120,
      ease: "Power2",
    });
  }

  createPathHints() {
    if (!this.startGrid || !this.exitGrid) return;
    const path = this.findPath(this.startGrid, this.exitGrid);
    if (!path.length) return;

    path.forEach(({ x, y }, index) => {
      const worldX = this.gridOffset.x + x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = this.gridOffset.y + y * TILE_SIZE + TILE_SIZE / 2;
      const hint = this.add
        .rectangle(worldX, worldY, TILE_SIZE - 6, TILE_SIZE - 6, PATH_GLOW_COLOR, 0.16)
        .setDepth(-0.4);

      hint.setStrokeStyle(1, PATH_GLOW_COLOR, 0.5);
      this.tweens.add({
        targets: hint,
        alpha: { from: 0.14, to: 0.28 },
        duration: 1600,
        yoyo: true,
        repeat: -1,
        delay: index * 35,
        ease: "Sine.easeInOut",
      });
    });
  }

  findPath(start, end) {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const queue = [start];
    const visited = new Set([`${start.x},${start.y}`]);
    const parent = new Map();
    let found = false;

    while (queue.length) {
      const current = queue.shift();
      if (current.x === end.x && current.y === end.y) {
        found = true;
        break;
      }

      directions.forEach(([dx, dy]) => {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;

        if (
          nx < 0 ||
          ny < 0 ||
          nx >= this.mazeCols ||
          ny >= this.mazeRows ||
          visited.has(key) ||
          this.pattern[ny][nx] === "#"
        ) {
          return;
        }

        visited.add(key);
        parent.set(key, current);
        queue.push({ x: nx, y: ny });
      });
    }

    if (!found) return [];

    const path = [];
    let cursor = end;
    let guard = 0;
    while (cursor && guard < this.mazeCols * this.mazeRows) {
      path.unshift(cursor);
      const key = `${cursor.x},${cursor.y}`;
      cursor = parent.get(key);
      guard++;
    }

    if (!path.length) return [];
    const first = path[0];
    if (first.x !== start.x || first.y !== start.y) {
      path.unshift(start);
    }
    return path;
  }

  markVisited(x, y) {
    const key = `${x},${y}`;
    if (this.visitedHighlights.has(key)) return;

    const worldX = this.gridOffset.x + x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = this.gridOffset.y + y * TILE_SIZE + TILE_SIZE / 2;

    const tile = this.add
      .rectangle(worldX, worldY, TILE_SIZE - 8, TILE_SIZE - 8, TRAIL_COLOR, 0.14)
      .setDepth(-0.35);
    tile.setStrokeStyle(1, 0x16a34a, 0.4);

    this.tweens.add({
      targets: tile,
      alpha: { from: 0.12, to: 0.22 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      delay: this.visitedHighlights.size * 20,
      ease: "Sine.easeInOut",
    });

    this.visitedHighlights.set(key, tile);
  }

  updatePlayerGridPosition() {
    if (this.posText) {
      this.posText.setText(`POS: ${this.gridPos.x},${this.gridPos.y}`);
    }
  }

  collectCoin(coin) {
    coin.destroy();
    this.coinsCollected++;
    this.score += 100;
    this.updateHUD();

    this.cameras.main.flash(100, 255, 215, 0);
    this.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  updateHUD() {
    if (this.hpText) this.hpText.setText(`HP: ${this.hp}`);
    if (this.scoreText) this.scoreText.setText(`SCORE: ${this.score}`);
    if (this.coinsText)
      this.coinsText.setText(`COINS: ${this.coinsCollected}/${this.totalCoins}`);
  }

  handleTrapHit() {
    const now = this.time.now;
    if (now - this.lastHitTime < 800 || this.completed || this.gameOver)
      return;
    this.lastHitTime = now;

    this.hp -= 1;
    this.score = Math.max(0, this.score - 50);
    this.updateHUD();

    this.cameras.main.shake(300, 0.015);
    this.cameras.main.flash(200, 239, 68, 68);
    this.player.setTint(0xef4444);
    this.tweens.add({
      targets: this.player,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
    });

    this.time.delayedCall(200, () => {
      this.player.clearTint();
      this.resetPlayer();
    });

    if (this.hp <= 0) {
      this.onGameOver();
    }
  }

  resetPlayer() {
    const rows = this.pattern.length;
    const cols = this.pattern[0].length;
    let startX = 0,
      startY = 0;

    this.pattern.forEach((row, y) => {
      [...row].forEach((char, x) => {
        if (char === "P") {
          startX = x;
          startY = y;
        }
      });
    });

    this.gridPos = { x: startX, y: startY };
    const offsetX = (this.game.config.width - cols * TILE_SIZE) / 2;
    const offsetY = (this.game.config.height - rows * TILE_SIZE) / 2;
    const worldX = offsetX + startX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = offsetY + startY * TILE_SIZE + TILE_SIZE / 2;

    this.player.setPosition(worldX, worldY);
  }

  onTimeUp() {
    if (this.completed || this.gameOver) return;
    this.gameOver = true;
    this.scene.pause();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);

    const timeRatio = elapsed / this.timeLimit;
    const hpRatio = this.hp / this.levelData.hp;
    let stars = 1;
    if (timeRatio < 0.5 && hpRatio >= 0.8) stars = 3;
    else if (timeRatio < 0.75 || hpRatio >= 0.6) stars = 2;

    const timeUpBg = this.add
      .rectangle(
        this.game.config.width / 2,
        this.game.config.height / 2,
        this.game.config.width,
        this.game.config.height,
        0x000000,
        0.85
      )
      .setDepth(200);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 60,
        "TIME UP!",
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "20px",
          color: "#ef4444",
        }
      )
      .setOrigin(0.5)
      .setDepth(201)
      .setShadow(3, 3, "#000000", 5);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 20,
        `SCORE: ${this.score}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#facc15",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 10,
        `COINS: ${this.coinsCollected}/${this.totalCoins}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#fbbf24",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    const starText = Array.from({ length: 3 }, (_, i) => (i < stars ? "★" : "☆")).join(" ");
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 30,
        `STARS: ${starText}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#fbbf24",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.cameras.main.flash(300, 239, 68, 68);

    if (this.onGameOver) {
      this.time.delayedCall(800, () => {
        this.onGameOver({
          id: this.levelId,
          name: this.levelName,
          time: elapsed,
          score: this.score,
          coins: {
            collected: this.coinsCollected,
            total: this.totalCoins,
          },
          stars: stars,
          status: "lose",
        });
      });
    }
  }

  onGameOver() {
    if (this.completed || this.gameOver) return;
    this.gameOver = true;
    this.scene.pause();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);

    const timeRatio = elapsed / this.timeLimit;
    const hpRatio = this.hp / this.levelData.hp;
    let stars = 1;
    if (timeRatio < 0.5 && hpRatio >= 0.8) stars = 3;
    else if (timeRatio < 0.75 || hpRatio >= 0.6) stars = 2;

    const gameOverBg = this.add
      .rectangle(
        this.game.config.width / 2,
        this.game.config.height / 2,
        this.game.config.width,
        this.game.config.height,
        0x000000,
        0.85
      )
      .setDepth(200);

    this.add
      .text(this.game.config.width / 2, this.game.config.height / 2 - 60, "GAME OVER", {
        fontFamily: '"Press Start 2P", system-ui, monospace',
        fontSize: "20px",
        color: "#ef4444",
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setShadow(3, 3, "#000000", 5);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 20,
        `SCORE: ${this.score}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#facc15",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 10,
        `TIME: ${elapsed}s`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#34d399",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 40,
        `COINS: ${this.coinsCollected}/${this.totalCoins}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#fbbf24",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    const starText = Array.from({ length: 3 }, (_, i) => (i < stars ? "★" : "☆")).join(" ");
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 60,
        `STARS: ${starText}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#fbbf24",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    if (this.onGameOver) {
      this.time.delayedCall(600, () => {
        this.onGameOver({
          id: this.levelId,
          name: this.levelName,
          time: elapsed,
          score: this.score,
          coins: {
            collected: this.coinsCollected,
            total: this.totalCoins,
          },
          stars: stars,
          status: "fail",
        });
      });
    }
  }

  onExitReached() {
    if (this.completed || this.gameOver) return;
    this.completed = true;

    this.scene.pause();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const timeBonus = Math.max(0, this.timeLimit - elapsed) * 10;
    const coinBonus = this.coinsCollected * 50;
    const finalScore = this.score + timeBonus + coinBonus;

    const timeRatio = elapsed / this.timeLimit;
    const hpRatio = this.hp / this.levelData.hp;
    let stars = 1;
    if (timeRatio < 0.5 && hpRatio >= 0.8) stars = 3;
    else if (timeRatio < 0.75 || hpRatio >= 0.6) stars = 2;

    setStars(this.levelId, stars);

    const winBg = this.add
      .rectangle(
        this.game.config.width / 2,
        this.game.config.height / 2,
        this.game.config.width,
        this.game.config.height,
        0x000000,
        0.85
      )
      .setDepth(200);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 80,
        "MAZE CLEARED!",
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "20px",
          color: "#22c55e",
        }
      )
      .setOrigin(0.5)
      .setDepth(201)
      .setShadow(3, 3, "#000000", 5);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 40,
        `FINAL SCORE: ${finalScore}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "14px",
          color: "#facc15",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 10,
        `TIME: ${elapsed}s`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#34d399",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 20,
        `COINS: ${this.coinsCollected}/${this.totalCoins}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "12px",
          color: "#fbbf24",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 50,
        `BONUS: +${timeBonus + coinBonus}`,
        {
          fontFamily: '"Press Start 2P", system-ui, monospace',
          fontSize: "10px",
          color: "#a5b4fc",
        }
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.cameras.main.flash(300, 34, 197, 94);

    if (this.onComplete) {
      this.time.delayedCall(800, () => {
        this.onComplete({
          id: this.levelId,
          name: this.levelName,
          time: elapsed,
          score: finalScore,
          coins: {
            collected: this.coinsCollected,
            total: this.totalCoins,
          },
          stars: stars,
          status: "win",
        });
      });
    }
  }
}
