import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

const AttendanceContext = createContext(null);

/* =========================================================
   Initial State
   ========================================================= */

const getInitialAttendance = () => {
  try {
    const savedAttendance = localStorage.getItem(
      "attendanceRecords"
    );

    return savedAttendance
      ? JSON.parse(savedAttendance)
      : [];
  } catch (error) {
    console.error(
      "Failed to load attendance records:",
      error
    );

    return [];
  }
};

/* =========================================================
   Reducer
   ========================================================= */

const attendanceReducer = (state, action) => {
  switch (action.type) {
    /* ---------------------------------------------
       ADD ATTENDANCE
       --------------------------------------------- */
    case "ADD_ATTENDANCE": {
      const newRecords = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const updatedState = [...state];

      newRecords.forEach((newRecord) => {
        const duplicateIndex = updatedState.findIndex(
          (record) =>
            String(record.lectureCode) ===
              String(newRecord.lectureCode) &&
            String(record.registrationNo) ===
              String(newRecord.registrationNo)
        );

        if (duplicateIndex !== -1) {
          // Update existing attendance
          updatedState[duplicateIndex] = {
            ...updatedState[duplicateIndex],
            ...newRecord,
          };
        } else {
          // Add new attendance
          updatedState.push({
            ...newRecord,
            id:
              newRecord.id ||
              `${newRecord.lectureCode}-${newRecord.registrationNo}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 7)}`,
          });
        }
      });

      return updatedState;
    }

    /* ---------------------------------------------
       UPDATE ATTENDANCE
       --------------------------------------------- */
    case "UPDATE_ATTENDANCE":
      return state.map((record) =>
        String(record.id) === String(action.payload.id)
          ? {
              ...record,
              ...action.payload,
            }
          : record
      );

    /* ---------------------------------------------
       DELETE ATTENDANCE
       --------------------------------------------- */
    case "DELETE_ATTENDANCE":
      return state.filter(
        (record) =>
          String(record.id) !==
          String(action.payload)
      );

    /* ---------------------------------------------
       DELETE LECTURE ATTENDANCE
       --------------------------------------------- */
    case "DELETE_LECTURE_ATTENDANCE":
      return state.filter(
        (record) =>
          !(
            String(record.lectureCode) ===
              String(action.payload.lectureCode) &&
            String(record.date) ===
              String(action.payload.date)
          )
      );

    /* ---------------------------------------------
       CLEAR ALL ATTENDANCE
       --------------------------------------------- */
    case "CLEAR_ATTENDANCE":
      return [];

    default:
      return state;
  }
};

/* =========================================================
   Provider
   ========================================================= */

