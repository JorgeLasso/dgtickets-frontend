export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(0).padStart(2, "0");

  // Ensure each value has maximum 2 digits
  const hoursStr = hours.toString().slice(0, 2);
  const minutesStr = minutes.toString().padStart(2, "0");

  return `${hoursStr}h ${minutesStr}m ${secs}s`;
};
