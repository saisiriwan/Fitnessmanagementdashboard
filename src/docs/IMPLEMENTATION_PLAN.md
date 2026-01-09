# 🚀 แผนการดำเนินการแก้ไขระบบ Trainer Pro

## 📌 ภาพรวม

เอกสารนี้แสดงแผนการดำเนินการแก้ไขระบบแบบเป็นขั้นตอน (Step-by-Step) โดยแบ่งออกเป็น 5 Phases

---

## Phase 1: ปรับโครงสร้างข้อมูล (Data Structure Refactoring)
**Timeline:** 3-5 วัน  
**Priority:** 🔴 CRITICAL

### 1.1 อัปเดต AppContext

**ไฟล์:** `/components/AppContext.tsx`

#### เพิ่ม Types/Interfaces ใหม่:

```typescript
// Workout Template (เซตท่าประจำวัน)
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  sections: ProgramSection[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isDefault: boolean; // ระบบมีให้ หรือเทรนเนอร์สร้าง
  createdBy: string; // trainer id
  createdAt: string;
  tags: string[]; // ['upper-body', 'strength', 'hypertrophy']
}

// Program Template (แม่แบบโปรแกรมหลายสัปดาห์)
export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  weeks: ProgramWeek[];
  goals: string[]; // ['muscle-gain', 'strength']
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ProgramWeek {
  weekNumber: number;
  name: string; // "Deload Week", "Peak Week"
  days: ProgramDay[];
}

export interface ProgramDay {
  dayNumber: number;
  dayName: string;
  workoutTemplateId?: string; // อ้างอิงไปที่ Workout Template
  isRestDay: boolean;
  notes?: string;
}

// Program Instance (โปรแกรมที่กำลังดำเนินการกับลูกเทรน)
export interface ProgramInstance {
  id: string;
  programTemplateId: string;
  programTemplateName: string; // denormalized for quick access
  clientId: string;
  startDate: string;
  endDate: string; // calculated
  currentWeek: number;
  currentDay: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completedSessions: number;
  totalScheduledSessions: number;
  progress: number; // percentage
  createdAt: string;
  completedAt?: string;
}

// Session (การฝึกจริงที่เสร็จแล้ว)
export interface Session {
  id: string;
  appointmentId?: string;
  clientId: string;
  clientName: string; // denormalized
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  
  // Link to program
  programInstanceId?: string;
  workoutTemplateId?: string;
  workoutTemplateName?: string;
  
  // Session metadata
  sessionNumber: number; // ครั้งที่ 1, 2, 3...
  weekNumber?: number; // Week 1, 2, 3... of program
  dayNumber?: number; // Day 1, 2, 3... of week
  
  // Exercise data
  exercises: SessionExercise[];
  
  // Feedback
  trainerNotes: string;
  clientEnergy: number; // 1-5
  clientForm: number; // 1-5
  overallRating: number; // 1-5
  
  // Summary
  totalVolume: number; // kg
  totalSets: number;
  totalReps: number;
  summaryCardUrl?: string;
  
  createdAt: string;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
  notes?: string;
}

export interface SessionSet {
  setNumber: number;
  plannedReps?: number;
  plannedWeight?: number;
  actualReps: number;
  actualWeight: number;
  actualRPE?: number;
  rest?: number; // seconds
  notes?: string;
  completed: boolean;
}

// อัปเดต Appointment
export interface Appointment {
  id: string;
  clientId: string;
  trainerId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string; // ⭐ เพิ่มใหม่
  duration: number; // calculated in minutes
  
  // Link to templates/instances
  workoutTemplateId?: string;
  programInstanceId?: string;
  
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  
  // Notifications ⭐ เพิ่มใหม่
  notifications: AppointmentNotification[];
  
  // Links to completed session
  sessionId?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentNotification {
  id: string;
  type: 'time-based' | 'custom';
  time: string; // "1 day", "3 hours", "30 minutes", "custom"
  customMinutes?: number; // ถ้าเป็น custom
  enabled: boolean;
  sent?: boolean;
  sentAt?: string;
}

// อัปเดต Client
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  
  // Goals
  goals: string[];
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  
  // Program tracking ⭐ เพิ่มใหม่
  currentProgramInstanceId?: string;
  totalSessions: number; // จำนวนครั้งที่ฝึกมาทั้งหมด
  lastSessionDate?: string;
  nextSessionDate?: string;
  
  // Personal notes ⭐ เพิ่มใหม่
  personalNotes: string; // บันทึกส่วนตัวของเทรนเนอร์
  
  // Medical
  medicalConditions?: string[];
  injuries?: string[];
  medications?: string[];
  
  // Emergency contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Account linking
  linkedAccountEmail?: string;
  accountLinked: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived';
}

// อัปเดต Exercise
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modality: string;
  
  isDefault: boolean; // ⭐ เพิ่มใหม่ - ท่าที่มากับระบบ
  createdBy?: string; // trainer id (ถ้าไม่ใช่ default)
  
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  commonMistakes?: string[];
  
  createdAt: string;
  updatedAt: string;
}
```

#### เพิ่ม State Management:

```typescript
const AppContext = createContext<{
  // ... existing states
  
  // Workout Templates
  workoutTemplates: WorkoutTemplate[];
  addWorkoutTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => string;
  updateWorkoutTemplate: (id: string, template: Partial<WorkoutTemplate>) => void;
  deleteWorkoutTemplate: (id: string) => void;
  
  // Program Templates
  programTemplates: ProgramTemplate[];
  addProgramTemplate: (template: Omit<ProgramTemplate, 'id' | 'createdAt'>) => string;
  updateProgramTemplate: (id: string, template: Partial<ProgramTemplate>) => void;
  deleteProgramTemplate: (id: string) => void;
  
  // Program Instances
  programInstances: ProgramInstance[];
  assignProgram: (params: {
    programTemplateId: string;
    clientId: string;
    startDate: string;
    createAppointments?: boolean;
    appointmentSettings?: {
      days: number[]; // [1, 3, 5] = Mon, Wed, Fri
      time: string;
      duration: number;
    };
  }) => string;
  updateProgramInstance: (id: string, instance: Partial<ProgramInstance>) => void;
  cancelProgramInstance: (id: string) => void;
  
  // Sessions
  sessions: Session[];
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => string;
  updateSession: (id: string, session: Partial<Session>) => void;
  getClientSessions: (clientId: string) => Session[];
  
  // Updated functions
  updateClient: (id: string, client: Partial<Client>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
}>
```

### 1.2 สร้าง Default Exercises

**ไฟล์:** `/data/defaultExercises.ts`

```typescript
export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Chest
  {
    name: 'Barbell Bench Press',
    description: 'Classic compound chest exercise',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    modality: 'strength',
    isDefault: true,
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to mid-chest',
      'Press bar up until arms are extended'
    ]
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest exercise with dumbbells',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    modality: 'strength',
    isDefault: true
  },
  // Back
  {
    name: 'Barbell Row',
    description: 'Compound back exercise',
    muscleGroups: ['back', 'biceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    modality: 'strength',
    isDefault: true
  },
  {
    name: 'Pull-ups',
    description: 'Bodyweight back exercise',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate',
    modality: 'strength',
    isDefault: true
  },
  // Legs
  {
    name: 'Barbell Squat',
    description: 'King of leg exercises',
    muscleGroups: ['legs', 'glutes', 'core'],
    equipment: ['barbell', 'rack'],
    difficulty: 'intermediate',
    modality: 'strength',
    isDefault: true
  },
  {
    name: 'Deadlift',
    description: 'Full body compound lift',
    muscleGroups: ['back', 'legs', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    modality: 'strength',
    isDefault: true
  },
  // ... เพิ่มท่าอื่นๆ ให้ครบ 50-100 ท่า
];
```

**Action Items:**
- [ ] อัปเดต AppContext.tsx
- [ ] สร้าง defaultExercises.ts
- [ ] Migration: เพิ่ม `isDefault: false` ให้ Exercise ที่มีอยู่แล้ว
- [ ] Load default exercises on first run
- [ ] เพิ่ม `sessionCount`, `personalNotes` ให้ Client ทั้งหมด

---

## Phase 2: สร้าง Workout Template System
**Timeline:** 2-3 วัน  
**Priority:** 🔴 CRITICAL

### 2.1 Workout Template Builder

**ไฟล์:** `/components/WorkoutTemplateBuilder.tsx`

**Features:**
- แบบฟอร์มสร้าง Workout Template
- เพิ่ม/ลบ Sections (Warmup, Main, Cooldown)
- เพิ่ม Exercises จาก Library
- กำหนด Sets, Reps, Weight template
- Preview ก่อนบันทึก
- บันทึกเป็น Template

**UI Mockup:**
```
┌────────────────────────────────────────┐
│ Create Workout Template                │
├────────────────────────────────────────┤
│ Name: [Upper Body Strength          ] │
│ Description: [Focus on chest & back ] │
│ Duration: [90] minutes                 │
│ Difficulty: [Intermediate ▼]          │
│                                        │
│ ── Sections ──                         │
│                                        │
│ 🔥 Warmup (10 min)                    │
│   + Add Exercise                       │
│                                        │
│ 💪 Main Work (60 min)                 │
│   ✓ Bench Press - 4x8-10              │
│   ✓ Barbell Row - 4x8-10              │
│   + Add Exercise                       │
│                                        │
│ 🌬️ Cooldown (20 min)                  │
│   + Add Exercise                       │
│                                        │
│ [+ Add Section]                        │
│                                        │
│ [Cancel] [Save as Template]            │
└────────────────────────────────────────┘
```

### 2.2 Workout Template List

**ไฟล์:** `/components/WorkoutTemplateList.tsx`

**Features:**
- แสดงรายการ Workout Templates ทั้งหมด
- กรอง: All / Default / My Custom
- ค้นหา
- ดูรายละเอียด
- แก้ไข (เฉพาะ Custom)
- ลบ (เฉพาะ Custom)
- Duplicate
- ใช้กับ Appointment

**Action Items:**
- [ ] สร้าง WorkoutTemplateBuilder.tsx
- [ ] สร้าง WorkoutTemplateList.tsx
- [ ] เพิ่ม Route: `/workout-templates`
- [ ] เพิ่มเมนู "Workout Templates" ใน Sidebar

---

## Phase 3: สร้าง Program Instance System
**Timeline:** 3-4 วัน  
**Priority:** 🔴 CRITICAL

### 3.1 Program Instance Manager

**ไฟล์:** `/components/ProgramInstanceManager.tsx`

**Features:**
- มอบหมายโปรแกรมให้ลูกเทรน
- เลือก Program Template
- เลือก Start Date
- Preview โปรแกรม (จำนวนสัปดาห์, วันฝึก)
- เลือกว่าจะสร้าง Appointments อัตโนมัติไหม
- Warning ถ้ามี Program Instance เดิมอยู่

**UI Flow:**
```
Step 1: เลือกลูกเทรน
┌────────────────────────────────────┐
│ Assign Program to Client           │
├────────────────────────────────────┤
│ Client: [John Doe ▼]               │
│                                    │
│ ⚠️ John is currently on:           │
│ "6-Week Fat Loss" (Week 2/6)      │
│                                    │
│ [Continue]                         │
└────────────────────────────────────┘

Step 2: เลือกโปรแกรม
┌────────────────────────────────────┐
│ Select Program Template            │
├────────────────────────────────────┤
│ ○ 8-Week Upper/Lower Split         │
│   Intermediate • 8 weeks           │
│                                    │
│ ○ 12-Week Strength Program         │
│   Advanced • 12 weeks              │
│                                    │
│ [Back] [Next]                      │
└────────────────────────────────────┘

Step 3: กำหนดวันเริ่ม
┌────────────────────────────────────┐
│ Program Schedule                   │
├────────────────────────────────────┤
│ Start Date: [Dec 16, 2024]        │
│                                    │
│ Preview:                           │
│ Duration: 8 weeks                  │
│ End Date: Feb 10, 2025            │
│ Training Days: 24 days            │
│ Rest Days: 32 days                │
│                                    │
│ ☑ Create appointments auto         │
│                                    │
│ [Back] [Next]                      │
└────────────────────────────────────┘

Step 4: ตั้งค่านัดหมาย (ถ้าเลือก auto)
┌────────────────────────────────────┐
│ Appointment Settings               │
├────────────────────────────────────┤
│ Training Days:                     │
│ ☑ Monday    ☑ Wednesday  ☑ Friday │
│ ☐ Tuesday   ☐ Thursday   ☐ Weekend│
│                                    │
│ Time: [09:00] - [11:00]           │
│                                    │
│ Will create 24 appointments        │
│                                    │
│ [Back] [Confirm]                   │
└────────────────────────────────────┘

Step 5: Confirmation
┌────────────────────────────────────┐
│ ⚠️ Confirm Program Assignment      │
├────────────────────────────────────┤
│ This will replace John's current   │
│ program "6-Week Fat Loss"          │
│                                    │
│ Actions:                           │
│ • Cancel current program           │
│ • Remove 8 future appointments     │
│ • Start new program                │
│ • Create 24 new appointments       │
│                                    │
│ Continue?                          │
│                                    │
│ [Cancel] [Yes, Proceed]            │
└────────────────────────────────────┘
```

### 3.2 Client Progress View

**ไฟล์:** `/components/ClientProgressView.tsx`

**Features:**
- แสดงความคืบหน้าโปรแกรม
- Progress bar (Week X/Y)
- Session count
- Last session details
- Next session preview
- ปุ่ม "View Full History"

**Action Items:**
- [ ] สร้าง ProgramInstanceManager.tsx
- [ ] สร้าง ClientProgressView.tsx
- [ ] เพิ่มใน ClientProfile.tsx
- [ ] เพิ่มฟังก์ชัน `assignProgram()` ใน AppContext
- [ ] สร้าง Warning Dialog component

---

## Phase 4: อัปเดต Appointment & Session System
**Timeline:** 3-4 วัน  
**Priority:** 🟠 HIGH

### 4.1 อัปเดต Appointment Form

**ไฟล์:** `/components/Calendar.tsx`, `/components/AppointmentForm.tsx`

**Changes:**
- เพิ่ม End Time picker
- คำนวณ Duration อัตโนมัติ
- Notification settings (multiple)
- ลิงก์กับ Workout Template (optional)
- ลิงก์กับ Program Instance (auto)

**UI:**
```
┌────────────────────────────────────┐
│ New Appointment                    │
├────────────────────────────────────┤
│ Client: [John Doe ▼]               │
│ Date: [Dec 16, 2024]              │
│                                    │
│ Time:                              │
│ Start: [09:00] End: [11:00]       │
│ Duration: 120 minutes              │
│                                    │
│ Workout: [Upper Body Strength ▼]  │
│          (optional)                │
│                                    │
│ Linked to Program:                 │
│ "8-Week Upper/Lower" - Week 1 Day 1│
│                                    │
│ ── Notifications ──                │
│ ☑ 1 day before                     │
│ ☑ 3 hours before                   │
│ ☑ 30 minutes before                │
│ ☐ Custom: [___] minutes            │
│                                    │
│ [Cancel] [Create]                  │
└────────────────────────────────────┘
```

### 4.2 สร้าง Session Recorder

**ไฟล์:** `/components/SessionRecorder.tsx`

**Features:**
- Load Workout Template (ถ้ามี)
- แสดง Session Number (ครั้งที่เท่าไหร่)
- บันทึก Actual Reps/Weight/RPE
- ฟีดแบ็ก: Energy, Form, Notes
- สร้าง Summary Card อัตโนมัติ
- อัปเดต Program Instance progress
- เพิ่ม Client.totalSessions

**UI:**
```
┌────────────────────────────────────┐
│ Session: John Doe                  │
│ This is John's 5th session ⭐      │
├────────────────────────────────────┤
│ Program: 8-Week Upper/Lower        │
│ Week 2 • Day 3                     │
│                                    │
│ Workout: Upper Body Strength       │
│                                    │
│ ── Exercises ──                    │
│                                    │
│ Bench Press                        │
│ Set 1: [8] reps @ [80] kg RPE [8] │
│ Set 2: [8] reps @ [80] kg RPE [8] │
│ Set 3: [7] reps @ [80] kg RPE [9] │
│ Set 4: [6] reps @ [80] kg RPE [9] │
│                                    │
│ Barbell Row                        │
│ ...                                │
│                                    │
│ ── Feedback ──                     │
│                                    │
│ Client Energy: ⭐⭐⭐⭐☆            │
│ Client Form: ⭐⭐⭐⭐⭐             │
│                                    │
│ Trainer Notes:                     │
│ [Bench press form excellent!    ] │
│ [Struggling on last set...      ] │
│                                    │
│ [Cancel] [Complete Session]        │
└────────────────────────────────────┘
```

