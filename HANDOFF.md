# Fat Loss Tracker Handoff

## 1. Project Overview

This is a local-only personal fat-loss tracking web app built for daily self-use. It tracks body weight, BMI, meals, water intake, sleep, habits, strength training, and body measurements. There is no backend; all data is stored in the browser through `localStorage`.

The UI is intended to be entirely Traditional Chinese zh-TW. The app has recently been simplified: Dashboard is intentionally glanceable, Daily Log no longer uses steps or notes, body measurements no longer use notes, meal templates are categorized by meal type, and water quick buttons support multiple custom amounts.

## 2. Tech Stack

- Framework: React with Vite
- Styling: Tailwind CSS
- Charts: Recharts
- Icons: lucide-react
- Persistence: browser `localStorage`
- PWA: `vite-plugin-pwa`
- Build scripts:
  - `npm.cmd run dev`
  - `npm.cmd run build`
  - `npm.cmd run preview`

## 3. Current Folder/File Structure

```text
fat-loss-tracker/
  index.html
  package.json
  package-lock.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  HANDOFF.md
  public/
    favicon.svg
    apple-touch-icon.png
    pwa-192x192.png
    pwa-512x512.png
  src/
    main.jsx
    App.jsx
    index.css
    components/
      AppShell.jsx
      Card.jsx
      EmptyState.jsx
      StatCard.jsx
    pages/
      Dashboard.jsx
      DailyLog.jsx
      WeightTrend.jsx
      ExerciseLog.jsx
      BodyMeasurement.jsx
      Settings.jsx
    utils/
      storage.js
      health.js
      dailyLog.js
      workouts.js
      bodyMeasurements.js
      dashboard.js
    data/
      sampleData.js
```

Generated folders/files may also exist:

```text
dist/
dev-dist/
vite.log
```

## 4. Current Pages

- Dashboard: simplified homepage with today’s weight, BMI, water progress, sleep, habits, compact training summary, latest body summary, and a short recent 7-record recap. It should stay uncluttered and should not show step count.
- Daily Log: daily form for date, weight, breakfast/lunch/dinner/snacks, categorized meal template insertion, water intake with configurable quick buttons, sleep start/wake time with automatic sleep duration, and four habit toggles.
- Weight Trend: current weight, target weight, target gap, current BMI, weight line chart, and BMI line chart.
- Exercise Log: strength-training-only tracker. Supports user-defined favorite exercises, adding custom exercises, auto-filling the most recent previous sets for the same movement, per-set logging, history by date, and movement progress records with a highest-weight chart.
- Body Measurement: body measurement form and trends for waist, hip, chest, and thigh. Notes are intentionally removed from the visible workflow.
- Settings: body target settings, height, daily water goal, multiple water quick amount management, sleep goal, data export/import, and sample data controls.

## 5. Implemented Features

- Daily weight tracking
- BMI calculation from settings height
- Meal logging for breakfast, lunch, dinner, and snacks / late-night snack
- Categorized custom meal templates:
  - `breakfast`
  - `lunch`
  - `dinner`
  - `snacks`
- Meal template insertion with `、` delimiter and duplicate prevention within a field
- Water logging with multiple configurable quick buttons
- Sleep tracking with automatic duration calculation
- Sleep duration supports crossing midnight
- Habit tracking:
  - sugary drink
  - late-night snack
  - fried food
  - dessert
- Simplified dashboard summary
- Weight and BMI trend charts
- Strength-training-only exercise log
- Multiple exercises per workout
- Multiple sets per exercise
- Per-set set type, weight, reps, and rest seconds
- User-defined favorite exercises in `localStorage`
- Auto-fill latest previous same-exercise set structure when adding a movement
- Exercise progress records by movement
- Highest-weight trend chart for selected movement when enough data exists
- Body measurements:
  - waist
  - hip
  - chest
  - thigh
- Body measurement trend charts
- Data export/import
- Sample data load/clear
- PWA configuration with manifest, service worker generation, and basic icons

## 6. localStorage Keys and Current Data Structures

Main app data:

```js
localStorage["fatLossTrackerStepOneData"]
```

Shape:

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

