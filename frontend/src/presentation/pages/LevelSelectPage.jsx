import React from "react";
import { useNavigate } from "react-router-dom";
import { LEVELS } from "../game/levelData";
import { getStars } from "../game/starStorage";
import { getAchievementLevel, getAchievementTier } from '../game/achievementStorage';
import "../styles/levelSelect.css";

const LevelSelectPage = () => {
  const navigate = useNavigate();

  const handleLevelSelect = (levelId) => {
    navigate(`/game/${levelId}`);
  };

  const goBack = () => {
    navigate("/home");
  };

  const levelArray = Object.keys(LEVELS).map((key) => ({
    id: parseInt(key),
    ...LEVELS[key],
  }));

  return (
    <div className="level-select-shell">
      <header className="level-select-header">
        <h1 className="level-select-title">SELECT LEVEL</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{fontSize:12}}>
            Achievement: <strong>{getAchievementLevel()}</strong> — {getAchievementTier()}
          </div>
          <button className="back-button" onClick={goBack}>
          ← BACK
          </button>
        </div>
      </header>

      <main className="level-select-grid">
        {levelArray.map((level) => (
          <div
            key={level.id}
            className="level-card unlocked"
            onClick={() => handleLevelSelect(level.id)}
          >
            <div className="level-card-header">
              <span className="level-number">LEVEL {level.id}</span>
              <span
                className={`difficulty-badge difficulty-${level.difficulty.toLowerCase()}`}
              >
                {level.difficulty}
              </span>
            </div>

            <div className="level-preview">
              {level.pattern.map((row, r) => (
                <div key={r} className="preview-row">
                  {row.split("").map((cell, c) => {
                    let cellClass = "preview-cell";
                    if (cell === "#") cellClass += " preview-wall";
                    else if (cell === "P") cellClass += " preview-player";
                    else if (cell === "E") cellClass += " preview-exit";
                    else if (cell === "T") cellClass += " preview-trap";
                    else if (cell === "M") cellClass += " preview-enemy";
                    else if (cell === "C") cellClass += " preview-coin";
                    else cellClass += " preview-path";

                    return (
                      <span key={`${r}-${c}`} className={cellClass} />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="level-info">
              <h3 className="level-name">{level.name} / {level.description}</h3>
            </div>

            <div className="level-stats">
              <div className="stat-item">
                <span className="stat-label">HP:</span>
                <span className="stat-value">{level.hp}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">TIME:</span>
                <span className="stat-value">{level.timeLimit}s</span>
              </div>
            </div>

            <div className="level-stars">
              {[1, 2, 3].map((star) => (
                <span key={star} className={`star ${star <= getStars(level.id) ? 'filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default LevelSelectPage;