export const AttendanceProvider = ({ children }) => {
  const [attendance, dispatch] = useReducer(
    attendanceReducer,
    [],
    getInitialAttendance
  );

  /* ---------------------------------------------
     Save to localStorage
     --------------------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(attendance)
    );
  }, [attendance]);

  /* =========================================================
     ADD / SAVE ATTENDANCE
     ========================================================= */

  const addAttendance = (records) => {
    const recordList = Array.isArray(records)
      ? records
      : [records];

    dispatch({
      type: "ADD_ATTENDANCE",
      payload: recordList,
    });

    return {
      success: true,
      message: "Attendance saved successfully.",
    };
  };

  /* =========================================================
     UPDATE ATTENDANCE
     ========================================================= */

  const updateAttendance = (record) => {
    dispatch({
      type: "UPDATE_ATTENDANCE",
      payload: record,
    });
  };

  /* =========================================================
     DELETE ONE RECORD
     ========================================================= */

  const deleteAttendance = (id) => {
    dispatch({
      type: "DELETE_ATTENDANCE",
      payload: id,
    });
  };

  /* =========================================================
     DELETE COMPLETE LECTURE ATTENDANCE
     ========================================================= */

  const deleteLectureAttendance = (
    lectureCode,
    date
  ) => {
    dispatch({
      type: "DELETE_LECTURE_ATTENDANCE",
      payload: {
        lectureCode,
        date,
      },
    });
  };

  /* =========================================================
     CHECK DUPLICATE
     ========================================================= */

  const isAttendanceExists = (
    lectureCode,
    registrationNo
  ) => {
    return attendance.some(
      (record) =>
        String(record.lectureCode) ===
          String(lectureCode) &&
        String(record.registrationNo) ===
          String(registrationNo)
    );
  };

  /* =========================================================
     GET ATTENDANCE BY LECTURE
     ========================================================= */

  const getLectureAttendance = (
    lectureCode,
    date = null
  ) => {
    return attendance.filter((record) => {
      const lectureMatch =
        String(record.lectureCode) ===
        String(lectureCode);

      if (!date) {
        return lectureMatch;
      }

      return (
        lectureMatch &&
        String(record.date) === String(date)
      );
    });
  };

  /* =========================================================
     GET STUDENT ATTENDANCE
     ========================================================= */

  const getStudentAttendance = (
    registrationNo
  ) => {
    return attendance.filter(
      (record) =>
        String(record.registrationNo) ===
        String(registrationNo)
    );
  };

  /* =========================================================
     GET SUBJECT ATTENDANCE
     ========================================================= */

  const getSubjectAttendance = (
    subjectCode
  ) => {
    return attendance.filter(
      (record) =>
        String(record.subjectCode) ===
        String(subjectCode)
    );
  };

  /* =========================================================
     GET PROFESSOR ATTENDANCE
     ========================================================= */

  const getProfessorAttendance = (
    professorId
  ) => {
    return attendance.filter(
      (record) =>
        String(record.professorId) ===
        String(professorId)
    );
  };

  /* =========================================================
     GET ATTENDANCE BY DATE
     ========================================================= */

  const getAttendanceByDate = (date) => {
    return attendance.filter(
      (record) =>
        String(record.date) === String(date)
    );
  };

  /* =========================================================
     GET PRESENT RECORDS
     ========================================================= */

  const getPresentRecords = () => {
    return attendance.filter(
      (record) => record.present === true
    );
  };

  /* =========================================================
     GET ABSENT RECORDS
     ========================================================= */

  const getAbsentRecords = () => {
    return attendance.filter(
      (record) => record.present === false
    );
  };

  /* =========================================================
     GET PRESENT COUNT
     ========================================================= */

  const getPresentCount = (
    records = attendance
  ) => {
    return records.filter(
      (record) => record.present === true
    ).length;
  };

  /* =========================================================
     GET ABSENT COUNT
     ========================================================= */

  const getAbsentCount = (
    records = attendance
  ) => {
    return records.filter(
      (record) => record.present === false
    ).length;
  };

  /* =========================================================
     GET ATTENDANCE PERCENTAGE
     ========================================================= */

  const getAttendancePercentage = (
    records = attendance
  ) => {
    if (!records.length) {
      return 0;
    }

    const presentCount = getPresentCount(records);

    return Math.round(
      (presentCount / records.length) * 100
    );
  };

  /* =========================================================
     GET LECTURE HISTORY
     ========================================================= */

  const getLectureHistory = () => {
    const lectureMap = new Map();

    attendance.forEach((record) => {
      const key = `${record.lectureCode}-${record.date}`;

      if (!lectureMap.has(key)) {
        lectureMap.set(key, {
          lectureCode: record.lectureCode,
          date: record.date,
          day: record.day || "",
          startTime: record.startTime || "",
          endTime: record.endTime || "",

          subjectCode:
            record.subjectCode || "",

          subjectName:
            record.subjectName || "",

          professorId:
            record.professorId || "",

          professorName:
            record.professorName || "",

          course: record.course || "",
          department: record.department || "",
          semester: record.semester || "",

          records: [],
        });
      }

      lectureMap
        .get(key)
        .records.push(record);
    });

    return Array.from(lectureMap.values()).map(
      (lecture) => {
        const total = lecture.records.length;

        const present = lecture.records.filter(
          (record) => record.present === true
        ).length;

        const absent = lecture.records.filter(
          (record) => record.present === false
        ).length;

        return {
          ...lecture,
          totalStudents: total,
          presentCount: present,
          absentCount: absent,
          attendancePercentage:
            total > 0
              ? Math.round(
                  (present / total) * 100
                )
              : 0,
        };
      }
    );
  };

  /* =========================================================
     GET STUDENT ATTENDANCE SUMMARY
     ========================================================= */

  const getStudentAttendanceSummary = (
    registrationNo
  ) => {
    const records =
      getStudentAttendance(registrationNo);

    const total = records.length;

    const present = records.filter(
      (record) => record.present === true
    ).length;

    const absent = records.filter(
      (record) => record.present === false
    ).length;

    return {
      total,
      present,
      absent,
      percentage:
        total > 0
          ? Math.round((present / total) * 100)
          : 0,
    };
  };

  /* =========================================================
     CONTEXT VALUE
     ========================================================= */

  const value = {
    /* Data */
    attendance,

    /* Reducer */
    dispatch,

    /* CRUD */
    addAttendance,
    updateAttendance,
    deleteAttendance,
    deleteLectureAttendance,

    /* Checks */
    isAttendanceExists,

    /* Filters */
    getLectureAttendance,
    getStudentAttendance,
    getSubjectAttendance,
    getProfessorAttendance,
    getAttendanceByDate,

    /* Status */
    getPresentRecords,
    getAbsentRecords,

    /* Counts */
    getPresentCount,
    getAbsentCount,
    getAttendancePercentage,

    /* History */
    getLectureHistory,

    /* Student summary */
    getStudentAttendanceSummary,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

/* =========================================================
   Hook
   ========================================================= */

export const useAttendance = () => {
  const context = useContext(AttendanceContext);

  if (!context) {
    throw new Error(
      "useAttendance must be used inside AttendanceProvider"
    );
  }

  return context;
};

export default AttendanceContext;