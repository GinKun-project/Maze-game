import React from 'react';
import './HudBar.css';

const HudBar = ({ hp, timeLeft, onPause }) => {
  return (
    <div className="hud-bar">
      <div className="hud-left">
        <span className="hud-label">HP</span>
        <div className="hearts">
          {[1, 2, 3].map((heart) => (
            <span key={heart} className={`heart ${heart <= hp ? 'filled' : 'empty'}`}>
              ♥
            </span>
          ))}
        </div>
      </div>
      <div className="hud-center">
        <button className="pause-button" onClick={onPause}>
          ||
        </button>
      </div>
      <div className="hud-right">
        <span className="hud-label">TIME</span>
        <span className="time-display">{timeLeft}</span>
      </div>
    </div>
  );
};

export default HudBar;