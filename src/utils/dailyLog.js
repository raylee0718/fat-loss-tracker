const MEAL_TEMPLATES_KEY = "mealTemplates";

export const mealTemplateCategories = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snacks: "加餐 / 宵夜"
};

export const presetMealTemplates = [];

export function getDateOffset(dateString, offsetDays) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPreviousDateString(dateString) {
  return getDateOffset(dateString, -1);
}

export function appendMealItem(currentText, item) {
  const trimmedText = String(currentText || "").trim();
  const trimmedItem = String(item || "").trim();
  if (!trimmedItem) return trimmedText;
  if (!trimmedText) return trimmedItem;

  const existingItems = trimmedText.split("、").map((part) => part.trim()).filter(Boolean);
  if (existingItems.includes(trimmedItem)) return trimmedText;
  return [...existingItems, trimmedItem].join("、");
}

export function getMealTemplates() {
  try {
    const rawTemplates = localStorage.getItem(MEAL_TEMPLATES_KEY);
    const parsedTemplates = rawTemplates ? JSON.parse(rawTemplates) : {};
    const normalizedTemplates = normalizeMealTemplates(parsedTemplates);
    if (rawTemplates && JSON.stringify(parsedTemplates) !== JSON.stringify(normalizedTemplates)) {
      localStorage.setItem(MEAL_TEMPLATES_KEY, JSON.stringify(normalizedTemplates));
    }
    return normalizedTemplates;
  } catch {
    return createEmptyMealTemplates();
  }
}

export function saveMealTemplates(templates) {
  const safeTemplates = normalizeMealTemplates(templates);
  localStorage.setItem(MEAL_TEMPLATES_KEY, JSON.stringify(safeTemplates));
  return safeTemplates;
}

export function normalizeMealTemplates(rawTemplates) {
  if (Array.isArray(rawTemplates)) {
    return {
      ...createEmptyMealTemplates(),
      breakfast: uniqueTrimmed(rawTemplates)
    };
  }

  if (!rawTemplates || typeof rawTemplates !== "object") return createEmptyMealTemplates();

  return {
    breakfast: uniqueTrimmed(rawTemplates.breakfast),
    lunch: uniqueTrimmed(rawTemplates.lunch),
    dinner: uniqueTrimmed(rawTemplates.dinner),
    snacks: uniqueTrimmed(rawTemplates.snacks)
  };
}

export function addMealTemplate(category, item) {
  const templates = getMealTemplates();
  const safeCategory = isMealCategory(category) ? category : "breakfast";
  const trimmedItem = String(item || "").trim();
  if (!trimmedItem) return templates;
  return saveMealTemplates({
    ...templates,
    [safeCategory]: uniqueTrimmed([...templates[safeCategory], trimmedItem])
  });
}

export function deleteMealTemplate(category, item) {
  const templates = getMealTemplates();
  const safeCategory = isMealCategory(category) ? category : "breakfast";
  return saveMealTemplates({
    ...templates,
    [safeCategory]: templates[safeCategory].filter((template) => template !== item)
  });
}

export function hasUnsavedChanges(originalRecord, currentRecord) {
  return JSON.stringify(normalizeComparableRecord(originalRecord)) !== JSON.stringify(normalizeComparableRecord(currentRecord));
}

export function formatSleepGoalComparison(sleepHours, goalHours) {
  const sleep = Number(sleepHours) || 0;
  const goal = Number(goalHours) || 7;
  if (!sleep) return "請先輸入睡眠時間";
  if (sleep >= goal) return "已達成睡眠目標";
  return `距離睡眠目標還差 ${(goal - sleep).toFixed(1)} 小時`;
}

function createEmptyMealTemplates() {
  return {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  };
}

function isMealCategory(category) {
  return Object.prototype.hasOwnProperty.call(mealTemplateCategories, category);
}

function normalizeComparableRecord(record) {
  return {
    date: record?.date || "",
    weight: record?.weight ?? "",
    breakfast: record?.breakfast || "",
    lunch: record?.lunch || "",
    dinner: record?.dinner || "",
    snacks: record?.snacks || "",
    waterMl: Number(record?.waterMl) || 0,
    sleepStart: record?.sleepStart || "",
    wakeTime: record?.wakeTime || "",
    sleepHours: Number(record?.sleepHours) || 0,
    habits: {
      sugaryDrink: !!record?.habits?.sugaryDrink,
      lateNightSnack: !!record?.habits?.lateNightSnack,
      friedFood: !!record?.habits?.friedFood,
      dessert: !!record?.habits?.dessert
    }
  };
}

function uniqueTrimmed(items) {
  return [...new Set((Array.isArray(items) ? items : []).map((item) => String(item).trim()).filter(Boolean))];
}
