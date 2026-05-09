# Fat Loss Tracker

A local-first personal fat-loss tracking web app for daily self-use. The app UI is written in Traditional Chinese zh-TW and is designed to track body weight, meals, water intake, sleep, habits, strength training, and body measurements without requiring an account or server.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Recharts
- lucide-react
- vite-plugin-pwa
- Browser `localStorage`

## Main Features

- Simplified dashboard for quick daily overview
- Daily weight and BMI tracking
- Meal logging for breakfast, lunch, dinner, and snacks / late-night snacks
- Categorized custom meal templates by meal type
- Water intake tracking with multiple custom quick buttons
- Sleep tracking with automatic duration calculation, including sleep crossing midnight
- Habit tracking for sugary drinks, late-night snacks, fried food, and desserts
- Weight and BMI trend charts
- Strength-training-only exercise log
- User-defined favorite exercises
- Per-set workout tracking with set type, weight, reps, and rest time
- Auto-fill previous set records when adding the same exercise again
- Exercise progress records by movement
- Body measurement tracking for waist, hip, chest, and thigh
- Data export/import for manual backup
- PWA support for mobile home-screen installation

## Install Dependencies

```powershell
npm install
```

If Windows PowerShell blocks `npm` because script execution is disabled, use `npm.cmd` instead, for example `npm.cmd install` or `npm.cmd run build`.

## Run Locally

```powershell
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

## Build

```powershell
npm run build
```

The production files are generated in `dist/`.

## Preview Production Build

```powershell
npm run preview
```

For testing from another device on the same Wi-Fi network:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173
```

Then open your computer’s local network IP from the other device.

## Deploy to Vercel

This project is a static Vite app and can be deployed directly to Vercel.

1. Push the project to a Git repository.
2. In Vercel, import the repository as a new project.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Deploy the project.

Vercel provides HTTPS by default, which is recommended for PWA installation and service worker behavior.

## Deploy to Netlify

This project can also be deployed as a static site on Netlify.

1. Push the project to a Git repository.
2. In Netlify, create a new site from the repository.
3. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Package/install command: `npm install`
4. Deploy the site.

Netlify provides HTTPS by default, which is recommended for PWA installation and service worker behavior.

## Data Storage

All app data is stored locally in the browser through `localStorage`.

Main keys:

- `fatLossTrackerStepOneData`
- `mealTemplates`
- `favoriteExercises`

There is no backend, login, cloud sync, or external health platform integration.

## Backup Reminder

Because the app stores data only in the browser, clearing browser data, changing browsers, using a different device, or changing the deployed domain can make previous records unavailable. Use the export/import tools in Settings to back up data regularly before browser cleanup, device changes, or domain changes.

## Known Limitations

- No backend or cloud sync
- No login or multi-device syncing
- No calorie tracking
- No AI meal analysis or photo recognition
- No Apple Health or Google Fit sync
- Browser `localStorage` can be cleared by the user or browser settings
- Production build may show a bundle-size warning because of chart and icon dependencies
- Full PWA installation and service worker behavior usually require HTTPS hosting

## Deployment Options

This is a static Vite app and can be deployed to common static hosting platforms, such as:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

For best PWA support, deploy over HTTPS.
