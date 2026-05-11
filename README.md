# Fat Loss Tracker

A local-first personal fat-loss tracking web app for daily self-use. The app UI is written in Traditional Chinese zh-TW and tracks body weight, BMI, meals, water intake, sleep, strength training, and body measurements without an account or server.

The app also generates a fixed-format daily coach report from the current Daily Log form so it can be copied and sent to a fitness coach.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Recharts
- lucide-react
- vite-plugin-pwa
- Browser `localStorage`
- Google Fonts:
  - `Noto Sans TC`
  - `LXGW WenKai TC`

## Main Features

- Simplified dashboard for quick daily overview
- Daily weight and BMI tracking
- Meal logging for breakfast, lunch, dinner, and snacks / late-night snacks
- Categorized custom meal templates by meal type
- Copyable daily coach report generated from the current Daily Log form
- Water intake tracking with multiple custom quick buttons
- Sleep tracking with automatic duration calculation, including sleep crossing midnight
- Weight and BMI trend charts
- Strength-training-only exercise log
- User-defined favorite exercises
- Multiple exercises per workout
- Multiple individual set records per exercise
- Per-set workout tracking with set type, weight, reps, and rest time
- Auto-fill previous set records when adding the same exercise again
- Exercise progress records by movement
- Body measurement tracking for waist, hip, chest, and thigh
- Body measurement trend charts
- Data export/import for manual backup
- Sample data load/clear
- PWA support for mobile home-screen installation
- Updated browser and PWA icons generated from `public/icons/app-icon-source.png`

## Install

```powershell
npm install
```

If Windows PowerShell blocks `npm` because script execution is disabled, use `npm.cmd` instead:

```powershell
npm.cmd install
```

## Local Development

```powershell
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

PowerShell fallback:

```powershell
npm.cmd run dev
```

## Build

```powershell
npm run build
```

The production files are generated in `dist/`.

PowerShell fallback:

```powershell
npm.cmd run build
```

## Production Preview

```powershell
npm run preview
```

For testing from another device on the same Wi-Fi network:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173
```

Then open your computer's local network IP from the other device.

## Deploy to Vercel

This project is a static Vite app and can be deployed directly to Vercel.

1. Push the project to a Git repository.
2. In Vercel, import the repository as a new project.
3. Use these settings:
   - Framework Preset: `Vite`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy the project.

Vercel provides HTTPS by default, which is recommended for PWA installation and service worker behavior.

## Deploy to Netlify

This project can also be deployed as a static site on Netlify.

1. Push the project to a Git repository.
2. In Netlify, create a new site from the repository.
3. Use these build settings:
   - Package/install command: `npm install`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy the site.

Netlify provides HTTPS by default, which is recommended for PWA installation and service worker behavior.

## PWA Mobile Installation

For best results, deploy the app over HTTPS first.

iPhone / iPad:

1. Open the deployed site in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Confirm the app name and icon.

Android / Chrome:

1. Open the deployed site in Chrome.
2. Use the install prompt if shown, or open the browser menu.
3. Choose Install app or Add to Home screen.
4. Confirm the install.

If an old icon remains cached, remove the old home-screen app first, clear the site's browser data if needed, then add/install it again.

## Data Storage and Backup

All app data is stored locally in the browser through `localStorage`.

Main keys:

- `fatLossTrackerStepOneData`
- `mealTemplates`
- `favoriteExercises`

Because the app stores data only in the browser, clearing browser data, changing browsers, using a different device, or changing the deployed domain can make previous records unavailable. Use the export/import tools in Settings to back up data regularly, especially before browser cleanup, device changes, or domain changes.

There is no backend, login, cloud sync, or external health platform integration.

## Known Limitations

- No backend or cloud sync
- No login or multi-device syncing
- No calorie tracking
- No AI meal analysis or photo recognition
- No Apple Health or Google Fit sync
- No automated test suite
- Browser `localStorage` can be cleared by the user or browser settings
- Data is scoped to the current browser and deployment domain
- Production build may show a bundle-size warning because of chart and icon dependencies
- Full PWA installation and service worker behavior usually require HTTPS hosting
- Clipboard behavior for the coach report may vary by browser/security context
- Google Fonts require network access; fallback fonts are configured

## Development Notes

- UI text must remain Traditional Chinese zh-TW.
- Do not use Simplified Chinese.
- Keep data in `localStorage`.
- Do not add backend, login, cloud sync, calorie tracking, AI meal analysis, or AI photo recognition unless explicitly requested.
- Exercise Log is strength-training only.
- Each exercise can contain multiple individual set records.
- BMI uses height from Settings.
- Sleep duration supports crossing midnight.
- Meal templates are categorized by meal type.
- Water quick amounts support multiple custom options.
- Favorite exercises are user-defined and stored separately from workout logs.
- Dashboard should stay simplified and glanceable.
- Daily Log intentionally excludes steps, notes, and habit tracking.
- Coach report intentionally excludes habits, steps, notes, calories, and AI analysis.
- Main UI font is `Noto Sans TC` with Microsoft JhengHei/system fallbacks.
- Warm accent font is `LXGW WenKai TC` for selected headings and helper text.
- PWA/browser icon source is `public/icons/app-icon-source.png`; generated deploy icons live at the root of `public/`.