Backward compatibility:
- Old `settings.customWaterQuickAmount` is normalized into `waterQuickAmounts`.
- Missing/incomplete settings are merged with defaults.

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
    sleepHours: 0,
    habits: {
      sugaryDrink: false,
      lateNightSnack: false,
      friedFood: false,
      dessert: false
    }
  }
]
```

Backward compatibility:
- Old `steps` and `notes` fields may remain in older browser data, but current normalization removes them from active app state.

Meal templates:

```js
localStorage["mealTemplates"]
```

Current shape:

```js
{
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: []
}
```

Backward compatibility:
- Old array format such as `["無糖豆漿", "茶葉蛋"]` is normalized into `breakfast`.

Favorite exercises:

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

Backward compatibility:
- Old workout/exercise/set notes should not crash the app; current normalization ignores note fields.
- Old workout formats with exercise-level `sets` count are migrated into per-set records.

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

Backward compatibility:
- Old `notes`/`note` fields should not crash the app and are ignored by current normalization.

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
- `presetMealTemplates` currently empty by design
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
- `getHabitCounts(logs)`
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
- No backend.
- No login.
- No cloud sync.
- No calorie tracking.
- No AI meal analysis.
- No AI photo recognition.
- No Apple Health / Google Fit sync.
- Exercise Log is strength-training only.
- Each workout can contain multiple exercises.
- Each exercise can contain multiple per-set records.
- BMI uses `settings.heightCm`.
- Sleep duration supports crossing midnight.
- Data is stored in browser `localStorage`.
- Dashboard should stay simplified and glanceable.
- Daily Log intentionally excludes steps and notes.
- Body Measurement intentionally excludes notes.
- Meal templates are categorized by meal type.
- Water quick amounts support multiple custom options.
- Favorite exercises are user-defined and stored separately from workout logs.
- PWA support exists for installable mobile/home-screen use.

## 9. Known Limitations or Unfinished Items

- There is no automated test suite.
- Build passes, but the bundle is larger than Vite’s default 500 kB warning threshold because of chart/icon dependencies.
- PWA install on phones generally needs HTTPS deployment or an HTTPS tunnel; local HTTP may open but install/service worker behavior can be limited.
- `dev-dist/` exists from PWA development output and may not need to be committed depending on workflow.
- No visual/mobile QA was performed in this handoff task.
- PowerShell may display Traditional Chinese source text as mojibake depending on console encoding. Node reads the source as UTF-8 correctly, and the latest build completed successfully.
- Some generated/build artifacts may be stale if `dist/` is not rebuilt after future source changes.
- Data migration is handled by normalizers, but old user `localStorage` should still be smoke-tested manually after structural changes.

## 10. Recommended Next 3 to 5 Steps

1. Run a manual smoke test in a browser with empty `localStorage`.
2. Test migration with old saved data containing array-style `mealTemplates`, `customWaterQuickAmount`, daily `steps`, daily `notes`, workout notes, and body measurement notes.
3. Test the Exercise Log repeat-workout flow: add an exercise, save it, add the same exercise on a later date, and verify previous sets are copied.
4. Test production PWA behavior with `npm.cmd run build` and `npm.cmd run preview`, then on a real phone via HTTPS.
5. Consider code-splitting Recharts-heavy pages if bundle size becomes a concern.

## 11. Deployment Readiness Status

Current status: build-ready with caveats.

Verified during this handoff:

```powershell
npm.cmd run build
```

Result:
- Build completed successfully.
- PWA files were generated:
  - `dist/manifest.webmanifest`
  - `dist/registerSW.js`
  - `dist/sw.js`
  - Workbox runtime file
- Vite reported a chunk-size warning over 500 kB.

Recommended local production preview:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

For phone testing on the same Wi-Fi network, run with a network host:

```powershell
npm.cmd run preview -- --host 0.0.0.0 --port 4173
```

Then open the computer’s LAN IP on the phone. For true PWA install behavior, prefer HTTPS hosting.

## 12. Recent Changes From the Latest Step

The latest step added PWA support:

- Added `vite-plugin-pwa` to `devDependencies`.
- Updated `vite.config.js` to use `VitePWA`.
- Added web app manifest metadata:
  - App name: `減脂紀錄`
  - Short name: `減脂紀錄`
  - Description: `個人用減脂、體重、飲食、喝水、睡眠與重訓紀錄工具`
  - Theme color: `#0f766e`
  - Background color: `#f7fbfa`
  - Display mode: `standalone`
  - Orientation: `portrait`
- Added PWA/icon assets:
  - `public/favicon.svg`
  - `public/apple-touch-icon.png`
  - `public/pwa-192x192.png`
  - `public/pwa-512x512.png`
- Updated `index.html` metadata for PWA/mobile install support.

Recent product changes before PWA:

- Dashboard was simplified.
- Daily Log removed steps and notes.
- Meal templates became categorized by meal type.
- Water quick buttons became configurable with multiple custom amounts.
- Exercise Log moved to user-defined favorite exercises.
- Exercise Log added same-exercise previous-set auto-fill.
- Exercise Log added movement progress history and highest-weight trend.
- Body Measurement removed notes and long explanation text.
