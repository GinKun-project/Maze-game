import React from 'react';
import './MazeRenderer.css';

const TILE_SIZE = 32;

const MazeRenderer = ({ grid, playerPos, playerMoving }) => {
  return (
    <div className="maze-container">
      <div className="maze-frame">
        <div className="maze-grid">
          {grid.map((row, y) => (
            <div key={y} className="maze-row">
              {row.map((cell, x) => {
                let className = 'maze-cell';
                if (cell === '#') className += ' wall';
                else if (cell === '.') className += ' path';
                else if (cell === 'T') className += ' trap';
                else if (cell === 'C') className += ' coin';
                else if (cell === 'D') className += ' door';
                else if (cell === 'E') className += ' exit';

                return (
                  <div key={`${x}-${y}`} className={className}>
                    {cell === 'D' && <span className="lock-icon">🔒</span>}
                    {cell === 'E' && <span className="exit-icon">🚪</span>}
                  </div>
                );
              })}
            </div>
          ))}
          <div
            className={`player ${playerMoving ? 'moving' : ''}`}
            style={{
              left: playerPos.x * TILE_SIZE,
              top: playerPos.y * TILE_SIZE,
            }}
          >
            <span className="player-icon">🟡</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeRenderer;