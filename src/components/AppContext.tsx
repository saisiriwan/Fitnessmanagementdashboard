import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultExercisesWithIds } from '../data/defaultExercises'; // ✅ เพิ่ม import
import { TrainingGoal } from '../types/goals'; // ✅ เพิ่ม import Goals

export interface ConnectionRequest {
  id: string;
  clientId: string;          // User ID ของลูกเทรนที่สมัครแล้ว
  trainerId: string;          // Trainer ID ที่ลูกเทรนขอเชื่อมโยง
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
  message?: string;           // ข้อความจากลูกเทรน
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  status: 'active' | 'paused' | 'inactive';
  tags: string[];
  joinDate: string;
  nextSession?: string;
  currentProgram?: string;
  avatar?: string;
  metrics?: {
    weight?: number;
    bodyFat?: number;
    muscle?: number;
  };
  notes: string;
  personalNotes?: string;  // ✅ เพิ่ม: บันทึกส่วนตัวของเทรนเนอร์
  preferences?: {          // ✅ เพิ่ม: ความชอบ/ไม่ชอบ
    likedExercises?: string[];
    dislikedExercises?: string[];
    injuries?: string[];
    specialNotes?: string;
  };
  // ✅ NEW: Goals system (Updated to 4 goals only)
  primaryGoal?: TrainingGoal; // ลดน้ำหนัก, เพิ่มกล้ามเนื้อ, เพิ่มความแข็งแรง, สุขภาพทั่วไป
  goalNotes?: string;
  // ✅ DEPRECATED: Old goals structure (keep for backward compatibility)
  goals?: {
    goalType: 'weight-loss' | 'muscle-gain' | 'strength' | 'endurance' | 'flexibility' | 'custom';
    targetWeight?: number; // kg
    currentWeight?: number; // kg
    targetBodyFat?: number; // %
    targetDate?: string; // YYYY-MM-DD
    customGoal?: string; // สำหรับ custom type
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  userId?: string;           // User ID สำหรับ login
  trainers?: string[];       // Array of trainer IDs (many-to-many relationship)
  username?: string;
  password?: string;
  joinedAt?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  avatar?: string;
  username: string;          // Username สำหรับให้ลูกเทรนกรอกเชื่อมโยง (เช่น "john_trainer")
  trainerCode: string;       // รหัสเทรนเนอร์สำหรับให้ลูกเทรนเชื่อมโยง (เช่น "JOHN2024")
  clients?: string[];        // ✅ เพิ่ม: ลูกเทรนที่เชื่อมโยงกับเทรนเนอร์
}

export interface Exercise {
  id: string;
  name: string;
  trainingType: 'weight-training' | 'cardio' | 'flexibility'; // ✨ NEW: ประเภทหลัก 3 ประเภท
  modality: 'strength' | 'cardio' | 'flexibility';
  muscleGroups: string[];
  movementPattern: string;
  instructions: string;
  category: string; // เก็บไว้สำหรับ subcategory เช่น Compound, Isolation, HIIT, Yoga
  isDefault?: boolean;      // ✅ เพิ่ม: true = มากับระบบ, false = เทรนเนอร์สร้างเอง
  createdBy?: string;       // ✅ เพิ่ม: ID ของเทรนเนอร์ที่สร้าง (ถ้า isDefault = false)
  createdAt?: string;       // ✅ เพิ่ม: วันที่สร้าง
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  trainerId?: string; // ← เพิ่ม: ID ของเทรนเนอร์ที่สร้าง session นี้
  programId?: string; // ⚠️ DEPRECATED: ใช้ programInstanceId แทน
  programInstanceId?: string; // ✅ เพิ่ม: ID ของ ProgramInstance (ใช้แทน programId)
  weekNumber?: number; // ✅ เพิ่ม: สัปดาห์ที่ (1, 2, 3, ...)
  dayNumber?: number; // ✅ เพิ่ม: วันที่ (1, 2, 3, ...)
  date: string; // เวลาเริ่มต้น (ISO string)
  endTime?: string; // ✅ เพิ่ม: เวลาสิ้นสุด (ISO string)
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  exercises: SessionExercise[];
  duration?: number;
  notes?: string;
  summary?: string;
  sharedWithClient?: boolean; // ← เพิ่ม: ส่งการ์ดให้ลูกเทรนหรือยัง
  // ✅ NEW: ข้อมูลเพิ่มเติมสำหรับ Client Dashboard
  type?: 'strength' | 'cardio' | 'flexibility' | 'recovery'; // ประเภทการฝึก
  rating?: number; // คะแนน 1-5 ดาว
  bodyWeight?: number; // น้ำหนักตัว (kg) วันนี้
  improvements?: string; // พัฒนาการ เช่น "+5kg on Bench Press"
  nextGoals?: string; // เป้าหมายครั้งถัดไป
  achievements?: string[]; // ความสำเร็จที่ทำได้ในวันนี้
}

export interface SessionExercise {
  exerciseId: string;
  sets: {
    reps?: number;
    weight?: number;
    rpe?: number;
    rest?: number;
    duration?: number;
    distance?: number;
    heartRate?: number;
    completed: boolean;
  }[];
  notes?: string;
}

// ✅ เปลี่ยนชื่อเป็น ProgramTemplate (เทมเพลตโปรแกรม)
export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  daysPerWeek: number;
  weeks: ProgramWeek[];
  createdAt: string;
  createdBy?: string; // ✅ เพิ่ม: ID ของเทรนเนอร์ที่สร้าง
  isArchived?: boolean; // ✅ เพิ่ม: เก็บถาวร (ไม่แสดงในรายการ)
}

