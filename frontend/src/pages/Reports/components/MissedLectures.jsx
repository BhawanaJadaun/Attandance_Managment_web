import React, { useMemo } from "react";
import { UserX } from "lucide-react";

const getValue = (value) =>
  value === null || value === undefined ? "" : String(value);

const same = (a, b) =>
  getValue(a).toLowerCase() === getValue(b).toLowerCase();

export default function MissedLectures({
  attendance = [],
  students = [],
  subjects = [],
  professors = [],
}) {
  const absentRecords = useMemo(() => {
    return attendance
      .filter((record) => record?.present === false)
      .map((record) => {
        const registrationNumber =
          record?.registrationNumber ||
          record?.registrationNo ||
          record?.registration_number ||
          "";

        const student = students.find((item) =>
          same(
            item?.registrationNumber ||
              item?.registrationNo ||
              item?.registration_number,
            registrationNumber
          )
        );

        const subject = subjects.find((item) =>
          same(
            item?.subjectCode ||
              item?.subject_code ||
              item?.code,
            record?.subjectCode
          )
        );

        const professor = professors.find((item) =>
          same(
            item?.id ||
              item?.professorId ||
              item?.professorID,
            record?.professorId
          )
        );

        return {
          ...record,

          registrationNo:
            registrationNumber ||
            student?.registrationNumber ||
            "",

          studentName:
            record?.studentName ||
            student?.name ||
            "",

          rollNo:
            record?.rollNo ||
            student?.rollNo ||
            "",

          subjectName:
            record?.subjectName ||
            subject?.subjectName ||
            "",

          professorName:
            record?.professorName ||
            professor?.name ||
            "",

          professorId:
            record?.professorId ||
            professor?.id ||
            professor?.professorId ||
            "",
        };
      });
  }, [attendance, students, subjects, professors]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <UserX size={19} className="text-red-500" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Absent / Missed Lectures
            </h2>

            <p className="text-xs text-slate-500">
              Students marked absent in selected records.
            </p>
          </div>
        </div>
      </div>

      {absentRecords.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No absent records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Registration No.</th>
                <th className="px-5 py-3">Roll No.</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Professor</th>
                <th className="px-5 py-3">Lecture Code</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {absentRecords.map((record, index) => (
                <tr
                  key={
                    record?.id ||
                    `${record?.lectureCode}-${record?.registrationNo}-${index}`
                  }
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(record?.date) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    {getValue(record?.studentName) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-indigo-600">
                    {getValue(record?.registrationNo) || "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getValue(record?.rollNo) || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {getValue(record?.subjectCode) || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {getValue(record?.subjectName) || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {getValue(
                        record?.professorName ||
                          record?.professor
                      ) || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      ID:{" "}
                      {getValue(record?.professorId) || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-indigo-600">
                    {getValue(record?.lectureCode) || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      Absent
                    </span>
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