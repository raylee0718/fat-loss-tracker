import { getLatestBodyMeasurement, sortBodyMeasurementsByDate } from "./bodyMeasurements.js";
import { calculateBMI, sortLogsByDate } from "./health.js";
import { getLastNDaysWorkoutStats, getWorkoutSummaryForDate as getStrengthWorkoutSummaryForDate } from "./workouts.js";

export function getLastNDaysLogs(logs, n) {
  return sortLogsByDate(Array.isArray(logs) ? logs : []).slice(-n);
}

export function calculateAverage(numbers) {
  const validNumbers = (Array.isArray(numbers) ? numbers : []).map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (!validNumbers.length) return null;
  return validNumbers.reduce((sum, value) => sum + value, 0) / validNumbers.length;
}

export function formatNumber(value, decimals = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "無資料";
  return number.toFixed(decimals);
}

export function calculateWeightChange(logs) {
  const validLogs = sortLogsByDate(Array.isArray(logs) ? logs : []).filter((log) => Number(log.weight));
  if (validLogs.length < 2) return null;
  return Number(validLogs.at(-1).weight) - Number(validLogs[0].weight);
}

export function getHabitCounts(logs) {
  return (Array.isArray(logs) ? logs : []).reduce(
    (counts, log) => {
      const habits = log.habits || {};
      return {
        sugaryDrink: counts.sugaryDrink + (habits.sugaryDrink ? 1 : 0),
        lateNightSnack: counts.lateNightSnack + (habits.lateNightSnack ? 1 : 0),
        friedFood: counts.friedFood + (habits.friedFood ? 1 : 0),
        dessert: counts.dessert + (habits.dessert ? 1 : 0)
      };
    },
    { sugaryDrink: 0, lateNightSnack: 0, friedFood: 0, dessert: 0 }
  );
}

export function getWorkoutSummaryForDate(workoutLogs, date) {
  return getStrengthWorkoutSummaryForDate(workoutLogs, date);
}

export function getWorkoutDaysCount(workoutLogs, days) {
  return getLastNDaysWorkoutStats(workoutLogs, days).trainingDays;
}

export function getRecentDateStrings(todayDate, days) {
  const dates = [];
  const today = new Date(`${todayDate}T00:00:00`);
  if (Number.isNaN(today.getTime())) return dates;

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export function getPreviousBodyMeasurement(records) {
  const sorted = sortBodyMeasurementsByDate(Array.isArray(records) ? records : []);
  return sorted.length >= 2 ? sorted.at(-2) : null;
}

export function calculateMeasurementChanges(latest, previous) {
  if (!latest || !previous) return null;

  return {
    waistCm: change(latest.waistCm, previous.waistCm),
    hipCm: change(latest.hipCm, previous.hipCm),
    chestCm: change(latest.chestCm, previous.chestCm),
    thighCm: change(latest.thighCm, previous.thighCm)
  };
}

export function getLatestMeasurement(records) {
  return getLatestBodyMeasurement(Array.isArray(records) ? records : []);
}

export function buildWeightChartData(logs, heightCm, days = 14) {
  return sortLogsByDate(Array.isArray(logs) ? logs : [])
    .filter((log) => Number(log.weight))
    .slice(-days)
    .map((log) => ({
      date: log.date ? log.date.slice(5) : "",
      體重: Number(log.weight),
      BMI: calculateBMI(log.weight, heightCm)
    }));
}

function change(latest, previous) {
  const latestNumber = Number(latest);
  const previousNumber = Number(previous);
  if (!latestNumber || !previousNumber) return null;
  return latestNumber - previousNumber;
}
