# Fat Loss Tracker Handoff

## 1. Project Overview

This is a local-first personal fat-loss tracking web app for daily self-use. It is a React + Vite single-page app with a Traditional Chinese zh-TW user interface. It tracks body weight, BMI, meals, water intake, sleep, strength training, and body measurements. It also generates a fixed-format daily coach report that can be copied and sent to a fitness coach.

There is no backend, login, cloud sync, calorie tracking, AI meal analysis, or AI photo recognition. All user data is stored in the browser through `localStorage`.

## 2. Tech Stack

- Framework: React with Vite
- Styling: Tailwind CSS
- Charts: Recharts
- Icons: lucide-react
- Fonts: Google Fonts via CSS import
  - Main UI: `Noto Sans TC`
  - Accent: `LXGW WenKai TC`
- Persistence: browser `localStorage`
- PWA: `vite-plugin-pwa`
- Build scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

On Windows PowerShell, `npm` may be blocked by execution policy. Use `npm.cmd run build` or `cmd /c "npm run build"` if needed.

## 3. Current Folder / File Structure

```text
fat-loss-tracker/
  .gitignore
  index.html
  package.json
  package-lock.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  README.md
  HANDOFF.md
  public/
    apple-touch-icon.png
    favicon.ico
    favicon.svg
    maskable-icon-512x512.png
    pwa-192x192.png
    pwa-512x512.png
    icons/
      app-icon-source.png
  src/
    main.jsx
    App.jsx
    index.css
    components/
      AppShell.jsx
      Card.jsx
      EmptyState.jsx
      StatCard.jsx
    data/
      sampleData.js
    pages/
      BodyMeasurement.jsx
      DailyLog.jsx
      Dashboard.jsx
      ExerciseLog.jsx
      Settings.jsx
      WeightTrend.jsx
    utils/
      bodyMeasurements.js
      dailyLog.js
      dashboard.js
      health.js
      storage.js
      workouts.js
```

Generated folders may also exist locally:

```text
dist/
dev-dist/
node_modules/
```

`dist/`, `dev-dist/`, and `node_modules/` are ignored by Git.

## 4. Current Pages and Features

- App Shell: top header and tab navigation for all app pages. Main navigation uses lucide-react icons.
- Dashboard: simplified overview of today's weight, BMI, water progress, sleep, training summary, latest body measurements, and recent 7-day recap. Habit tracking is intentionally not shown.
- Daily Log: daily form for date, weight, meals, water intake, sleep times, and a copyable coach report preview. It supports categorized meal templates and configurable water quick buttons.
- Weight Trend: current weight, target weight, target gap, current BMI, weight trend chart, and BMI trend chart.
- Exercise Log: strength-training-only tracker with favorite exercises, custom exercises, multiple exercises per workout, multiple individual set records per exercise, previous-set auto-fill, history, and movement progress.
- Body Measurement: body measurement form, latest summary, history table, and trend charts for waist, hip, chest, and thigh.
- Settings: body target settings, height, daily water goal, water quick amount management, sleep goal, export/import, and sample data controls.

## 5. Implemented Features

- Daily weight tracking
- BMI calculation from settings height
- Meal logging for breakfast, lunch, dinner, and snacks / late-night snacks
- Categorized custom meal templates:
  - `breakfast`
  - `lunch`
  - `dinner`
  - `snacks`
- Meal template insertion with the `、` delimiter and duplicate prevention within a field
- Daily coach report generation from the current Daily Log form state
- Copy-to-clipboard button for the coach report
- Water logging with multiple configurable quick buttons
- Sleep tracking with automatic duration calculation
- Sleep duration supports crossing midnight
- Simplified dashboard summary
- Weight and BMI trend charts
- Strength-training-only exercise log
- User-defined favorite exercises
- Multiple exercises per workout
- Multiple individual set records per exercise
- Per-set set type, weight, reps, and rest seconds
- Auto-fill latest previous same-exercise set structure when adding a movement
- Exercise progress records by movement
- Highest-weight trend chart for selected movement when enough data exists
- Body measurements:
  - waist
  - hip
  - chest
  - thigh
- Body measurement trend charts
- Data export/import for manual backup
- Sample data load/clear
- PWA manifest, service worker generation, and updated browser/mobile icons
- Typography update:
  - `Noto Sans TC` for the main UI
  - `LXGW WenKai TC` for selected warm accent areas

## 6. localStorage Keys and Data Structures

Main app data key:

```js
localStorage["fatLossTrackerStepOneData"]
```

Current shape:

```js
{
  dailyLogs: [],
  workoutLogs: [],
  bodyMeasurements: [],
  settings: {}
}
```

Settings:

```js
{
  startingWeight: "",
  targetWeight: "",
  heightCm: "",
  dailyWaterGoal: 2000,
  waterQuickAmounts: [250, 500, 750],
  dailySleepGoal: 7
}
```

Daily logs:

```js
[
  {
    date: "YYYY-MM-DD",
    weight: "",
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    waterMl: 0,
    sleepStart: "",
    wakeTime: "",
    sleepHours: 0
  }
]
```

Meal templates key:

