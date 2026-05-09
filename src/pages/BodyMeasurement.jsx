import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { createEmptyBodyMeasurement, getLatestBodyMeasurement, sortBodyMeasurementsByDate } from "../utils/bodyMeasurements";
import { getTodayDateString } from "../utils/health";

const chartConfigs = [
  { key: "waistCm", title: "腰圍趨勢圖", label: "腰圍", color: "#0f766e" },
  { key: "hipCm", title: "臀圍趨勢圖", label: "臀圍", color: "#2563eb" },
  { key: "chestCm", title: "胸圍趨勢圖", label: "胸圍", color: "#f59e0b" },
  { key: "thighCm", title: "大腿圍趨勢圖", label: "大腿圍", color: "#be123c" }
];

export function BodyMeasurement({ data, onSaveBodyMeasurement, onDeleteBodyMeasurement }) {
  const [form, setForm] = useState(() => createEmptyBodyMeasurement(getTodayDateString()));
  const [message, setMessage] = useState("");
  const [skipAutoLoad, setSkipAutoLoad] = useState(false);
  const sortedRecords = useMemo(() => sortBodyMeasurementsByDate(data.bodyMeasurements || []), [data.bodyMeasurements]);
  const latest = getLatestBodyMeasurement(data.bodyMeasurements || []);

  useEffect(() => {
    if (skipAutoLoad) {
      setSkipAutoLoad(false);
      return;
    }
    const sameDateRecord = (data.bodyMeasurements || []).find((record) => record.date === form.date);
    if (sameDateRecord && sameDateRecord.id !== form.id) {
      setForm(sameDateRecord);
      setMessage("");
    }
  }, [data.bodyMeasurements, form.date, form.id, skipAutoLoad]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const saveRecord = () => {
    const sameDateRecord = (data.bodyMeasurements || []).find((record) => record.date === form.date);
    const nextRecord = {
      id: sameDateRecord?.id || form.id,
      date: form.date,
      waistCm: form.waistCm ?? "",
      hipCm: form.hipCm ?? "",
      chestCm: form.chestCm ?? "",
      thighCm: form.thighCm ?? ""
    };
    onSaveBodyMeasurement(nextRecord);
    setForm(nextRecord);
    setMessage("體態紀錄已儲存。");
  };
  const clearForm = () => {
    setSkipAutoLoad(true);
    setForm(createEmptyBodyMeasurement(getTodayDateString()));
    setMessage("");
  };
  const editRecord = (record) => {
    setForm(record);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteRecord = (id) => {
    if (window.confirm("確定要刪除這筆體態紀錄嗎？")) {
      onDeleteBodyMeasurement(id);
      if (form.id === id) clearForm();
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">體態紀錄</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="secondary-btn" type="button" onClick={clearForm}>清空表單</button>
            <button className="primary-btn" type="button" onClick={saveRecord}>儲存體態紀錄</button>
          </div>
        </div>
        {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Input label="日期" type="date" value={form.date} onChange={(value) => updateField("date", value)} />
          <Input label="腰圍 cm" type="number" value={form.waistCm} onChange={(value) => updateField("waistCm", value)} placeholder="輸入腰圍" />
          <Input label="臀圍 cm" type="number" value={form.hipCm} onChange={(value) => updateField("hipCm", value)} placeholder="輸入臀圍" />
          <Input label="胸圍 cm" type="number" value={form.chestCm} onChange={(value) => updateField("chestCm", value)} placeholder="輸入胸圍" />
          <Input label="大腿圍 cm" type="number" value={form.thighCm} onChange={(value) => updateField("thighCm", value)} placeholder="輸入大腿圍" />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold text-slate-950">最新體態摘要</h2>
        {latest ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryItem label="日期" value={latest.date || "尚未紀錄"} />
            <SummaryItem label="腰圍" value={formatCm(latest.waistCm)} />
            <SummaryItem label="臀圍" value={formatCm(latest.hipCm)} />
            <SummaryItem label="胸圍" value={formatCm(latest.chestCm)} />
            <SummaryItem label="大腿圍" value={formatCm(latest.thighCm)} />
          </div>
        ) : <EmptyState message="尚無體態紀錄" />}
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">{chartConfigs.map((config) => <MeasurementChart key={config.key} records={sortedRecords} config={config} />)}</div>

      <Card>
        <h2 className="mb-4 text-xl font-bold text-slate-950">歷史紀錄</h2>
        {sortedRecords.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-slate-500"><tr>{["日期", "腰圍", "臀圍", "胸圍", "大腿圍", "操作"].map((title) => <th key={title} className="border-b border-slate-200 p-3 font-semibold">{title}</th>)}</tr></thead>
              <tbody>{[...sortedRecords].reverse().map((record) => (
                <tr key={record.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-semibold text-slate-900">{record.date || "尚未紀錄"}</td>
                  <td className="p-3">{formatCm(record.waistCm)}</td>
                  <td className="p-3">{formatCm(record.hipCm)}</td>
                  <td className="p-3">{formatCm(record.chestCm)}</td>
                  <td className="p-3">{formatCm(record.thighCm)}</td>
                  <td className="p-3"><div className="flex gap-2"><button className="secondary-btn" type="button" onClick={() => editRecord(record)}>編輯</button><button className="danger-btn" type="button" onClick={() => deleteRecord(record.id)}>刪除</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState message="尚無體態紀錄" />}
      </Card>
    </div>
  );
}

function MeasurementChart({ records, config }) {
  const chartData = records.filter((record) => Number(record[config.key])).map((record) => ({ date: record.date, [config.label]: Number(record[config.key]) }));
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-slate-950">{config.title}</h2>
      {chartData.length >= 2 ? (
        <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis tick={{ fill: "#64748b", fontSize: 12 }} /><Tooltip labelFormatter={(label) => `日期：${label}`} formatter={(value, name) => [`${value} cm`, name]} /><Legend /><Line type="monotone" dataKey={config.label} name={config.label} stroke={config.color} strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
      ) : <EmptyState message="累積更多紀錄後，這裡會顯示趨勢圖。" />}
    </Card>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return <div><label className="label">{label}</label><input className="field" type={type} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SummaryItem({ label, value }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-950">{value}</p></div>;
}

function formatCm(value) {
  return value ? `${value} cm` : "尚未紀錄";
}
