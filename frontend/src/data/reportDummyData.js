// ============================================================
// REPORT DUMMY DATA
// ============================================================

export const COURSE_OPTIONS = [
  "B.Tech",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
  "B.Com",
];

// ============================================================
// DEPARTMENTS BY COURSE
// ============================================================

export const DEPARTMENT_OPTIONS = {
  "B.Tech": [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],

  BCA: [
    "Computer Applications",
  ],

  MCA: [
    "Computer Applications",
  ],

  BBA: [
    "Management",
  ],

  MBA: [
    "Management",
  ],

  "B.Com": [
    "Commerce",
  ],
};

// ============================================================
// SEMESTERS BY COURSE
// ============================================================

export const SEMESTER_OPTIONS = {
  "B.Tech": ["1", "2", "3", "4", "5", "6"],
  BCA: ["1", "2", "3", "4", "5", "6"],
  MCA: ["1", "2", "3", "4"],
  BBA: ["1", "2", "3", "4", "5", "6"],
  MBA: ["1", "2", "3", "4"],
  "B.Com": ["1", "2", "3", "4", "5", "6"],
};

// ============================================================
// SUBJECT DATA
// ============================================================

export const DUMMY_SUBJECTS = [
  // ==========================================================
  // B.TECH - CSE
  // ==========================================================

  {
    id: "BTCS101",
    subjectCode: "BTCS101",
    subjectName: "Programming Fundamentals",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "1",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
  },

  {
    id: "BTCS102",
    subjectCode: "BTCS102",
    subjectName: "Engineering Mathematics-I",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "1",
    professorId: "P002",
    professorName: "Dr. Neha Gupta",
  },

  {
    id: "BTCS201",
    subjectCode: "BTCS201",
    subjectName: "Data Structures",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "2",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
  },

  {
    id: "BTCS202",
    subjectCode: "BTCS202",
    subjectName: "Digital Logic Design",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "2",
    professorId: "P003",
    professorName: "Dr. Amit Verma",
  },

  {
    id: "BTCS301",
    subjectCode: "BTCS301",
    subjectName: "Database Management System",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    professorId: "P004",
    professorName: "Dr. Priya Singh",
  },

  {
    id: "BTCS302",
    subjectCode: "BTCS302",
    subjectName: "Computer Networks",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
  },

  {
    id: "BTCS401",
    subjectCode: "BTCS401",
    subjectName: "Operating Systems",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "4",
    professorId: "P005",
    professorName: "Dr. Anjali Mehta",
  },

  {
    id: "BTCS402",
    subjectCode: "BTCS402",
    subjectName: "Software Engineering",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "4",
    professorId: "P004",
    professorName: "Dr. Priya Singh",
  },

  {
    id: "BTCS501",
    subjectCode: "BTCS501",
    subjectName: "Artificial Intelligence",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "5",
    professorId: "P006",
    professorName: "Dr. Vikash Kumar",
  },

  {
    id: "BTCS502",
    subjectCode: "BTCS502",
    subjectName: "Web Technologies",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "5",
    professorId: "P007",
    professorName: "Dr. Sneha Kapoor",
  },

  {
    id: "BTCS601",
    subjectCode: "BTCS601",
    subjectName: "Machine Learning",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "6",
    professorId: "P006",
    professorName: "Dr. Vikash Kumar",
  },

  {
    id: "BTCS602",
    subjectCode: "BTCS602",
    subjectName: "Cloud Computing",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "6",
    professorId: "P008",
    professorName: "Dr. Arjun Singh",
  },

  // ==========================================================
  // B.TECH - ECE
  // ==========================================================

  {
    id: "BTEC101",
    subjectCode: "BTEC101",
    subjectName: "Basic Electronics",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "1",
    professorId: "P009",
    professorName: "Dr. Mohit Sharma",
  },

  {
    id: "BTEC201",
    subjectCode: "BTEC201",
    subjectName: "Electronic Devices",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "2",
    professorId: "P009",
    professorName: "Dr. Mohit Sharma",
  },

  {
    id: "BTEC301",
    subjectCode: "BTEC301",
    subjectName: "Digital Electronics",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "3",
    professorId: "P010",
    professorName: "Dr. Ritu Singh",
  },

  {
    id: "BTEC401",
    subjectCode: "BTEC401",
    subjectName: "Microprocessors",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "4",
    professorId: "P010",
    professorName: "Dr. Ritu Singh",
  },

  {
    id: "BTEC501",
    subjectCode: "BTEC501",
    subjectName: "Communication Systems",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "5",
    professorId: "P011",
    professorName: "Dr. Kavita Joshi",
  },

  {
    id: "BTEC601",
    subjectCode: "BTEC601",
    subjectName: "Wireless Communication",
    course: "B.Tech",
    department: "Electronics & Communication",
    semester: "6",
    professorId: "P011",
    professorName: "Dr. Kavita Joshi",
  },

  // ==========================================================
  // BCA
  // ==========================================================

  {
    id: "BCA101",
    subjectCode: "BCA101",
    subjectName: "Computer Fundamentals",
    course: "BCA",
    department: "Computer Applications",
    semester: "1",
    professorId: "P012",
    professorName: "Dr. Manish Gupta",
  },

  {
    id: "BCA102",
    subjectCode: "BCA102",
    subjectName: "Programming in C",
    course: "BCA",
    department: "Computer Applications",
    semester: "1",
    professorId: "P013",
    professorName: "Dr. Pooja Sharma",
  },

  {
    id: "BCA201",
    subjectCode: "BCA201",
    subjectName: "Data Structures",
    course: "BCA",
    department: "Computer Applications",
    semester: "2",
    professorId: "P013",
    professorName: "Dr. Pooja Sharma",
  },

  {
    id: "BCA202",
    subjectCode: "BCA202",
    subjectName: "Object Oriented Programming",
    course: "BCA",
    department: "Computer Applications",
    semester: "2",
    professorId: "P014",
    professorName: "Dr. Rohit Verma",
  },

  {
    id: "BCA301",
    subjectCode: "BCA301",
    subjectName: "Database Management System",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P012",
    professorName: "Dr. Manish Gupta",
  },

  {
    id: "BCA302",
    subjectCode: "BCA302",
    subjectName: "Computer Networks",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P015",
    professorName: "Dr. Neeraj Singh",
  },

  {
    id: "BCA401",
    subjectCode: "BCA401",
    subjectName: "Web Development",
    course: "BCA",
    department: "Computer Applications",
    semester: "4",
    professorId: "P016",
    professorName: "Dr. Simran Kaur",
  },

  {
    id: "BCA402",
    subjectCode: "BCA402",
    subjectName: "Software Engineering",
    course: "BCA",
    department: "Computer Applications",
    semester: "4",
    professorId: "P014",
    professorName: "Dr. Rohit Verma",
  },

  {
    id: "BCA501",
    subjectCode: "BCA501",
    subjectName: "Artificial Intelligence",
    course: "BCA",
    department: "Computer Applications",
    semester: "5",
    professorId: "P017",
    professorName: "Dr. Aakash Jain",
  },

  {
    id: "BCA502",
    subjectCode: "BCA502",
    subjectName: "Python Programming",
    course: "BCA",
    department: "Computer Applications",
    semester: "5",
    professorId: "P013",
    professorName: "Dr. Pooja Sharma",
  },

  {
    id: "BCA601",
    subjectCode: "BCA601",
    subjectName: "Cloud Computing",
    course: "BCA",
    department: "Computer Applications",
    semester: "6",
    professorId: "P018",
    professorName: "Dr. Nitin Kapoor",
  },

  {
    id: "BCA602",
    subjectCode: "BCA602",
    subjectName: "Project Management",
    course: "BCA",
    department: "Computer Applications",
    semester: "6",
    professorId: "P014",
    professorName: "Dr. Rohit Verma",
  },

  // ==========================================================
  // MCA - 1
  // ==========================================================

  {
    id: "BMC101",
    subjectCode: "BMC101",
    subjectName: "Advanced Programming",
    course: "MCA",
    department: "Computer Applications",
    semester: "1",
    professorId: "P019",
    professorName: "Dr. Suresh Kumar",
  },

  {
    id: "BMC102",
    subjectCode: "BMC102",
    subjectName: "Computer Organization",
    course: "MCA",
    department: "Computer Applications",
    semester: "1",
    professorId: "P020",
    professorName: "Dr. Anjali Sharma",
  },

  {
    id: "BMC103",
    subjectCode: "BMC103",
    subjectName: "Discrete Mathematics",
    course: "MCA",
    department: "Computer Applications",
    semester: "1",
    professorId: "P021",
    professorName: "Dr. Ravi Gupta",
  },

  // ==========================================================
  // MCA - 2
  // ==========================================================

  {
    id: "BMC201",
    subjectCode: "BMC201",
    subjectName: "Data Structures & Algorithms",
    course: "MCA",
    department: "Computer Applications",
    semester: "2",
    professorId: "P019",
    professorName: "Dr. Suresh Kumar",
  },

  {
    id: "BMC202",
    subjectCode: "BMC202",
    subjectName: "Operating Systems",
    course: "MCA",
    department: "Computer Applications",
    semester: "2",
    professorId: "P022",
    professorName: "Dr. Priyanka Singh",
  },

  {
    id: "BMC203",
    subjectCode: "BMC203",
    subjectName: "Database Management System",
    course: "MCA",
    department: "Computer Applications",
    semester: "2",
    professorId: "P023",
    professorName: "Dr. Karan Mehta",
  },

  // ==========================================================
  // MCA - 3
  // ==========================================================

  {
    id: "BMC301",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
  },

  {
    id: "BMC302",
    subjectCode: "BMC302",
    subjectName: "Cryptography & Network Security",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P024",
    professorName: "Dr. Deepak Verma",
  },

  {
    id: "BMC303",
    subjectCode: "BMC303",
    subjectName: "Artificial Intelligence",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P025",
    professorName: "Dr. Shalini Gupta",
  },

  {
    id: "BMC304",
    subjectCode: "BMC304",
    subjectName: "Web Technologies",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    professorId: "P026",
    professorName: "Dr. Nisha Kapoor",
  },

  // ==========================================================
  // MCA - 4
  // ==========================================================

  {
    id: "BMC401",
    subjectCode: "BMC401",
    subjectName: "Machine Learning",
    course: "MCA",
    department: "Computer Applications",
    semester: "4",
    professorId: "P025",
    professorName: "Dr. Shalini Gupta",
  },

  {
    id: "BMC402",
    subjectCode: "BMC402",
    subjectName: "Cloud Computing",
    course: "MCA",
    department: "Computer Applications",
    semester: "4",
    professorId: "P027",
    professorName: "Dr. Arvind Kumar",
  },

  {
    id: "BMC403",
    subjectCode: "BMC403",
    subjectName: "Project Management",
    course: "MCA",
    department: "Computer Applications",
    semester: "4",
    professorId: "P028",
    professorName: "Dr. Meena Joshi",
  },

  // ==========================================================
  // BBA
  // ==========================================================

  {
    id: "BBA101",
    subjectCode: "BBA101",
    subjectName: "Principles of Management",
    course: "BBA",
    department: "Management",
    semester: "1",
    professorId: "P029",
    professorName: "Dr. Rakesh Sharma",
  },

  {
    id: "BBA102",
    subjectCode: "BBA102",
    subjectName: "Business Economics",
    course: "BBA",
    department: "Management",
    semester: "1",
    professorId: "P030",
    professorName: "Dr. Neha Agarwal",
  },

  {
    id: "BBA201",
    subjectCode: "BBA201",
    subjectName: "Marketing Management",
    course: "BBA",
    department: "Management",
    semester: "2",
    professorId: "P031",
    professorName: "Dr. Amit Gupta",
  },

  {
    id: "BBA301",
    subjectCode: "BBA301",
    subjectName: "Human Resource Management",
    course: "BBA",
    department: "Management",
    semester: "3",
    professorId: "P029",
    professorName: "Dr. Rakesh Sharma",
  },

  {
    id: "BBA401",
    subjectCode: "BBA401",
    subjectName: "Financial Management",
    course: "BBA",
    department: "Management",
    semester: "4",
    professorId: "P032",
    professorName: "Dr. Pankaj Singh",
  },

  {
    id: "BBA501",
    subjectCode: "BBA501",
    subjectName: "Business Analytics",
    course: "BBA",
    department: "Management",
    semester: "5",
    professorId: "P033",
    professorName: "Dr. Kavita Sharma",
  },

  {
    id: "BBA601",
    subjectCode: "BBA601",
    subjectName: "Entrepreneurship",
    course: "BBA",
    department: "Management",
    semester: "6",
    professorId: "P031",
    professorName: "Dr. Amit Gupta",
  },

  // ==========================================================
  // MBA
  // ==========================================================

  {
    id: "MBA101",
    subjectCode: "MBA101",
    subjectName: "Management Principles",
    course: "MBA",
    department: "Management",
    semester: "1",
    professorId: "P034",
    professorName: "Dr. Rajiv Malhotra",
  },

  {
    id: "MBA102",
    subjectCode: "MBA102",
    subjectName: "Managerial Economics",
    course: "MBA",
    department: "Management",
    semester: "1",
    professorId: "P035",
    professorName: "Dr. Priya Agarwal",
  },

  {
    id: "MBA201",
    subjectCode: "MBA201",
    subjectName: "Financial Management",
    course: "MBA",
    department: "Management",
    semester: "2",
    professorId: "P036",
    professorName: "Dr. Sandeep Kumar",
  },

  {
    id: "MBA202",
    subjectCode: "MBA202",
    subjectName: "Marketing Management",
    course: "MBA",
    department: "Management",
    semester: "2",
    professorId: "P037",
    professorName: "Dr. Nidhi Sharma",
  },

  {
    id: "MBA301",
    subjectCode: "MBA301",
    subjectName: "Human Resource Management",
    course: "MBA",
    department: "Management",
    semester: "3",
    professorId: "P038",
    professorName: "Dr. Anil Gupta",
  },

  {
    id: "MBA302",
    subjectCode: "MBA302",
    subjectName: "Business Analytics",
    course: "MBA",
    department: "Management",
    semester: "3",
    professorId: "P039",
    professorName: "Dr. Simran Mehta",
  },

  {
    id: "MBA401",
    subjectCode: "MBA401",
    subjectName: "Strategic Management",
    course: "MBA",
    department: "Management",
    semester: "4",
    professorId: "P040",
    professorName: "Dr. Rajiv Malhotra",
  },

  {
    id: "MBA402",
    subjectCode: "MBA402",
    subjectName: "Entrepreneurship Development",
    course: "MBA",
    department: "Management",
    semester: "4",
    professorId: "P041",
    professorName: "Dr. Pooja Mehta",
  },

  // ==========================================================
  // B.COM
  // ==========================================================

  {
    id: "BCOM101",
    subjectCode: "BCOM101",
    subjectName: "Financial Accounting",
    course: "B.Com",
    department: "Commerce",
    semester: "1",
    professorId: "P042",
    professorName: "Dr. Alok Gupta",
  },

  {
    id: "BCOM102",
    subjectCode: "BCOM102",
    subjectName: "Business Organisation",
    course: "B.Com",
    department: "Commerce",
    semester: "1",
    professorId: "P043",
    professorName: "Dr. Seema Sharma",
  },

  {
    id: "BCOM201",
    subjectCode: "BCOM201",
    subjectName: "Corporate Accounting",
    course: "B.Com",
    department: "Commerce",
    semester: "2",
    professorId: "P042",
    professorName: "Dr. Alok Gupta",
  },

  {
    id: "BCOM301",
    subjectCode: "BCOM301",
    subjectName: "Income Tax",
    course: "B.Com",
    department: "Commerce",
    semester: "3",
    professorId: "P044",
    professorName: "Dr. Ramesh Kumar",
  },

  {
    id: "BCOM401",
    subjectCode: "BCOM401",
    subjectName: "Cost Accounting",
    course: "B.Com",
    department: "Commerce",
    semester: "4",
    professorId: "P045",
    professorName: "Dr. Kavita Gupta",
  },

  {
    id: "BCOM501",
    subjectCode: "BCOM501",
    subjectName: "Auditing",
    course: "B.Com",
    department: "Commerce",
    semester: "5",
    professorId: "P046",
    professorName: "Dr. Mohan Singh",
  },

  {
    id: "BCOM601",
    subjectCode: "BCOM601",
    subjectName: "Business Law",
    course: "B.Com",
    department: "Commerce",
    semester: "6",
    professorId: "P047",
    professorName: "Dr. Ritu Sharma",
  },
];

