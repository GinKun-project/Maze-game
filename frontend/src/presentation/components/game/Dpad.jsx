import React, { useState } from 'react';
import './Dpad.css';

const Dpad = ({ onMove }) => {
  const [pressed, setPressed] = useState(null);

  const handlePress = (direction) => {
    setPressed(direction);
    onMove(direction);
  };

  const handleRelease = () => {
    setPressed(null);
  };

  return (
    <div className="dpad-container">
      <div className="dpad">
        <button
          className={`dpad-btn up ${pressed === 'up' ? 'pressed' : ''}`}
          onMouseDown={() => handlePress('up')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handlePress('up')}
          onTouchEnd={handleRelease}
        >
          ↑
        </button>
        <div className="dpad-row">
          <button
            className={`dpad-btn left ${pressed === 'left' ? 'pressed' : ''}`}
            onMouseDown={() => handlePress('left')}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={() => handlePress('left')}
            onTouchEnd={handleRelease}
          >
            ←
          </button>
          <div className="dpad-center"></div>
          <button
            className={`dpad-btn right ${pressed === 'right' ? 'pressed' : ''}`}
            onMouseDown={() => handlePress('right')}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={() => handlePress('right')}
            onTouchEnd={handleRelease}
          >
            →
          </button>
        </div>
        <button
          className={`dpad-btn down ${pressed === 'down' ? 'pressed' : ''}`}
          onMouseDown={() => handlePress('down')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handlePress('down')}
          onTouchEnd={handleRelease}
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default Dpad;