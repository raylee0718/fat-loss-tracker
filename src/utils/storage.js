import { sampleData } from "../data/sampleData.js";
import { normalizeMealTemplates } from "./dailyLog.js";

const STORAGE_KEY = "fatLossTrackerStepOneData";
const MEAL_TEMPLATES_KEY = "mealTemplates";
const FAVORITE_EXERCISES_KEY = "favoriteExercises";
const defaultWaterQuickAmounts = [250, 500, 750];
const allowedSetTypes = ["熱身組", "正式組", "遞減組", "力竭組", "其他"];

export const defaultData = {
  dailyLogs: [],
  workoutLogs: [],
  bodyMeasurements: [],
  settings: {
    startingWeight: "",
    targetWeight: "",
    heightCm: "",
    dailyWaterGoal: 2000,
    waterQuickAmounts: defaultWaterQuickAmounts,
    dailySleepGoal: 7
  }
};

export function readAppData() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return createDefaultData();
    const parsedData = JSON.parse(rawData);

    return {
      dailyLogs: Array.isArray(parsedData.dailyLogs) ? parsedData.dailyLogs.map(normalizeDailyLog) : [],
      workoutLogs: Array.isArray(parsedData.workoutLogs) ? parsedData.workoutLogs.map(normalizeWorkoutLog) : [],
      bodyMeasurements: Array.isArray(parsedData.bodyMeasurements) ? parsedData.bodyMeasurements.map(normalizeBodyMeasurement) : [],
      settings: normalizeSettings(parsedData.settings)
    };
  } catch {
    return createDefaultData();
  }
}

export function writeAppData(data = {}) {
  const safeData = {
    dailyLogs: Array.isArray(data.dailyLogs) ? data.dailyLogs.map(normalizeDailyLog) : [],
    workoutLogs: Array.isArray(data.workoutLogs) ? data.workoutLogs.map(normalizeWorkoutLog) : [],
    bodyMeasurements: Array.isArray(data.bodyMeasurements) ? data.bodyMeasurements.map(normalizeBodyMeasurement) : [],
    settings: normalizeSettings(data.settings)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
}

export function saveAppData(data) {
  writeAppData(data);
  return readAppData();
}

export function clearSampleData() {
  const currentData = readAppData();
  writeAppData({ ...currentData, dailyLogs: [], workoutLogs: [], bodyMeasurements: [] });
  return readAppData();
}

export function loadSampleData() {
  writeAppData(sampleData);
  return readAppData();
}

export function mergeSettingsWithDefaults(settings = {}) {
  return normalizeSettings(settings);
}

export function normalizeSettings(settings = {}) {
  return {
    ...defaultData.settings,
    ...settings,
    dailyWaterGoal: Number(settings.dailyWaterGoal) || defaultData.settings.dailyWaterGoal,
    waterQuickAmounts: normalizeWaterQuickAmounts(settings),
    dailySleepGoal: Number(settings.dailySleepGoal) || defaultData.settings.dailySleepGoal
  };
}

export function normalizeWaterQuickAmounts(settings = {}) {
  const rawAmounts = Array.isArray(settings.waterQuickAmounts)
    ? settings.waterQuickAmounts
    : [250, 500, settings.customWaterQuickAmount].filter((amount) => amount !== undefined && amount !== null && amount !== "");

  const amounts = [...new Set(rawAmounts.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0))]
    .sort((a, b) => a - b);

  return amounts.length ? amounts : [...defaultWaterQuickAmounts];
}

export function addWaterQuickAmount(settings, amount) {
  const number = Number(amount);
  if (!Number.isFinite(number) || number < 50 || number > 3000) return normalizeSettings(settings);
  return normalizeSettings({
    ...settings,
    waterQuickAmounts: [...normalizeWaterQuickAmounts(settings), number]
  });
}

export function deleteWaterQuickAmount(settings, amount) {
  const number = Number(amount);
  return normalizeSettings({
    ...settings,
    waterQuickAmounts: normalizeWaterQuickAmounts(settings).filter((item) => item !== number)
  });
}

export function resetDefaultWaterQuickAmounts(settings = {}) {
  return normalizeSettings({
    ...settings,
    waterQuickAmounts: [...defaultWaterQuickAmounts]
  });
}

export function getWaterQuickAmounts(settings = {}) {
  return normalizeWaterQuickAmounts(settings);
}