// ============================================================
// PROFESSORS
// ============================================================

export const DUMMY_PROFESSORS = [
  ...Array.from(
    new Map(
      DUMMY_SUBJECTS.map((subject) => [
        subject.professorId,
        {
          id: subject.professorId,
          professorId: subject.professorId,
          name: subject.professorName,
          professorName: subject.professorName,
          department: subject.department,
          status: "Active",
        },
      ])
    ).values()
  ),
];

// ============================================================
// STUDENTS
// ============================================================

export const DUMMY_STUDENTS = [
  {
    id: "S001",
    registrationNo: "MCA2026001",
    rollNo: "01",
    name: "Rahul Kumar",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S002",
    registrationNo: "MCA2026002",
    rollNo: "02",
    name: "Priya Singh",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S003",
    registrationNo: "MCA2026003",
    rollNo: "03",
    name: "Amit Verma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S004",
    registrationNo: "MCA2026004",
    rollNo: "04",
    name: "Neha Gupta",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S005",
    registrationNo: "MCA2026005",
    rollNo: "05",
    name: "Anjali Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S006",
    registrationNo: "MCA2026006",
    rollNo: "06",
    name: "Rohit Singh",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "B",
    status: "Active",
  },

  {
    id: "S007",
    registrationNo: "BCA2026001",
    rollNo: "01",
    name: "Karan Kumar",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S008",
    registrationNo: "BCA2026002",
    rollNo: "02",
    name: "Pooja Verma",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S009",
    registrationNo: "BTCS3001",
    rollNo: "01",
    name: "Arjun Singh",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S010",
    registrationNo: "BTCS3002",
    rollNo: "02",
    name: "Simran Kaur",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S011",
    registrationNo: "MBA3001",
    rollNo: "01",
    name: "Ravi Sharma",
    course: "MBA",
    department: "Management",
    semester: "3",
    section: "A",
    status: "Active",
  },

  {
    id: "S012",
    registrationNo: "MBA3002",
    rollNo: "02",
    name: "Neha Agarwal",
    course: "MBA",
    department: "Management",
    semester: "3",
    section: "A",
    status: "Active",
  },
];

