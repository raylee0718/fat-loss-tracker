import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import {
  addMealTemplate,
  appendMealItem,
  deleteMealTemplate,
  formatSleepGoalComparison,
  getDateOffset,
  getMealTemplates,
  getPreviousDateString,
  hasUnsavedChanges,
  mealTemplateCategories
} from "../utils/dailyLog";
import { calculateBMI, calculateSleepHours, createEmptyDailyLog, getLogByDate, getTodayDateString } from "../utils/health";
import { getWaterQuickAmounts } from "../utils/storage";

const mealFields = [
  ["breakfast", "早餐", "加入早餐常用餐點"],
  ["lunch", "午餐", "加入午餐常用餐點"],
  ["dinner", "晚餐", "加入晚餐常用餐點"],
  ["snacks", "加餐 / 宵夜", "加入加餐 / 宵夜常用餐點"]
];

const habitFields = [
  ["sugaryDrink", "是否喝含糖飲料"],
  ["lateNightSnack", "是否吃宵夜"],
  ["friedFood", "是否吃炸物"],
  ["dessert", "是否吃點心"]
];

export function DailyLog({ data, onSaveDailyLog }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [form, setForm] = useState(() => getLogByDate(data.dailyLogs, selectedDate) || createEmptyDailyLog(selectedDate));
  const [originalRecord, setOriginalRecord] = useState(form);
  const [saveMessage, setSaveMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [mealTemplates, setMealTemplates] = useState(getMealTemplates);
  const [templateCategory, setTemplateCategory] = useState("breakfast");
  const [templateInput, setTemplateInput] = useState("");
  const previousSelectedDate = useRef(selectedDate);

  const sleepHours = useMemo(() => calculateSleepHours(form.sleepStart, form.wakeTime), [form.sleepStart, form.wakeTime]);
  const bmi = calculateBMI(form.weight, data.settings.heightCm);
  const waterGoal = Number(data.settings.dailyWaterGoal) || 2000;
  const waterQuickAmounts = getWaterQuickAmounts(data.settings);
  const waterMl = Math.max(0, Number(form.waterMl) || 0);
  const waterPercent = Math.round((waterMl / waterGoal) * 100);
  const sleepGoal = Number(data.settings.dailySleepGoal) || 7;
  const currentRecord = buildDailyRecord(form, selectedDate, waterMl, sleepHours);
  const hasChanges = hasUnsavedChanges(originalRecord, currentRecord);

  useEffect(() => {
    const dateChanged = previousSelectedDate.current !== selectedDate;
    const nextRecord = getLogByDate(data.dailyLogs, selectedDate) || createEmptyDailyLog(selectedDate);
    setForm(nextRecord);
    setOriginalRecord(buildDailyRecord(nextRecord, selectedDate, Number(nextRecord.waterMl) || 0, Number(nextRecord.sleepHours) || 0));
    if (dateChanged) {
      setSaveMessage("");
      setNotice("");
    }
    previousSelectedDate.current = selectedDate;
  }, [data.dailyLogs, selectedDate]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const updateField = (key, value) => {
    setSaveMessage("");
    setNotice("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateHabit = (key) => {
    setSaveMessage("");
    setNotice("");
    setForm((current) => ({
      ...current,
      habits: {
        ...current.habits,
        [key]: !current.habits?.[key]
      }
    }));
  };

  const copyYesterdayMeals = () => {
    const previousLog = getLogByDate(data.dailyLogs, getPreviousDateString(selectedDate));
    const hasMeals = previousLog && mealFields.some(([key]) => previousLog[key]);

    if (!hasMeals) {
      setNotice("昨天沒有可複製的餐食紀錄。");
      setSaveMessage("");
      return;
    }

    setForm((current) => ({
      ...current,
      breakfast: previousLog.breakfast || "",
      lunch: previousLog.lunch || "",
      dinner: previousLog.dinner || "",
      snacks: previousLog.snacks || ""
    }));
    setNotice("已複製昨天的餐食。");
    setSaveMessage("");
  };

  const insertMealTemplate = (mealKey, item) => {
    updateField(mealKey, appendMealItem(form[mealKey], item));
  };

  const addTemplate = () => {
    const trimmedInput = templateInput.trim();
    if (!trimmedInput) {
      setNotice("請先輸入餐點名稱");
      return;
    }
    if (mealTemplates[templateCategory]?.includes(trimmedInput)) {
      setNotice("這個餐點已經存在");
      return;
    }
    const nextTemplates = addMealTemplate(templateCategory, trimmedInput);
    setMealTemplates(nextTemplates);
    setTemplateInput("");
    setNotice("已新增常用餐點");
    setSaveMessage("");
  };

  const removeTemplate = (category, item) => {
    setMealTemplates(deleteMealTemplate(category, item));
    setNotice("已刪除常用餐點");
    setSaveMessage("");
  };

  const addWater = (amount) => updateField("waterMl", Math.max(0, waterMl + amount));

  const saveLog = () => {
    const nextRecord = buildDailyRecord(form, selectedDate, waterMl, sleepHours);
    onSaveDailyLog(nextRecord);
    setOriginalRecord(nextRecord);
    setForm(nextRecord);
    setSaveMessage("每日紀錄已儲存。");
    setNotice("");
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">每日紀錄</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">記錄今天最重要的減脂資料</h2>
            <p className="mt-2 text-sm text-slate-500">保留體重、餐食、喝水、睡眠與習慣，畫面更簡潔。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="secondary-btn" type="button" onClick={() => setSelectedDate(getDateOffset(selectedDate, -1))}>前一天</button>
            <button className="secondary-btn" type="button" onClick={() => setSelectedDate(getTodayDateString())}>今天</button>
            <button className="secondary-btn" type="button" onClick={() => setSelectedDate(getDateOffset(selectedDate, 1))}>後一天</button>
            <button className="primary-btn" type="button" onClick={saveLog}>儲存每日紀錄</button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {hasChanges && <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">你有尚未儲存的變更。</div>}
          {saveMessage && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{saveMessage}</div>}
          {notice && <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{notice}</div>}
        </div>
      </Card>

      <DailySummary form={form} bmi={bmi} waterPercent={waterPercent} sleepHours={sleepHours} />

      <Section title="基本資料">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="日期" type="date" value={selectedDate} onChange={setSelectedDate} />
          <Input label="體重 kg" type="number" value={form.weight} onChange={(value) => updateField("weight", value)} placeholder="輸入體重" />
          <Input label="BMI" value={bmi ? bmi.toFixed(1) : "尚未紀錄"} disabled />
        </div>
      </Section>

      <Section title="餐食紀錄">
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="secondary-btn" type="button" onClick={copyYesterdayMeals}>複製昨天餐食</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {mealFields.map(([key, label, buttonLabel]) => (
            <MealInput
              key={key}
              label={label}
              buttonLabel={buttonLabel}
              value={form[key]}
              templates={mealTemplates[key] || []}
              onChange={(value) => updateField(key, value)}
              onTemplateSelect={(item) => insertMealTemplate(key, item)}
            />
          ))}
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <h3 className="mb-3 text-base font-bold text-slate-950">常用餐點管理</h3>
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <Select label="餐點類別" value={templateCategory} onChange={setTemplateCategory} options={Object.entries(mealTemplateCategories)} />
            <Input label="新增常用餐點" value={templateInput} onChange={setTemplateInput} placeholder="輸入餐點名稱" />
            <div className="flex items-end"><button className="primary-btn w-full" type="button" onClick={addTemplate}>新增常用餐點</button></div>
          </div>
          <div className="mt-4 space-y-3">
            {Object.entries(mealTemplateCategories).map(([category, label]) => (
              <div key={category}>
                <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
                {mealTemplates[category]?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {mealTemplates[category].map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                        {item}
                        <button className="font-semibold text-rose-600" type="button" onClick={() => removeTemplate(category, item)}>刪除</button>
                      </span>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">{getMealEmptyMessage(category)}</p>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="喝水紀錄">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <Input label="喝水量 ml" type="number" value={waterMl} onChange={(value) => updateField("waterMl", Math.max(0, Number(value) || 0))} placeholder="輸入喝水量" />
          <div className="flex flex-wrap items-end gap-2">
            {waterQuickAmounts.length ? waterQuickAmounts.map((amount) => (
              <button key={amount} className="secondary-btn" type="button" onClick={() => addWater(amount)}>+{amount} ml</button>
            )) : <p className="text-sm text-slate-500">尚未設定喝水快捷量，請到設定新增。</p>}
            <button className="danger-btn" type="button" onClick={() => updateField("waterMl", 0)}>歸零喝水量</button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600"><span>今日喝水量：{waterMl} / {waterGoal} ml</span><span>完成 {waterPercent}%</span></div>
          <ProgressBar value={waterPercent} />
        </div>
      </Section>

      <Section title="睡眠紀錄">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="入睡時間" type="time" value={form.sleepStart} onChange={(value) => updateField("sleepStart", value)} />
          <Input label="起床時間" type="time" value={form.wakeTime} onChange={(value) => updateField("wakeTime", value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoBox label="總睡眠時數" value={sleepHours ? `${sleepHours} 小時` : "尚未紀錄"} />
          <InfoBox label="睡眠目標" value={formatSleepGoalComparison(sleepHours, sleepGoal)} helper={`目標 ${sleepGoal} 小時`} />
        </div>
      </Section>

      <Section title="習慣紀錄">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {habitFields.map(([key, label]) => (
            <button key={key} type="button" onClick={() => updateHabit(key)} className={`rounded-lg border p-4 text-left transition ${form.habits?.[key] ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"}`}>
              <p className="font-bold">{label}</p>
              <p className="mt-1 text-sm">{form.habits?.[key] ? "有" : "沒有"}</p>
            </button>
          ))}
        </div>
      </Section>

      <div className="flex justify-end"><button className="primary-btn px-6" type="button" onClick={saveLog}>儲存每日紀錄</button></div>
    </div>
  );
}

function buildDailyRecord(form, date, waterMl, sleepHours) {
  return {
    date,
    weight: form.weight ?? "",
    breakfast: form.breakfast || "",
    lunch: form.lunch || "",
    dinner: form.dinner || "",
    snacks: form.snacks || "",
    waterMl,
    sleepStart: form.sleepStart || "",
    wakeTime: form.wakeTime || "",
    sleepHours,
    habits: {
      sugaryDrink: !!form.habits?.sugaryDrink,
      lateNightSnack: !!form.habits?.lateNightSnack,
      friedFood: !!form.habits?.friedFood,
      dessert: !!form.habits?.dessert
    }
  };
}

function DailySummary({ form, bmi, waterPercent, sleepHours }) {
  const habits = habitFields.filter(([key]) => form.habits?.[key]).map(([, label]) => label.replace("是否", ""));
  return (
    <Card>
      <h3 className="mb-4 text-lg font-bold text-slate-950">今日摘要</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryItem label="體重" value={form.weight ? `${form.weight} kg` : "尚未紀錄"} />
        <SummaryItem label="BMI" value={bmi ? bmi.toFixed(1) : "尚未紀錄"} />
        <SummaryItem label="喝水進度" value={`${waterPercent}%`} />
        <SummaryItem label="睡眠" value={sleepHours ? `${sleepHours} 小時` : "尚未紀錄"} />
        <SummaryItem label="習慣" value={habits.length ? habits.join("、") : "尚未紀錄"} />
      </div>
    </Card>
  );
}

function MealInput({ label, buttonLabel, value, templates, onChange, onTemplateSelect }) {
  return (
    <div>
      <Input label={label} value={value} onChange={onChange} placeholder={`輸入${label}`} />
      <div className="mt-2">
        {templates.length ? (
          <select className="field" value="" onChange={(event) => event.target.value && onTemplateSelect(event.target.value)}>
            <option value="">{buttonLabel}</option>
            {templates.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        ) : <p className="text-sm text-slate-500">尚未建立{label}常用餐點</p>}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </div>
  );
}

function getMealEmptyMessage(category) {
  const label = mealTemplateCategories[category] || "餐點";
  return `尚未建立${label}常用餐點`;
}

function Section({ title, children }) {
  return <Card><div className="mb-4"><h3 className="text-lg font-bold text-slate-950">{title}</h3></div>{children}</Card>;
}

function Input({ label, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return <div><label className="label">{label}</label><input className="field disabled:bg-slate-50 disabled:text-slate-500" type={type} value={value ?? ""} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></div>;
}

function InfoBox({ label, value, helper }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-950">{value}</p>{helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}</div>;
}

function SummaryItem({ label, value }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>;
}

function ProgressBar({ value }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);
  return <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${width}%` }} /></div>;
}