// ⚠️ DEPRECATED: ใช้ ProgramTemplate แทน
export interface Program extends ProgramTemplate {
  assignedClients: string[]; // DEPRECATED field
}

// ✅ ProgramInstance = โปรแกรมที่ถูก Assign ให้ลูกเทรนแล้ว
export interface ProgramInstance {
  id: string;
  templateId: string; // อ้างอิงไปที่ ProgramTemplate
  clientId: string;
  trainerId: string;
  assignedAt: string; // วันที่ Assign
  startDate: string; // วันที่เริ่มโปรแกรม (YYYY-MM-DD)
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currentWeek: number; // สัปดาห์ปัจจุบัน (1, 2, 3, ...)
  currentDay: number; // วันปัจจุบัน (1, 2, 3, ...)
  completedWeeks: number[]; // สัปดาห์ที่ทำเสร็จแล้ว [1, 2]
  completedDays: { week: number; day: number }[]; // วันที่ทำเสร็จแล้ว
  notes?: string; // โน้ตเฉพาะ Instance นี้
  modifiedExercises?: {
    // ถ้าเทรนเนอร์แก้ไขท่าเฉพาะลูกเทรนคนนี้
    weekNumber: number;
    dayNumber: number;
    exercises: ProgramExercise[];
  }[];
}

export interface ProgramWeek {
  weekNumber: number;
  days: ProgramDay[];
}

export interface ProgramDay {
  dayNumber: number;
  name: string;
  isRestDay?: boolean; // true = วันพัก, false/undefined = วันฝึก
  sections?: ProgramSection[]; // Optional for backward compatibility
  exercises?: ProgramExercise[]; // Legacy support for old programs
}

export interface ProgramSection {
  id: string;
  sectionType: 'warmup' | 'main' | 'skill' | 'cooldown' | 'custom';
  sectionFormat: 'circuit' | 'straight-sets' | 'superset' | 'amrap' | 'emom' | 'tabata' | 'custom';
  name: string;
  duration?: number; // minutes
  exercises?: ProgramExercise[]; // Optional for backward compatibility
  notes?: string;
  rounds?: number; // for circuits, AMRAP, etc.
  workTime?: number; // for EMOM, Tabata (seconds)
  restTime?: number; // for EMOM, Tabata (seconds)
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string; // e.g., "8-12", "AMRAP"
  weight?: string; // e.g., "70%", "RPE 8"
  rest: number; // seconds
  notes?: string;
  tempo?: string; // e.g., "3-1-1-0"
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'note' | 'rest-day';
  title?: string;
  content?: string;
  createdAt: string;
}

export interface ProgramAssignment {
  id: string;
  clientId: string;
  programId: string;
  assignmentStartDate: string; // ISO date "2025-12-13"
  startingDay: number; // 1, 4, etc.
  notifyClient: boolean;
  assignedAt: string; // timestamp
}

export interface ClientProgramDay {
  dayNumber: number;
  dayData: ProgramDay;
  weekNumber: number;
}

