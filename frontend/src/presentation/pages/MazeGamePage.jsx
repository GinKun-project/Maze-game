import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "../game/levelData";
import { useGameEngine } from "../hooks/useGameEngine";
import HudBar from "../components/game/HudBar";
import { addLevelCompletion } from "../game/achievementStorage";
import MazeRenderer from "../components/game/MazeRenderer";
import Dpad from "../components/game/Dpad";
import "../styles/gameScreen.css";

const MazeGamePage = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const levelNum = parseInt(levelId) || 1;
  const levelData = LEVELS[levelNum] || LEVELS[1];

  const game = useGameEngine(levelData);

  const handleMove = (direction) => {
    const moves = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [dx, dy] = moves[direction] || [0, 0];
    game.movePlayer(dx, dy);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (game.paused || game.gameOver || game.win) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMove('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [game.paused, game.gameOver, game.win]);

  useEffect(() => {
    if (!game.win) return;
    try {
      addLevelCompletion(levelNum);
      const raw = localStorage.getItem('mazeOptions');
      const opts = raw ? JSON.parse(raw) : { showAchievementToast: true };
      if (opts.showAchievementToast) {
        // simple notification for now
        alert(`Achievement: Level ${levelNum} completed!`);
      }
    } catch (e) {
      // ignore
    }
  }, [game.win]);

  const goBack = () => {
    navigate("/levels");
  };

  const retry = () => {
    game.resetGame();
  };

  return (
    <div className="game-screen">
      <HudBar hp={game.hp} timeLeft={game.timeLeft} onPause={game.togglePause} />
      
      <div className="game-main">
        <MazeRenderer 
          grid={game.grid} 
          playerPos={game.playerPos} 
          playerMoving={game.playerMoving} 
        />
        <Dpad onMove={handleMove} />
        <div className="bottom-right-panel"></div>
      </div>

      {game.paused && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>PAUSED</h2>
            <button onClick={game.togglePause}>Resume</button>
            <button onClick={retry}>Restart</button>
            <button onClick={goBack}>Back</button>
          </div>
        </div>
      )}

      {game.gameOver && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>GAME OVER</h2>
            <p>Time's up or HP depleted!</p>
            <button onClick={retry}>Retry</button>
            <button onClick={goBack}>Back</button>
          </div>
        </div>
      )}

      {game.win && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>LEVEL COMPLETE</h2>
            <p>Time left: {game.timeLeft}s</p>
            <p>HP left: {game.hp}</p>
            <button onClick={() => navigate(`/game/${levelNum + 1}`)}>Continue</button>
            <button onClick={retry}>Replay</button>
            <button onClick={goBack}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeGamePage;
