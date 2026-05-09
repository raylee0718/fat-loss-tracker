import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { getTodayDateString } from "../utils/health";
import {
  addFavoriteExercise,
  buildWorkoutSummary,
  countWorkoutSets,
  createEmptySet,
  createEmptyWorkoutLog,
  createExerciseFromPreviousRecord,
  deleteFavoriteExercise,
  getAllExerciseNames,
  getExerciseProgressRecords,
  getFavoriteExercises,
  setTypes
} from "../utils/workouts";

export function ExerciseLog({ data, onSaveWorkoutLog, onDeleteWorkoutLog }) {
  const [form, setForm] = useState(() => createEmptyWorkoutLog(getTodayDateString()));
  const [favoriteExercises, setFavoriteExercises] = useState(getFavoriteExercises);
  const [favoriteInput, setFavoriteInput] = useState("");
  const [selectedFavorite, setSelectedFavorite] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [selectedProgressExercise, setSelectedProgressExercise] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const workoutLogs = data.workoutLogs || [];
  const sortedWorkoutLogs = [...workoutLogs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const allExerciseNames = useMemo(() => getAllExerciseNames(workoutLogs), [workoutLogs]);
  const progressExercise = selectedProgressExercise || allExerciseNames[0] || "";
  const progressRecords = useMemo(() => getExerciseProgressRecords(workoutLogs, progressExercise), [workoutLogs, progressExercise]);
  const progressChartData = progressRecords.filter((record) => Number(record.highestWeight)).map((record) => ({ date: record.date, 最高重量: record.highestWeight }));

  const addExercise = (name) => {
    const trimmedName = String(name || "").trim();
    if (!trimmedName) {
      setNotice("請先選擇或輸入動作名稱。");
      return;
    }

    const result = createExerciseFromPreviousRecord(trimmedName, workoutLogs, form.date);
    setForm((current) => ({ ...current, exercises: [...current.exercises, result.exercise] }));
    setNotice(result.loadedPrevious ? "已帶入上次訓練紀錄，可直接微調後儲存。" : "尚無上次紀錄，已建立空白組別。");
    setMessage("");
  };

  const addSelectedExercise = () => {
    const name = customExerciseName.trim() || selectedFavorite;
    addExercise(name);
    if (customExerciseName.trim()) setCustomExerciseName("");
  };

  const addFavorite = () => {
    const nextFavorites = addFavoriteExercise(favoriteInput);
    setFavoriteExercises(nextFavorites);
    setFavoriteInput("");
  };

  const removeFavorite = (name) => {
    const nextFavorites = deleteFavoriteExercise(name);
    setFavoriteExercises(nextFavorites);
    if (selectedFavorite === name) setSelectedFavorite("");
  };

  const updateExerciseName = (exerciseId, value) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, name: value } : exercise))
    }));
    setMessage("");
  };

  const deleteExercise = (exerciseId) => {
    setForm((current) => ({ ...current, exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId) }));
    setMessage("");
  };

  const addSet = (exerciseId) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, createEmptySet()] } : exercise))
    }));
    setMessage("");
  };

  const updateSet = (exerciseId, setId, key, value) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => (
        exercise.id === exerciseId
          ? { ...exercise, sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [key]: value } : set)) }
          : exercise
      ))
    }));
    setMessage("");
  };

  const deleteSet = (exerciseId, setId) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => (
        exercise.id === exerciseId ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) } : exercise
      ))
    }));
    setMessage("");
  };

  const saveWorkout = () => {
    onSaveWorkoutLog(form);
    setForm(createEmptyWorkoutLog(getTodayDateString()));
    setMessage("訓練紀錄已儲存。");
    setNotice("");
  };

  const editWorkout = (workout) => {
    setForm(workout);
    setMessage("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteWorkout = (id) => {
    if (window.confirm("確定要刪除這筆訓練紀錄嗎？")) {
      onDeleteWorkoutLog(id);
      if (form.id === id) setForm(createEmptyWorkoutLog(getTodayDateString()));
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">重訓紀錄</h2>
            <p className="mt-1 text-sm text-slate-500">新增動作後會優先帶入同動作的上次訓練內容。</p>
          </div>
          <button className="primary-btn" type="button" onClick={saveWorkout}>儲存訓練紀錄</button>
        </div>
        {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
        {notice && <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{notice}</div>}
        <Input label="日期" type="date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
      </Card>

      <Card>
        <SectionTitle title="常用動作" />
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input label="新增常用動作" value={favoriteInput} onChange={setFavoriteInput} placeholder="輸入常練的動作" />
          <div className="flex items-end"><button className="primary-btn w-full" type="button" onClick={addFavorite}>新增常用動作</button></div>
        </div>
        {favoriteExercises.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {favoriteExercises.map((exercise) => (
              <span key={exercise} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                {exercise}
                <button className="font-semibold text-rose-600" type="button" onClick={() => removeFavorite(exercise)}>刪除常用動作</button>
              </span>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-slate-500">尚未建立常用動作，可先新增自己常練的動作。</p>}
      </Card>

      <Card>
        <SectionTitle title="新增動作" helper="可選擇常用動作，或直接輸入自訂動作名稱。" />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <Select label="選擇常用動作" value={selectedFavorite} onChange={setSelectedFavorite} options={favoriteExercises} placeholder="選擇常用動作" />
          <Input label="自訂動作名稱" value={customExerciseName} onChange={setCustomExerciseName} placeholder="輸入自訂動作名稱" />
          <div className="flex items-end"><button className="primary-btn w-full" type="button" onClick={addSelectedExercise}>新增動作</button></div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="本次訓練內容" helper={`目前 ${form.exercises.length} 個動作，${countWorkoutSets(form)} 組`} />
        {form.exercises.length ? (
          <div className="space-y-4">
            {form.exercises.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <Input label={`動作名稱 ${exerciseIndex + 1}`} value={exercise.name} onChange={(value) => updateExerciseName(exercise.id, value)} placeholder="輸入動作名稱" />
                  <div className="flex gap-2">
                    <button className="secondary-btn" type="button" onClick={() => addSet(exercise.id)}>新增一組</button>
                    <button className="danger-btn" type="button" onClick={() => deleteExercise(exercise.id)}>刪除動作</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {exercise.sets.length ? exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid gap-3 rounded-lg bg-white p-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                      <div><label className="label">組別類型</label><select className="field" value={set.setType} onChange={(event) => updateSet(exercise.id, set.id, "setType", event.target.value)}>{setTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
                      <Input label="重量 kg" type="number" value={set.weightKg} onChange={(value) => updateSet(exercise.id, set.id, "weightKg", value)} placeholder="重量" />
                      <Input label="次數" type="number" value={set.reps} onChange={(value) => updateSet(exercise.id, set.id, "reps", value)} placeholder="次數" />
                      <Input label="組間休息秒數" type="number" value={set.restSeconds} onChange={(value) => updateSet(exercise.id, set.id, "restSeconds", value)} placeholder="秒數" />
                      <div className="flex items-end"><button className="danger-btn w-full" type="button" onClick={() => deleteSet(exercise.id, set.id)}>刪除</button></div>
                      <p className="text-sm font-semibold text-slate-500 lg:col-span-5">第 {setIndex + 1} 組</p>
                    </div>
                  )) : <EmptyState message="這個動作尚未加入組別，請新增一組。" />}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState message="尚未新增動作。" />}
      </Card>

      <Card>
        <SectionTitle title="歷史紀錄" />
        {sortedWorkoutLogs.length ? (
          <div className="space-y-3">
            {sortedWorkoutLogs.map((workout) => (
              <div key={workout.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{workout.date || "尚未紀錄"}</p>
                    <p className="mt-2 text-sm text-slate-600">動作數量：{workout.exercises.length}，總組數：{countWorkoutSets(workout)}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{buildWorkoutSummary(workout)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button className="secondary-btn" type="button" onClick={() => editWorkout(workout)}>編輯</button>
                    <button className="danger-btn" type="button" onClick={() => deleteWorkout(workout.id)}>刪除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState message="尚無訓練紀錄。" />}
      </Card>

      <Card>
        <SectionTitle title="動作進步紀錄" />
        {allExerciseNames.length ? (
          <>
            <Select label="選擇動作" value={progressExercise} onChange={setSelectedProgressExercise} options={allExerciseNames} placeholder="選擇動作" />
            <div className="mt-5">
              <h3 className="mb-3 text-lg font-bold text-slate-950">最高重量趨勢</h3>
              {progressChartData.length >= 2 ? (
                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={progressChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis tick={{ fill: "#64748b", fontSize: 12 }} /><Tooltip labelFormatter={(label) => `日期：${label}`} formatter={(value) => [`${value} kg`, "最高重量"]} /><Line type="monotone" dataKey="最高重量" name="最高重量" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
              ) : <EmptyState message="累積更多訓練紀錄後，這裡會顯示進步趨勢。" />}
            </div>
            <div className="mt-5 space-y-3">
              {progressRecords.map((record) => (
                <div key={`${record.date}-${record.totalSets}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{record.date}｜{record.setTexts.length ? record.setTexts.join("、") : "尚未填寫重量與次數"}</p>
                  <p className="mt-2 text-sm text-slate-600">最高重量：{record.highestWeight ? `${record.highestWeight} kg` : "尚未紀錄"}，總次數：{record.totalReps} 次，總組數：{record.totalSets} 組</p>
                </div>
              ))}
            </div>
          </>
        ) : <EmptyState message="累積訓練紀錄後，這裡會顯示動作進步紀錄。" />}
      </Card>
    </div>
  );
}

function SectionTitle({ title, helper }) {
  return <div className="mb-4"><h3 className="text-lg font-bold text-slate-950">{title}</h3>{helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}</div>;
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return <div><label className="label">{label}</label><input className="field" type={type} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}
