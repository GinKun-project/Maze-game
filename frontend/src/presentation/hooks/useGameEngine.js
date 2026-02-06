import { useState, useEffect, useCallback } from 'react';

const TILE_SIZE = 32;
const MOVE_DURATION = 200; // ms

const DEFAULT_LEVEL = [
  '####################',
  '#P.................#',
  '#..###############.#',
  '#..#.............#.#',
  '#..#..#########..#.#',
  '#..#..#.......#..#.#',
  '#..#..#..T..C.#..#.#',
  '#..#..#.......#..#.#',
  '#..#..#########..#.#',
  '#..#.............#.#',
  '#..###############.#',
  '#..................#',
  '#..###############.#',
  '#..#.............#.#',
  '#..#..#########..#.#',
  '#..#..#.......#..#.#',
  '#..#..#..D..C.#..#.#',
  '#..#..#.......#..#.#',
  '#..#..#########..#.#',
  '#..#.............#.#',
  '####################E',
];

export const useGameEngine = (levelData) => {
  const [grid, setGrid] = useState(DEFAULT_LEVEL.map(row => row.split('')));
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [playerMoving, setPlayerMoving] = useState(false);
  const [hp, setHp] = useState(3);
  const [timeLeft, setTimeLeft] = useState(240);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  useEffect(() => {
    const level = levelData?.pattern || DEFAULT_LEVEL;
    const gridData = level.map(row => row.split(''));
    setGrid(gridData);

    let startX = 0, startY = 0;
    let coins = 0;
    gridData.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'P') {
          startX = x;
          startY = y;
        }
        if (cell === 'C') coins++;
      });
    });
    setPlayerPos({ x: startX, y: startY });
    setTotalCoins(coins);
    setHp(levelData?.hp || 3);
    setTimeLeft(levelData?.timeLimit || 240);
  }, [levelData]);

  useEffect(() => {
    if (paused || gameOver || win) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paused, gameOver, win]);

  const movePlayer = useCallback((dx, dy) => {
    if (playerMoving || paused || gameOver || win) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= grid[0].length || newY < 0 || newY >= grid.length) return;

    const targetCell = grid[newY][newX];
    if (targetCell === '#') return; // wall
    if (targetCell === 'D' && !doorUnlocked) return; // locked door

    setPlayerMoving(true);
    setPlayerPos({ x: newX, y: newY });

    setTimeout(() => {
      setPlayerMoving(false);

      // Handle cell effects
      if (targetCell === 'T') {
        setHp(prev => {
          const newHp = prev - 1;
          if (newHp <= 0) setGameOver(true);
          return newHp;
        });
      } else if (targetCell === 'C') {
        setCoinsCollected(prev => prev + 1);
        setGrid(prev => {
          const newGrid = prev.map(row => [...row]);
          newGrid[newY][newX] = '.';
          return newGrid;
        });
      } else if (targetCell === 'E') {
        if (doorUnlocked || coinsCollected === totalCoins) {
          setWin(true);
        }
      }

      // Check door unlock
      setDoorUnlocked(prev => prev || (coinsCollected + (targetCell === 'C' ? 1 : 0) === totalCoins));
    }, MOVE_DURATION);
  }, [playerPos, grid, playerMoving, paused, gameOver, win, doorUnlocked, coinsCollected, totalCoins]);

  const togglePause = () => {
    setPaused(!paused);
  };

  const resetGame = () => {
    // Reset logic
    setGameOver(false);
    setWin(false);
    setPaused(false);
    setHp(levelData?.hp || 3);
    setTimeLeft(levelData?.timeLimit || 240);
    setCoinsCollected(0);
    setDoorUnlocked(false);
    const level = levelData?.pattern || DEFAULT_LEVEL;
    const gridData = level.map(row => row.split(''));
    setGrid(gridData);
    let startX = 0, startY = 0;
    gridData.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'P') {
          startX = x;
          startY = y;
        }
      });
    });
    setPlayerPos({ x: startX, y: startY });
  };

  return {
    grid,
    playerPos,
    playerMoving,
    hp,
    timeLeft,
    paused,
    gameOver,
    win,
    coinsCollected,
    totalCoins,
    doorUnlocked,
    movePlayer,
    togglePause,
    resetGame,
  };
};