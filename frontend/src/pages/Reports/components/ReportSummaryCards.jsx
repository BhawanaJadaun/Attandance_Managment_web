import React from "react";
import { CheckCircle2, ClipboardCheck, Percent, UserX } from "lucide-react";

function Card({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function ReportSummaryCards({ summary }) {
  const safeSummary = {
    conducted: 0,
    present: 0,
    absent: 0,
    percentage: 0,
    ...summary,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        title="Lectures Conducted"
        value={safeSummary.conducted}
        icon={ClipboardCheck}
        description="From lecture records"
      />

      <Card
        title="Present"
        value={safeSummary.present}
        icon={CheckCircle2}
        description="Present records"
      />

      <Card
        title="Absent"
        value={safeSummary.absent}
        icon={UserX}
        description="Absent records"
      />

      <Card
        title="Attendance"
        value={`${safeSummary.percentage}%`}
        icon={Percent}
        description="Selected report scope"
      />
    </div>
  );
}
