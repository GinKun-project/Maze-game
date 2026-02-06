const STORAGE_KEY = 'mazeGameStars';

export const getStars = (levelId) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;
  const stars = JSON.parse(stored);
  return stars[levelId] || 0;
};

export const setStars = (levelId, stars) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  data[levelId] = Math.max(data[levelId] || 0, stars);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};