import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/game.css';
import {
  getCompletedLevels,
  getAchievementLevel,
  getAchievementTier,
  resetAchievements,
} from '../game/achievementStorage';

const OPTIONS_KEY = 'mazeOptions';

const loadOptions = () => {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    return raw ? JSON.parse(raw) : { showAchievementToast: true };
  } catch (e) {
    return { showAchievementToast: true };
  }
};

const saveOptions = (opts) => {
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(opts));
};

const OptionsPage = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState(loadOptions());
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    setCompleted(getCompletedLevels());
  }, []);

  const toggleToast = () => {
    const next = { ...options, showAchievementToast: !options.showAchievementToast };
    setOptions(next);
    saveOptions(next);
  };

  const handleReset = () => {
    resetAchievements();
    setCompleted([]);
  };

  return (
    <div className="retro-shell">
      <header className="level-select-header">
        <h1 className="level-select-title">OPTIONS</h1>
        <button className="back-button" onClick={() => navigate('/home')}>← BACK</button>
      </header>

      <main style={{ padding: 16 }}>
        <h3>Achievements</h3>
        <p>Achievement Level: <strong>{getAchievementLevel()}</strong> — Tier: <strong>{getAchievementTier()}</strong></p>
        <p>Completed levels: {completed.length ? completed.join(', ') : 'None'}</p>
        <button onClick={handleReset}>Reset Achievements</button>

        <hr />

        <h3>Notifications</h3>
        <label>
          <input type="checkbox" checked={options.showAchievementToast} onChange={toggleToast} /> Show achievement toast on level completion
        </label>
      </main>
    </div>
  );
};

export default OptionsPage;
