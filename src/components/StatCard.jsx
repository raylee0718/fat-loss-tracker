import { Card } from "./Card";

export function StatCard({ title, value, helper }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </Card>
  );
}