export function exportAppData() {
  return {
    ...readAppData(),
    mealTemplates: readMealTemplates(),
    favoriteExercises: readStringArray(FAVORITE_EXERCISES_KEY)
  };
}

export function importAppDataFromObject(importedData) {
  if (!importedData || typeof importedData !== "object") {
    throw new Error("invalid data");
  }

  const nextData = {
    dailyLogs: Array.isArray(importedData.dailyLogs) ? importedData.dailyLogs.map(normalizeDailyLog) : [],
    workoutLogs: Array.isArray(importedData.workoutLogs) ? importedData.workoutLogs.map(normalizeWorkoutLog) : [],
    bodyMeasurements: Array.isArray(importedData.bodyMeasurements) ? importedData.bodyMeasurements.map(normalizeBodyMeasurement) : [],
    settings: normalizeSettings(importedData.settings)
  };

  writeAppData(nextData);

  if (importedData.mealTemplates) {
    localStorage.setItem(MEAL_TEMPLATES_KEY, JSON.stringify(normalizeMealTemplates(importedData.mealTemplates)));
  }

  if (Array.isArray(importedData.favoriteExercises)) {
    localStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(uniqueTrimmed(importedData.favoriteExercises)));
  }

  return readAppData();
}

export function importAppData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(importAppDataFromObject(JSON.parse(reader.result)));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function normalizeDailyLog(log = {}) {
  return {
    date: log.date || "",
    weight: log.weight ?? "",
    breakfast: log.breakfast || "",
    lunch: log.lunch || "",
    dinner: log.dinner || "",
    snacks: log.snacks ?? log.snack ?? "",
    waterMl: Math.max(0, Number(log.waterMl) || 0),
    sleepStart: log.sleepStart || "",
    wakeTime: log.wakeTime || "",
    sleepHours: Number(log.sleepHours) || 0
  };
}

export function normalizeWorkoutLog(log = {}) {
  return {
    id: log.id || generateLocalId(),
    date: log.date || "",
    exercises: Array.isArray(log.exercises) ? log.exercises.map(normalizeWorkoutExercise).filter((exercise) => exercise.name || exercise.sets.length) : []
  };
}

export function normalizeBodyMeasurement(record = {}) {
  return {
    id: record.id || generateLocalId(),
    date: record.date || "",
    waistCm: record.waistCm ?? record.waist ?? "",
    hipCm: record.hipCm ?? record.hip ?? "",
    chestCm: record.chestCm ?? record.chest ?? "",
    thighCm: record.thighCm ?? record.thigh ?? ""
  };
}

function createDefaultData() {
  return {
    dailyLogs: [],
    workoutLogs: [],
    bodyMeasurements: [],
    settings: { ...defaultData.settings, waterQuickAmounts: [...defaultWaterQuickAmounts] }
  };
}

function normalizeWorkoutExercise(exercise = {}) {
  if (Array.isArray(exercise.sets)) {
    return {
      id: exercise.id || generateLocalId(),
      name: exercise.name || "",
      sets: exercise.sets.map(normalizeWorkoutSet)
    };
  }

  const setCount = Math.max(1, Number(exercise.sets) || 1);
  const generatedSets = Array.from({ length: setCount }, () => ({
    id: generateLocalId(),
    setType: "正式組",
    weightKg: exercise.weightKg ?? exercise.weight ?? "",
    reps: exercise.reps ?? "",
    restSeconds: exercise.restSeconds ?? ""
  }));

  return {
    id: exercise.id || generateLocalId(),
    name: exercise.name || "",
    sets: generatedSets.map(normalizeWorkoutSet)
  };
}

function normalizeWorkoutSet(set = {}) {
  return {
    id: set.id || generateLocalId(),
    setType: allowedSetTypes.includes(set.setType) ? set.setType : "正式組",
    weightKg: set.weightKg ?? "",
    reps: set.reps ?? "",
    restSeconds: set.restSeconds ?? ""
  };
}

function readMealTemplates() {
  try {
    const raw = localStorage.getItem(MEAL_TEMPLATES_KEY);
    return normalizeMealTemplates(raw ? JSON.parse(raw) : {});
  } catch {
    return normalizeMealTemplates({});
  }
}

function readStringArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return uniqueTrimmed(parsed);
  } catch {
    return [];
  }
}

function uniqueTrimmed(items) {
  return [...new Set((Array.isArray(items) ? items : []).map((item) => String(item).trim()).filter(Boolean))];
}

function generateLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
