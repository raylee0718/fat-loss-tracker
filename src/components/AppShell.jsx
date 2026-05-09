import { Activity, BarChart3, CalendarDays, Dumbbell, Ruler, Settings } from "lucide-react";

const tabs = [
  { key: "dashboard", label: "首頁", icon: BarChart3 },
  { key: "dailyLog", label: "每日紀錄", icon: CalendarDays },
  { key: "weightTrend", label: "體重趨勢", icon: Activity },
  { key: "exerciseLog", label: "重訓紀錄", icon: Dumbbell },
  { key: "bodyMeasurement", label: "體態紀錄", icon: Ruler },
  { key: "settings", label: "設定", icon: Settings }
];

export function AppShell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5">
          <p className="text-sm font-semibold text-teal-700">本機個人紀錄</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">減脂追蹤器</h1>
        </header>

        <nav className="mb-5 flex gap-2 overflow-x-auto rounded-lg border border-white/80 bg-white/70 p-2 shadow-soft backdrop-blur">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
