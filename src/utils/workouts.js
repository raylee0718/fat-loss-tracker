import { readAppData, writeAppData } from "./storage.js";

const FAVORITE_EXERCISES_KEY = "favoriteExercises";

export const setTypes = ["熱身組", "正式組", "遞減組", "力竭組", "其他"];

export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getWorkoutLogs() {
  return readAppData().workoutLogs;
}

export function saveWorkoutLogs(logs) {
  const currentData = readAppData();
  const nextLogs = Array.isArray(logs) ? logs.map(normalizeWorkoutLog) : [];
  writeAppData({ ...currentData, workoutLogs: nextLogs });
  return nextLogs;
}

export function upsertWorkoutLog(logs, newLog) {
  const normalized = normalizeWorkoutLog(newLog);
  const nextLogs = (Array.isArray(logs) ? logs : []).filter((log) => log.id !== normalized.id);
  return [...nextLogs, normalized].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function deleteWorkoutLog(logs, id) {
  return (Array.isArray(logs) ? logs : []).filter((log) => log.id !== id);
}

export function normalizeWorkoutLog(log = {}) {
  return {
    id: log.id || generateId(),
    date: log.date || "",
    exercises: Array.isArray(log.exercises) ? log.exercises.map(normalizeExercise).filter((exercise) => exercise.name || exercise.sets.length) : []
  };
}

export function migrateWorkoutLogsIfNeeded(logs) {
  return (Array.isArray(logs) ? logs : []).map(normalizeWorkoutLog);
}

export function createEmptyWorkoutLog(date) {
  return {
    id: generateId(),
    date,
    exercises: []
  };
}

export function createEmptyExercise(name = "") {
  return {
    id: generateId(),
    name,
    sets: [createEmptySet()]
  };
}

export function createEmptySet() {
  return {
    id: generateId(),
    setType: "正式組",
    weightKg: "",
    reps: "",
    restSeconds: ""
  };
}

export function getFavoriteExercises() {
  try {
    const raw = localStorage.getItem(FAVORITE_EXERCISES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return uniqueTrimmed(parsed);
  } catch {
    return [];
  }
}

export function saveFavoriteExercises(exercises) {
  const safeExercises = uniqueTrimmed(exercises);
  localStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(safeExercises));
  return safeExercises;
}

export function addFavoriteExercise(name) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) return getFavoriteExercises();
  return saveFavoriteExercises([...getFavoriteExercises(), trimmedName]);
}

export function deleteFavoriteExercise(name) {
  return saveFavoriteExercises(getFavoriteExercises().filter((exercise) => exercise !== name));
}

export function countWorkoutSets(workout) {
  return (workout?.exercises || []).reduce((sum, exercise) => sum + (Array.isArray(exercise.sets) ? exercise.sets.length : 0), 0);
}

export function getWorkoutExerciseNames(workout) {
  return uniqueTrimmed((workout?.exercises || []).map((exercise) => exercise.name));
}

export function getAllExerciseNames(workoutLogs) {
  return uniqueTrimmed((Array.isArray(workoutLogs) ? workoutLogs : []).flatMap((workout) => getWorkoutExerciseNames(normalizeWorkoutLog(workout)))).sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

export function getWorkoutLogsByDate(logs, date) {
  return (Array.isArray(logs) ? logs : []).filter((log) => log.date === date).map(normalizeWorkoutLog);
}

export function getWorkoutSummaryForDate(workoutLogs, date) {
  const workouts = getWorkoutLogsByDate(workoutLogs, date);
  if (!workouts.length) return null;

  const exerciseCount = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const setCount = workouts.reduce((sum, workout) => sum + countWorkoutSets(workout), 0);
  const names = workouts.flatMap(getWorkoutExerciseNames).slice(0, 4);

  return {
    count: workouts.length,
    exerciseCount,
    setCount,
    names,
    text: `今日訓練：${exerciseCount} 個動作，${setCount} 組${names.length ? `，${names.join("、")}` : ""}`,
    workouts
  };
}

export function getLastNDaysWorkoutStats(workoutLogs, dates) {
  const dateSet = new Set(dates);
  const scopedLogs = (Array.isArray(workoutLogs) ? workoutLogs : [])
    .filter((log) => dateSet.has(log.date))
    .map(normalizeWorkoutLog);
  const workoutDates = new Set(scopedLogs.map((log) => log.date));
  const totalSets = scopedLogs.reduce((sum, workout) => sum + countWorkoutSets(workout), 0);
  const exerciseCounts = {};

  scopedLogs.flatMap(getWorkoutExerciseNames).forEach((name) => {
    exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
  });

  const frequentExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    trainingDays: workoutDates.size,
    totalSets,
    frequentExercises
  };
}