```js
localStorage["mealTemplates"]
```

Shape:

```js
{
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: []
}
```

Favorite exercises key:

```js
localStorage["favoriteExercises"]
```

Shape:

```js
["槓鈴臥推", "坐姿划船"]
```

Workout logs:

```js
[
  {
    id: "unique-id",
    date: "YYYY-MM-DD",
    exercises: [
      {
        id: "unique-id",
        name: "槓鈴臥推",
        sets: [
          {
            id: "unique-id",
            setType: "正式組",
            weightKg: "",
            reps: "",
            restSeconds: ""
          }
        ]
      }
    ]
  }
]
```

Supported set types:

```js
["熱身組", "正式組", "遞減組", "力竭組", "其他"]
```

Body measurements:

```js
[
  {
    id: "unique-id",
    date: "YYYY-MM-DD",
    waistCm: "",
    hipCm: "",
    chestCm: "",
    thighCm: ""
  }
]
```

Backward compatibility notes:

- Old `settings.customWaterQuickAmount` is normalized into `waterQuickAmounts`.
- Old array-format `mealTemplates` are normalized into the `breakfast` category.
- Old daily log `snack` is normalized into `snacks`.
- Old daily log `habits`, `steps`, and `notes` may exist in older browser storage, but the current app no longer shows or uses them.
- Old workout formats with exercise-level `sets` counts are migrated into individual set records.
- Old workout note fields and body measurement note fields are ignored by current normalizers.

## 7. Important Helper Functions

`src/utils/storage.js`

- `readAppData()`
- `writeAppData(data)`
- `saveAppData(data)`
- `clearSampleData()`
- `loadSampleData()`
- `mergeSettingsWithDefaults(settings)`
- `normalizeSettings(settings)`
- `normalizeWaterQuickAmounts(settings)`
- `addWaterQuickAmount(settings, amount)`
- `deleteWaterQuickAmount(settings, amount)`
- `resetDefaultWaterQuickAmounts(settings)`
- `getWaterQuickAmounts(settings)`
- `exportAppData()`
- `importAppData(file)`
- `importAppDataFromObject(importedData)`
- `normalizeDailyLog(log)`
- `normalizeWorkoutLog(log)`
- `normalizeBodyMeasurement(record)`

`src/utils/health.js`

- `getTodayDateString()`
- `calculateSleepHours(sleepStart, wakeTime)`
- `calculateBMI(weight, heightCm)`
- `sortLogsByDate(logs)`
- `getLatestLog(logs)`
- `getLogByDate(logs, date)`
- `upsertDailyLog(logs, newLog)`
- `createEmptyDailyLog(date)`

`src/utils/dailyLog.js`

- `mealTemplateCategories`
- `presetMealTemplates`
- `getDateOffset(dateString, offsetDays)`
- `getPreviousDateString(dateString)`
- `appendMealItem(currentText, item)`
- `getMealTemplates()`
- `saveMealTemplates(templates)`
- `normalizeMealTemplates(rawTemplates)`
- `addMealTemplate(category, item)`
- `deleteMealTemplate(category, item)`
- `hasUnsavedChanges(originalRecord, currentRecord)`
- `formatSleepGoalComparison(sleepHours, goalHours)`

`src/utils/workouts.js`

- `setTypes`
- `generateId()`
- `getWorkoutLogs()`
- `saveWorkoutLogs(logs)`
- `upsertWorkoutLog(logs, newLog)`
- `deleteWorkoutLog(logs, id)`
- `normalizeWorkoutLog(log)`
- `migrateWorkoutLogsIfNeeded(logs)`
- `createEmptyWorkoutLog(date)`
- `createEmptyExercise(name)`
- `createEmptySet()`
- `getFavoriteExercises()`
- `saveFavoriteExercises(exercises)`
- `addFavoriteExercise(name)`
- `deleteFavoriteExercise(name)`
- `countWorkoutSets(workout)`
- `getWorkoutExerciseNames(workout)`
- `getAllExerciseNames(workoutLogs)`
- `getWorkoutLogsByDate(logs, date)`
- `getWorkoutSummaryForDate(workoutLogs, date)`
- `getLastNDaysWorkoutStats(workoutLogs, dates)`
- `findLastExerciseRecord(workoutLogs, exerciseName, beforeDate)`
- `createExerciseFromPreviousRecord(exerciseName, workoutLogs, date)`
- `getExerciseProgressRecords(workoutLogs, exerciseName)`
- `getHighestWeightForExerciseOnDate(workout, exerciseName)`
- `buildWorkoutSummary(workout)`
- `buildCompactWorkoutSummary(workout)`

`src/utils/bodyMeasurements.js`

- `getBodyMeasurements()`
- `saveBodyMeasurements(records)`
- `sortBodyMeasurementsByDate(records)`
- `getLatestBodyMeasurement(records)`
- `upsertBodyMeasurement(records, newRecord)`
- `deleteBodyMeasurement(records, id)`
- `createEmptyBodyMeasurement(date)`
- `normalizeBodyMeasurement(record)`

`src/utils/dashboard.js`