**Action Items:**
- [ ] อัปเดต AppointmentForm.tsx
- [ ] สร้าง SessionRecorder.tsx
- [ ] สร้าง SessionSummaryCard.tsx (auto-generate image)
- [ ] เพิ่มฟังก์ชัน `addSession()` ใน AppContext
- [ ] Hook: อัปเดต Client.totalSessions เมื่อ complete session
- [ ] Hook: อัปเดต ProgramInstance.currentWeek/Day

---

## Phase 5: UI/UX Improvements
**Timeline:** 2-3 วัน  
**Priority:** 🟡 MEDIUM

### 5.1 อัปเดต Dashboard

**ไฟล์:** `/components/Dashboard.tsx`

**Changes:**
- แสดง Session Count ในการ์ดลูกเทรน
- แสดง "ครั้งถัดไปจะเป็นครั้งที่ X"
- แสดงความคืบหน้าโปรแกรม
- Quick actions: "Start Session", "View Progress"

**Before:**
```
┌──────────────────┐
│ John Doe         │
│ Goal: Build Muscle│
│ [View Profile]   │
└──────────────────┘
```

**After:**
```
┌─────────────────────────────────┐
│ John Doe                        │
│ 💪 Sessions: 12 times ⭐         │
│ 📊 Program: Week 3/8 (37%)      │
│ 📅 Next: Tomorrow 9:00 AM       │
│                                 │
│ [Start Session] [View Progress] │
└─────────────────────────────────┘
```

### 5.2 อัปเดต Client Profile

**ไฟล์:** `/components/ClientProfile.tsx`

**Changes:**
- เพิ่ม Personal Notes section
- แสดงความคืบหน้าโปรแกรม
- แสดง Session history
- Quick stats

**New Sections:**
```
┌────────────────────────────────────┐
│ 📝 Personal Notes (Private)        │
├────────────────────────────────────┤
│ - ชอบฝึก chest & back             │
│ - มักถาม recovery                 │
│ - เป้าหมาย: Bench 100kg ภายใน ม.ค.│
│                                    │
│ [Edit Notes]                       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 💪 Training Progress               │
├────────────────────────────────────┤
│ Total Sessions: 12 ⭐               │
│ Last Session: Dec 15, 2024        │
│                                    │
│ Current Program:                   │
│ "8-Week Upper/Lower Split"        │
│ Week 3/8 ███████░░░ 37.5%         │
│                                    │
│ [View Full History]                │
└────────────────────────────────────┘
```

### 5.3 อัปเดต Exercise Library

**ไฟล์:** `/components/ExerciseLibrary.tsx`

**Changes:**
- Badge แสดง "System" (สีน้ำเงิน) vs "Custom" (สีส้ม)
- Filter: All / System / My Custom
- ท่า System ลบไม่ได้ แต่ซ่อนได้
- ท่า Custom แก้ไข/ลบได้

**UI:**
```
┌────────────────────────────────────┐
│ Exercise Library                   │
├────────────────────────────────────┤
│ [🔍 Search] [All▼] [System] [Custom]│
│                                    │
│ ┌────────────────────────────┐   │
│ │ Bench Press       [System] │   │
│ │ Chest • Intermediate       │   │
│ └────────────────────────────┘   │
│                                    │
│ ┌────────────────────────────┐   │
│ │ Cable Fly 45°     [Custom] │   │
│ │ Chest • Beginner           │   │
│ │ [Edit] [Delete]            │   │
│ └────────────────────────────┘   │
└────────────────────────────────────┘
```

**Action Items:**
- [ ] อัปเดต Dashboard.tsx
- [ ] อัปเดต ClientProfile.tsx
- [ ] เพิ่ม PersonalNotes component
- [ ] อัปเดต ExerciseLibrary.tsx
- [ ] สร้าง Badge components

---

## Phase 6: Testing & Refinement
**Timeline:** 2-3 วัน  
**Priority:** 🟡 MEDIUM

