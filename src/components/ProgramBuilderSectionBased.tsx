import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Copy,
  Edit,
  Trash,
  Users,
  Search,
  Dumbbell,
  Clock,
  Repeat,
  Weight,
  MoreHorizontal,
  Star,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  Flame,
  Activity,
  Wind,
  Target,
  Timer,
  Zap,
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Minus,
  Moon,
  Bell,
  Info,
  ChevronUp,
  LayoutGrid,
  Save,
  Hash,
  TrendingUp,
  MessageSquare,
  MoveRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  useApp,
  Program,
  ProgramDay,
  ProgramSection,
  ProgramExercise
} from "./AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

interface ProgramWithMeta extends Program {
  isTemplate?: boolean;
  assigned_client_count?: number;
  clientId?: string;
  originalTemplateId?: string;
}

interface ExerciseSet {
  setNumber: number;
  reps?: string;
  weight?: string;
  duration?: string;
  distance?: string;
  rest?: number;
  rpe?: number;
  notes?: string;
}

interface NewSectionExercise {
  exerciseId: string;
  sets: ExerciseSet[];
}

interface DaySchedule {
  dayNumber: number;
  scheduledDate: string; // ISO date string
  scheduledTime?: string; // HH:MM format
}

const SECTION_TYPES = [
  { value: 'warmup', label: 'Warm-up (อบอุ่นร่างกาย)', icon: Flame, color: 'text-orange-500' },
  { value: 'main', label: 'Main Work (ฝึกซ้อมหลัก)', icon: Dumbbell, color: 'text-blue-500' },
  { value: 'skill', label: 'Skill Development (พัฒนาทักษะ)', icon: Target, color: 'text-purple-500' },
  { value: 'cooldown', label: 'Cool-down (คลายกล้ามเนื้อ)', icon: Wind, color: 'text-green-500' },
  { value: 'custom', label: 'Custom (กำหนดเอง)', icon: Settings, color: 'text-gray-500' },
];

const SECTION_FORMATS = [
  { value: 'straight-sets', label: 'Straight Sets', description: 'เซ็ตปกติ ทำครบเซ็ตก่อนเปลี่ยนท่า' },
  { value: 'circuit', label: 'Circuit Training', description: 'ทำทุกท่าเป็นรอบ พักตอนจบรอบ' },
  { value: 'superset', label: 'Superset', description: 'ทำ 2 ท่าติดกันไม่พัก' },
  { value: 'amrap', label: 'AMRAP', description: 'ทำให้ได้มากที่สุดในเวลาที่กำหนด' },
  { value: 'emom', label: 'EMOM', description: 'ทำทุกนาทีที่เริ่มต้น' },
  { value: 'tabata', label: 'Tabata', description: '20 วิทำ 10 วิพัก' },
  { value: 'custom', label: 'Custom', description: 'กำหนดเอง' },
];

// Set Presets ตามหลักวิทยาศาสตร์การกีฬา
// อ้างอิง: หลักการฝึกซ้อมตามมาตรฐานวิทยาศาสตร์การกีฬา
const SET_PRESETS = {
  strength: {
    // Resistance/Muscular Training (3-5 sets, 15-30 reps, 30-90s rest, ≤60% 1RM for safety)
    moderate: {
      name: 'Moderate Endurance (ความทนทานปานกลาง)',
      icon: Dumbbell,
      sets: 3,
      reps: '15',
      rest: 60,
      rpe: 6,
      description: '3 sets × 15 reps, พัก 60s',
      scienceNote: 'เหมาะสำหรับการฝึกความทนทานกล้ามเนื้อระดับปานกลาง (15-20 reps)',
      physiologicalEffects: 'พัฒนา Muscle Endurance, เพิ่ม Muscle Tone และความแข็งแรงของ Tendon/Ligament'
    },
    standard: {
      name: 'Standard Training (มาตรฐาน)',
      icon: Weight,
      sets: 4,
      reps: '18',
      rest: 75,
      rpe: 7,
      description: '4 sets × 18 reps, พัก 75s',
      scienceNote: 'รูปแบบมาตรฐาน 3-5 sets, พัก 30-90 วินาที',
      physiologicalEffects: 'เพิ่ม Muscle Mass, Bone Density และพัฒนาระบบประสาทควบคุมกล้ามเนื้อ'
    },
    highEndurance: {
      name: 'High Endurance (ความทนทานสูง)',
      icon: Repeat,
      sets: 4,
      reps: '20',
      rest: 45,
      rpe: 7,
      description: '4 sets × 20 reps, พัก 45s',
      scienceNote: 'ฝึกความทนทานกล้ามเนื้อ 15-20 ครั้งต่อเซต',
      physiologicalEffects: 'กระตุ้นกล้ามเนื้อให้หดตัวได้แรงและเร็วขึ้น พัฒนา Muscle Power'
    },
    highVolume: {
      name: 'High Volume (ปริมาณสูง)',
      icon: Activity,
      sets: 5,
      reps: '25',
      rest: 90,
      rpe: 8,
      description: '5 sets × 25 reps, พัก 90s',
      scienceNote: 'เพิ่มปริมาณงาน 25-30 ครั้งต่อเซต สำหรับการพัฒนาสูงสุด',
      physiologicalEffects: 'เสริมสร้างความแข็งแรงของเนื้อเยื่ออ่อน รองรับการเคลื่อนไหวที่ใช้กำลังและความเร็ว'
    },
    maxVolume: {
      name: 'Maximum Volume (ปริมาณสูงสุด)',
      icon: Zap,
      sets: 5,
      reps: '30',
      rest: 90,
      rpe: 8,
      description: '5 sets × 30 reps, พัก 90s',
      scienceNote: 'ปริมาณสูงสุด 30 reps ต่อเซต ใช้น้ำหนักไม่เกิน 60% 1RM',
      physiologicalEffects: 'พัฒนา Anaerobic Capacity, เพิ่ม Muscle Strength และ Speed Training'
    }
  },
  cardio: {
    // Cardio/Aerobic Training
    intervalShort: {
      name: 'Short Interval (ช่วงสั้น)',
      icon: Zap,
      sets: 6,
      duration: '2',
      rest: 240,
      description: '6 รอบ × 2min, พัก 4min',
      scienceNote: 'Interval Training: 4-6 รอบ, 2-8 นาทีต่อรอบ, พัก 4-6 นาที',
      physiologicalEffects: 'เพิ่ม VO₂ Max 5-30%, พัฒนา Aerobic Capacity และระบบหัวใจ-ปอด'
    },
    intervalMedium: {
      name: 'Medium Interval (ช่วงกลาง)',
      icon: Activity,
      sets: 5,
      duration: '4',
      rest: 300,
      description: '5 รอบ × 4min, พัก 5min',
      scienceNote: 'เพิ่ม VO₂ Max ด้วย Interval 2-8 นาที',
      physiologicalEffects: 'เพิ่มการสะสม Glycogen, Myoglobin, Triglyceride ในกล้ามเนื้อ'
    },
    intervalLong: {
      name: 'Long Interval (ช่วงยาว)',
      icon: Timer,
      sets: 4,
      duration: '8',
      rest: 360,
      description: '4 รอบ × 8min, พัก 6min',
      scienceNote: 'Interval Training ระยะยาว เพื่อพัฒนาความอดทน',
      physiologicalEffects: 'พัฒนา Slow Twitch Fiber, เพิ่มประสิทธิภาพการใช้ออกซิเจน'
    },
    continuousShort: {
      name: 'Continuous Short (ต่อเนื่องสั้น)',
      icon: Clock,
      sets: 1,
      duration: '20',
      rest: 0,
      description: '1 set × 20min ต่อเนื่อง',
      scienceNote: 'Continuous Training 20-60 นาที, 3-5 วัน/สัปดาห์',
      physiologicalEffects: 'เพิ่มความหนาแน่นของ Capillaries, เพิ่ม Mitochondria ในกล้ามเนื้อ'
    },
    continuousMedium: {
      name: 'Continuous Medium (ต่อเนื่องกลาง)',
      icon: Timer,
      sets: 1,
      duration: '30',
      rest: 0,
      description: '1 set × 30min ต่อเนื่อง',
      scienceNote: 'ฝึกต่อเนื่อง 50-85% HRR (Heart Rate Reserve)',
      physiologicalEffects: 'เพิ่มขนาดและจำนวน Mitochondria, พัฒนาการผลิตพลังงานจากไขมัน'
    },
    continuousLong: {
      name: 'Continuous Long (ต่อเนื่องยาว)',
      icon: Activity,
      sets: 1,
      duration: '45',
      rest: 0,
      description: '1 set × 45min ต่อเนื่อง',
      scienceNote: 'Aerobic Training ระยะยาว 45-60 นาที',
      physiologicalEffects: 'เพิ่ม Glycogen Storage, พัฒนาความอดทนของระบบไหลเวียนเลือด'
    },
    continuousMax: {
      name: 'Continuous Max (ต่อเนื่องสูงสุด)',
      icon: Flame,
      sets: 1,
      duration: '60',
      rest: 0,
      description: '1 set × 60min ต่อเนื่อง',
      scienceNote: 'ระยะยาวสุด 60 นาที เพื่อความอดทนสูงสุด',
      physiologicalEffects: 'สังเคราะห์ ATP ได้เพิ่มขึ้น, ลดความเหนื่อยล้าในระหว่างการฟื้นสภาพ'
    }
  },
  flexibility: {
    // Flexibility Training (10-15 min total for cool down)
    cooldownShort: {
      name: 'Cool Down Short (คลายสั้น)',
      icon: Wind,
      sets: 1,
      duration: '10',
      rest: 0,
      description: 'ยืดเหยียด 10 นาที',
      scienceNote: 'Cool Down 10-15 นาที เพื่อฟื้นสภาพร่างกาย',
      physiologicalEffects: 'กำจัดของเสีย (Waste Products), ลดความตึงเครียดของกล้ามเนื้อ'
    },
    cooldownStandard: {
      name: 'Cool Down Standard (คลายมาตรฐาน)',
      icon: Moon,
      sets: 1,
      duration: '12',
      rest: 0,
      description: 'ยืดเหยียด 12 นาที',
      scienceNote: 'ยืดเหยียดกล้ามเนื้อและข้อต่อส่วนต่างๆ',
      physiologicalEffects: 'เพิ่ม Range of Motion, ลดความหนืด (Viscosity) ภายในกล้ามเนื้อ'
    },
    cooldownFull: {
      name: 'Cool Down Full (คลายเต็มรูปแบบ)',
      icon: Repeat,
      sets: 1,
      duration: '15',
      rest: 0,
      description: 'ยืดเหยียด 15 นาที',
      scienceNote: 'ฟื้นสภาพเต็มรูปแบบ กำจัดของเสียและลดความตึงกล้ามเนื้อ',
      physiologicalEffects: 'คืนสภาพร่างกายสู่ภาวะปกติ, ลดโอกาสการบาดเจ็บและฉีกขาดของกล้ามเนื้อ'
    },
    staticHold: {
      name: 'Static Hold (ยืดค้างท่า)',
      icon: Clock,
      sets: 2,
      duration: '30',
      rest: 15,
      description: '2 sets × 30s hold, พัก 15s',
      scienceNote: 'ยืดค้างท่า 30 วินาที ในจุดที่มีความตึงตัวสูง',
      physiologicalEffects: 'พัฒนาความยืดหยุ่น (Flexibility), เพิ่ม Mobility ของข้อต่อ'
    }
  },
  mobility: {
    // Mobility & Warm-up (15-20 min recommended)
    warmupShort: {
      name: 'Warm-up Short (อบอุ่นสั้น)',
      icon: Flame,
      sets: 1,
      duration: '15',
      rest: 0,
      description: 'อบอุ่นร่างกาย 15 นาที',
      scienceNote: 'Warm-up 15-20 นาที เตรียมระบบไหลเวียนและป้องกันการบาดเจ็บ',
      physiologicalEffects: 'เตรียมระบบหัวใจและไหลเวียนเลือด, ลดความเสี่ยงต่อการบาดเจ็บ'
    },
    warmupStandard: {
      name: 'Warm-up Standard (อบอุ่นมาตรฐาน)',
      icon: Target,
      sets: 1,
      duration: '18',
      rest: 0,
      description: 'อบอุ่นร่างกาย 18 นาที',
      scienceNote: 'เตรียมความพร้อมของระบบไหลเวียนเลือดและกล้ามเนื้อ',
      physiologicalEffects: 'สนับสนุนความเร็ว ความคล่องแคล่วว่องไว และความสัมพันธ์ในการเคลื่อนไหว'
    },
    warmupFull: {
      name: 'Warm-up Full (อบอุ่นเต็มรูปแบบ)',
      icon: Activity,
      sets: 1,
      duration: '20',
      rest: 0,
      description: 'อบอุ่นร่างกาย 20 นาที',
      scienceNote: 'Warm-up เต็มรูปแบบ ป้องกันการบาดเจ็บอย่างมีประสิทธิภาพ',
      physiologicalEffects: 'เพิ่มระยะการเคลื่อนไหวของข้อต่อ (ROM), ป้องกันการฉีกขาดของกล้ามเนื้อ'
    },
    dynamicPrep: {
      name: 'Dynamic Preparation (เตรียมแบบเคลื่อนไหว)',
      icon: Zap,
      sets: 2,
      reps: '12',
      rest: 30,
      description: '2 sets × 12 reps, พัก 30s',
      scienceNote: 'การเตรียมร่างกายแบบ dynamic เพื่อเพิ่มความพร้อม',
      physiologicalEffects: 'Dynamic Stretch + PNF ช่วยเพิ่ม Mobility และกระตุ้นระบบประสาท'
    }
  }
};

