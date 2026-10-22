import React, { useMemo } from "react";
import { BookOpen, CheckCircle2, XCircle, Percent } from "lucide-react";

const getValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getSubjectCode = (item) =>
  getValue(item?.subjectCode || item?.subject_code || item?.code);

const getSubjectName = (item) =>
  getValue(
    item?.subjectName || item?.subject || item?.name || "Unknown Subject",
  );

const getProfessorId = (item) =>
  getValue(
    item?.professorId ||
      item?.professorID ||
      item?.teacherId ||
      item?.teacherID ||
      item?.facultyId,
  );

const getProfessorName = (item) =>
  getValue(
    item?.professorName ||
      item?.professor ||
      item?.teacherName ||
      item?.name ||
      "Not Assigned",
  );

const SubjectWiseReport = ({
  lectures = [],
  attendance = [],
  students = [],
}) => {
  const subjectReport = useMemo(() => {
    const subjectMap = new Map();

    /*
     * ============================================================
     * CREATE SUBJECTS FROM LECTURE DATA
     * ============================================================
     *
     * This makes "Lectures Conducted" independent
     * from attendance submission.
     */
    lectures.forEach((lecture) => {
      const subjectCode = getSubjectCode(lecture);

      if (!subjectCode) {
        return;
      }

      if (!subjectMap.has(subjectCode)) {
        subjectMap.set(subjectCode, {
          subjectCode,
          subjectName: getSubjectName(lecture),
          professorId: getProfessorId(lecture),
          professorName: getProfessorName(lecture),
          lectureCodes: new Set(),
          conducted: 0,
          present: 0,
          absent: 0,
          notSubmitted: 0,
        });
      }

      const subject = subjectMap.get(subjectCode);

      const lectureCode = getValue(
        lecture?.lectureCode || lecture?.lecture_code,
      );

      if (lectureCode && !subject.lectureCodes.has(lectureCode)) {
        subject.lectureCodes.add(lectureCode);
        subject.conducted += 1;
      }

      /*
       * If professor information was initially missing,
       * use the information available from another lecture.
       */
      const professorId = getProfessorId(lecture);
      const professorName = getProfessorName(lecture);

      if (professorId && !subject.professorId) {
        subject.professorId = professorId;
      }

      if (professorName && professorName !== "Not Assigned") {
        subject.professorName = professorName;
      }

      /*
       * Update subject name if the first lecture did not
       * contain a proper subject name.
       */
      const subjectName = getSubjectName(lecture);

      if (subjectName && subject.subjectName === "Unknown Subject") {
        subject.subjectName = subjectName;
      }
    });

    /*
     * ============================================================
     * ADD ATTENDANCE INFORMATION
     * ============================================================
     */
    attendance.forEach((record) => {
      const subjectCode = getSubjectCode(record);

      if (!subjectCode) {
        return;
      }

      /*
       * If attendance contains a subject which does not exist
       * in lecture records, create it here.
       */
      if (!subjectMap.has(subjectCode)) {
        subjectMap.set(subjectCode, {
          subjectCode,
          subjectName: getSubjectName(record),
          professorId: getProfessorId(record),
          professorName: getProfessorName(record),
          lectureCodes: new Set(),
          conducted: 0,
          present: 0,
          absent: 0,
          notSubmitted: 0,
        });
      }

      const subject = subjectMap.get(subjectCode);

      /*
       * Count present and absent attendance records.
       */
      if (record?.present === true) {
        subject.present += 1;
      }

      if (record?.present === false) {
        subject.absent += 1;
      }

      /*
       * If a lecture exists in attendance but was not already
       * present in LectureContext, add it.
       */
      const lectureCode = getValue(record?.lectureCode || record?.lecture_code);

      if (lectureCode && !subject.lectureCodes.has(lectureCode)) {
        subject.lectureCodes.add(lectureCode);
        subject.conducted += 1;
      }

      /*
       * Fill missing professor information from attendance.
       */
      const professorId = getProfessorId(record);
      const professorName = getProfessorName(record);

      if (professorId && !subject.professorId) {
        subject.professorId = professorId;
      }

      if (professorName && professorName !== "Not Assigned") {
        subject.professorName = professorName;
      }

      /*
       * Fill missing subject name.
       */
      const subjectName = getSubjectName(record);

      if (subjectName && subject.subjectName === "Unknown Subject") {
        subject.subjectName = subjectName;
      }
    });

    /*
     * ============================================================
     * CALCULATE ATTENDANCE PERCENTAGE
     * ============================================================
     *
     * Possible attendance =
     * Conducted Lectures × Total Students
     *
     * This prevents the percentage from being calculated as:
     * Present / Lectures
     */
    return Array.from(subjectMap.values())
      .map((subject) => {
        const possibleAttendance =
          subject.conducted * Math.max(students.length, 1);

        const percentage =
          possibleAttendance > 0
            ? ((subject.present / possibleAttendance) * 100).toFixed(2)
            : "0.00";

        /*
         * When attendance records are incomplete,
         * calculate absent records from the possible
         * attendance count.
         */
        const calculatedAbsent = Math.max(
          possibleAttendance - subject.present,
          0,
        );

        return {
          ...subject,

          absent: subject.absent > 0 ? subject.absent : calculatedAbsent,

          percentage: Number(percentage),
        };
      })
      .sort((a, b) =>
        String(a.subjectCode).localeCompare(String(b.subjectCode)),
      );
  }, [lectures, attendance, students]);

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */
  if (subjectReport.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-400" />

        <h3 className="text-base font-semibold text-slate-800">
          No Subject Report Available
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Create lectures and attendance records to generate the subject-wise
          report.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ========================================================
          HEADER
      ======================================================== */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />

            <h2 className="text-lg font-semibold text-slate-800">
              Subject-wise Report
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Attendance performance grouped by subject.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
          {subjectReport.length} Subject
          {subjectReport.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ========================================================
          DESKTOP TABLE
      ======================================================== */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Subject</th>

              <th className="px-5 py-3 font-semibold">Professor</th>

              <th className="px-5 py-3 text-center font-semibold">Conducted</th>

              <th className="px-5 py-3 text-center font-semibold">Present</th>

              <th className="px-5 py-3 text-center font-semibold">Absent</th>

              <th className="px-5 py-3 text-center font-semibold">
                Attendance %
              </th>

              <th className="px-5 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {subjectReport.map((subject) => {
              const eligible = subject.percentage >= 75;

              return (
                <tr
                  key={subject.subjectCode}
                  className="transition hover:bg-slate-50"
                >
                  {/* Subject */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">
                      {subject.subjectName || "Unknown Subject"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {subject.subjectCode}
                    </div>
                  </td>

                  {/* Professor */}
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-slate-700">
                      {subject.professorName || "Not Assigned"}
                    </div>

                    {subject.professorId && (
                      <div className="mt-1 text-xs text-slate-500">
                        ID: {subject.professorId}
                      </div>
                    )}
                  </td>

                  {/* Conducted */}
                  <td className="px-5 py-4 text-center font-medium text-slate-700">
                    {subject.conducted}
                  </td>

                  {/* Present */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />

                      {subject.present}
                    </span>
                  </td>

                  {/* Absent */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
                      <XCircle className="h-4 w-4" />

                      {subject.absent}
                    </span>
                  </td>

                  {/* Percentage */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700">
                      <Percent className="h-4 w-4" />
                      {subject.percentage}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        eligible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {eligible ? "Eligible" : "Short Attendance"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MOBILE CARDS
      ======================================================== */}
      <div className="space-y-3 p-4 md:hidden">
        {subjectReport.map((subject) => {
          const eligible = subject.percentage >= 75;

          return (
            <div
              key={subject.subjectCode}
              className="rounded-xl border border-slate-200 p-4"
            >
              {/* Subject Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {subject.subjectName || "Unknown Subject"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {subject.subjectCode}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    eligible
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {eligible ? "Eligible" : "Short"}
                </span>
              </div>

              {/* Professor */}
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Professor:</span>{" "}
                {subject.professorName || "Not Assigned"}
                {subject.professorId && (
                  <span className="ml-1 text-xs text-slate-400">
                    ({subject.professorId})
                  </span>
                )}
              </div>

              {/* Statistics */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {/* Conducted */}
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Conducted</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {subject.conducted}
                  </p>
                </div>

                {/* Attendance */}
                <div className="rounded-lg bg-indigo-50 p-3">
                  <p className="text-xs text-slate-500">Attendance</p>

                  <p className="mt-1 font-semibold text-indigo-700">
                    {subject.percentage}%
                  </p>
                </div>

                {/* Present */}
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-slate-500">Present</p>

                  <p className="mt-1 font-semibold text-emerald-700">
                    {subject.present}
                  </p>
                </div>

                {/* Absent */}
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-slate-500">Absent</p>

                  <p className="mt-1 font-semibold text-red-700">
                    {subject.absent}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SubjectWiseReport;
