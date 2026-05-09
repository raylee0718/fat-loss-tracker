import { useEffect, useRef, useState } from "react";
import { Card } from "../components/Card";
import {
  addWaterQuickAmount,
  deleteWaterQuickAmount,
  exportAppData,
  getWaterQuickAmounts,
  importAppData,
  mergeSettingsWithDefaults,
  resetDefaultWaterQuickAmounts
} from "../utils/storage";

export function Settings({ data, onSaveSettings, onImportData, onLoadSampleData, onClearSampleData }) {
  const [settings, setSettings] = useState(mergeSettingsWithDefaults(data.settings));
  const [message, setMessage] = useState("");
  const [waterAmountInput, setWaterAmountInput] = useState("");
  const fileInputRef = useRef(null);
  const waterQuickAmounts = getWaterQuickAmounts(settings);

  useEffect(() => {
    setSettings(mergeSettingsWithDefaults(data.settings));
  }, [data.settings]);

  const updateField = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const saveSettings = () => {
    onSaveSettings(mergeSettingsWithDefaults(settings));
    setMessage("設定已儲存。");
  };

  const addQuickAmount = () => {
    const amount = Number(waterAmountInput);
    if (!Number.isFinite(amount) || amount < 50 || amount > 3000) {
      setMessage("請輸入有效的喝水量");
      return;
    }
    if (waterQuickAmounts.includes(amount)) {
      setMessage("這個快捷量已經存在");
      return;
    }
    const nextSettings = addWaterQuickAmount(settings, amount);
    setSettings(nextSettings);
    onSaveSettings(nextSettings);
    setWaterAmountInput("");
    setMessage("已新增喝水快捷量");
  };

  const removeQuickAmount = (amount) => {
    const nextSettings = deleteWaterQuickAmount(settings, amount);
    setSettings(nextSettings);
    onSaveSettings(nextSettings);
    setMessage("已刪除喝水快捷量");
  };

  const resetQuickAmounts = () => {
    const nextSettings = resetDefaultWaterQuickAmounts(settings);
    setSettings(nextSettings);
    onSaveSettings(nextSettings);
    setMessage("已恢復預設喝水快捷量");
  };

  const exportData = () => {
    const dataText = JSON.stringify(exportAppData(), null, 2);
    const blob = new Blob([dataText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `減脂追蹤器資料-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importAppData(file)
      .then((nextData) => {
        onImportData(nextData);
        setMessage("資料已匯入。");
      })
      .catch(() => {
        setMessage("匯入失敗，請確認檔案格式是否正確。");
      })
      .finally(() => {
        event.target.value = "";
      });
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">設定</h2>
            <p className="mt-1 text-sm text-slate-500">管理體重目標、身高、喝水目標與睡眠目標。</p>
          </div>
          <button className="primary-btn" type="button" onClick={saveSettings}>儲存設定</button>
        </div>
        {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
        <div className="space-y-5">
          <SettingsSection title="體重與身高">
            <Input label="起始體重 kg" type="number" value={settings.startingWeight} onChange={(value) => updateField("startingWeight", value)} placeholder="輸入起始體重" />
            <Input label="目標體重 kg" type="number" value={settings.targetWeight} onChange={(value) => updateField("targetWeight", value)} placeholder="輸入目標體重" />
            <Input label="身高 cm" type="number" value={settings.heightCm} onChange={(value) => updateField("heightCm", value)} placeholder="輸入身高" />
          </SettingsSection>

          <SettingsSection title="喝水設定">
            <Input label="每日喝水目標 ml" type="number" value={settings.dailyWaterGoal} onChange={(value) => updateField("dailyWaterGoal", Number(value) || 0)} placeholder="輸入喝水目標" />
            <div className="md:col-span-2 xl:col-span-2">
              <p className="label">喝水快捷選項</p>
              <div className="flex flex-wrap gap-2">
                {waterQuickAmounts.map((amount) => (
                  <span key={amount} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                    {amount} ml
                    <button className="font-semibold text-rose-600" type="button" onClick={() => removeQuickAmount(amount)}>刪除</button>
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <Input label="新增喝水快捷量 ml" type="number" value={waterAmountInput} onChange={setWaterAmountInput} placeholder="輸入喝水量" />
                <div className="flex items-end"><button className="primary-btn w-full" type="button" onClick={addQuickAmount}>新增快捷量</button></div>
                <div className="flex items-end"><button className="secondary-btn w-full" type="button" onClick={resetQuickAmounts}>恢復預設喝水快捷量</button></div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="睡眠設定">
            <Input label="每日睡眠目標 小時" type="number" value={settings.dailySleepGoal} onChange={(value) => updateField("dailySleepGoal", Number(value) || 0)} placeholder="輸入睡眠目標" />
          </SettingsSection>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-950">資料管理</h3>
        <p className="mt-2 text-sm text-slate-600">資料只會保存在這台裝置的瀏覽器中。你可以匯出備份、匯入資料，或載入範例資料。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="primary-btn" type="button" onClick={exportData}>匯出資料</button>
          <button className="secondary-btn" type="button" onClick={() => fileInputRef.current?.click()}>匯入資料</button>
          <button className="secondary-btn" type="button" onClick={onLoadSampleData}>載入範例資料</button>
          <button className="danger-btn" type="button" onClick={onClearSampleData}>清除範例資料</button>
          <input ref={fileInputRef} className="hidden" type="file" accept="application/json" onChange={importData} />
        </div>
      </Card>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return <section><h3 className="mb-3 text-lg font-bold text-slate-950">{title}</h3><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div></section>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return <div><label className="label">{label}</label><input className="field" type={type} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}
