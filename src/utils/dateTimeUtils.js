export const getFormattedLocalDateTime = () => {
  const now = new Date();
  const pad = (n) => (n < 10 ? `0${n}` : n);

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return {
    logDate: `${year}-${month}-${day}`,
    logTime: `${hours}:${minutes}:${seconds}`,
    logDateTime: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    displayTime: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
  };
};

export const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const formatHoursMinutes = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
