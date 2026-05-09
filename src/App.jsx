import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { DailyLog } from "./pages/DailyLog";
import { WeightTrend } from "./pages/WeightTrend";
import { ExerciseLog } from "./pages/ExerciseLog";
import { BodyMeasurement } from "./pages/BodyMeasurement";
import { Settings } from "./pages/Settings";
import { clearSampleData, loadSampleData, readAppData, saveAppData } from "./utils/storage";
import { upsertDailyLog } from "./utils/health";
import { deleteWorkoutLog, upsertWorkoutLog } from "./utils/workouts";
import { deleteBodyMeasurement, upsertBodyMeasurement } from "./utils/bodyMeasurements";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(readAppData);

  const saveData = (nextData) => {
    setData(saveAppData(nextData));
  };

  const saveDailyLog = (dailyLog) => {
    saveData({
      ...data,
      dailyLogs: upsertDailyLog(data.dailyLogs, dailyLog)
    });
  };

  const saveSettings = (settings) => {
    saveData({
      ...data,
      settings
    });
  };

  const saveWorkoutLog = (workoutLog) => {
    saveData({
      ...data,
      workoutLogs: upsertWorkoutLog(data.workoutLogs, workoutLog)
    });
  };

  const removeWorkoutLog = (id) => {
    saveData({
      ...data,
      workoutLogs: deleteWorkoutLog(data.workoutLogs, id)
    });
  };

  const saveBodyMeasurement = (record) => {
    saveData({
      ...data,
      bodyMeasurements: upsertBodyMeasurement(data.bodyMeasurements, record)
    });
  };

  const removeBodyMeasurement = (id) => {
    saveData({
      ...data,
      bodyMeasurements: deleteBodyMeasurement(data.bodyMeasurements, id)
    });
  };

  const replaceData = (nextData) => {
    setData(nextData);
  };

  const pages = {
    dashboard: <Dashboard data={data} />,
    dailyLog: <DailyLog data={data} onSaveDailyLog={saveDailyLog} />,
    weightTrend: <WeightTrend data={data} />,
    exerciseLog: <ExerciseLog data={data} onSaveWorkoutLog={saveWorkoutLog} onDeleteWorkoutLog={removeWorkoutLog} />,
    bodyMeasurement: <BodyMeasurement data={data} onSaveBodyMeasurement={saveBodyMeasurement} onDeleteBodyMeasurement={removeBodyMeasurement} />,
    settings: (
      <Settings
        data={data}
        onSaveSettings={saveSettings}
        onImportData={replaceData}
        onLoadSampleData={() => setData(loadSampleData())}
        onClearSampleData={() => setData(clearSampleData())}
      />
    )
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {pages[activeTab]}
    </AppShell>
  );
}
