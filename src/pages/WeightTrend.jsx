import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { calculateBMI, getLatestLog, sortLogsByDate } from "../utils/health";

export function WeightTrend({ data }) {
  const sortedLogs = sortLogsByDate(data.dailyLogs || []).filter((log) => Number(log.weight));
  const chartData = sortedLogs.map((log) => ({ date: log.date, 體重: Number(log.weight) }));
  const bmiChartData = sortedLogs
    .map((log) => ({ date: log.date, BMI: calculateBMI(log.weight, data.settings.heightCm) }))
    .filter((log) => Number(log.BMI));

  const latestLog = getLatestLog(sortedLogs);
  const currentWeight = latestLog?.weight ? Number(latestLog.weight) : null;
  const targetWeight = Number(data.settings.targetWeight) || null;
  const currentBmi = latestLog ? calculateBMI(latestLog.weight, data.settings.heightCm) : null;
  const targetGap = currentWeight && targetWeight ? currentWeight - targetWeight : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="目前體重" value={currentWeight ? `${currentWeight} kg` : "尚未紀錄"} />
        <StatCard title="目標體重" value={targetWeight ? `${targetWeight} kg` : "尚未設定"} />
        <StatCard title="與目標體重差距" value={targetGap !== null ? `${Math.abs(targetGap).toFixed(1)} kg` : "尚未紀錄"} />
        <StatCard title="目前 BMI" value={currentBmi ? currentBmi.toFixed(1) : "尚未紀錄"} />
      </div>

      <Card>
        <h2 className="mb-4 text-xl font-bold text-slate-950">體重折線圖</h2>
        {chartData.length >= 2 ? <TrendChart data={chartData} lineKey="體重" color="#0f766e" unit="kg" /> : <EmptyState message="累積更多紀錄後，這裡會顯示趨勢圖。" />}
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold text-slate-950">BMI 折線圖</h2>
        {bmiChartData.length >= 2 ? <TrendChart data={bmiChartData} lineKey="BMI" color="#f59e0b" unit="" /> : <EmptyState message="累積更多紀錄後，這裡會顯示趨勢圖。" />}
      </Card>
    </div>
  );
}

function TrendChart({ data, lineKey, color, unit }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip labelFormatter={(label) => `日期：${label}`} formatter={(value, name) => [`${value}${unit ? ` ${unit}` : ""}`, name]} />
          <Legend />
          <Line type="monotone" dataKey={lineKey} name={lineKey} stroke={color} strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
