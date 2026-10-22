import React, { useMemo } from "react";
import { ClipboardCheck } from "lucide-react";

const getValue = (value) =>
  value === null || value === undefined ? "" : String(value);

const same = (a, b) =>
  getValue(a).toLowerCase() === getValue(b).toLowerCase();

export default function LectureWiseReport({
  lectures = [],
  attendance = [],
  students = [],
}) {
  const rows = useMemo(() => {
    return lectures.map((lecture) => {
      const lectureCode = lecture?.lectureCode || "";

      const records = attendance.filter((record) =>
        same(record?.lectureCode, lectureCode)
      );

      const present = records.filter(
        (record) => record?.present === true
      ).length;

      const absent = records.filter(
        (record) => record?.present === false
      ).length;

      /*
       * Use the actual number of attendance records for this lecture.
       * This prevents a lecture with only 3 attendance records from
       * incorrectly being calculated against all students.
       */
      const totalRecords = present + absent;

      const percentage =
        totalRecords > 0
          ? Number(((present / totalRecords) * 100).toFixed(2))
          : 0;

      return {
        lecture,
        present,
        absent,
        percentage,
      };
    });
  }, [lectures, attendance, students]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={19} className="text-indigo-600" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Lecture-wise Report
            </h2>

            <p className="text-xs text-slate-500">
              Attendance for each conducted lecture.
            </p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No lecture records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Lecture Code</th>

                <th className="px-5 py-3">Date</th>

                <th className="px-5 py-3">Subject</th>

                <th className="px-5 py-3">Professor</th>

                <th className="px-5 py-3">Present</th>

                <th className="px-5 py-3">Absent</th>

                <th className="px-5 py-3">%</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map(
                ({
                  lecture,
                  present,
                  absent,
                  percentage,
                }) => (
                  <tr
                    key={lecture?.lectureCode}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-indigo-600">
                      {getValue(lecture?.lectureCode)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {getValue(lecture?.date) || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {getValue(lecture?.subjectCode)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {getValue(lecture?.subjectName)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {getValue(
                          lecture?.professorName ||
                            lecture?.professor
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID:{" "}
                        {getValue(lecture?.professorId) || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-emerald-600">
                      {present}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-red-600">
                      {absent}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-slate-800">
                      {percentage}%
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}