- `getLastNDaysLogs(logs, n)`
- `calculateAverage(numbers)`
- `formatNumber(value, decimals)`
- `calculateWeightChange(logs)`
- `getWorkoutSummaryForDate(workoutLogs, date)`
- `getWorkoutDaysCount(workoutLogs, days)`
- `getRecentDateStrings(todayDate, days)`
- `getPreviousBodyMeasurement(records)`
- `calculateMeasurementChanges(latest, previous)`
- `getLatestMeasurement(records)`
- `buildWeightChartData(logs, heightCm, days)`

## 8. Important Design Decisions

- UI must remain Traditional Chinese zh-TW.
- Do not use Simplified Chinese.
- Data stays in browser `localStorage`.
- No backend.
- No login.
- No cloud sync.
- No calorie tracking.
- No AI meal analysis.
- No AI photo recognition.
- No Apple Health or Google Fit sync.
- Exercise Log is strength-training only.
- Each exercise can contain multiple individual set records.
- BMI uses `settings.heightCm`.
- Sleep duration supports crossing midnight.
- Dashboard should stay simplified and glanceable.
- Daily Log intentionally excludes steps, notes, and habit tracking.
- Body Measurement intentionally excludes notes.
- Coach report intentionally excludes habits, steps, notes, calories, and AI analysis.
- Meal templates are categorized by meal type.
- Water quick amounts support multiple custom options.
- Favorite exercises are user-defined and stored separately from workout logs.
- Main UI typography uses `Noto Sans TC`; warm accent areas use `LXGW WenKai TC`.
- App icons are generated from `public/icons/app-icon-source.png`; deployed icon paths are root-level public assets.

## 9. Deployment Status

Current status: build-ready with caveats.

Last verified command:

```powershell
cmd /c "npm run build"
```

Result:

- Build completed successfully.
- PWA files were generated in `dist/`.
- `dist/manifest.webmanifest` references:
  - `/pwa-192x192.png`
  - `/pwa-512x512.png`
  - `/maskable-icon-512x512.png`
- `dist/index.html` references:
  - `/favicon.ico`
  - `/apple-touch-icon.png`
- Vite still reports a chunk-size warning because the main JS bundle is larger than 500 kB.

Recommended local production preview:

```powershell
npm run preview
```

For phone testing on the same Wi-Fi network:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173
```

For best PWA behavior, deploy over HTTPS.

## 10. Known Limitations or Unfinished Items

- There is no automated test suite.
- No full mobile visual QA suite is present.
- Build passes, but Vite reports a bundle-size warning over 500 kB because of chart/icon dependencies.
- PWA install and service worker behavior generally require HTTPS.
- Browser `localStorage` can be cleared by browser settings, manual cleanup, private browsing behavior, or device changes.
- Data is scoped to browser and domain; moving between deployment domains requires export/import.
- Coach report copy uses the Clipboard API with a textarea fallback, but clipboard behavior may vary by browser/security context.
- Google Fonts require network access; fallback fonts are configured if they fail to load.
- `public/favicon.svg` remains in the project but `index.html` now uses `favicon.ico`.
- `public/icons/app-icon-source.png` is a source asset and may be copied into `dist/icons/` during build even though the manifest uses generated root-level icons.
- Data migration is handled by normalizers, but old user `localStorage` should still be smoke-tested manually after structural changes.

## 11. Recommended Next Steps

1. Run a manual smoke test with empty `localStorage`.
2. Run a manual migration smoke test with old data containing `habits`, `steps`, `notes`, old array-style `mealTemplates`, `customWaterQuickAmount`, old workout notes, and old body measurement notes.
3. Test Daily Log save/load and verify the coach report updates before saving and after loading a saved record.
4. Test the copy button in Chrome, Safari, and on a phone after HTTPS deployment.
5. Test Exercise Log repeat-workout flow: save an exercise, add the same exercise on a later date, and verify previous sets are copied.
6. Test production PWA install on iPhone and Android over HTTPS.
7. Consider code-splitting Recharts-heavy pages if bundle size becomes a concern.

## 12. New Codex Conversation Starter

Use this to start a new Codex session:

```text
I am continuing an existing React + Vite personal fat-loss tracking app.

Please read HANDOFF.md and README.md first, then inspect the current codebase before making changes.

Important project rules:
- Do not rebuild from scratch.
- Keep the UI in Traditional Chinese zh-TW.
- Do not use Simplified Chinese.
- Do not add backend, login, cloud sync, calorie tracking, AI meal analysis, or AI photo recognition unless I explicitly ask.
- Data is stored in localStorage.
- Exercise Log is strength-training only.
- Each exercise can contain multiple individual set records.
- BMI uses height from settings.
- Sleep duration supports crossing midnight.
- Meal templates are categorized by meal type.
- Water quick amounts support multiple custom options.
- Favorite exercises are user-defined.
- Dashboard should stay simplified.
- Daily Log excludes steps, notes, and habit tracking.
- Coach report excludes habits, steps, notes, calories, and AI analysis.
- Make small, safe changes only.

First, summarize your understanding of the current app from HANDOFF.md and README.md, then inspect the relevant files before making changes.
```