### 6.1 Manual Testing Checklist

**Workflow 1: สร้าง Workout Template**
- [ ] สร้าง template ใหม่
- [ ] แก้ไข template
- [ ] ลบ template
- [ ] Duplicate template

**Workflow 2: สร้าง Program Template**
- [ ] สร้าง program template
- [ ] อ้างอิง workout templates
- [ ] Preview program

**Workflow 3: มอบหมายโปรแกรม**
- [ ] มอบหมายให้ลูกเทรนที่ยังไม่มีโปรแกรม
- [ ] มอบหมายให้ลูกเทรนที่มีโปรแกรมอยู่แล้ว (ต้องมี warning)
- [ ] สร้าง appointments อัตโนมัติ
- [ ] ตรวจสอบ program instance ถูกสร้าง

**Workflow 4: บันทึก Session**
- [ ] เริ่ม session จาก appointment
- [ ] บันทึกข้อมูลการฝึก
- [ ] บันทึกฟีดแบ็ก
- [ ] Complete session
- [ ] ตรวจสอบ session count เพิ่มขึ้น
- [ ] ตรวจสอบ program progress อัปเดต
- [ ] ตรวจสอบ summary card ถูกสร้าง

**Workflow 5: ดูความคืบหน้า**
- [ ] ดูใน Dashboard
- [ ] ดูใน Client Profile
- [ ] ดู Session history

**Workflow 6: Exercise Library**
- [ ] กรอง System exercises
- [ ] กรอง Custom exercises
- [ ] เพิ่มท่า custom
- [ ] แก้ไขท่า custom
- [ ] ลบท่า custom
- [ ] ท่า System ลบไม่ได้

### 6.2 Edge Cases

- [ ] ลูกเทรนมาไม่ตรงตามโปรแกรม (skip days)
- [ ] ยกเลิก appointment ที่อยู่ในโปรแกรม
- [ ] เปลี่ยนโปรแกรมระหว่างทาง
- [ ] ลบ workout template ที่ถูกใช้ในโปรแกรม
- [ ] ลบโปรแกรมที่กำลังดำเนินการ

### 6.3 Data Migration

- [ ] เพิ่ม field ใหม่ให้ข้อมูลเดิม
- [ ] Set default values
- [ ] Validate data integrity

---

## 📊 Timeline Summary

| Phase | Task | Days | Status |
|-------|------|------|--------|
| 1 | Data Structure | 3-5 | 🔴 Not Started |
| 2 | Workout Templates | 2-3 | 🔴 Not Started |
| 3 | Program Instances | 3-4 | 🔴 Not Started |
| 4 | Appointment & Session | 3-4 | 🔴 Not Started |
| 5 | UI/UX Improvements | 2-3 | 🔴 Not Started |
| 6 | Testing | 2-3 | 🔴 Not Started |
| **Total** | | **15-22 วัน** | |

---

## 🎯 Success Criteria

ระบบจะถือว่าสำเร็จเมื่อ:

1. **Workflow ชัดเจน**
   - เทรนเนอร์เข้าใจความแตกต่างระหว่าง Template, Instance, Session
   - สามารถสร้างและใช้ซ้ำ Workout Templates ได้
   - สามารถสร้างและมอบหมาย Program ได้

2. **ข้อมูลครบถ้วน**
   - แสดง Session Count ทุกที่
   - แสดงความคืบหน้าโปรแกรม
   - มี Personal Notes
   - มี End Time ในนัดหมาย

3. **ระบบปลอดภัย**
   - มี Warning เมื่อทำอะไรที่กระทบข้อมูลเดิม
   - ไม่สามารถลบ System exercises
   - ยืนยันก่อนลบข้อมูลสำคัญ

4. **UX ดี**
   - ใช้งานง่าย ไม่สับสน
   - Responsive
   - Fast performance

---

## 📝 Notes

- แต่ละ Phase ควรทำให้เสร็จก่อนไปต่อ
- Test ทุก feature ก่อน merge
- ใช้ feature branches
- Review code ก่อน merge to main

---

**เอกสารนี้สร้างเมื่อ:** December 16, 2024  
**สถานะ:** 🔴 Ready to Start  
**Next Action:** เริ่ม Phase 1 - อัปเดต AppContext.tsx
