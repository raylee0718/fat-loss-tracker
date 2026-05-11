import { Activity, Droplets, HeartPulse, Moon, Ruler, Scale } from "lucide-react";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import {
  calculateAverage,
  calculateMeasurementChanges,
  calculateWeightChange,
  formatNumber,
  getLastNDaysLogs,
  getLatestMeasurement,
  getPreviousBodyMeasurement
} from "../utils/dashboard";
import { calculateBMI, getLatestLog, getLogByDate, getTodayDateString } from "../utils/health";
import { getWorkoutSummaryForDate } from "../utils/workouts";

export function Dashboard({ data }) {
  const today = getTodayDateString();
  const dailyLogs = data.dailyLogs || [];
  const workoutLogs = data.workoutLogs || [];
  const bodyMeasurements = data.bodyMeasurements || [];
  const settings = data.settings || {};
  const todayLog = getLogByDate(dailyLogs, today);
  const latestWeightLog = getLatestLog(dailyLogs.filter((log) => Number(log.weight)));
  const last7Logs = getLastNDaysLogs(dailyLogs, 7);
  const last7WeightLogs = getLastNDaysLogs(dailyLogs.filter((log) => Number(log.weight)), 7);
  const todayWorkout = getWorkoutSummaryForDate(workoutLogs, today);
  const waterGoal = Number(settings.dailyWaterGoal) || 2000;
  const sleepGoal = Number(settings.dailySleepGoal) || 7;
  const todayWater = Number(todayLog?.waterMl) || 0;
  const todayWaterPercent = Math.round((todayWater / waterGoal) * 100);
  const todayBmi = calculateBMI(todayLog?.weight, settings.heightCm);
  const latestMeasurement = getLatestMeasurement(bodyMeasurements);
  const previousMeasurement = getPreviousBodyMeasurement(bodyMeasurements);
  const measurementChanges = calculateMeasurementChanges(latestMeasurement, previousMeasurement);
  const weightChange7 = calculateWeightChange(last7WeightLogs);
  const averageSleep = calculateAverage(last7Logs.map((log) => log.sleepHours));
  const averageWater = calculateAverage(last7Logs.map((log) => log.waterMl));

  return (
    <div className="space-y-6">
      <DashboardSection title="今日概覽">
        {!todayLog && <EmptyState message="今天還沒有紀錄" />}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <OverviewCard icon={Scale} title="今日體重" value={todayLog?.weight ? `${todayLog.weight} kg` : "尚未紀錄"} />
          <OverviewCard icon={HeartPulse} title="今日 BMI" value={todayBmi ? todayBmi.toFixed(1) : "尚未紀錄"} />
          <OverviewCard icon={Droplets} title="今日喝水進度" value={`${todayWater} / ${waterGoal} ml`} helper={`完成 ${todayWaterPercent}%`}><ProgressBar value={todayWaterPercent} /></OverviewCard>
          <OverviewCard icon={Moon} title="今日睡眠時數" value={todayLog?.sleepHours ? `${todayLog.sleepHours} 小時` : "尚未紀錄"} helper={`目標 ${sleepGoal} 小時`} />
          <OverviewCard icon={Activity} title="今日訓練摘要" value={todayWorkout ? `${todayWorkout.exerciseCount} 個動作，${todayWorkout.setCount} 組` : "今天尚未記錄訓練"} helper={todayWorkout?.names?.length ? todayWorkout.names.slice(0, 3).join("、") : ""} />
        </div>
      </DashboardSection>

      <DashboardSection title="最新體態摘要">
        {latestMeasurement ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric label="日期" value={latestMeasurement.date || "尚未紀錄"} icon={Ruler} />
            <MeasurementMetric label="腰圍" value={latestMeasurement.waistCm} change={measurementChanges?.waistCm} />
            <MeasurementMetric label="臀圍" value={latestMeasurement.hipCm} change={measurementChanges?.hipCm} />
            <MeasurementMetric label="胸圍" value={latestMeasurement.chestCm} change={measurementChanges?.chestCm} />
            <MeasurementMetric label="大腿圍" value={latestMeasurement.thighCm} change={measurementChanges?.thighCm} />
          </div>
        ) : <EmptyState message="尚無體態紀錄" />}
      </DashboardSection>

      <DashboardSection title="最近 7 天簡短回顧">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="體重變化" value={weightChange7 !== null ? `${formatSigned(weightChange7)} kg` : "尚未紀錄"} />
          <Metric label="平均喝水" value={averageWater ? `${formatNumber(averageWater, 0)} ml` : "尚未紀錄"} />
          <Metric label="平均睡眠" value={averageSleep ? `${formatNumber(averageSleep)} 小時` : "尚未紀錄"} />
        </div>
      </DashboardSection>
    </div>
  );
}

function DashboardSection({ title, children }) {
  return <section><div className="mb-3"><h2 className="text-xl font-bold text-slate-950">{title}</h2></div>{children}</section>;
}

function OverviewCard({ icon: Icon, title, value, helper, children }) {
  return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>{helper && <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>}</div><div className="rounded-lg bg-teal-50 p-3 text-teal-700"><Icon size={20} /></div></div>{children && <div className="mt-3">{children}</div>}</Card>;
}

function Metric({ label, value, helper, icon: Icon }) {
  return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p>{helper && <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>}</div>{Icon && <div className="rounded-lg bg-teal-50 p-3 text-teal-700"><Icon size={18} /></div>}</div></Card>;
}

function MeasurementMetric({ label, value, change }) {
  return <Metric label={label} value={value ? `${value} cm` : "尚未紀錄"} helper={change !== null && change !== undefined ? `變化 ${formatSigned(change)} cm` : "無前一筆資料"} />;
}

function ProgressBar({ value }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);
  return <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${width}%` }} /></div>;
}

function formatSigned(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "尚未紀錄";
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}`;
}
