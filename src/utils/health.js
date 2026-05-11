export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateSleepHours(sleepStart, wakeTime) {
  if (!sleepStart || !wakeTime) return 0;

  const [startHour, startMinute] = sleepStart.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

  if ([startHour, startMinute, wakeHour, wakeMinute].some(Number.isNaN)) return 0;

  const startTotal = startHour * 60 + startMinute;
  let wakeTotal = wakeHour * 60 + wakeMinute;

  if (wakeTotal <= startTotal) {
    wakeTotal += 24 * 60;
  }

  return Math.round(((wakeTotal - startTotal) / 60) * 10) / 10;
}

export function calculateBMI(weight, heightCm) {
  const numericWeight = Number(weight);
  const numericHeight = Number(heightCm);

  if (!numericWeight || !numericHeight) return null;

  const heightMeters = numericHeight / 100;
  const bmi = numericWeight / (heightMeters * heightMeters);

  return Math.round(bmi * 10) / 10;
}

export function sortLogsByDate(logs) {
  return [...(Array.isArray(logs) ? logs : [])].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
}

export function getLatestLog(logs) {
  return sortLogsByDate(logs).at(-1);
}

export function getLogByDate(logs, date) {
  return (Array.isArray(logs) ? logs : []).find((log) => log.date === date);
}

export function upsertDailyLog(logs, newLog) {
  const nextLogs = (Array.isArray(logs) ? logs : []).filter((log) => log.date !== newLog.date);
  return sortLogsByDate([...nextLogs, newLog]);
}

export function createEmptyDailyLog(date = getTodayDateString()) {
  return {
    date,
    weight: "",
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    waterMl: 0,
    sleepStart: "",
    wakeTime: "",
    sleepHours: 0
  };
}
