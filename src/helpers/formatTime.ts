export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(0).padStart(2, "0");
  return `${minutes}m ${secs}s`;
};