interface AppContextType {
  clients: Client[];
  trainers: Trainer[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  programs: Program[]; // ⚠️ DEPRECATED: ใช้ programTemplates แทน
  programTemplates: ProgramTemplate[]; // ✅ เทมเพลตโปรแกรม
  programInstances: ProgramInstance[]; // ✅ โปรแกรมที่ Assign แล้ว
  calendarNotes: CalendarNote[];
  programAssignments: ProgramAssignment[]; // ⚠️ DEPRECATED: ใช้ programInstances แทน
  connectionRequests: ConnectionRequest[];
  addClient: (client: Omit<Client, 'id'>) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => string;
  updateTrainer: (id: string, trainer: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => string;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  addSession: (session: Omit<WorkoutSession, 'id'>) => string;
  updateSession: (id: string, session: Partial<WorkoutSession>) => void;
  deleteSession: (id: string) => void;
  // ⚠️ DEPRECATED Program functions
  addProgram: (program: Omit<Program, 'id'>) => string;
  updateProgram: (id: string, program: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  assignProgram: (clientId: string, programId: string) => void;
  assignProgramWithSchedule: (assignment: Omit<ProgramAssignment, 'id' | 'assignedAt'>) => string;
  unassignProgram: (assignmentId: string) => void;
  getProgramAssignmentsByClient: (clientId: string) => ProgramAssignment[];
  getProgramAssignmentsForDate: (date: string) => Array<ProgramAssignment & { client: Client; program: Program; programDay: ClientProgramDay | null }>;
  getClientProgramDay: (assignment: ProgramAssignment, targetDate: Date, program: Program) => ClientProgramDay | null;
  // ✅ NEW: ProgramTemplate functions
  addProgramTemplate: (template: Omit<ProgramTemplate, 'id' | 'createdAt'>) => string;
  updateProgramTemplate: (id: string, template: Partial<ProgramTemplate>) => void;
  deleteProgramTemplate: (id: string) => void;
  getProgramTemplateById: (id: string) => ProgramTemplate | undefined;
  // ✅ NEW: ProgramInstance functions
  createProgramInstance: (instance: Omit<ProgramInstance, 'id' | 'assignedAt'>) => string;
  updateProgramInstance: (id: string, instance: Partial<ProgramInstance>) => void;
  deleteProgramInstance: (id: string) => void;
  getProgramInstanceById: (id: string) => ProgramInstance | undefined;
  getProgramInstancesByClient: (clientId: string) => ProgramInstance[];
  getActiveProgramInstance: (clientId: string) => ProgramInstance | undefined;
  getClientById: (id: string) => Client | undefined;
  getTrainerById: (id: string) => Trainer | undefined;
  getTrainerByUsername: (username: string) => Trainer | undefined;
  getSessionById: (id: string) => WorkoutSession | undefined;
  getProgramById: (id: string) => Program | undefined;
  getExerciseById: (id: string) => Exercise | undefined;
  addCalendarNote: (note: Omit<CalendarNote, 'id' | 'createdAt'>) => string;
  updateCalendarNote: (id: string, note: Partial<CalendarNote>) => void;
  deleteCalendarNote: (id: string) => void;
  getNotesForDate: (date: string) => CalendarNote[];
  createConnectionRequest: (clientId: string, trainerId: string, message?: string) => ConnectionRequest;
  updateConnectionRequest: (id: string, updates: Partial<ConnectionRequest>) => void;
  getConnectionRequestById: (id: string) => ConnectionRequest | undefined;
  getConnectionRequestsByClientId: (clientId: string) => ConnectionRequest[];
  getConnectionRequestsByTrainerId: (trainerId: string) => ConnectionRequest[];
  linkClientToTrainer: (clientEmail: string, trainerUsername: string) => { success: boolean; message: string; trainerId?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    phone: '081-234-5678',
    goal: 'ลดน้ำหนัก 5 กิโล',
    primaryGoal: 'weight_loss', // ✅ เพิ่ม
    status: 'active',
    tags: ['weight-loss', 'beginner'],
    joinDate: '2024-01-15',
    nextSession: '2024-09-24T10:00:00',
    currentProgram: 'program-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 75, bodyFat: 20, muscle: 35 },
    notes: 'มีปัญหาเข่าเล็กน้อย ต้องระวัง squat',
    userId: 'user-1',
    username: 'somchai',
    password: '1234',
    trainers: ['trainer-1'],
    joinedAt: '2024-01-15T10:00:00'
  },
  {
    id: 'client-2',
    name: 'มาลี สวยงาม',
    email: 'malee@example.com',
    phone: '082-345-6789',
    goal: 'เพิ่มกล้ามเนื้อ',
    primaryGoal: 'muscle_building', // ✅ เพิ่ม
    status: 'active',
    tags: ['muscle-gain', 'intermediate'],
    joinDate: '2024-02-01',
    nextSession: '2024-09-24T14:00:00',
    currentProgram: 'program-2',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 55, bodyFat: 18, muscle: 28 },
    notes: 'มีประสบการณ์การออกกำลังกายมาบ้างแล้ว',
    userId: 'user-2',
    username: 'malee',
    password: '1234',
    trainers: ['trainer-1', 'trainer-2'],
    joinedAt: '2024-02-01T14:00:00'
  },
  {
    id: 'client-3',
    name: 'ธนากร แข็งแรง',
    email: 'thanakorn@example.com',
    phone: '083-456-7890',
    goal: 'เพิ่มความแข็งแรง',
    primaryGoal: 'strength', // ✅ เพิ่ม
    status: 'paused',
    tags: ['strength', 'advanced'],
    joinDate: '2023-12-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 80, bodyFat: 15, muscle: 45 },
    notes: 'พักชั่วคราวเนื่องจากงานยุ่ง',
    userId: 'user-3',
    username: 'thanakorn',
    password: '1234',
    trainers: ['trainer-2'],
    joinedAt: '2023-12-01T10:00:00'
  },
  {
    id: 'client-4',
    name: 'น้องแพม',
    email: 'pam@example.com',
    phone: '084-567-8901',
    goal: 'สร้างกล้ามเนื้อและลดไขมัน',
    primaryGoal: 'muscle_building', // ✅ เพิ่ม
    status: 'active',
    tags: ['body-recomp', 'beginner'],
    joinDate: '2024-12-01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 60, bodyFat: 25, muscle: 25 },
    notes: 'เพิ่งเริ่มออกกำลังกาย มีความกระตือรือร้นสูง',
    username: 'pam',
    password: '1234',
    trainers: ['trainer-1']
  },
  {
    id: 'client-5',
    name: 'น้องเบส',
    email: 'bass@example.com',
    phone: '085-678-9012',
    goal: 'เพิ่มพละกำลัง',
    primaryGoal: 'general_health', // ✅ เพิ่ม
    status: 'active',
    tags: ['strength', 'beginner'],
    joinDate: '2024-12-05',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 70, bodyFat: 18, muscle: 35 },
    notes: 'มีพื้นฐานการออกกำลังกายมาบ้าง',
    username: 'bass',
    password: '1234',
    trainers: ['trainer-1']
  }
];

const mockTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'สมชาย ผู้ฝึก',
    email: 'trainer1@example.com',
    phone: '081-234-5678',
    specialty: 'ลดน้ำหนัก',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    username: 'john_trainer',
    trainerCode: 'JOHN2024'
  },
  {
    id: 'trainer-2',
    name: 'มาลี ผู้ฝึก',
    email: 'trainer2@example.com',
    phone: '082-345-6789',
    specialty: 'เพิ่มกล้ามเนื้อ',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    username: 'mary_trainer',
    trainerCode: 'MARY2024'
  }
];

