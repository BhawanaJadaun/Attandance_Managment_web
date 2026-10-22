import React from "react";
import { Users } from "lucide-react";

const getValue = (value) =>
  value === null || value === undefined ? "" : String(value);

export default function StudentListReport({ students = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <Users size={19} className="text-indigo-600" />

          <div>
            <h2 className="font-semibold text-slate-900">Students</h2>

            <p className="text-xs text-slate-500">
              Students belonging to the selected academic scope.
            </p>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No students found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Registration No.</th>

                <th className="px-5 py-3">Roll No.</th>

                <th className="px-5 py-3">Student</th>

                <th className="px-5 py-3">Course</th>

                <th className="px-5 py-3">Department</th>

                <th className="px-5 py-3">Semester</th>

                <th className="px-5 py-3">Section</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.map((student, index) => (
                <tr
                  key={
                    getValue(student?.registrationNo) ||
                    getValue(student?.rollNo) ||
                    `student-${index}`
                  }
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-indigo-600">
                    {getValue(student?.registrationNo) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(student?.rollNo) || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {getValue(student?.name) || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(student?.course) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(student?.department) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(student?.semester) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(student?.section) || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