export default function ProgramBuilderSectionBased() {
  const navigate = useNavigate();
  const {
    programTemplates, // ✅ ใช้ programTemplates แทน programs
    exercises: contextExercises,
    clients,
    addProgramTemplate, // ✅ ใช้ addProgramTemplate แทน addProgram
    updateProgramTemplate, // ✅ ใช้ updateProgramTemplate แทน updateProgram
    deleteProgramTemplate, // ✅ ใช้ deleteProgramTemplate แทน deleteProgram
    addSession,
    assignProgramWithSchedule
  } = useApp();

  // State
  const [programs, setPrograms] = useState<ProgramWithMeta[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "template" | "custom">("all");

  // Create Program Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    isTemplate: true,
  });

  // Add Section Modal
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [newSection, setNewSection] = useState<Partial<ProgramSection>>({
    sectionType: 'warmup',
    sectionFormat: 'straight-sets',
    name: '',
    duration: 10,
    exercises: [],
    notes: '',
  });

  // Exercises for new section
  const [newSectionExercises, setNewSectionExercises] = useState<NewSectionExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetTargetExerciseIdx, setPresetTargetExerciseIdx] = useState<number | null>(null);

  // Workout Choice Dialog
  const [showWorkoutChoiceDialog, setShowWorkoutChoiceDialog] = useState(false);
  const [pendingWorkoutDay, setPendingWorkoutDay] = useState<{ weekNumber: number; dayNumber: number } | null>(null);

  // Add Exercise Modal (for existing sections)
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  // Assign Program Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignStartDate, setAssignStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assignStartDay, setAssignStartDay] = useState<number>(1);
  const [notifyClient, setNotifyClient] = useState<boolean>(true);
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  // Expanded states
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(["week-1-day-1"]));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // Day Options Dialog
  const [showDayOptionsDialog, setShowDayOptionsDialog] = useState(false);
  const [selectedDayForOptions, setSelectedDayForOptions] = useState<{weekNumber: number, dayNumber: number} | null>(null);

  // Load Programs
  useEffect(() => {
    const mappedData = programTemplates.map((p) => ({
      ...p,
      assigned_client_count: p.assignedClients?.length || 0,
      isTemplate: !p.clientId,
    }));
    setPrograms(mappedData);
  }, [programTemplates]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Filtered Programs
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "template" && program.isTemplate) ||
      (filterType === "custom" && !program.isTemplate);
    return matchesSearch && matchesFilter;
  });

  const templatePrograms = filteredPrograms.filter((p) => p.isTemplate);
  const customPrograms = filteredPrograms.filter((p) => !p.isTemplate);

  // Filtered Clients
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Create Program Handler
  const handleCreateProgram = () => {
    if (!createFormData.name.trim()) {
      toast.error("กรุณากรอกชื่อโปรแกรม");
      return;
    }

    const weeks = [
      {
        weekNumber: 1,
        days: Array.from({ length: 7 }).map((_, dayIdx) => ({
          dayNumber: dayIdx + 1,
          name: `Day ${dayIdx + 1}`,
          sections: [],
          isRestDay: false, // Default: all days are training days
        })),
      },
    ];

    const newProgramId = addProgramTemplate({
      name: createFormData.name,
      description: createFormData.description,
      duration: 1,
      daysPerWeek: 7,
      weeks: weeks,
      assignedClients: [],
      isTemplate: createFormData.isTemplate,
    } as any);

    toast.success(
      createFormData.isTemplate
        ? "สร้าง Template โปรแกรมเรียบร้อย"
        : "สร้างโปรแกรมเรียบร้อย"
    );
    setShowCreateModal(false);
    setCreateFormData({ name: "", description: "", isTemplate: true });
    setSelectedProgramId(newProgramId);
    setView("detail");
  };

  // Clone Program
  const handleCloneProgram = (programId: string, targetClientId?: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;

    const clonedId = addProgramTemplate({
      ...program,
      name: `${program.name} (Copy)`,
      assignedClients: targetClientId ? [targetClientId] : [],
      clientId: targetClientId,
      originalTemplateId: program.isTemplate ? program.id : program.originalTemplateId,
    } as any);

    toast.success("คัดลอกโปรแกรมเรียบร้อย");
    setSelectedProgramId(clonedId);
    setView("detail");
  };

  // Delete Program
  const handleDeleteProgram = (programId: string) => {
    setProgramToDelete(programId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProgram = () => {
    if (!programToDelete) return;

    const program = programs.find((p) => p.id === programToDelete);
    const programName = program?.name || "โปรแกรม";

    deleteProgramTemplate(programToDelete);
    
    // If we're viewing the deleted program, go back to list
    if (selectedProgramId === programToDelete) {
      setSelectedProgramId(null);
      setView("list");
    }

    toast.success(`ลบ "${programName}" เรียบร้อยแล้ว`);
    setShowDeleteModal(false);
    setProgramToDelete(null);
  };

  // Add/Remove Days
  const handleAddDay = () => {
    if (!selectedProgram) return;

    const totalDays = selectedProgram.weeks[0]?.days.length || 0;
    if (totalDays >= 7) {
      toast.error("ไม่สามารถเพิ่มได้เกิน 7 วันต่อสัปดาห์");
      return;
    }

    const updatedWeeks = selectedProgram.weeks.map((week) => {
      const currentMaxDay = Math.max(...week.days.map(d => d.dayNumber), 0);
      return {
        ...week,
        days: [
          ...week.days,
          {
            dayNumber: currentMaxDay + 1,
            name: `Day ${currentMaxDay + 1}`,
            sections: [],
            isRestDay: false,
          }
        ]
      };
    });

    updateProgramTemplate(selectedProgram.id, { 
      weeks: updatedWeeks,
      daysPerWeek: updatedWeeks[0].days.length
    });
    toast.success("เพิ่มวันเรียบร้อย");
  };

  const handleRemoveDay = (dayNumber: number) => {
    if (!selectedProgram) return;
    
    const totalDays = selectedProgram.weeks[0]?.days.length || 0;
    if (totalDays <= 1) {
      toast.error("ต้องมีอย่างน้อย 1 Day");
      return;
    }

    if (!confirm(`ต้องการลบ Day ${dayNumber}?`)) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.filter(d => d.dayNumber !== dayNumber)
        .map((day, idx) => ({
          ...day,
          dayNumber: idx + 1,
          name: `Day ${idx + 1}`
        }))
    }));

    updateProgramTemplate(selectedProgram.id, { 
      weeks: updatedWeeks,
      daysPerWeek: updatedWeeks[0].days.length
    });
    toast.success("ลบ Day เรียบร้อย");
  };

  // Add Week
  const handleAddWeek = () => {
    if (!selectedProgram) return;

    const currentMaxWeek = Math.max(...selectedProgram.weeks.map(w => w.weekNumber), 0);
    const daysInWeek = selectedProgram.weeks[0]?.days.length || 7;

    const newWeek = {
      weekNumber: currentMaxWeek + 1,
      days: Array.from({ length: daysInWeek }).map((_, dayIdx) => ({
        dayNumber: dayIdx + 1,
        name: `Day ${dayIdx + 1}`,
        sections: [],
        isRestDay: false,
      })),
    };

    const updatedWeeks = [...selectedProgram.weeks, newWeek];

    updateProgramTemplate(selectedProgram.id, { 
      weeks: updatedWeeks,
      duration: updatedWeeks.length
    });
    toast.success("เพิ่มสัปดาห์เรียบร้อย");
  };

  // Toggle Rest Day
  const handleToggleRestDay = (weekNumber: number, dayNumber: number) => {
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => 
      week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((day) =>
              day.dayNumber === dayNumber
                ? { ...day, isRestDay: !day.isRestDay }
                : day
            ),
          }
        : week
    );

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    
    const day = selectedProgram.weeks
      .find(w => w.weekNumber === weekNumber)?.days
      .find(d => d.dayNumber === dayNumber);
    
    toast.success(day?.isRestDay ? "เปลี่ยนเป็นวันฝึก" : "เปลี่ยนเป็นวันพัก");
  };

  // Set Training Frequency Preset
  const handleSetTrainingFrequency = (weekNumber: number, frequency: number) => {
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => {
      if (week.weekNumber !== weekNumber) return week;

      // Define preset patterns for different frequencies
      const patterns: Record<number, number[]> = {
        3: [1, 3, 5], // Mon, Wed, Fri
        4: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
        5: [1, 2, 3, 4, 5], // Mon-Fri
        6: [1, 2, 3, 4, 5, 6], // Mon-Sat
        7: [1, 2, 3, 4, 5, 6, 7], // Every day
      };

      const trainingDays = patterns[frequency] || [];

      return {
        ...week,
        days: week.days.map((day) => ({
          ...day,
          isRestDay: !trainingDays.includes(day.dayNumber),
        })),
      };
    });

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success(`ตั้งค่าความถี่ฝึก ${frequency} วัน/สัปดาห์`);
  };

  // Add Exercise to New Section
  const handleAddExerciseToNewSection = (exerciseId: string) => {
    const exercise = contextExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    if (newSectionExercises.some(ex => ex.exerciseId === exerciseId)) {
      toast.error("ท่านี้ถูกเพิ่มแล้ว");
      return;
    }

    const defaultSets: ExerciseSet[] = [];
    const numSets = 3;

    for (let i = 1; i <= numSets; i++) {
      if (exercise.modality === 'strength') {
        defaultSets.push({
          setNumber: i,
          reps: "10",
          weight: "0",
          rest: 60,
        });
      } else if (exercise.modality === 'cardio') {
        defaultSets.push({
          setNumber: i,
          duration: "5",
          distance: "0",
          rest: 60,
        });
      } else {
        defaultSets.push({
          setNumber: i,
          duration: "30",
          rest: 30,
        });
      }
    }

    setNewSectionExercises([
      ...newSectionExercises,
      {
        exerciseId,
        sets: defaultSets,
      },
    ]);

    setShowExercisePicker(false);
    setExerciseSearchTerm("");
    toast.success("เพิ่มท่าฝึกเรียบร้อย");
  };

  // Add Exercise Directly (สร้าง Section อัตโนมัติ)
  const handleAddExerciseDirectly = (exerciseId: string) => {
    if (!selectedProgram || !pendingWorkoutDay) return;

    const exercise = contextExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    // สร้าง default sets ตาม modality
    let defaultSets: ExerciseSet[] = [];
    if (exercise.modality === 'strength') {
      defaultSets = Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: "10",
        weight: "0",
        rest: 60,
      }));
    } else if (exercise.modality === 'cardio') {
      defaultSets = Array.from({ length: 1 }, (_, i) => ({
        setNumber: i + 1,
        duration: "10",
        distance: "0",
        rest: 60,
      }));
    } else {
      defaultSets = Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        duration: "30",
        rest: 30,
      }));
    }

    // สร้าง Section ใหม่อัตโนมัติ
    const newSection: WorkoutSection = {
      id: `section-${Date.now()}`,
      sectionType: 'main-work',
      sectionFormat: 'straight-sets',
      name: exercise.name,
      exercises: [{
        exerciseId,
        sets: defaultSets,
      }],
      notes: '',
    };

    const updatedWeeks = selectedProgram.weeks.map(week =>
      week.weekNumber === pendingWorkoutDay.weekNumber
        ? {
            ...week,
            days: week.days.map(day =>
              day.dayNumber === pendingWorkoutDay.dayNumber
                ? { ...day, sections: [...(day.sections || []), newSection] }
                : day
            ),
          }
        : week
    );

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success(`เพิ่ม ${exercise.name} เรียบร้อย`);
    
    setShowExercisePicker(false);
    setExerciseSearchTerm("");
    setPendingWorkoutDay(null);
  };

  // Update Set in New Section Exercise
  const handleUpdateNewSectionExerciseSet = (
    exerciseIdx: number,
    setIdx: number,
    updates: Partial<ExerciseSet>
  ) => {
    const updatedExercises = [...newSectionExercises];
    updatedExercises[exerciseIdx].sets[setIdx] = {
      ...updatedExercises[exerciseIdx].sets[setIdx],
      ...updates,
    };
    setNewSectionExercises(updatedExercises);
  };

  // Add Set to New Section Exercise
  const handleAddSetToNewSectionExercise = (exerciseIdx: number) => {
    const exercise = contextExercises.find(
      ex => ex.id === newSectionExercises[exerciseIdx].exerciseId
    );
    if (!exercise) return;

    const updatedExercises = [...newSectionExercises];
    const currentSets = updatedExercises[exerciseIdx].sets;
    const newSetNumber = currentSets.length + 1;

    let newSet: ExerciseSet = { setNumber: newSetNumber };

    if (exercise.modality === 'strength') {
      newSet = { ...newSet, reps: "10", weight: "0", rest: 60 };
    } else if (exercise.modality === 'cardio') {
      newSet = { ...newSet, duration: "5", distance: "0", rest: 60 };
    } else {
      newSet = { ...newSet, duration: "30", rest: 30 };
    }

    updatedExercises[exerciseIdx].sets.push(newSet);
    setNewSectionExercises(updatedExercises);
  };

  // Delete Set from New Section Exercise
  const handleDeleteSetFromNewSectionExercise = (exerciseIdx: number, setIdx: number) => {
    const updatedExercises = [...newSectionExercises];
    updatedExercises[exerciseIdx].sets.splice(setIdx, 1);
    updatedExercises[exerciseIdx].sets = updatedExercises[exerciseIdx].sets.map((set, idx) => ({
      ...set,
      setNumber: idx + 1,
    }));
    setNewSectionExercises(updatedExercises);
  };

  // Delete Exercise from New Section
  const handleDeleteExerciseFromNewSection = (exerciseIdx: number) => {
    const updatedExercises = [...newSectionExercises];
    updatedExercises.splice(exerciseIdx, 1);
    setNewSectionExercises(updatedExercises);
  };

  // Apply Preset to Exercise
  const handleApplyPreset = (exerciseIdx: number, presetConfig: any) => {
    const exercise = contextExercises.find(
      ex => ex.id === newSectionExercises[exerciseIdx].exerciseId
    );
    if (!exercise) return;

    const updatedExercises = [...newSectionExercises];
    const newSets: ExerciseSet[] = [];

    for (let i = 0; i < presetConfig.sets; i++) {
      let newSet: ExerciseSet = { setNumber: i + 1 };

      if (exercise.modality === 'strength') {
        newSet = {
          ...newSet,
          reps: presetConfig.reps || '10',
          weight: '0',
          rest: presetConfig.rest || 60,
          rpe: presetConfig.rpe,
        };
      } else if (exercise.modality === 'cardio') {
        newSet = {
          ...newSet,
          duration: presetConfig.duration || '5',
          distance: '0',
          rest: presetConfig.rest || 60,
        };
      } else {
        // flexibility or mobility
        newSet = {
          ...newSet,
          duration: presetConfig.duration || '30',
          rest: presetConfig.rest || 30,
          reps: presetConfig.reps,
        };
      }

      newSets.push(newSet);
    }

    updatedExercises[exerciseIdx].sets = newSets;
    setNewSectionExercises(updatedExercises);
    setShowPresetDialog(false);
    setPresetTargetExerciseIdx(null);
    toast.success(`ใช้ Preset: ${presetConfig.name}`);
  };

  // Add Section with Exercises
  const handleAddSection = () => {
    if (!selectedProgram || selectedDayNumber === null || !newSection.name) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const sectionId = crypto.randomUUID();

    const programExercises: ProgramExercise[] = newSectionExercises.map(ex => {
      const avgReps = ex.sets.length > 0 && ex.sets[0].reps
        ? ex.sets.map(s => s.reps || "0").join(", ")
        : "10";
      const avgWeight = ex.sets.length > 0 && ex.sets[0].weight
        ? ex.sets.map(s => s.weight || "0").join(", ")
        : "0";
      const avgRest = ex.sets.length > 0 && ex.sets[0].rest
        ? Math.round(ex.sets.reduce((sum, s) => sum + (s.rest || 0), 0) / ex.sets.length)
        : 60;

      return {
        exerciseId: ex.exerciseId,
        sets: ex.sets.length,
        reps: avgReps,
        weight: avgWeight,
        rest: avgRest,
        notes: "",
      };
    });

    const section: ProgramSection = {
      id: sectionId,
      sectionType: newSection.sectionType || 'main',
      sectionFormat: newSection.sectionFormat || 'straight-sets',
      name: newSection.name,
      duration: newSection.duration,
      exercises: programExercises,
      notes: newSection.notes,
      rounds: newSection.rounds,
      workTime: newSection.workTime,
      restTime: newSection.restTime,
    };

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === selectedDayNumber
          ? {
              ...day,
              sections: [...(day.sections || []), section],
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("สร้าง Section เรียบร้อย");
    
    setShowAddSectionModal(false);
    setNewSection({
      sectionType: 'warmup',
      sectionFormat: 'straight-sets',
      name: '',
      duration: 10,
      exercises: [],
      notes: '',
    });
    setNewSectionExercises([]);
    
    // Navigate back to programs list
    navigate('/programs');
  };

  // Delete Section
  const handleDeleteSection = (dayNumber: number, sectionId: string) => {
    if (!confirm("ต้องการลบ Section นี้?")) return;
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              sections: (day.sections || []).filter((s) => s.id !== sectionId),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("ลบ Section เรียบร้อย");
  };

  // Add Exercise to Section
  const handleAddExerciseToSection = () => {
    if (!selectedProgram || selectedDayNumber === null || !selectedSectionId || !selectedExerciseId) {
      toast.error("กรุณาเลือกท่าฝึก");
      return;
    }

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === selectedDayNumber
          ? {
              ...day,
              sections: (day.sections || []).map((section) =>
                section.id === selectedSectionId
                  ? {
                      ...section,
                      exercises: [
                        ...(section.exercises || []),
                        {
                          exerciseId: selectedExerciseId,
                          sets: 3,
                          reps: "10",
                          weight: "0",
                          rest: 60,
                          notes: "",
                        },
                      ],
                    }
                  : section
              ),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("เพิ่มท่าฝึกเรียบร้อย");
    setShowAddExerciseModal(false);
    setSelectedExerciseId("");
    setExpandedSections(prev => new Set([...prev, selectedSectionId]));
  };

  // Update Exercise
  const handleUpdateExercise = (
    dayNumber: number,
    sectionId: string,
    exerciseId: string,
    updates: Partial<ProgramExercise>
  ) => {
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              sections: (day.sections || []).map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      exercises: (section.exercises || []).map((ex) =>
                        ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
                      ),
                    }
                  : section
              ),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
  };

  // Delete Exercise
  const handleDeleteExercise = (dayNumber: number, sectionId: string, exerciseId: string) => {
    if (!confirm("ต้องการลบท่าฝึกนี้?")) return;
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              sections: (day.sections || []).map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      exercises: (section.exercises || []).filter((ex) => ex.exerciseId !== exerciseId),
                    }
                  : section
              ),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("ลบท่าฝึกเรียบร้อย");
  };

  // Handle Save & Assign Program
  const handleSaveProgram = () => {
    toast.success("บันทึกโปรแกรมเรียบร้อย");
    // Navigate back to programs list
    navigate('/programs');
  };

  // Handle Assign Program to Clients
  const handleAssignProgram = () => {
    if (selectedClientIds.length === 0) {
      toast.error("กรุณาเลือกลูกเทรนอย่างน้อย 1 คน");
      return;
    }

    if (!selectedProgram) return;

    // Create program assignment for each client
    selectedClientIds.forEach((clientId) => {
      assignProgramWithSchedule({
        clientId,
        programId: selectedProgram.id,
        assignmentStartDate: assignStartDate,
        startingDay: assignStartDay,
        notifyClient: notifyClient
      });
    });

    // Update program assigned clients
    const updatedAssignedClients = [
      ...(selectedProgram.assignedClients || []),
      ...selectedClientIds
    ];
    updateProgramTemplate(selectedProgram.id, { 
      assignedClients: Array.from(new Set(updatedAssignedClients))
    });

    const notificationText = notifyClient ? " (พร้อมส่งการแจ้งเตือน)" : "";
    toast.success(`มอบหมายโปรแกรมให้ ${selectedClientIds.length} คน${notificationText}`);
    setShowAssignModal(false);
    setSelectedClientIds([]);
    setAssignStartDate(new Date().toISOString().split('T')[0]);
    setAssignStartDay(1);
    setNotifyClient(true);
    
    setTimeout(() => {
      setView("list");
    }, 500);
  };

  // Toggle Client Selection
  const handleToggleClient = (clientId: string) => {
    if (selectedClientIds.includes(clientId)) {
      setSelectedClientIds(selectedClientIds.filter(id => id !== clientId));
    } else {
      setSelectedClientIds([...selectedClientIds, clientId]);
    }
  };

  // Toggle Expansions
  const toggleDay = (weekNumber: number, dayNumber: number) => {
    const dayKey = `week-${weekNumber}-day-${dayNumber}`;
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleExerciseDetails = (exerciseKey: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseKey)) {
      newExpanded.delete(exerciseKey);
    } else {
      newExpanded.add(exerciseKey);
    }
    setExpandedExercises(newExpanded);
  };

  // Filtered Exercises
  const filteredExercises = contextExercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  // Get Section Type Icon
  const getSectionTypeIcon = (type: string) => {
    const found = SECTION_TYPES.find(t => t.value === type);
    return found ? found.icon : Settings;
  };

  const getSectionTypeColor = (type: string) => {
    const found = SECTION_TYPES.find(t => t.value === type);
    return found ? found.color : 'text-gray-500';
  };

  // Get muscle group badge color
  const getMuscleGroupColor = (muscle: string) => {
    const colors: Record<string, string> = {
      'chest': 'bg-red-100 text-red-700 border-red-200',
      'back': 'bg-blue-100 text-blue-700 border-blue-200',
      'legs': 'bg-green-100 text-green-700 border-green-200',
      'shoulders': 'bg-orange-100 text-orange-700 border-orange-200',
      'arms': 'bg-purple-100 text-purple-700 border-purple-200',
      'core': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'glutes': 'bg-pink-100 text-pink-700 border-pink-200',
      'cardio': 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return colors[muscle.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get modality icon and color
  const getModalityDisplay = (modality: string) => {
    const displays: Record<string, { icon: any, color: string }> = {
      'strength': { icon: Dumbbell, color: 'text-blue-600' },
      'cardio': { icon: Activity, color: 'text-red-600' },
      'flexibility': { icon: Wind, color: 'text-green-600' },
      'mobility': { icon: Target, color: 'text-purple-600' }
    };
    return displays[modality.toLowerCase()] || { icon: Activity, color: 'text-gray-600' };
  };

  // Render Program List
  if (view === "list") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/20 p-3">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">โปรแกรมการออกกำลังกาย</h1>
              <p className="text-sm text-muted-foreground mt-1">
                จัดการ Template และโปรแกรมที่ปรับแต่งเฉพาะบุคคล
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              สร้างโปรแกรม
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาโปรแกรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-primary/20 focus:border-primary"
            />
          </div>
          <Tabs value={filterType} onValueChange={(v: any) => setFilterType(v)} className="w-auto">
            <TabsList className="h-11 bg-muted/50">
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="custom">ปรับแต่งแล้ว</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Template Programs */}
        {templatePrograms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="rounded-md bg-accent/10 p-2">
                <Star className="h-4 w-4 text-accent fill-accent" />
              </div>
              <h2 className="font-semibold">Template โปรแกรม</h2>
              <Badge variant="outline" className="ml-auto border-accent/30 text-accent">
                {templatePrograms.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatePrograms.map((program) => {
                const trainingDaysPerWeek = program.weeks?.[0]?.days.filter(d => !d.isRestDay).length || program.daysPerWeek;
                
                return (
                <Card 
                  key={program.id} 
                  className="group hover:border-accent/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedProgramId(program.id);
                    setView("detail");
                  }}
                >
                  <CardHeader className="pb-3 bg-gradient-to-br from-accent/5 to-transparent">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/30">
                            <Star className="h-3 w-3 mr-1 fill-accent" />
                            Template
                          </Badge>
                        </div>
                        <CardTitle className="text-base group-hover:text-accent transition-colors">{program.name}</CardTitle>
                        <CardDescription className="text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {program.description || "ไม่มีคำอธิบาย"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedProgramId(program.id);
                            setView("detail");
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไขโปรแกรม
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneProgram(program.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            คัดลอกโปรแกรม
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProgram(program.id);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            ลบโปรแกรม
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                        <CalendarIcon className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-muted-foreground mb-0.5">ระยะเวลา</p>
                        <p className="font-semibold text-primary">{program.duration} สัปดาห์</p>
                      </div>
                      <div className="text-center p-2.5 bg-accent/5 rounded-lg border border-accent/10">
                        <Dumbbell className="h-4 w-4 mx-auto mb-1 text-accent" />
                        <p className="text-muted-foreground mb-0.5">ความถี่</p>
                        <p className="font-semibold text-accent">{trainingDaysPerWeek} วัน/สัปดาห์</p>
                      </div>
                      <div className="text-center p-2.5 bg-green-600/5 rounded-lg border border-green-600/10">
                        <Users className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <p className="text-muted-foreground mb-0.5">ใช้โดย</p>
                        <p className="font-semibold text-green-600">{program.assigned_client_count} คน</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Programs */}
        {customPrograms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="rounded-md bg-primary/10 p-2">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold">โปรแกรมที่ปรับแต่งแล้ว</h2>
              <Badge variant="outline" className="ml-auto border-primary/30 text-primary">
                {customPrograms.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPrograms.map((program) => {
                const client = program.clientId ? clients.find(c => c.id === program.clientId) : null;
                return (
                  <Card 
                    key={program.id} 
                    className="hover:border-primary transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProgramId(program.id);
                      setView("detail");
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">ปรับแต่งแล้ว</Badge>
                            {client && (
                              <Badge variant="secondary" className="text-xs">
                                {client.name}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">{program.name}</CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-2">
                            {program.description || "ไม่มีคำอธิบาย"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedProgramId(program.id);
                              setView("detail");
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไขโปรแกรม
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCloneProgram(program.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              คัดลอกโปรแกรม
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProgram(program.id);
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              ลบโปรแกรม
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground mb-1">ระยะเวลา</p>
                          <p className="font-semibold">{program.duration} สัปดาห์</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground mb-1">ความถี่</p>
                          <p className="font-semibold">{program.daysPerWeek} วัน/สัปดาห์</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="rounded-full bg-muted/30 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="font-semibold mb-2">ไม่พบโปรแกรม</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                ยังไม่มีโปรแกรมการออกกำลังกาย เริ่มสร้างโปรแกรมแรกของ��ุณตอนนี้
              </p>
              <Button onClick={() => setShowCreateModal(true)} size="lg" className="shadow-md">
                <Plus className="h-5 w-5 mr-2" />
                สร้างโปรแกรมใหม่
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Program Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md" aria-describedby="create-program-section-description">
            <DialogHeader>
              <DialogTitle>สร้างโปรแกรมใหม่</DialogTitle>
              <DialogDescription id="create-program-section-description">
                สร้าง Template หรือโปรแกรมปรับแต่งสำหรับลูกเทรนเฉพาะคน
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อโปรแกรม *</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="เช่น Beginner Full Body, Advanced Strength"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, description: e.target.value })
                  }
                  placeholder="อธิบายเป้าหมายและรูปแบบของโปรแกรม"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Template โปรแกรม</p>
                  <p className="text-xs text-muted-foreground">
                    ใช้เป็นแม่แบบสำหรับหลายคน
                  </p>
                </div>
                <Button
                  variant={createFormData.isTemplate ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setCreateFormData({ ...createFormData, isTemplate: !createFormData.isTemplate })
                  }
                >
                  {createFormData.isTemplate ? (
                    <>
                      <Star className="h-4 w-4 mr-1" />
                      Template
                    </>
                  ) : (
                    "ปรับแต่ง"
                  )}
                </Button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  ยกเลิก
                </Button>
                <Button onClick={handleCreateProgram} className="flex-1">
                  สร้างโปรแกรม
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md" aria-describedby="delete-program-description">
            <DialogHeader>
              <DialogTitle>ยืนยันการลบโปรแกรม</DialogTitle>
              <DialogDescription id="delete-program-description">
                คุณแน่ใจหรือไม่ที่จะลบโปรแกรมนี้? การกระทำนี้ไม่สามารถยกเลิกได้
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {programToDelete && (() => {
                const program = programs.find((p) => p.id === programToDelete);
                return program ? (
                  <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-destructive/10 p-2 mt-0.5">
                          <Trash className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{program.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {program.description || "ไม่มีคำอธิบาย"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProgramToDelete(null);
                  }} 
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteProgram} 
                  className="flex-1"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  ลบโปรแกรม
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Render Program Detail
  if (!selectedProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ไม่พบโปรแกรม</p>
        <Button onClick={() => setView("list")} className="mt-4">
          กลับไปรายการ
        </Button>
      </div>
    );
  }

  const allDaysWithWeek: Array<{ week: number; day: ProgramDay }> = [];
  selectedProgram.weeks.forEach((week) => {
    week.days.forEach((day) => {
      allDaysWithWeek.push({ week: week.weekNumber, day });
    });
  });

  const totalSections = allDaysWithWeek.reduce((sum, item) => sum + (item.day.sections?.length || 0), 0);
  const totalExercises = allDaysWithWeek.reduce(
    (sum, item) => sum + (item.day.sections?.reduce((s, sec) => s + (sec.exercises?.length || 0), 0) || 0), 
    0
  );

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setView("list")}
          className="hover:bg-primary/10 mt-1"
        >
          <ChevronDown className="h-5 w-5 rotate-90" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-primary">{selectedProgram.name}</h1>
            {selectedProgram.isTemplate && (
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                <Star className="h-3.5 w-3.5 mr-1 fill-accent" />
                Template
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {selectedProgram.description || "ไม่มีคำอธิบาย"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="default" 
          className="bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
          onClick={handleSaveProgram}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          บันทึกโปรแกรม
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleCloneProgram(selectedProgram.id)}
          className="hover:bg-primary/5 hover:border-primary/50"
        >
          <Copy className="h-4 w-4 mr-2" />
          คัดลอก
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowAssignModal(true)}
          className="hover:bg-accent/10 hover:border-accent/50"
        >
          <Users className="h-4 w-4 mr-2" />
          มอบหมายลูกเทรน
        </Button>
      </div>

      {/* Program Stats - Cards ด้านบน */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div className="rounded-full bg-primary/10 px-2 py-0.5">
                <span className="text-xs text-primary">Duration</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">{selectedProgram.weeks.length || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">สัปดาห์</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Dumbbell className="h-5 w-5 text-accent" />
              <div className="rounded-full bg-accent/10 px-2 py-0.5">
                <span className="text-xs text-accent">Frequency</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-accent">
              {selectedProgram.weeks[0]?.days.filter(d => !d.isRestDay).length || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">วัน/สัปดาห์</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="rounded-full bg-blue-600/10 px-2 py-0.5">
                <span className="text-xs text-blue-600">Sections</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalSections}</p>
            <p className="text-sm text-muted-foreground mt-1">sections ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <div className="rounded-full bg-green-600/10 px-2 py-0.5">
                <span className="text-xs text-green-600">Clients</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{selectedProgram.assigned_client_count || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">ลูกเทรน</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Sessions - Week-based View */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">ตารางฝึกซ้อม</h2>
            </div>
            <div className="bg-muted/30 border border-dashed rounded-lg p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                💡 <strong>คลิกเมนู ⋯ ของสัปดาห์</strong> เพื่อตั้งค่าความถี่ฝึกอย่างรวดเร็ว หรือ <strong>คลิกเมนู ⋯ ของแต่ละวัน</strong> เพื่อเลือกว่าจะเป็นวันฝึกหรือวันพัก
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddDay} className="mt-8">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            ย้อนกลับ
          </Button>
        </div>

        {selectedProgram.weeks.map((week) => {
          const trainingDays = week.days.filter(d => !d.isRestDay).length;
          const restDays = week.days.filter(d => d.isRestDay).length;
          
          return (
          <Card key={week.weekNumber} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <CalendarIcon className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>สัปดาห์ที่ {week.weekNumber}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      ตั้งค่าความถี่ฝึก
                    </div>
                    <DropdownMenuItem onClick={() => handleSetTrainingFrequency(week.weekNumber, 3)}>
                      <Dumbbell className="h-4 w-4 mr-2" />
                      3 วัน/สัปดาห์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetTrainingFrequency(week.weekNumber, 4)}>
                      <Dumbbell className="h-4 w-4 mr-2" />
                      4 วัน/สัปดาห์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetTrainingFrequency(week.weekNumber, 5)}>
                      <Dumbbell className="h-4 w-4 mr-2" />
                      5 วัน/สัปดาห์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetTrainingFrequency(week.weekNumber, 6)}>
                      <Dumbbell className="h-4 w-4 mr-2" />
                      6 วัน/สัปดาห์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetTrainingFrequency(week.weekNumber, 7)}>
                      <Dumbbell className="h-4 w-4 mr-2" />
                      7 วัน/สัปดาห์
                    </DropdownMenuItem>
                    {selectedProgram.weeks.length > 1 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          ลบสัปดาห์
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-background">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                {week.days.map((day) => {
                  const daySectionCount = day.sections?.length || 0;
                  const dayExerciseCount = day.sections?.reduce((sum, s) => sum + (s.exercises?.length || 0), 0) || 0;
                  const isRestDay = day.isRestDay || false;
                  const dayKey = `week-${week.weekNumber}-day-${day.dayNumber}`;
                  const isDayExpanded = expandedDays.has(dayKey);

                  return (
                    <div 
                      key={day.dayNumber}
                      className="flex flex-col"
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-sm font-medium">Day {day.dayNumber}</span>
                        <div className="flex items-center gap-1">
                          {isDayExpanded && (
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          )}
                          <span className="text-xs text-muted-foreground">#{day.dayNumber}</span>
                        </div>
                      </div>
                      
                      {/* Day Card */}
                      <button
                        onClick={() => {
                          setSelectedDayForOptions({ weekNumber: week.weekNumber, dayNumber: day.dayNumber });
                          setShowDayOptionsDialog(true);
                        }}
                        className={`group relative border rounded-lg p-6 transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[120px] text-center ${
                          isDayExpanded
                            ? 'bg-blue-50 border-blue-300 border-2 shadow-sm'
                            : isRestDay 
                              ? 'bg-muted/20 border-dashed hover:bg-muted/30' 
                              : daySectionCount > 0
                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30'
                                : 'bg-muted/30 hover:bg-muted/50 border-border'
                        }`}
                      >
                        {isRestDay ? (
                          <>
                            <Moon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">วันพัก</span>
                          </>
                        ) : daySectionCount > 0 ? (
                          <>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Dumbbell className={`h-5 w-5 ${isDayExpanded ? 'text-blue-600' : 'text-primary'}`} />
                              <span className={`font-semibold ${isDayExpanded ? 'text-blue-600' : 'text-primary'}`}>{daySectionCount}</span>
                            </div>
                            <span className={`text-xs ${isDayExpanded ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>
                              {isDayExpanded ? '✓ กำลังแสดง' : 'ดูรายละเอียด'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-8 w-8 text-muted-foreground/40 group-hover:text-muted-foreground mb-2 transition-colors" />
                            <span className="text-xs text-muted-foreground">คลิกเพื่อเพิ่ม</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
                
                {/* Add Day Button */}
                {week.days.length < 7 && (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2 px-1 opacity-0">
                      <span className="text-sm">-</span>
                    </div>
                    <button
                      onClick={handleAddDay}
                      className="group relative bg-background hover:bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg p-6 transition-all flex flex-col items-center justify-center min-h-[120px] text-center"
                    >
                      <Plus className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary mb-2 transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-primary">เพิ่มวัน</span>
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
        })}

        {/* Add Week Button */}
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleAddWeek}
            className="border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            เพิ่มสัปดาห์
          </Button>
        </div>
      </div>

      {/* Expanded Day Details Dialog/Section */}
      {expandedDays.size > 0 && (
        <Card className="mt-4 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/20 p-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">รายละเอียดวันฝึก</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpandedDays(new Set())}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {allDaysWithWeek.filter(item => expandedDays.has(`week-${item.week}-day-${item.day.dayNumber}`)).map((item, dayIdx) => {
            const { week, day } = item;
            const isExpanded = true;
            const daySectionCount = day.sections?.length || 0;
            const dayExerciseCount = day.sections?.reduce((sum, s) => sum + (s.exercises?.length || 0), 0) || 0;

            return (
              <div key={`week-${week}-day-${day.dayNumber}-${dayIdx}`} className="border-2 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                {/* Day Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">สัปดาห์ที่ {week} - Day {day.dayNumber}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {daySectionCount} sections
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {dayExerciseCount} ท่า
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedDayNumber(day.dayNumber);
                      setShowAddSectionModal(true);
                    }}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    สร้าง Section
                  </Button>
                </div>

                {/* Day Sections */}
                <div className="p-3 space-y-2 bg-background">
                  {!day.sections || day.sections.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>ยังไม่มี Section</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSelectedDayNumber(day.dayNumber);
                            setShowAddSectionModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          เ��ิ่ม Section
                        </Button>
                      </div>
                    ) : (
                      (day.sections || []).map((section, sectionIdx) => {
                        const isSectionExpanded = expandedSections.has(section.id);
                        const SectionIcon = getSectionTypeIcon(section.sectionType);
                        const sectionColor = getSectionTypeColor(section.sectionType);
                        const formatLabel = SECTION_FORMATS.find(f => f.value === section.sectionFormat)?.label || section.sectionFormat;

                        return (
                          <div key={section.id} className="border-2 rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                            {/* Section Header */}
                            <div
                              className="flex items-center justify-between p-3.5 bg-gradient-to-r from-muted/50 to-muted/20 cursor-pointer hover:from-muted/70 hover:to-muted/40 transition-all"
                              onClick={() => toggleSection(section.id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="transition-transform">
                                  {isSectionExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-primary" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className={`rounded-md p-1.5 ${sectionColor.replace('text-', 'bg-')}/10`}>
                                  <SectionIcon className={`h-4 w-4 ${sectionColor}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-sm">{section.name}</p>
                                    <Badge variant="outline" className="text-xs border-primary/30">
                                      {formatLabel}
                                    </Badge>
                                    {section.duration && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {section.duration} นาที
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Dumbbell className="h-3 w-3" />
                                    {section.exercises?.length || 0} ท่า
                                    {section.notes && ` • ${section.notes}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDayNumber(day.dayNumber);
                                    setSelectedSectionId(section.id);
                                    setShowAddExerciseModal(true);
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  เพิ่มท่า
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-destructive/10 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(day.dayNumber, section.id);
                                  }}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Section Exercises */}
                            {isSectionExpanded && (
                              <div className="p-3 space-y-2">
                                {!section.exercises || section.exercises.length === 0 ? (
                                  <div className="text-center py-4 text-muted-foreground text-xs">
                                    <Dumbbell className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                    <p>ยังไม่มีท่าฝึก</p>
                                  </div>
                                ) : (
                                  (section.exercises || []).map((exercise, exerciseIdx) => {
                                    const exerciseData = contextExercises.find(
                                      (ex) => ex.id === exercise.exerciseId
                                    );
                                    if (!exerciseData) return null;

                                    const exerciseKey = `${section.id}-${exercise.exerciseId}-${exerciseIdx}`;
                                    const isExpanded = expandedExercises.has(exerciseKey);
                                    const modalityDisplay = getModalityDisplay(exerciseData.modality);
                                    const ModalityIcon = modalityDisplay.icon;

                                    return (
                                      <div
                                        key={exerciseKey}
                                        className="border-2 rounded-lg p-3 bg-background hover:border-accent/50 transition-colors"
                                      >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                              <div className={`p-1 rounded ${modalityDisplay.color.replace('text-', 'bg-')}/10`}>
                                                <ModalityIcon className={`h-3.5 w-3.5 ${modalityDisplay.color}`} />
                                              </div>
                                              <p className="font-semibold text-sm">{exerciseData.name}</p>
                                            </div>
                                            
                                            {/* Category and Equipment */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                              <span>{exerciseData.category}</span>
                                              {exerciseData.equipment && (
                                                <>
                                                  <span>•</span>
                                                  <span>{exerciseData.equipment}</span>
                                                </>
                                              )}
                                            </div>

                                            {/* Muscle Groups */}
                                            {exerciseData.muscleGroups && exerciseData.muscleGroups.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mb-2">
                                                {exerciseData.muscleGroups.map((muscle, idx) => (
                                                  <span
                                                    key={idx}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getMuscleGroupColor(muscle)}`}
                                                  >
                                                    {muscle}
                                                  </span>
                                                ))}
                                              </div>
                                            )}

                                            {/* Show Instructions Toggle */}
                                            {exerciseData.instructions && (
                                              <button
                                                onClick={() => toggleExerciseDetails(exerciseKey)}
                                                className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                              >
                                                <Info className="h-3 w-3" />
                                                <span>{isExpanded ? 'ซ่อนคำแนะนำ' : 'ดูคำแนะนำการฝึก'}</span>
                                                {isExpanded ? (
                                                  <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                  <ChevronDown className="h-3 w-3" />
                                                )}
                                              </button>
                                            )}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:bg-red-50"
                                            onClick={() =>
                                              handleDeleteExercise(day.dayNumber, section.id, exercise.exerciseId)
                                            }
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        {/* Expanded Instructions */}
                                        {isExpanded && exerciseData.instructions && (
                                          <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-900 whitespace-pre-line">
                                              {exerciseData.instructions}
                                            </p>
                                          </div>
                                        )}

                                        {/* FITT Parameters */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                          <div>
                                            <Label className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                              <Repeat className="h-3 w-3" />
                                              Sets
                                            </Label>
                                            <Input
                                              type="number"
                                              value={exercise.sets}
                                              onChange={(e) =>
                                                handleUpdateExercise(
                                                  day.dayNumber,
                                                  section.id,
                                                  exercise.exerciseId,
                                                  { sets: parseInt(e.target.value) || 0 }
                                                )
                                              }
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                              <Repeat className="h-3 w-3" />
                                              Reps
                                            </Label>
                                            <Input
                                              value={exercise.reps}
                                              onChange={(e) =>
                                                handleUpdateExercise(
                                                  day.dayNumber,
                                                  section.id,
                                                  exercise.exerciseId,
                                                  { reps: e.target.value }
                                                )
                                              }
                                              className="h-7 text-xs"
                                              placeholder="8-12"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                              <Weight className="h-3 w-3" />
                                              Weight
                                            </Label>
                                            <Input
                                              value={exercise.weight}
                                              onChange={(e) =>
                                                handleUpdateExercise(
                                                  day.dayNumber,
                                                  section.id,
                                                  exercise.exerciseId,
                                                  { weight: e.target.value }
                                                )
                                              }
                                              className="h-7 text-xs"
                                              placeholder="kg / %"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              Rest (s)
                                            </Label>
                                            <Input
                                              type="number"
                                              value={exercise.rest || ''}
                                              onChange={(e) =>
                                                handleUpdateExercise(
                                                  day.dayNumber,
                                                  section.id,
                                                  exercise.exerciseId,
                                                  { rest: parseInt(e.target.value) || 0 }
                                                )
                                              }
                                              className="h-7 text-xs"
                                              placeholder="60"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                              <Zap className="h-3 w-3" />
                                              RPE
                                            </Label>
                                            <Input
                                              type="number"
                                              value={exercise.rpe || ''}
                                              onChange={(e) =>
                                                handleUpdateExercise(
                                                  day.dayNumber,
                                                  section.id,
                                                  exercise.exerciseId,
                                                  { rpe: parseInt(e.target.value) || undefined }
                                                )
                                              }
                                              className="h-7 text-xs"
                                              placeholder="1-10"
                                              min="1"
                                              max="10"
                                            />
                                          </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="mt-2">
                                          <Input
                                            value={exercise.notes || ""}
                                            onChange={(e) =>
                                              handleUpdateExercise(
                                                day.dayNumber,
                                                section.id,
                                                exercise.exerciseId,
                                                { notes: e.target.value }
                                              )
                                            }
                                            className="h-7 text-xs"
                                            placeholder="หมายเหตุเพิ่มเติม..."
                                          />
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      )}

      {/* Add Section Modal */}
      <Dialog open={showAddSectionModal} onOpenChange={(open) => {
        setShowAddSectionModal(open);
        if (!open) {
          setNewSection({
            sectionType: 'warmup',
            sectionFormat: 'straight-sets',
            name: '',
            duration: 10,
            exercises: [],
            notes: '',
          });
          setNewSectionExercises([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="add-section-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#FF6B35]" />
              สร้าง Section ใหม่ - Day {selectedDayNumber}
            </DialogTitle>
            <DialogDescription id="add-section-description">
              กำหนดรูปแบบการฝึก เลือกท่าออกกำลังกาย และกำหนด Sets
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Step 1: Section Configuration */}
              <Card className="border-l-4 border-l-[#FF6B35]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    ขั้นตอนที่ 1: ตั้งค่า Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#FF6B35]" />
                        ประเภท Section *
                      </Label>
                      <Select
                        value={newSection.sectionType}
                        onValueChange={(value: any) =>
                          setNewSection({ ...newSection, sectionType: value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTION_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${type.color}`} />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-[#FF6B35]" />
                        รูปแบบการฝึก *
                      </Label>
                      <Select
                        value={newSection.sectionFormat}
                        onValueChange={(value: any) =>
                          setNewSection({ ...newSection, sectionFormat: value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTION_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              <div>
                                <p className="font-medium">{format.label}</p>
                                <p className="text-xs text-muted-foreground">{format.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#FF6B35]" />
                      ชื่อ Section *
                    </Label>
                    <Input
                      className="h-11"
                      value={newSection.name}
                      onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                      placeholder="เช่น Mobility Warm-up, Upper Body Push"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#FF6B35]" />
                      หมายเหตุ (ไม่บังคับ)
                    </Label>
                    <Textarea
                      value={newSection.notes}
                      onChange={(e) => setNewSection({ ...newSection, notes: e.target.value })}
                      placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับ Section นี้..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Exercise Selection */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      ขั้นตอนที่ 2: เพิ่มท่าออกกำลังกาย
                    </CardTitle>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setShowExercisePicker(true)}
                      className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มท่า
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {newSectionExercises.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                      <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground mb-1">ยังไม่มีท่าออกกำลังกาย</p>
                      <p className="text-xs text-muted-foreground mb-3">เริ่มต้นด้วยการเพิ่มท่าแรกของคุณ</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExercisePicker(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มท่าแรก
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                    {newSectionExercises.map((exercise, exerciseIdx) => {
                      const exerciseData = contextExercises.find(ex => ex.id === exercise.exerciseId);
                      if (!exerciseData) return null;

                      const getCategoryColor = (category: string) => {
                        const colors: { [key: string]: string } = {
                          'Chest': 'bg-red-100 text-red-700 border-red-200',
                          'Back': 'bg-blue-100 text-blue-700 border-blue-200',
                          'Shoulders': 'bg-orange-100 text-orange-700 border-orange-200',
                          'Legs': 'bg-green-100 text-green-700 border-green-200',
                          'Arms': 'bg-purple-100 text-purple-700 border-purple-200',
                          'Core': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                          'Cardio': 'bg-pink-100 text-pink-700 border-pink-200',
                          'Mobility': 'bg-teal-100 text-teal-700 border-teal-200',
                        };
                        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
                      };

                      return (
                        <Card key={exerciseIdx} className="border-2 hover:border-[#FF6B35]/50 transition-colors">
                          <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={`text-xs ${getCategoryColor(exerciseData.category)}`}>
                                    {exerciseData.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {exerciseData.modality}
                                  </Badge>
                                </div>
                                <CardTitle className="text-base">{exerciseData.name}</CardTitle>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteExerciseFromNewSection(exerciseIdx)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Sets Header */}
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4 text-[#FF6B35]" />
                                Sets ({exercise.sets.length})
                              </Label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    setPresetTargetExerciseIdx(exerciseIdx);
                                    setShowPresetDialog(true);
                                  }}
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Quick Set
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleAddSetToNewSectionExercise(exerciseIdx)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  เพิ่ม Set
                                </Button>
                              </div>
                            </div>

                            {/* Sets List */}
                            <div className="space-y-2">

                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="border-2 rounded-lg p-3 bg-card hover:border-[#FF6B35]/30 transition-colors">
                                  <div className="flex items-center justify-between mb-3">
                                    <Badge className="bg-[#002140] hover:bg-[#002140]/90 text-white">
                                      Set {set.setNumber}
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDeleteSetFromNewSectionExercise(exerciseIdx, setIdx)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Fields based on modality */}
                                  {exerciseData.modality === 'strength' && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Hash className="h-3 w-3" />
                                          Reps
                                        </Label>
                                        <Input
                                          className="h-9 text-center"
                                          value={set.reps || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              reps: e.target.value,
                                            })
                                          }
                                          placeholder="10"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Weight className="h-3 w-3" />
                                          Weight (kg)
                                        </Label>
                                        <Input
                                          className="h-9 text-center"
                                          value={set.weight || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              weight: e.target.value,
                                            })
                                          }
                                          placeholder="0"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Timer className="h-3 w-3" />
                                          Rest (s)
                                        </Label>
                                        <Input
                                          type="number"
                                          className="h-9 text-center"
                                          value={set.rest || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              rest: parseInt(e.target.value) || 0,
                                            })
                                          }
                                          placeholder="60"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <TrendingUp className="h-3 w-3" />
                                          RPE (1-10)
                                        </Label>
                                        <Input
                                          type="number"
                                          className="h-9 text-center"
                                          value={set.rpe || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              rpe: parseInt(e.target.value) || undefined,
                                            })
                                          }
                                          placeholder="8"
                                          min="1"
                                          max="10"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {exerciseData.modality === 'cardio' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          Duration (min)
                                        </Label>
                                        <Input
                                          className="h-9 text-center"
                                          value={set.duration || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              duration: e.target.value,
                                            })
                                          }
                                          placeholder="5"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MoveRight className="h-3 w-3" />
                                          Distance (km)
                                        </Label>
                                        <Input
                                          className="h-9 text-center"
                                          value={set.distance || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              distance: e.target.value,
                                            })
                                          }
                                          placeholder="2"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Timer className="h-3 w-3" />
                                          Rest (s)
                                        </Label>
                                        <Input
                                          type="number"
                                          className="h-9 text-center"
                                          value={set.rest || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              rest: parseInt(e.target.value) || 0,
                                            })
                                          }
                                          placeholder="60"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {(exerciseData.modality === 'flexibility' || exerciseData.modality === 'mobility') && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          Duration (s)
                                        </Label>
                                        <Input
                                          className="h-9 text-center"
                                          value={set.duration || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              duration: e.target.value,
                                            })
                                          }
                                          placeholder="30"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Timer className="h-3 w-3" />
                                          Rest (s)
                                        </Label>
                                        <Input
                                          type="number"
                                          className="h-9 text-center"
                                          value={set.rest || ''}
                                          onChange={(e) =>
                                            handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                              rest: parseInt(e.target.value) || 0,
                                            })
                                          }
                                          placeholder="30"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-3">
                                    <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      หมายเหตุ (ไม่บังคับ)
                                    </Label>
                                    <Input
                                      className="h-9"
                                      value={set.notes || ''}
                                      onChange={(e) =>
                                        handleUpdateNewSectionExerciseSet(exerciseIdx, setIdx, {
                                          notes: e.target.value,
                                        })
                                      }
                                      placeholder="เช่น Tempo 3-0-1-0, Pause at bottom..."
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddSectionModal(false);
                setNewSection({
                  sectionType: 'warmup',
                  sectionFormat: 'straight-sets',
                  name: '',
                  duration: 10,
                  exercises: [],
                  notes: '',
                });
                setNewSectionExercises([]);
              }}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleAddSection} 
              className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              บันทึก Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker Dialog */}
      <Dialog open={showExercisePicker} onOpenChange={(open) => {
        setShowExercisePicker(open);
        if (!open) {
          setPendingWorkoutDay(null);
          setExerciseSearchTerm("");
        }
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="exercise-picker-description">
          <DialogHeader>
            <DialogTitle>
              {pendingWorkoutDay ? 'เพิ่มท่าออกกำลังกาย' : 'เลือกท่าออกกำลังกาย'}
            </DialogTitle>
            <DialogDescription id="exercise-picker-description">
              {pendingWorkoutDay 
                ? `เลือกท่าฝึกเพื่อเพิ่มเข้า Day ${pendingWorkoutDay.dayNumber} (จะสร้าง Section อัตโนมัติ)` 
                : 'เลือกท่าฝึกจากคลังท่า'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาท่าฝึก..."
                value={exerciseSearchTerm}
                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredExercises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">ไม่พบท่าฝึก</p>
                ) : (
                  filteredExercises.map((exercise) => {
                    // ถ้าเป็นการเพิ่มโดยตรง (มี pendingWorkoutDay) ไม่ต้องเช็ค isAdded
                    const isAdded = !pendingWorkoutDay && newSectionExercises.some(ex => ex.exerciseId === exercise.id);
                    
                    return (
                      <div
                        key={exercise.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          isAdded
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : "hover:border-accent/50"
                        }`}
                        onClick={() => {
                          if (isAdded) return;
                          // ถ้ามี pendingWorkoutDay แสดงว่ากดจาก Add Exercise (เพิ่มโดยตรง)
                          if (pendingWorkoutDay) {
                            handleAddExerciseDirectly(exercise.id);
                          } else {
                            // ถ้าไม่มี แสดงว่าเป็นการเพิ่มใน Section ใหม่
                            handleAddExerciseToNewSection(exercise.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.category} • {exercise.modality}
                            </p>
                          </div>
                          {isAdded && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              ✓ เพิ่มแล้ว
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExercisePicker(false);
                  setExerciseSearchTerm("");
                }}
                className="flex-1"
              >
                ปิด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Modal (for existing sections) */}
      <Dialog open={showAddExerciseModal} onOpenChange={setShowAddExerciseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="add-exercise-modal-description">
          <DialogHeader>
            <DialogTitle>เพิ่มท่าฝึก</DialogTitle>
            <DialogDescription id="add-exercise-modal-description">เลือกท่าฝึกจากคลังท่า</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาท่าฝึก..."
                value={exerciseSearchTerm}
                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">ไม่พบท่าฝึก</p>
              ) : (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedExerciseId === exercise.id
                        ? "border-accent bg-accent/10"
                        : "hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.category} • {exercise.modality}
                        </p>
                      </div>
                      {selectedExerciseId === exercise.id && (
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          เลือกแล้ว
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setSelectedExerciseId("");
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddExerciseToSection}
                disabled={!selectedExerciseId}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มท่าฝึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Set Preset Dialog */}
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby="preset-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF6B35]" />
              Quick Set - เลือกรูปแบบการฝึกตามหลักวิทยาศาสตร์
            </DialogTitle>
            <DialogDescription id="preset-dialog-description">
              เลือก Preset ที่เหมาะสมกับเป้าหมายการฝึก ระบบจะจัด Sets อัตโนมัติ
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {presetTargetExerciseIdx !== null && (() => {
                const exercise = contextExercises.find(
                  ex => ex.id === newSectionExercises[presetTargetExerciseIdx].exerciseId
                );
                if (!exercise) return null;

                const availablePresets = 
                  exercise.modality === 'strength' ? SET_PRESETS.strength :
                  exercise.modality === 'cardio' ? SET_PRESETS.cardio :
                  exercise.modality === 'flexibility' ? SET_PRESETS.flexibility :
                  exercise.modality === 'mobility' ? SET_PRESETS.mobility :
                  null;

                if (!availablePresets) return <p className="text-center text-muted-foreground">ไม่มี Preset สำหรับประเภทนี้</p>;

                return (
                  <>
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <p className="text-sm font-medium mb-1">ท่าที่เลือก: {exercise.name}</p>
                      <p className="text-xs text-muted-foreground">ประเภท: {exercise.modality}</p>
                    </div>

                    {/* Science-based Training Structure Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            โครงสร้างการฝึกรายครั้งตามหลักวิทยาศาสตร์การกีฬา
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-blue-800 dark:text-blue-200">Warm-up: 15-20 นาที</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Dumbbell className="h-3 w-3 text-[#FF6B35]" />
                              <span className="text-blue-800 dark:text-blue-200">Conditioning: ตามเซต</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Target className="h-3 w-3 text-purple-500" />
                              <span className="text-blue-800 dark:text-blue-200">Sports Phase: ตามโปรแกรม</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Wind className="h-3 w-3 text-green-500" />
                              <span className="text-blue-800 dark:text-blue-200">Cool Down: 10-15 นาที</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {Object.entries(availablePresets).map(([key, preset]: [string, any]) => {
                        const Icon = preset.icon;
                        return (
                          <Card
                            key={key}
                            className="cursor-pointer hover:border-[#FF6B35] transition-all hover:shadow-md"
                            onClick={() => handleApplyPreset(presetTargetExerciseIdx, preset)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                                  <Icon className="h-5 w-5 text-[#FF6B35]" />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-base">{preset.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {preset.description}
                                  </CardDescription>
                                  {preset.scienceNote && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>{preset.scienceNote}</span>
                                      </p>
                                    </div>
                                  )}
                                  {preset.physiologicalEffects && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                                      <p className="text-xs text-green-700 dark:text-green-300 flex items-start gap-1">
                                        <Activity className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span><span className="font-medium">ผลทางสรีรวิทยา:</span> {preset.physiologicalEffects}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </ScrollArea>

          <div className="space-y-3 pt-4 border-t">
            {/* Warning/Info message */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <span className="font-medium">หลักการฝึกซ้อม:</span> การกำหนดเซตและครั้งเปรียบเสมือน "การจัดตารางยาตามใบสั่งแพทย์" 
                    หากฝึกน้อยไปร่างกายจะไม่พัฒนา แต่ฝึกหนักเกินไปอาจเกิดการบาดเจ็บ 
                    ดังนั้นการปฏิบัติให้ตรงตามจำนวนเซตและครั้งที่เหมาะสมจึงเป็นกุญแจสำคัญสู่ความสำเร็จ
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPresetDialog(false);
                  setPresetTargetExerciseIdx(null);
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Program Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="assign-program-modal-sb-description">
          <DialogHeader>
            <DialogTitle>มอบหมายโปรแกรม</DialogTitle>
            <DialogDescription id="assign-program-modal-sb-description">
              เลือกลูกเทรนและกำหนดวันเวลาที่ลูกค้าเทรน
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-4 h-[500px]">
            {/* Left: Client List */}
            <div className="col-span-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ค้นหาลูกค้า..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg">
                <div className="p-3 bg-muted/50 border-b">
                  <p className="text-sm font-medium">ลูกค้าทั้งหมด ({filteredClients.length})</p>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="p-2 space-y-1">
                    {filteredClients.map((client) => {
                      const isSelected = selectedClientIds.includes(client.id);
                      return (
                        <div
                          key={client.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleToggleClient(client.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.profileImage} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className={`text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {client.email}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right: Selected Clients & Schedule */}
            <div className="col-span-3 space-y-4">
              <div className="border rounded-lg">
                <div className="p-3 bg-muted/50 border-b">
                  <p className="text-sm font-medium">ลูกค้าที่เลือก ({selectedClientIds.length})</p>
                </div>
                <div className="p-3 min-h-[120px]">
                  {selectedClientIds.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>ยังไม่ได้เลือกลูกเทรน</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedClientIds.map((clientId) => {
                        const client = clients.find(c => c.id === clientId);
                        if (!client) return null;
                        return (
                          <Badge key={clientId} variant="secondary" className="text-sm py-1.5 px-3">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={client.profileImage} />
                              <AvatarFallback className="text-xs">{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {client.name}
                            <X 
                              className="h-3 w-3 ml-2 cursor-pointer" 
                              onClick={() => handleToggleClient(clientId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-semibold text-sm">วันที่เริ่มโปรแกรม</h3>
                
                <div className="space-y-2">
                  <Label>Assignment start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {assignStartDate ? (
                          format(new Date(assignStartDate), "d MMMM yyyy", { locale: th })
                        ) : (
                          <span>เลือกวันที่</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={assignStartDate ? new Date(assignStartDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setAssignStartDate(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    ช่องสำหรับระบุวันที่เริ่มฝึก
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Starting day</Label>
                  <Select
                    value={assignStartDay.toString()}
                    onValueChange={(value) => setAssignStartDay(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(() => {
                          const selectedDay = allDaysWithWeek.find(
                            item => item.day.dayNumber === assignStartDay
                          );
                          if (!selectedDay) return "เลือก Day เริ่มต้น";
                          return `Day ${selectedDay.day.dayNumber}${selectedDay.day.isRestDay ? " (พัก)" : ""}`;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProgram.weeks.map((week) => (
                        <SelectGroup key={week.weekNumber}>
                          <SelectLabel className="text-muted-foreground">- Week {week.weekNumber} -</SelectLabel>
                          {week.days.map((day) => (
                            <SelectItem key={day.dayNumber} value={day.dayNumber.toString()}>
                              Day {day.dayNumber}
                              {day.isRestDay && " (พัก)"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    เลือกได้ว่าจะให้ลูกค้าเริ่มที่ "Day 1" ของโปรแกรมเลย หรือเริ่มข้ามไปวันอื่น
                  </p>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-client">Notify client</Label>
                    <p className="text-xs text-muted-foreground">
                      ส่งแจ้งเตือนไปบอกลูกค้าว่าได้รับโปรแกรมใหม่แล้ว
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className={`h-4 w-4 ${notifyClient ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Switch
                      id="notify-client"
                      checked={notifyClient}
                      onCheckedChange={setNotifyClient}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedClientIds([]);
                setAssignStartDate(new Date().toISOString().split('T')[0]);
                setAssignStartDay(1);
                setNotifyClient(true);
              }}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleAssignProgram}
              disabled={selectedClientIds.length === 0}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              มอบหมายโปรแกรม
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workout Choice Dialog */}
      <Dialog open={showWorkoutChoiceDialog} onOpenChange={setShowWorkoutChoiceDialog}>
        <DialogContent className="max-w-md" aria-describedby="workout-choice-description">
          <DialogHeader>
            <DialogTitle>เพิ่ม Workout</DialogTitle>
            <DialogDescription id="workout-choice-description">
              เลือกวิธีการเพิ่มท่าออกกำลังกาย
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {/* Add Section */}
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-muted"
              onClick={() => {
                setShowWorkoutChoiceDialog(false);
                setShowAddSectionModal(true);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">Add Section</p>
                <p className="text-xs text-muted-foreground">
                  สร้าง Section ใหม่พร้อมกำหนดรูปแบบการฝึก
                </p>
              </div>
            </Button>

            {/* Add Exercise */}
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-muted"
              onClick={() => {
                setShowWorkoutChoiceDialog(false);
                setShowExercisePicker(true);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">Add Exercise</p>
                <p className="text-xs text-muted-foreground">
                  เลือกท่าออกกำลังกายจากคลังโดยตรง
                </p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Options Dialog */}
      <Dialog open={showDayOptionsDialog} onOpenChange={setShowDayOptionsDialog}>
        <DialogContent className="max-w-md" aria-describedby="day-options-description">
          <DialogHeader>
            <DialogTitle>
              จัดการ Day {selectedDayForOptions?.dayNumber}
            </DialogTitle>
            <DialogDescription id="day-options-description">
              เลือกการจัดการสำหรับวันนี้
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => {
                if (selectedDayForOptions) {
                  // ถ้าเป็นวันพัก ให้เปลี่ยนเป็นวันฝึกก่อน
                  const currentDay = selectedProgram?.weeks
                    .find(w => w.weekNumber === selectedDayForOptions.weekNumber)?.days
                    .find(d => d.dayNumber === selectedDayForOptions.dayNumber);
                  
                  if (currentDay?.isRestDay) {
                    handleToggleRestDay(selectedDayForOptions.weekNumber, selectedDayForOptions.dayNumber);
                  }
                  
                  // เก็บข้อมูล day ที่จะเพิ่ม workout
                  setPendingWorkoutDay({
                    weekNumber: selectedDayForOptions.weekNumber,
                    dayNumber: selectedDayForOptions.dayNumber
                  });
                  setSelectedDayNumber(selectedDayForOptions.dayNumber);
                  
                  // เปิด Dialog เลือกทาง
                  setShowWorkoutChoiceDialog(true);
                  setShowDayOptionsDialog(false);
                }
              }}
            >
              <Plus className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-semibold">Workout</p>
                <p className="text-xs text-muted-foreground">เพิ่มท่าออกกำลังกายใหม่</p>
              </div>
            </Button>

            {selectedDayForOptions && (() => {
              const currentDay = selectedProgram?.weeks
                .find(w => w.weekNumber === selectedDayForOptions.weekNumber)?.days
                .find(d => d.dayNumber === selectedDayForOptions.dayNumber);
              const isRestDay = currentDay?.isRestDay || false;
              
              return (
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted"
                  onClick={() => {
                    handleToggleRestDay(selectedDayForOptions.weekNumber, selectedDayForOptions.dayNumber);
                    setShowDayOptionsDialog(false);
                  }}
                >
                  {isRestDay ? (
                    <>
                      <Dumbbell className="h-6 w-6 text-primary" />
                      <div className="text-center">
                        <p className="font-semibold">เปลี่ยนเป็นวันฝึก</p>
                        <p className="text-xs text-muted-foreground">เพิ่มการฝึกในวันนี้</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Moon className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-semibold">ตั้งเป็นวันพัก</p>
                        <p className="text-xs text-muted-foreground">ไม่มีการฝึกในวันนี้</p>
                      </div>
                    </>
                  )}
                </Button>
              );
            })()}

            {selectedDayForOptions && selectedProgram?.weeks
              .find(w => w.weekNumber === selectedDayForOptions.weekNumber)?.days
              .find(d => d.dayNumber === selectedDayForOptions.dayNumber)?.sections && 
              selectedProgram.weeks
                .find(w => w.weekNumber === selectedDayForOptions.weekNumber)?.days
                .find(d => d.dayNumber === selectedDayForOptions.dayNumber)?.sections!.length > 0 && (
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => {
                  if (selectedDayForOptions) {
                    setSelectedDayNumber(selectedDayForOptions.dayNumber);
                    toggleDay(selectedDayForOptions.weekNumber, selectedDayForOptions.dayNumber);
                    setShowDayOptionsDialog(false);
                  }
                }}
              >
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">ดูรายละเอียด</p>
                  <p className="text-xs text-muted-foreground">ดูและแก้ไข Section ทั้งหมด</p>
                </div>
              </Button>
            )}

            <div className="pt-3 border-t">
              <Button
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                disabled={selectedProgram && selectedProgram.weeks[0]?.days.length <= 1}
                onClick={() => {
                  if (selectedDayForOptions) {
                    const totalDays = selectedProgram?.weeks[0]?.days.length || 0;
                    if (totalDays <= 1) {
                      toast.error("ต้องมีอย่างน้อย 1 วัน");
                      return;
                    }
                    setShowDayOptionsDialog(false);
                    handleRemoveDay(selectedDayForOptions.dayNumber);
                  }
                }}
              >
                <Trash className="h-4 w-4 mr-2" />
                ลบวันนี้
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDayOptionsDialog(false)}
              className="flex-1"
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
