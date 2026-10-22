# Attendance Management System – Application Flow

## 1. Overall System Flow

```text
                    USER
                     │
                     ↓
                  LOGIN
                     │
                     ↓
             Authentication
                     │
              ┌──────┴──────┐
              ↓             ↓
             Admin       Professor
              │             │
              ↓             ↓
        Admin Dashboard  Professor Dashboard
              │             │
              │             ↓
              │        Professor ID
              │             │
              ↓             ↓
       Manage Professors  My Subjects
       Manage Students       │
       Manage Subjects       ↓
       Manage Lectures   Create Lecture
       View Reports          │
              │              ↓
              │         Lecture Code
              │              │
              └──────┬───────┘
                     ↓
              Take Attendance
                     │
                     ↓
                  Students
                     │
                     ↓
              Present / Absent
                     │
                     ↓
             Attendance Record
                     │
                     ↓
                  Reports