// ============================================================
// LECTURES
// ============================================================

export const DUMMY_LECTURES = [
  {
    lectureCode: "LEC-MCA-301-001",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-01",
    day: "Thursday",
    startTime: "10:00",
    endTime: "11:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MCA-301-002",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-03",
    day: "Saturday",
    startTime: "10:00",
    endTime: "11:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MCA-302-001",
    subjectCode: "BMC302",
    subjectName: "Cryptography & Network Security",
    professorId: "P024",
    professorName: "Dr. Deepak Verma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-02",
    day: "Friday",
    startTime: "11:00",
    endTime: "12:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MCA-303-001",
    subjectCode: "BMC303",
    subjectName: "Artificial Intelligence",
    professorId: "P025",
    professorName: "Dr. Shalini Gupta",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-04",
    day: "Sunday",
    startTime: "12:00",
    endTime: "13:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MCA-304-001",
    subjectCode: "BMC304",
    subjectName: "Web Technologies",
    professorId: "P026",
    professorName: "Dr. Nisha Kapoor",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-06",
    day: "Tuesday",
    startTime: "14:00",
    endTime: "15:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-BCA-301-001",
    subjectCode: "BCA301",
    subjectName: "Database Management System",
    professorId: "P012",
    professorName: "Dr. Manish Gupta",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-01",
    day: "Thursday",
    startTime: "09:00",
    endTime: "10:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-BCA-302-001",
    subjectCode: "BCA302",
    subjectName: "Computer Networks",
    professorId: "P015",
    professorName: "Dr. Neeraj Singh",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    date: "2026-10-03",
    day: "Saturday",
    startTime: "11:00",
    endTime: "12:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-BTCS-301-001",
    subjectCode: "BTCS301",
    subjectName: "Database Management System",
    professorId: "P004",
    professorName: "Dr. Priya Singh",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    section: "A",
    date: "2026-10-01",
    day: "Thursday",
    startTime: "10:00",
    endTime: "11:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-BTCS-302-001",
    subjectCode: "BTCS302",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "3",
    section: "A",
    date: "2026-10-03",
    day: "Saturday",
    startTime: "11:00",
    endTime: "12:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MBA-301-001",
    subjectCode: "MBA301",
    subjectName: "Human Resource Management",
    professorId: "P038",
    professorName: "Dr. Anil Gupta",
    course: "MBA",
    department: "Management",
    semester: "3",
    section: "A",
    date: "2026-10-01",
    day: "Thursday",
    startTime: "10:00",
    endTime: "11:00",
    status: "Completed",
  },

  {
    lectureCode: "LEC-MBA-302-001",
    subjectCode: "MBA302",
    subjectName: "Business Analytics",
    professorId: "P039",
    professorName: "Dr. Simran Mehta",
    course: "MBA",
    department: "Management",
    semester: "3",
    section: "A",
    date: "2026-10-03",
    day: "Saturday",
    startTime: "11:00",
    endTime: "12:00",
    status: "Completed",
  },
];