// ✅ ใช้ Default Exercises แทน mockExercises
const mockExercises: Exercise[] = getDefaultExercisesWithIds();

const mockPrograms: Program[] = [
  {
    id: 'program-1',
    name: 'โปรแกรมลดน้ำหนัก 8 สัปดาห์',
    description: 'โปรแกรมสำหรับผู้เริ่มต้น เน้นการลดน้ำหนักและสร้างพื้นฐาน',
    duration: 8,
    daysPerWeek: 7,
    assignedClients: ['client-1'],
    createdAt: '2024-01-01',
    weeks: [
      // Week 1
      {
        weekNumber: 1,
        days: [
          {
            dayNumber: 1,
            name: 'Upper Body - Push',
            sections: [
              {
                id: 'w1d1-section-1',
                sectionType: 'main',
                sectionFormat: 'straight-sets',
                name: 'Push Exercises',
                exercises: [
                  { exerciseId: 'ex-2', sets: 3, reps: '12-15', weight: 'bodyweight', rest: 60, notes: 'เน้นท่าถูกต้อง' },
                  { exerciseId: 'ex-5', sets: 3, reps: '10-12', weight: '10', rest: 60, notes: 'ค่อยๆ เพิ่มน้ำหนัก' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Lower Body',
            sections: [
              {
                id: 'w1d2-section-1',
                sectionType: 'main',
                sectionFormat: 'straight-sets',
                name: 'Leg Day',
                exercises: [
                  { exerciseId: 'ex-1', sets: 4, reps: '15-20', weight: 'bodyweight', rest: 90, notes: 'ลงลึกให้ถึง' },
                  { exerciseId: 'ex-10', sets: 3, reps: '12-15', weight: 'bodyweight', rest: 60, notes: 'เน้นความมั่นคง' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Cardio & Core',
            sections: [
              {
                id: 'w1d3-section-1',
                sectionType: 'main',
                sectionFormat: 'circuit',
                name: 'Fat Burning',
                exercises: [
                  { exerciseId: 'ex-16', sets: 3, reps: '20', weight: 'bodyweight', rest: 30, notes: 'ทำให้เร็ว' },
                  { exerciseId: 'ex-18', sets: 3, reps: '30 sec', weight: 'bodyweight', rest: 30, notes: 'กล้ามหน้าท้อง' }
                ]
              }
            ]
          },
          {
            dayNumber: 4,
            name: 'Upper Body - Pull',
            sections: [
              {
                id: 'w1d4-section-1',
                sectionType: 'main',
                sectionFormat: 'straight-sets',
                name: 'Pull Exercises',
                exercises: [
                  { exerciseId: 'ex-3', sets: 3, reps: '8-10', weight: 'assisted', rest: 90, notes: 'ใช้แรงหลัก' },
                  { exerciseId: 'ex-4', sets: 3, reps: '12-15', weight: '8', rest: 60, notes: 'ดึงไปที่หน้าอก' }
                ]
              }
            ]
          },
          {
            dayNumber: 5,
            name: 'Full Body HIIT',
            sections: [
              {
                id: 'w1d5-section-1',
                sectionType: 'main',
                sectionFormat: 'circuit',
                name: 'HIIT Circuit',
                exercises: [
                  { exerciseId: 'ex-16', sets: 4, reps: '30', weight: 'bodyweight', rest: 20, notes: 'ทำเต็มที่' },
                  { exerciseId: 'ex-1', sets: 4, reps: '20', weight: 'bodyweight', rest: 20, notes: 'รักษาจังหวะ' },
                  { exerciseId: 'ex-2', sets: 4, reps: '15', weight: 'bodyweight', rest: 20, notes: 'ทำให้ถึง' }
                ]
              }
            ]
          },
          {
            dayNumber: 6,
            name: 'Rest Day',
            isRestDay: true,
            sections: []
          },
          {
            dayNumber: 7,
            name: 'Active Recovery',
            sections: [
              {
                id: 'w1d7-section-1',
                sectionType: 'warmup',
                sectionFormat: 'straight-sets',
                name: 'Stretching',
                exercises: [
                  { exerciseId: 'ex-20', sets: 3, reps: '10', weight: 'bodyweight', rest: 60, notes: 'ยืดเหยียดเบาๆ' }
                ]
              }
            ]
          }
        ]
      },
      // Week 2-8: คัดลอกจาก Week 1 แต่เพิ่มความหนักขึ้น
      ...Array.from({ length: 7 }, (_, weekIndex) => ({
        weekNumber: weekIndex + 2,
        days: [
          {
            dayNumber: 1,
            name: 'Upper Body - Push',
            sections: [
              {
                id: `w${weekIndex + 2}d1-section-1`,
                sectionType: 'main' as const,
                sectionFormat: 'straight-sets' as const,
                name: 'Push Exercises',
                exercises: [
                  { exerciseId: 'ex-2', sets: 3, reps: '12-15', weight: 'bodyweight', rest: 60, notes: 'เน้นท่าถูกต้อง' },
                  { exerciseId: 'ex-5', sets: 3, reps: '10-12', weight: '10', rest: 60, notes: 'ค่อยๆ เพิ่มน้ำหนัก' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Lower Body',
            sections: [
              {
                id: `w${weekIndex + 2}d2-section-1`,
                sectionType: 'main' as const,
                sectionFormat: 'straight-sets' as const,
                name: 'Leg Day',
                exercises: [
                  { exerciseId: 'ex-1', sets: 4, reps: '15-20', weight: 'bodyweight', rest: 90, notes: 'ลงลึกให้ถึง' },
                  { exerciseId: 'ex-10', sets: 3, reps: '12-15', weight: 'bodyweight', rest: 60, notes: 'เน้นความมั่นคง' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Cardio & Core',
            sections: [
              {
                id: `w${weekIndex + 2}d3-section-1`,
                sectionType: 'main' as const,
                sectionFormat: 'circuit' as const,
                name: 'Fat Burning',
                exercises: [
                  { exerciseId: 'ex-16', sets: 3, reps: '20', weight: 'bodyweight', rest: 30, notes: 'ทำให้เร็ว' },
                  { exerciseId: 'ex-18', sets: 3, reps: '30 sec', weight: 'bodyweight', rest: 30, notes: 'กล้ามหน้าท้อง' }
                ]
              }
            ]
          },
          {
            dayNumber: 4,
            name: 'Upper Body - Pull',
            sections: [
              {
                id: `w${weekIndex + 2}d4-section-1`,
                sectionType: 'main' as const,
                sectionFormat: 'straight-sets' as const,
                name: 'Pull Exercises',
                exercises: [
                  { exerciseId: 'ex-3', sets: 3, reps: '8-10', weight: 'assisted', rest: 90, notes: 'ใช้แรงหลัก' },
                  { exerciseId: 'ex-4', sets: 3, reps: '12-15', weight: '8', rest: 60, notes: 'ดึงไปที่หน้าอก' }
                ]
              }
            ]
          },
          {
            dayNumber: 5,
            name: 'Full Body HIIT',
            sections: [
              {
                id: `w${weekIndex + 2}d5-section-1`,
                sectionType: 'main' as const,
                sectionFormat: 'circuit' as const,
                name: 'HIIT Circuit',
                exercises: [
                  { exerciseId: 'ex-16', sets: 4, reps: '30', weight: 'bodyweight', rest: 20, notes: 'ทำเต็มที่' },
                  { exerciseId: 'ex-1', sets: 4, reps: '20', weight: 'bodyweight', rest: 20, notes: 'รักษาจังหวะ' },
                  { exerciseId: 'ex-2', sets: 4, reps: '15', weight: 'bodyweight', rest: 20, notes: 'ทำให้ถึง' }
                ]
              }
            ]
          },
          {
            dayNumber: 6,
            name: 'Rest Day',
            isRestDay: true,
            sections: []
          },
          {
            dayNumber: 7,
            name: 'Active Recovery',
            sections: [
              {
                id: `w${weekIndex + 2}d7-section-1`,
                sectionType: 'warmup' as const,
                sectionFormat: 'straight-sets' as const,
                name: 'Stretching',
                exercises: [
                  { exerciseId: 'ex-20', sets: 3, reps: '10', weight: 'bodyweight', rest: 60, notes: 'ยืดเหยียดเบาๆ' }
                ]
              }
            ]
          }
        ]
      }))
    ]
  },
  {
    id: 'program-2',
    name: 'โปรแกรมเพิ่มกล้ามเนื้อ 12 สัปดาห์',
    description: 'โปรแกรมสำหรับการเพิ่มกล้ามเนื้อและความแข็งแรง',
    duration: 12,
    daysPerWeek: 4,
    assignedClients: ['client-2'],
    createdAt: '2024-02-01',
    weeks: [
      {
        weekNumber: 1,
        days: [
          {
            dayNumber: 1,
            name: 'Push Day',
            sections: [
              {
                id: 'section-2',
                sectionType: 'main',
                sectionFormat: 'straight-sets',
                name: 'Push Day',
                exercises: [
                  {
                    exerciseId: 'ex-2',
                    sets: 4,
                    reps: '8-10',
                    weight: '75%',
                    rest: 90,
                    notes: 'Progressive overload'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const mockSessions: WorkoutSession[] = [
  {
    id: 'session-1',
    clientId: 'client-1',
    programId: 'program-1',
    date: '2024-09-24T10:00:00',
    status: 'scheduled',
    exercises: []
  },
  {
    id: 'session-2',
    clientId: 'client-2',
    programId: 'program-2',
    date: '2024-09-24T14:00:00',
    status: 'scheduled',
    exercises: []
  },
  {
    id: 'session-3',
    clientId: 'client-1',
    date: '2024-09-23T10:00:00',
    status: 'completed',
    exercises: [
      {
        exerciseId: 'ex-1',
        sets: [
          { reps: 15, weight: 40, rpe: 7, rest: 60, completed: true },
          { reps: 12, weight: 40, rpe: 8, rest: 60, completed: true },
          { reps: 10, weight: 40, rpe: 9, rest: 60, completed: true }
        ]
      }
    ],
    duration: 45,
    summary: 'การฝึกที่ดี ฟอร์มดีขึ้น'
  }
];

const mockCalendarNotes: CalendarNote[] = [
  {
    id: 'note-1',
    date: '2024-09-25',
    type: 'note',
    title: 'การประชุมทีม',
    content: 'มีการประชุมทีมวันนี้ เวลา 10:00 น.',
    createdAt: '2024-09-24T16:00:00'
  },
  {
    id: 'note-2',
    date: '2024-09-26',
    type: 'rest-day',
    createdAt: '2024-09-25T16:00:00'
  }
];

const mockProgramAssignments: ProgramAssignment[] = [
  {
    id: 'assignment-1',
    clientId: 'client-1',
    programId: 'program-1',
    assignmentStartDate: '2024-09-24',
    startingDay: 1,
    notifyClient: true,
    assignedAt: '2024-09-24T10:00:00'
  },
  {
    id: 'assignment-2',
    clientId: 'client-2',
    programId: 'program-2',
    assignmentStartDate: '2024-09-24',
    startingDay: 1,
    notifyClient: true,
    assignedAt: '2024-09-24T14:00:00'
  }
];

const mockConnectionRequests: ConnectionRequest[] = [
  {
    id: 'request-1',
    clientId: 'client-4',
    trainerId: 'trainer-1',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    message: 'สวัสดีครับ ผมอยากเทรนกับคุณครับ รบกวนด้วยนะครับ 🙏'
  },
  {
    id: 'request-2',
    clientId: 'client-5',
    trainerId: 'trainer-1',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    message: 'ขอเชื่อมโยงกับคุณครับ ผมเพิ่งสมัครใหม่'
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [sessions, setSessions] = useState<WorkoutSession[]>(mockSessions);
  const [programs, setPrograms] = useState<Program[]>(mockPrograms); // ⚠️ DEPRECATED
  const [programTemplates, setProgramTemplates] = useState<ProgramTemplate[]>(mockPrograms); // ✅ ใช้ mockPrograms ชั่วคราว
  const [programInstances, setProgramInstances] = useState<ProgramInstance[]>([]); // ✅ เริ่มต้นว่าง
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>(mockCalendarNotes);
  const [programAssignments, setProgramAssignments] = useState<ProgramAssignment[]>(mockProgramAssignments); // ⚠️ DEPRECATED
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(mockConnectionRequests);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedClients = localStorage.getItem('trainer-app-clients');
    const storedTrainers = localStorage.getItem('trainer-app-trainers');
    const storedExercises = localStorage.getItem('trainer-app-exercises');
    const storedSessions = localStorage.getItem('trainer-app-sessions');
    const storedPrograms = localStorage.getItem('trainer-app-programs');
    const storedProgramTemplates = localStorage.getItem('trainer-app-program-templates'); // ✅ เพิ่ม
    const storedProgramInstances = localStorage.getItem('trainer-app-program-instances'); // ✅ เพิ่ม
    const storedCalendarNotes = localStorage.getItem('trainer-app-calendar-notes');
    const storedProgramAssignments = localStorage.getItem('trainer-app-program-assignments');
    const storedConnectionRequests = localStorage.getItem('trainer-app-connection-requests');

    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedTrainers) setTrainers(JSON.parse(storedTrainers));
    if (storedExercises) setExercises(JSON.parse(storedExercises));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    if (storedPrograms) setPrograms(JSON.parse(storedPrograms));
    if (storedProgramTemplates) {
      try {
        const templates = JSON.parse(storedProgramTemplates);
        // ✅ Validate ว่า templates มี weeks
        const validTemplates = templates.filter((t: ProgramTemplate) => {
          if (!t.weeks || !Array.isArray(t.weeks)) {
            console.warn('Invalid template found (missing weeks):', t);
            return false;
          }
          return true;
        });
        setProgramTemplates(validTemplates);
      } catch (e) {
        console.error('Failed to parse program templates:', e);
        setProgramTemplates(mockPrograms);
      }
    }
    if (storedProgramInstances) setProgramInstances(JSON.parse(storedProgramInstances)); // ✅ เพิ่ม
    if (storedCalendarNotes) setCalendarNotes(JSON.parse(storedCalendarNotes));
    if (storedProgramAssignments) setProgramAssignments(JSON.parse(storedProgramAssignments));
    if (storedConnectionRequests) setConnectionRequests(JSON.parse(storedConnectionRequests));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('trainer-app-clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('trainer-app-trainers', JSON.stringify(trainers));
  }, [trainers]);

  useEffect(() => {
    localStorage.setItem('trainer-app-exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('trainer-app-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('trainer-app-programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('trainer-app-calendar-notes', JSON.stringify(calendarNotes));
  }, [calendarNotes]);

  useEffect(() => {
    localStorage.setItem('trainer-app-program-assignments', JSON.stringify(programAssignments));
  }, [programAssignments]);

  // ✅ เพิ่ม: save programTemplates และ programInstances
  useEffect(() => {
    localStorage.setItem('trainer-app-program-templates', JSON.stringify(programTemplates));
  }, [programTemplates]);

  useEffect(() => {
    localStorage.setItem('trainer-app-program-instances', JSON.stringify(programInstances));
  }, [programInstances]);

  useEffect(() => {
    localStorage.setItem('trainer-app-connection-requests', JSON.stringify(connectionRequests));
  }, [connectionRequests]);

  const generateId = () => crypto.randomUUID();

  const addClient = (client: Omit<Client, 'id'>) => {
    const id = generateId();
    const newClient = { ...client, id };
    setClients(prev => [...prev, newClient]);
    return id;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const addTrainer = (trainer: Omit<Trainer, 'id'>) => {
    const id = generateId();
    const newTrainer = { ...trainer, id };
    setTrainers(prev => [...prev, newTrainer]);
    return id;
  };

  const updateTrainer = (id: string, updates: Partial<Trainer>) => {
    setTrainers(prev => prev.map(trainer => 
      trainer.id === id ? { ...trainer, ...updates } : trainer
    ));
  };

  const deleteTrainer = (id: string) => {
    setTrainers(prev => prev.filter(trainer => trainer.id !== id));
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const id = generateId();
    const newExercise = { ...exercise, id };
    setExercises(prev => [...prev, newExercise]);
    return id;
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === id ? { ...exercise, ...updates } : exercise
    ));
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const addSession = (session: Omit<WorkoutSession, 'id'>) => {
    const id = generateId();
    const newSession = { ...session, id };
    setSessions(prev => [...prev, newSession]);
    return id;
  };

  const updateSession = (id: string, updates: Partial<WorkoutSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, ...updates } : session
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  const addProgram = (program: Omit<Program, 'id'>) => {
    const id = generateId();
    const newProgram = { ...program, id };
    setPrograms(prev => [...prev, newProgram]);
    return id;
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(program => 
      program.id === id ? { ...program, ...updates } : program
    ));
  };

  const deleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(program => program.id !== id));
  };

  // ⚠️ DEPRECATED: assignProgram - Use createProgramInstance instead
  // This function is kept for backward compatibility only
  const assignProgram = (clientId: string, programId: string) => {
    // Old schema - no longer used
    updateClient(clientId, { currentProgram: programId });
    updateProgramTemplate(programId, {
      assignedClients: programTemplates.find(p => p.id === programId)?.assignedClients.includes(clientId) 
        ? programTemplates.find(p => p.id === programId)?.assignedClients || []
        : [...(programTemplates.find(p => p.id === programId)?.assignedClients || []), clientId]
    });
  };

  const assignProgramWithSchedule = (assignment: Omit<ProgramAssignment, 'id' | 'assignedAt'>) => {
    const id = generateId();
    const newAssignment = { ...assignment, id, assignedAt: new Date().toISOString() };
    setProgramAssignments(prev => [...prev, newAssignment]);
    return id;
  };

  const unassignProgram = (assignmentId: string) => {
    setProgramAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
  };

  const getProgramAssignmentsByClient = (clientId: string) => programAssignments.filter(assignment => assignment.clientId === clientId);

  const getProgramAssignmentsForDate = (date: string) => {
    const targetDate = new Date(date);
    return programAssignments.map(assignment => {
      const client = getClientById(assignment.clientId);
      const program = getProgramById(assignment.programId);
      const programDay = getClientProgramDay(assignment, targetDate, program);
      return { ...assignment, client, program, programDay };
    }).filter(item => item.programDay !== null);
  };

  const getClientProgramDay = (assignment: ProgramAssignment, targetDate: Date, program: Program | undefined): ClientProgramDay | null => {
    if (!program) return null;
    
    const startDate = new Date(assignment.assignmentStartDate);
    startDate.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // ยังไม่ถึงวันเริ่มต้น
    if (daysPassed < 0) return null;
    
    // คำนว program day ปัจจุบัน
    const currentProgramDay = assignment.startingDay + daysPassed;
    
    // หา day data จาก program
    for (const week of program.weeks) {
      for (const day of week.days) {
        if (day.dayNumber === currentProgramDay) {
          return {
            dayNumber: currentProgramDay,
            dayData: day,
            weekNumber: week.weekNumber
          };
        }
      }
    }
    
    // เกินโปรแกรมแล้ว
    return null;
  };

  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getTrainerById = (id: string) => trainers.find(trainer => trainer.id === id);
  const getTrainerByUsername = (username: string) => trainers.find(trainer => trainer.username === username);
  const getSessionById = (id: string) => sessions.find(session => session.id === id);
  const getProgramById = (id: string) => programs.find(program => program.id === id);
  const getExerciseById = (id: string) => exercises.find(exercise => exercise.id === id);

  const addCalendarNote = (note: Omit<CalendarNote, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNote = { ...note, id, createdAt: new Date().toISOString() };
    setCalendarNotes(prev => [...prev, newNote]);
    return id;
  };

  const updateCalendarNote = (id: string, updates: Partial<CalendarNote>) => {
    setCalendarNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  const deleteCalendarNote = (id: string) => {
    setCalendarNotes(prev => prev.filter(note => note.id !== id));
  };

  const getNotesForDate = (date: string) => calendarNotes.filter(note => note.date === date);

  const createConnectionRequest = (clientId: string, trainerId: string, message?: string) => {
    const id = generateId();
    const newRequest: ConnectionRequest = {
      id,
      clientId,
      trainerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      message
    };
    setConnectionRequests(prev => [...prev, newRequest]);
    return newRequest;
  };

  const updateConnectionRequest = (id: string, updates: Partial<ConnectionRequest>) => {
    setConnectionRequests(prev => prev.map(request => 
      request.id === id ? { ...request, ...updates } : request
    ));
  };

  const getConnectionRequestById = (id: string) => connectionRequests.find(request => request.id === id);
  const getConnectionRequestsByClientId = (clientId: string) => connectionRequests.filter(request => request.clientId === clientId);
  const getConnectionRequestsByTrainerId = (trainerId: string) => connectionRequests.filter(request => request.trainerId === trainerId);

  const linkClientToTrainer = (clientEmail: string, trainerUsername: string) => {
    //  1. หาเทรนเนอร์จาก username
    const trainer = trainers.find(t => t.username.toLowerCase() === trainerUsername.toLowerCase());
    
    if (!trainer) {
      return { success: false, message: 'ไม่พบ Username ของเทรนเนอร์นี้ในระบบ' };
    }

    // 2. เช็คว่าเทรนเนอร์มีลกเทรนที่มี email ตรงกันหรือไม่
    const trainerClient = clients.find(c => 
      c.email.toLowerCase() === clientEmail.toLowerCase() && 
      !c.userId && // ยังไม่มี userId = เทรนเนอร์เพิ่มไว้
      trainer.clients?.includes(c.id)
    );
    
    if (!trainerClient) {
      return { 
        success: false, 
        message: `ไม่พบอีเมลนี้ในรายชื่อลูกเทรนของเทรนเนอร์ "${trainer.name}" กรุณาให้เทรนเนอร์เพิ่มข้อมูลก่อนทำการเชื่อมโยง` 
      };
    }

    // 3. หาบัญชีลูกเทรนที่สมัครแล้ว (มี userId)
    const clientAccount = clients.find(c => c.email.toLowerCase() === clientEmail.toLowerCase() && c.userId);
    
    if (!clientAccount) {
      return { success: false, message: 'ไม่พบบัญชีลูกเทรนนี้ กรุณาให้ลูกเทรนสมัครสมาชิกก่อน' };
    }

    // 4. เชื่อมโยง: เพิ่ม trainer ID เข้า client.trainers
    const existingTrainers = clientAccount.trainers || [];
    if (existingTrainers.includes(trainer.id)) {
      return { success: false, message: 'คุณเชื่อมโยงกับเทรนเนอร์คนนี้แล้ว' };
    }

    updateClient(clientAccount.id, { 
      trainers: [...existingTrainers, trainer.id] 
    });

    return { 
      success: true, 
      message: `เชื่อมโยงสำเร็จกับเทรนเนอร์ "${trainer.name}"`, 
      trainerId: trainer.id 
    };
  };

  // ✅ NEW: ProgramTemplate functions
  const addProgramTemplate = (template: Omit<ProgramTemplate, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newTemplate: ProgramTemplate = {
      ...template,
      id,
      createdAt: new Date().toISOString(),
    };
    setProgramTemplates(prev => [...prev, newTemplate]);
    return id;
  };

  const updateProgramTemplate = (id: string, template: Partial<ProgramTemplate>) => {
    setProgramTemplates(prev => prev.map(t => t.id === id ? { ...t, ...template } : t));
  };

  const deleteProgramTemplate = (id: string) => {
    setProgramTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getProgramTemplateById = (id: string) => {
    return programTemplates.find(t => t.id === id);
  };

  // ✅ NEW: ProgramInstance functions
  const createProgramInstance = (instance: Omit<ProgramInstance, 'id' | 'assignedAt'>) => {
    const id = generateId();
    const newInstance: ProgramInstance = {
      ...instance,
      id,
      assignedAt: new Date().toISOString(),
    };
    setProgramInstances(prev => [...prev, newInstance]);
    return id;
  };

  const updateProgramInstance = (id: string, instance: Partial<ProgramInstance>) => {
    setProgramInstances(prev => prev.map(i => i.id === id ? { ...i, ...instance } : i));
  };

  const deleteProgramInstance = (id: string) => {
    setProgramInstances(prev => prev.filter(i => i.id !== id));
  };

  const getProgramInstanceById = (id: string) => {
    return programInstances.find(i => i.id === id);
  };

  const getProgramInstancesByClient = (clientId: string) => {
    return programInstances.filter(i => i.clientId === clientId);
  };

  const getActiveProgramInstance = (clientId: string) => {
    return programInstances.find(i => i.clientId === clientId && i.status === 'active');
  };

  return (
    <AppContext.Provider value={{
      clients,
      trainers,
      exercises,
      sessions,
      programs,
      calendarNotes,
      programAssignments,
      connectionRequests,
      addClient,
      updateClient,
      deleteClient,
      addTrainer,
      updateTrainer,
      deleteTrainer,
      addExercise,
      updateExercise,
      deleteExercise,
      addSession,
      updateSession,
      deleteSession,
      addProgram,
      updateProgram,
      deleteProgram,
      assignProgram,
      assignProgramWithSchedule,
      unassignProgram,
      getProgramAssignmentsByClient,
      getProgramAssignmentsForDate,
      getClientProgramDay,
      getClientById,
      getTrainerById,
      getTrainerByUsername,
      getSessionById,
      getProgramById,
      getExerciseById,
      addCalendarNote,
      updateCalendarNote,
      deleteCalendarNote,
      getNotesForDate,
      createConnectionRequest,
      updateConnectionRequest,
      getConnectionRequestById,
      getConnectionRequestsByClientId,
      getConnectionRequestsByTrainerId,
      linkClientToTrainer,
      // ✅ NEW: ProgramTemplate & ProgramInstance
      programTemplates,
      programInstances,
      addProgramTemplate,
      updateProgramTemplate,
      deleteProgramTemplate,
      getProgramTemplateById,
      createProgramInstance,
      updateProgramInstance,
      deleteProgramInstance,
      getProgramInstanceById,
      getProgramInstancesByClient,
      getActiveProgramInstance
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}