export function findLastExerciseRecord(workoutLogs, exerciseName, beforeDate) {
  const targetName = normalizeName(exerciseName);
  if (!targetName) return null;

  const candidates = (Array.isArray(workoutLogs) ? workoutLogs : [])
    .map(normalizeWorkoutLog)
    .filter((workout) => workout.date && (!beforeDate || workout.date < beforeDate))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  for (const workout of candidates) {
    const exercise = workout.exercises.find((item) => normalizeName(item.name) === targetName);
    if (exercise) {
      return {
        date: workout.date,
        exercise
      };
    }
  }

  return null;
}

export function createExerciseFromPreviousRecord(exerciseName, workoutLogs, date) {
  const lastRecord = findLastExerciseRecord(workoutLogs, exerciseName, date);
  if (!lastRecord) {
    return {
      exercise: createEmptyExercise(exerciseName),
      loadedPrevious: false
    };
  }

  return {
    exercise: {
      id: generateId(),
      name: exerciseName,
      sets: lastRecord.exercise.sets.map((set) => ({
        id: generateId(),
        setType: setTypes.includes(set.setType) ? set.setType : "正式組",
        weightKg: set.weightKg ?? "",
        reps: set.reps ?? "",
        restSeconds: set.restSeconds ?? ""
      }))
    },
    loadedPrevious: true,
    previousDate: lastRecord.date
  };
}

export function getExerciseProgressRecords(workoutLogs, exerciseName) {
  const targetName = normalizeName(exerciseName);
  if (!targetName) return [];

  return (Array.isArray(workoutLogs) ? workoutLogs : [])
    .map(normalizeWorkoutLog)
    .filter((workout) => workout.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .flatMap((workout) => {
      const matchingExercises = workout.exercises.filter((exercise) => normalizeName(exercise.name) === targetName);
      if (!matchingExercises.length) return [];

      const sets = matchingExercises.flatMap((exercise) => exercise.sets);
      const validWeights = sets.map((set) => Number(set.weightKg)).filter((weight) => Number.isFinite(weight) && weight > 0);
      const validReps = sets.map((set) => Number(set.reps)).filter((reps) => Number.isFinite(reps) && reps > 0);
      const setTexts = sets
        .map((set) => {
          const weight = Number(set.weightKg);
          const reps = Number(set.reps);
          if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) return null;
          return `${formatNumber(weight)}kg × ${formatNumber(reps, 0)}`;
        })
        .filter(Boolean);

      return [{
        date: workout.date,
        sets,
        setTexts,
        totalSets: sets.length,
        totalReps: validReps.reduce((sum, reps) => sum + reps, 0),
        highestWeight: validWeights.length ? Math.max(...validWeights) : null
      }];
    });
}

export function getHighestWeightForExerciseOnDate(workout, exerciseName) {
  const records = getExerciseProgressRecords([workout], exerciseName);
  return records[0]?.highestWeight ?? null;
}

export function buildWorkoutSummary(workout) {
  const normalized = normalizeWorkoutLog(workout || {});
  if (!normalized.exercises.length) return "尚未加入動作";
  return normalized.exercises
    .map((exercise) => `${exercise.name || "未命名動作"}：${exercise.sets.length} 組`)
    .join("、");
}

export function buildCompactWorkoutSummary(workout) {
  const normalized = normalizeWorkoutLog(workout || {});
  const setCount = countWorkoutSets(normalized);
  const names = getWorkoutExerciseNames(normalized).slice(0, 3);
  if (!normalized.exercises.length) return "尚未加入訓練內容";
  return `${normalized.exercises.length} 個動作，${setCount} 組${names.length ? `，${names.join("、")}` : ""}`;
}

function normalizeExercise(exercise = {}) {
  if (Array.isArray(exercise.sets)) {
    return {
      id: exercise.id || generateId(),
      name: exercise.name || "",
      sets: exercise.sets.map(normalizeSet)
    };
  }

  const setCount = Math.max(1, Number(exercise.sets) || 1);
  const generatedSets = Array.from({ length: setCount }, () => ({
    id: generateId(),
    setType: "正式組",
    weightKg: exercise.weightKg ?? exercise.weight ?? "",
    reps: exercise.reps ?? "",
    restSeconds: exercise.restSeconds ?? ""
  }));

  return {
    id: exercise.id || generateId(),
    name: exercise.name || "",
    sets: generatedSets.map(normalizeSet)
  };
}

function normalizeSet(set = {}) {
  return {
    id: set.id || generateId(),
    setType: setTypes.includes(set.setType) ? set.setType : "正式組",
    weightKg: set.weightKg ?? "",
    reps: set.reps ?? "",
    restSeconds: set.restSeconds ?? ""
  };
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function uniqueTrimmed(items) {
  return [...new Set((Array.isArray(items) ? items : []).map((item) => String(item).trim()).filter(Boolean))];
}

function formatNumber(value, decimals = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return decimals === 0 ? String(Math.round(number)) : String(Math.round(number * 10) / 10);
}
