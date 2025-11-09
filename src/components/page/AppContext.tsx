import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

export interface Exercise {
  id: string;
  name: string;
  modality: 'strength' | 'cardio' | 'flexibility' | 'mobility';
  muscleGroups: string[];
  movementPattern: string;
  instructions: string;
  category: string;
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  programId?: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  exercises: SessionExercise[];
  duration?: number;
  notes?: string;
  summary?: string;
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

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  daysPerWeek: number;
  weeks: ProgramWeek[];
  assignedClients: string[];
  createdAt: string;
}

export interface ProgramWeek {
  weekNumber: number;
  days: ProgramDay[];
}

export interface ProgramDay {
  dayNumber: number;
  name: string;
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string; // e.g., "8-12", "AMRAP"
  weight?: string; // e.g., "70%", "RPE 8"
  rest: number; // seconds
  notes?: string;
}

interface AppContextType {
  clients: Client[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  programs: Program[];
  addClient: (client: Omit<Client, 'id'>) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => string;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  addSession: (session: Omit<WorkoutSession, 'id'>) => string;
  updateSession: (id: string, session: Partial<WorkoutSession>) => void;
  addProgram: (program: Omit<Program, 'id'>) => string;
  updateProgram: (id: string, program: Partial<Program>) => void;
  assignProgram: (clientId: string, programId: string) => void;
  getClientById: (id: string) => Client | undefined;
  getSessionById: (id: string) => WorkoutSession | undefined;
  getProgramById: (id: string) => Program | undefined;
  getExerciseById: (id: string) => Exercise | undefined;
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
    status: 'active',
    tags: ['weight-loss', 'beginner'],
    joinDate: '2024-01-15',
    nextSession: '2024-09-24T10:00:00',
    currentProgram: 'program-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 75, bodyFat: 20, muscle: 35 },
    notes: 'มีปัญหาเข่าเล็กน้อย ต้องระวัง squat'
  },
  {
    id: 'client-2',
    name: 'มาลี สวยงาม',
    email: 'malee@example.com',
    phone: '082-345-6789',
    goal: 'เพิ่มกล้ามเนื้อ',
    status: 'active',
    tags: ['muscle-gain', 'intermediate'],
    joinDate: '2024-02-01',
    nextSession: '2024-09-24T14:00:00',
    currentProgram: 'program-2',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 55, bodyFat: 18, muscle: 28 },
    notes: 'มีประสบการณ์การออกกำลังกายมาบ้างแล้ว'
  },
  {
    id: 'client-3',
    name: 'ธนากร แข็งแรง',
    email: 'thanakorn@example.com',
    phone: '083-456-7890',
    goal: 'เพิ่มความแข็งแรง',
    status: 'paused',
    tags: ['strength', 'advanced'],
    joinDate: '2023-12-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    metrics: { weight: 80, bodyFat: 15, muscle: 45 },
    notes: 'พักชั่วคราวเนื่องจากงานยุ่ง'
  }
];

const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Barbell Squat',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
    movementPattern: 'Squat',
    instructions: 'ยืนกางขาเท่าไหล่ ค่อยๆ นั่งลงจนต้นขาขาดกับพื้น แล้วยืนขึ้น',
    category: 'Compound'
  },
  {
    id: 'ex-2',
    name: 'Bench Press',
    modality: 'strength',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    movementPattern: 'Push',
    instructions: 'นอนบนเก้าอี้ ดันบาร์เบลขึ้นจากหน้าอกจนแขนตึง',
    category: 'Compound'
  },
  {
    id: 'ex-3',
    name: 'Deadlift',
    modality: 'strength',
    muscleGroups: ['Hamstrings', 'Glutes', 'Back'],
    movementPattern: 'Hinge',
    instructions: 'ยืนหลังตรง ค่อยๆ ก้มลงยกบาร์เบลขึ้นมา',
    category: 'Compound'
  },
  {
    id: 'ex-4',
    name: 'Treadmill Running',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Core'],
    movementPattern: 'Locomotion',
    instructions: 'วิ่งบนลู่วิ่งด้วยความเร็วและระยะเวลาที่กำหนด',
    category: 'Cardio'
  }
];

const mockPrograms: Program[] = [
  {
    id: 'program-1',
    name: 'โปรแกรมลดน้ำหนัก 8 สัปดาห์',
    description: 'โปรแกรมสำหรับผู้เริ่มต้น เน้นการลดน้ำหนักและสร้างพื้นฐาน',
    duration: 8,
    daysPerWeek: 3,
    assignedClients: ['client-1'],
    createdAt: '2024-01-01',
    weeks: [
      {
        weekNumber: 1,
        days: [
          {
            dayNumber: 1,
            name: 'Upper Body',
            exercises: [
              {
                exerciseId: 'ex-2',
                sets: 3,
                reps: '12-15',
                weight: 'bodyweight',
                rest: 60,
                notes: 'เน้นท่าถูกต้อง'
              }
            ]
          }
        ]
      }
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
    summary: 'เซสชันที่ดี ฟอร์มดีขึ้น'
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [sessions, setSessions] = useState<WorkoutSession[]>(mockSessions);
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedClients = localStorage.getItem('trainer-app-clients');
    const storedExercises = localStorage.getItem('trainer-app-exercises');
    const storedSessions = localStorage.getItem('trainer-app-sessions');
    const storedPrograms = localStorage.getItem('trainer-app-programs');

    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedExercises) setExercises(JSON.parse(storedExercises));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    if (storedPrograms) setPrograms(JSON.parse(storedPrograms));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('trainer-app-clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('trainer-app-exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('trainer-app-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('trainer-app-programs', JSON.stringify(programs));
  }, [programs]);

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

  const assignProgram = (clientId: string, programId: string) => {
    updateClient(clientId, { currentProgram: programId });
    updateProgram(programId, {
      assignedClients: programs.find(p => p.id === programId)?.assignedClients.includes(clientId) 
        ? programs.find(p => p.id === programId)?.assignedClients || []
        : [...(programs.find(p => p.id === programId)?.assignedClients || []), clientId]
    });
  };

  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getSessionById = (id: string) => sessions.find(session => session.id === id);
  const getProgramById = (id: string) => programs.find(program => program.id === id);
  const getExerciseById = (id: string) => exercises.find(exercise => exercise.id === id);

  return (
    <AppContext.Provider value={{
      clients,
      exercises,
      sessions,
      programs,
      addClient,
      updateClient,
      deleteClient,
      addExercise,
      updateExercise,
      addSession,
      updateSession,
      addProgram,
      updateProgram,
      assignProgram,
      getClientById,
      getSessionById,
      getProgramById,
      getExerciseById
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