// ============================================================
// ATTENDANCE
// ============================================================

export const DUMMY_ATTENDANCE = [
  {
    id: "ATT001",
    lectureCode: "LEC-MCA-301-001",
    date: "2026-10-01",
    day: "Thursday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026001",
    rollNo: "01",
    studentName: "Rahul Kumar",
    present: true,
  },

  {
    id: "ATT002",
    lectureCode: "LEC-MCA-301-001",
    date: "2026-10-01",
    day: "Thursday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026002",
    rollNo: "02",
    studentName: "Priya Singh",
    present: true,
  },

  {
    id: "ATT003",
    lectureCode: "LEC-MCA-301-001",
    date: "2026-10-01",
    day: "Thursday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026003",
    rollNo: "03",
    studentName: "Amit Verma",
    present: false,
  },

  {
    id: "ATT004",
    lectureCode: "LEC-MCA-301-002",
    date: "2026-10-03",
    day: "Saturday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026001",
    rollNo: "01",
    studentName: "Rahul Kumar",
    present: true,
  },

  {
    id: "ATT005",
    lectureCode: "LEC-MCA-301-002",
    date: "2026-10-03",
    day: "Saturday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026002",
    rollNo: "02",
    studentName: "Priya Singh",
    present: false,
  },

  {
    id: "ATT006",
    lectureCode: "LEC-MCA-301-002",
    date: "2026-10-03",
    day: "Saturday",
    subjectCode: "BMC301",
    subjectName: "Computer Networks",
    professorId: "P001",
    professorName: "Dr. Rahul Sharma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026003",
    rollNo: "03",
    studentName: "Amit Verma",
    present: true,
  },

  {
    id: "ATT007",
    lectureCode: "LEC-MCA-302-001",
    date: "2026-10-02",
    day: "Friday",
    subjectCode: "BMC302",
    subjectName: "Cryptography & Network Security",
    professorId: "P024",
    professorName: "Dr. Deepak Verma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026001",
    rollNo: "01",
    studentName: "Rahul Kumar",
    present: false,
  },

  {
    id: "ATT008",
    lectureCode: "LEC-MCA-302-001",
    date: "2026-10-02",
    day: "Friday",
    subjectCode: "BMC302",
    subjectName: "Cryptography & Network Security",
    professorId: "P024",
    professorName: "Dr. Deepak Verma",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026002",
    rollNo: "02",
    studentName: "Priya Singh",
    present: true,
  },

  {
    id: "ATT009",
    lectureCode: "LEC-MCA-303-001",
    date: "2026-10-04",
    day: "Sunday",
    subjectCode: "BMC303",
    subjectName: "Artificial Intelligence",
    professorId: "P025",
    professorName: "Dr. Shalini Gupta",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026001",
    rollNo: "01",
    studentName: "Rahul Kumar",
    present: true,
  },

  {
    id: "ATT010",
    lectureCode: "LEC-MCA-303-001",
    date: "2026-10-04",
    day: "Sunday",
    subjectCode: "BMC303",
    subjectName: "Artificial Intelligence",
    professorId: "P025",
    professorName: "Dr. Shalini Gupta",
    course: "MCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "MCA2026002",
    rollNo: "02",
    studentName: "Priya Singh",
    present: true,
  },

  {
    id: "ATT011",
    lectureCode: "LEC-BCA-301-001",
    date: "2026-10-01",
    day: "Thursday",
    subjectCode: "BCA301",
    subjectName: "Database Management System",
    professorId: "P012",
    professorName: "Dr. Manish Gupta",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "BCA2026001",
    rollNo: "01",
    studentName: "Karan Kumar",
    present: true,
  },

  {
    id: "ATT012",
    lectureCode: "LEC-BCA-301-001",
    date: "2026-10-01",
    day: "Thursday",
    subjectCode: "BCA301",
    subjectName: "Database Management System",
    professorId: "P012",
    professorName: "Dr. Manish Gupta",
    course: "BCA",
    department: "Computer Applications",
    semester: "3",
    section: "A",
    registrationNo: "BCA2026002",
    rollNo: "02",
    studentName: "Pooja Verma",
    present: false,
  },
];

// ============================================================
// DEFAULT REPORT FILTERS
// ============================================================

export const DEFAULT_REPORT_FILTERS = {
  course: "",
  department: "",
  semester: "",
  subjectCode: "",
  professorId: "",
  lectureCode: "",
  registrationNo: "",
  rollNo: "",
  studentName: "",
  fromDate: "",
  toDate: "",
  attendanceStatus: "",
};