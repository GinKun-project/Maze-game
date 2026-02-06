const ACH_KEY = 'mazeAchievements';

export const getCompletedLevels = () => {
  const raw = localStorage.getItem(ACH_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data.completed) ? data.completed : [];
  } catch (e) {
    return [];
  }
};

export const addLevelCompletion = (levelId) => {
  const completed = new Set(getCompletedLevels());
  completed.add(parseInt(levelId));
  const data = { completed: Array.from(completed) };
  localStorage.setItem(ACH_KEY, JSON.stringify(data));
};

export const getAchievementLevel = () => {
  const count = getCompletedLevels().length;
  return count;
};

export const getAchievementTier = () => {
  const n = getAchievementLevel();
  if (n >= 20) return 'Master';
  if (n >= 10) return 'Expert';
  if (n >= 6) return 'Adept';
  if (n >= 3) return 'Apprentice';
  if (n >= 1) return 'Novice';
  return 'None';
};

export const resetAchievements = () => {
  localStorage.removeItem(ACH_KEY);
};

export const hasCompleted = (levelId) => {
  return getCompletedLevels().includes(parseInt(levelId));
};

export default {
  getCompletedLevels,
  addLevelCompletion,
  getAchievementLevel,
  getAchievementTier,
  resetAchievements,
  hasCompleted,
};
