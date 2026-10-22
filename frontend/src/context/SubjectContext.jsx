import { createContext, useContext, useMemo, useReducer } from "react";

const SubjectContext = createContext(null);

const initialSubjects = [
  {
    id: "SUB001",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH001",
    teacherName: "Dr. Sharma",
    status: "Active",
  },
  {
    id: "SUB002",
    subjectCode: "BMC302",
    subjectName: "Artificial Intelligence",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH002",
    teacherName: "Dr. Priya Singh",
    status: "Active",
  },
  {
    id: "SUB003",
    subjectCode: "BMC303",
    subjectName: "Cryptography and Network Security",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH003",
    teacherName: "Dr. Amit Kumar",
    status: "Active",
  },
  {
    id: "SUB004",
    subjectCode: "BMC304",
    subjectName: "Advanced Database Management Systems",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH004",
    teacherName: "Dr. Neha Gupta",
    status: "Active",
  },
  {
    id: "SUB005",
    subjectCode: "BMC305",
    subjectName: "Web Technologies",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH005",
    teacherName: "Dr. Rahul Verma",
    status: "Active",
  },
  {
    id: "SUB006",
    subjectCode: "BMC306",
    subjectName: "Software Engineering",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH006",
    teacherName: "Dr. Anjali Sharma",
    status: "Active",
  },
  {
    id: "SUB007",
    subjectCode: "BMC307",
    subjectName: "Cloud Computing",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH007",
    teacherName: "Dr. Rajesh Singh",
    status: "Active",
  },
  {
    id: "SUB008",
    subjectCode: "BMC308",
    subjectName: "Machine Learning",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH008",
    teacherName: "Dr. Pooja Sharma",
    status: "Active",
  },
  {
    id: "SUB009",
    subjectCode: "BMC309",
    subjectName: "Data Analytics",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH009",
    teacherName: "Dr. Sandeep Kumar",
    status: "Active",
  },
  {
    id: "SUB010",
    subjectCode: "BMC310",
    subjectName: "Python Programming",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH010",
    teacherName: "Dr. Ritu Singh",
    status: "Active",
  },
  {
    id: "SUB011",
    subjectCode: "BMC311",
    subjectName: "Big Data Technologies",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH011",
    teacherName: "Dr. Vivek Sharma",
    status: "Active",
  },
  {
    id: "SUB012",
    subjectCode: "BMC312",
    subjectName: "DevOps and Software Development",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    teacherId: "TCH012",
    teacherName: "Dr. Nisha Verma",
    status: "Active",
  },
];

const subjectReducer = (state, action) => {
  switch (action.type) {
    case "ADD_SUBJECT":
      return [...state, action.payload];

    case "UPDATE_SUBJECT":
      return state.map((subject) =>
        String(subject.id) === String(action.payload.id)
          ? { ...subject, ...action.payload }
          : subject
      );

    case "DELETE_SUBJECT":
      return state.filter(
        (subject) => String(subject.id) !== String(action.payload)
      );

    case "SET_SUBJECTS":
      return action.payload;

    case "CLEAR_SUBJECTS":
      return [];

    default:
      return state;
  }
};

export const SubjectProvider = ({ children }) => {
  const [subjects, dispatch] = useReducer(
    subjectReducer,
    initialSubjects
  );

  const value = useMemo(
    () => ({
      subjects,
      dispatch,
    }),
    [subjects]
  );

  return (
    <SubjectContext.Provider value={value}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjects = () => {
  const context = useContext(SubjectContext);

  if (!context) {
    throw new Error(
      "useSubjects must be used inside SubjectProvider"
    );
  }

  return context;
};

export default SubjectContext;