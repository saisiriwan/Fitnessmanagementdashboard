import { useState, useEffect } from "react";
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
  Zap,
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Moon,
  Bell,
  Info,
  ChevronUp,
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api"; // ✅ ใช้ API ตามเดิม
import AssignProgramModal from "./AssignProgramModal";
// --- Interfaces (Adapted for UI + API) ---

interface ProgramExercise {
  id?: string; // ID from DB (program_exercises table)
  exerciseId: string;
  sets: number;
  reps: string;
  weight: string;
  rest: number;
  rpe?: number;
  notes?: string;
  duration?: string;
  distance?: string;
}

interface ProgramSection {
  id: string;
  sectionType: string;
  sectionFormat: string;
  name: string;
  duration?: number;
  exercises: ProgramExercise[];
  notes?: string;
  rounds?: number;
  workTime?: number;
  restTime?: number;
}

interface ProgramDay {
  id: string;
  programId?: string; // Needed for update
  weekNumber?: number; // Needed for update
  dayNumber: number;
  name: string;
  sections: ProgramSection[];
  isRestDay: boolean;
}

interface ProgramWeek {
  weekNumber: number;
  days: ProgramDay[];
}

interface Program {
  id: string;
  name: string;
  description?: string;
  duration: number; // In weeks
  daysPerWeek: number;
  weeks: ProgramWeek[];
  isTemplate: boolean;
  assignedClients?: string[];
  assigned_client_count?: number;
  clientId?: string;
  originalTemplateId?: string;
}

// Local State Interfaces for Builder
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

// API Data Interfaces
interface Client {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface ExerciseData {
  id: string;
  name: string;
  category: string;
  modality: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  tracking_fields?: string[];
}

const SECTION_TYPES = [
  {
    value: "warmup",
    label: "Warm-up (อบอุ่นร่างกาย)",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    value: "main",
    label: "Main Work (ฝึกซ้อมหลัก)",
    icon: Dumbbell,
    color: "text-blue-500",
  },
  {
    value: "skill",
    label: "Skill Development (พัฒนาทักษะ)",
    icon: Target,
    color: "text-purple-500",
  },
  {
    value: "cooldown",
    label: "Cool-down (คลายกล้ามเนื้อ)",
    icon: Wind,
    color: "text-green-500",
  },
  {
    value: "custom",
    label: "Custom (กำหนดเอง)",
    icon: Settings,
    color: "text-gray-500",
  },
];

const SECTION_FORMATS = [
  {
    value: "straight-sets",
    label: "Straight Sets",
    description: "เซ็ตปกติ ทำครบเซ็ตก่อนเปลี่ยนท่า",
  },
  {
    value: "circuit",
    label: "Circuit Training",
    description: "ทำทุกท่าเป็นรอบ พักตอนจบรอบ",
  },
  { value: "superset", label: "Superset", description: "ทำ 2 ท่าติดกันไม่พัก" },
  { value: "custom", label: "Custom", description: "กำหนดเอง" },
];

export default function ProgramBuilderSectionBased() {
  const navigate = useNavigate();

  // --- Data State (From API) ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [exercisesList, setExercisesList] = useState<ExerciseData[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);

  // --- UI State ---
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [selectedProgramDetail, setSelectedProgramDetail] =
    useState<Program | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "template" | "custom">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(false);

  // --- Modals State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isQuickAddMode, setIsQuickAddMode] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    isTemplate: true,
  });

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(
    null
  ); // Visual only

  // Section Builder State
  const [newSection, setNewSection] = useState<Partial<ProgramSection>>({
    sectionType: "warmup",
    sectionFormat: "straight-sets",
    name: "",
    duration: 10,
    exercises: [],
    notes: "",
  });
  const [newSectionExercises, setNewSectionExercises] = useState<
    NewSectionExercise[]
  >([]);

  // Exercise Picker
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignStartDate, setAssignStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  // Day Options
  const [showDayOptionsDialog, setShowDayOptionsDialog] = useState(false);
  const [selectedDayForOptions, setSelectedDayForOptions] =
    useState<ProgramDay | null>(null);

  // Workout Choice
  const [showWorkoutChoiceDialog, setShowWorkoutChoiceDialog] = useState(false);

  // Expanded State
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // --- Initial Fetch ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [progRes, exRes, clientRes] = await Promise.all([
        api.get("/programs"),
        api.get("/exercises"),
        api.get("/clients"),
      ]);

      setPrograms(
        progRes.data.map((p: any) => ({
          ...p,
          assigned_client_count: p.assigned_clients?.length || 0,
          isTemplate: p.is_template,
          duration: p.duration_weeks,
          daysPerWeek: p.days_per_week,
          clientId: p.client_id,
        }))
      );
      setExercisesList(exRes.data);
      setClientsList(
        clientRes.data.map((c: any) => ({
          ...c,
          profileImage: c.avatar_url || c.avatar,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    }
  };

  // --- Fetch Detail ---
  useEffect(() => {
    if (selectedProgramId) {
      fetchProgramDetail(selectedProgramId);
    }
  }, [selectedProgramId]);

  const fetchProgramDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/programs/${id}`);
      const { program: programData, schedule: daysData } = res.data;

      // Transform Flat DB Data to Nested UI Structure
      const weeksMap = new Map<number, ProgramDay[]>();

      daysData.forEach((day: any) => {
        const uiDay: ProgramDay = {
          id: day.id.toString(),
          programId: day.program_id.toString(),
          weekNumber: day.week_number,
          dayNumber: day.day_number,
          name: day.name || `Day ${day.day_number}`,
          isRestDay: day.is_rest_day,
          sections:
            day.sections
              ?.map((sec: any) => ({
                id: sec.id.toString(),
                name: sec.name,
                sectionType: sec.type,
                sectionFormat: sec.format,
                duration: sec.duration_seconds
                  ? Math.round(sec.duration_seconds / 60)
                  : 0,
                notes: sec.notes,
                exercises:
                  sec.exercises
                    ?.map((ex: any) => ({
                      id: ex.id.toString(),
                      exerciseId: ex.exercise_id.toString(),
                      sets: ex.sets,
                      reps: ex.reps,
                      weight: ex.weight,
                      rest: ex.rest_seconds,
                      notes: ex.notes,
                    }))
                    .sort((a: any, b: any) => a.order - b.order) || [],
              }))
              .sort((a: any, b: any) => a.order - b.order) || [],
        };

        if (!weeksMap.has(day.week_number)) weeksMap.set(day.week_number, []);
        weeksMap.get(day.week_number)?.push(uiDay);
      });

      const weeks: ProgramWeek[] = Array.from(weeksMap.entries())
        .map(([weekNum, days]) => ({
          weekNumber: weekNum,
          days: days.sort((a, b) => a.dayNumber - b.dayNumber),
        }))
        .sort((a, b) => a.weekNumber - b.weekNumber);

      const totalActiveDays = daysData.filter(
        (d: any) => !d.is_rest_day
      ).length;
      const durationWeeks = programData.duration_weeks || 1;
      const effectiveDaysPerWeek = Math.round(totalActiveDays / durationWeeks);

      const fullProgram: Program = {
        ...programData,
        id: programData.id.toString(),
        isTemplate: programData.is_template,
        duration: programData.duration_weeks,
        daysPerWeek: effectiveDaysPerWeek || programData.days_per_week,
        assigned_client_count: programData.assigned_clients?.length || 0,
        weeks: weeks,
      };

      setSelectedProgramDetail(fullProgram);

      // Auto expand first day
      if (weeks.length > 0 && weeks[0].days.length > 0) {
        setExpandedDays(new Set([weeks[0].days[0].id]));
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast.error("ไม่สามารถโหลดรายละเอียดได้");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions ---

  const handleCreateProgram = async () => {
    if (!createFormData.name.trim()) return;
    try {
      const res = await api.post("/programs", {
        name: createFormData.name,
        description: createFormData.description,
        is_template: createFormData.isTemplate,
        duration_weeks: 1,
        days_per_week: 7,
      });

      toast.success("สร้างโปรแกรมเรียบร้อย");
      setShowCreateModal(false);
      fetchInitialData();
      setSelectedProgramId(res.data.id);
      setView("detail");
    } catch (error) {
      toast.error("สร้างโปรแกรมล้มเหลว");
    }
  };

  const handleCloneProgram = async (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;

    // Note: In real app, this should be a backend endpoint '/programs/clone'
    // simulating for now by creating new
    try {
      const res = await api.post("/programs", {
        name: `${program.name} (Copy)`,
        description: program.description,
        is_template: program.isTemplate,
        duration_weeks: program.duration,
        days_per_week: program.daysPerWeek,
      });
      toast.success("คัดลอกโปรแกรมเรียบร้อย (โครงสร้าง)");
      fetchInitialData();
    } catch (err) {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleDeleteProgram = (id: string) => {
    setProgramToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;
    try {
      await api.delete(`/programs/${programToDelete}`);
      toast.success("ลบโปรแกรมเรียบร้อย");
      setShowDeleteModal(false);
      if (selectedProgramId === programToDelete) {
        setSelectedProgramId(null);
        setView("list");
      }
      fetchInitialData();
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // --- Day/Week Actions ---

  const handleAddWeek = async () => {
    if (!selectedProgramDetail) return;
    const currentWeeks = selectedProgramDetail.weeks;
    const nextWeekNum = currentWeeks.length + 1;

    try {
      const promises = [];
      for (let i = 1; i <= 7; i++) {
        promises.push(
          api.post("/program-days", {
            program_id: parseInt(selectedProgramDetail.id),
            week_number: nextWeekNum,
            day_number: i,
            name: `Day ${i}`,
            is_rest_day: false,
          })
        );
      }
      await Promise.all(promises);
      fetchProgramDetail(selectedProgramDetail.id);
      toast.success("เพิ่มสัปดาห์เรียบร้อย");
    } catch (err) {
      toast.error("เพิ่มสัปดาห์ไม่สำเร็จ");
    }
  };

  const handleAddDay = async () => {
    if (!selectedProgramDetail) return;
    const lastWeek =
      selectedProgramDetail.weeks[selectedProgramDetail.weeks.length - 1];
    const nextDayNum =
      lastWeek.days.reduce((max, d) => Math.max(max, d.dayNumber), 0) + 1;

    try {
      await api.post("/program-days", {
        program_id: parseInt(selectedProgramDetail.id),
        week_number: lastWeek.weekNumber,
        day_number: nextDayNum,
        name: `Day ${nextDayNum}`,
        is_rest_day: false,
      });
      fetchProgramDetail(selectedProgramDetail.id);
      toast.success("เพิ่มวันเรียบร้อย");
    } catch (err) {
      toast.error("เพิ่มวันไม่สำเร็จ");
    }
  };

  const handleSetWeekFrequency = async (week: ProgramWeek, days: number) => {
    if (!selectedProgramDetail) return;
    const currentCount = week.days.length;

    if (days === currentCount) return;

    try {
      if (days > currentCount) {
        // Add days
        const promises = [];
        for (let i = currentCount + 1; i <= days; i++) {
          promises.push(
            api.post("/program-days", {
              program_id: parseInt(selectedProgramDetail.id),
              week_number: week.weekNumber,
              day_number: i,
              name: `Day ${i}`,
              is_rest_day: false,
            })
          );
        }
        await Promise.all(promises);
      } else {
        // Remove days from end
        const daysToRemove = week.days.slice(days);
        const promises = daysToRemove.map((day) =>
          api.delete(`/program-days/${day.id}`)
        );
        await Promise.all(promises);
      }
      fetchProgramDetail(selectedProgramDetail.id);
      toast.success(`ปรับความถี่เป็น ${days} วัน/สัปดาห์`);
    } catch (err) {
      toast.error("ปรับความถี่ไม่สำเร็จ");
    }
  };

  const handleDeleteWeek = async (week: ProgramWeek) => {
    if (!selectedProgramDetail) return;
    if (!confirm(`ยืนยันลบสัปดาห์ที่ ${week.weekNumber}?`)) return;
    try {
      // Delete all days in week
      const promises = week.days.map((day) =>
        api.delete(`/program-days/${day.id}`)
      );
      await Promise.all(promises);
      fetchProgramDetail(selectedProgramDetail.id);
      toast.success("ลบสัปดาห์เรียบร้อย");
    } catch (err) {
      toast.error("ลบสัปดาห์ไม่สำเร็จ");
    }
  };

  const handleToggleRestDay = async (day: ProgramDay) => {
    try {
      await api.put(`/program-days/${day.id}`, {
        program_id: day.programId ? parseInt(day.programId) : undefined,
        week_number: day.weekNumber,
        day_number: day.dayNumber,
        name: day.name,
        is_rest_day: !day.isRestDay,
      });
      if (selectedProgramId) fetchProgramDetail(selectedProgramId);
      toast.success(day.isRestDay ? "เปลี่ยนเป็นวันฝึก" : "เปลี่ยนเป็นวันพัก");
    } catch (err) {
      toast.error("แก้ไขไม่สำเร็จ");
    }
  };

  const handleRemoveDay = async (dayId: string) => {
    try {
      await api.delete(`/program-days/${dayId}`);
      if (selectedProgramId) fetchProgramDetail(selectedProgramId);
      toast.success("ลบวันเรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // --- Section Actions ---

  const handleAddSection = async () => {
    if (!selectedDayId || !newSection.name) return;
    try {
      // 1. Create Section
      const res = await api.post("/program-sections", {
        program_day_id: parseInt(selectedDayId),
        type: newSection.sectionType,
        format: newSection.sectionFormat,
        name: newSection.name,
        duration_seconds: (newSection.duration || 10) * 60,
        notes: newSection.notes,
        order: 99, // simplistic order
      });
      const sectionId = res.data.id;

      // 2. Add Exercises
      if (newSectionExercises.length > 0) {
        const exPromises = newSectionExercises.map((ex, idx) => {
          const firstSet = ex.sets[0];
          return api.post("/program-exercises", {
            program_section_id: parseInt(sectionId),
            exercise_id: parseInt(ex.exerciseId),
            sets: ex.sets.length,
            reps: firstSet?.reps || "10",
            weight: firstSet?.weight || "0",
            rest_seconds: firstSet?.rest || 60,
            order: idx + 1,
          });
        });
        await Promise.all(exPromises);
      }

      toast.success("สร้าง Section เรียบร้อย");
      setShowAddSectionModal(false);
      setNewSection({
        sectionType: "warmup",
        sectionFormat: "straight-sets",
        name: "",
        duration: 10,
        exercises: [],
        notes: "",
      });
      setNewSectionExercises([]);
      if (selectedProgramId) fetchProgramDetail(selectedProgramId);
    } catch (err) {
      toast.error("สร้าง Section ไม่สำเร็จ");
    }
  };

  const handleQuickAddExercise = (day: ProgramDay) => {
    // 1. Prepare context for new section
    setSelectedDayId(day.id);
    setSelectedDayNumber(day.dayNumber);
    // 2. Initialize new section "Main"
    setNewSection({
      sectionType: "main",
      sectionFormat: "straight-sets",
      name: "Main Workout",
      duration: 45,
      exercises: [],
      notes: "",
    });
    setNewSectionExercises([]);
    // 3. Open Pickers
    setShowWorkoutChoiceDialog(false);
    setShowDayOptionsDialog(false);
    setShowExercisePicker(true);
    setShowAddSectionModal(true);
    setIsQuickAddMode(true);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("ลบ Section นี้?")) return;
    try {
      await api.delete(`/program-sections/${sectionId}`);
      if (selectedProgramId) fetchProgramDetail(selectedProgramId);
      toast.success("ลบ Section เรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  // --- Section Builder Helper Functions ---
  const handleAddExerciseToNewSection = (exId: string) => {
    const ex = exercisesList.find((e) => e.id === exId);
    if (!ex) return;
    setNewSectionExercises([
      ...newSectionExercises,
      {
        exerciseId: exId,
        sets: [{ setNumber: 1, reps: "10", weight: "0", rest: 60 }],
      },
    ]);
    setShowExercisePicker(false);
    setExerciseSearchTerm("");
  };

  const handleAddSetToNewSectionExercise = (exIdx: number) => {
    const updated = [...newSectionExercises];
    const currentSets = updated[exIdx].sets;
    const lastSet =
      currentSets.length > 0 ? currentSets[currentSets.length - 1] : null;

    updated[exIdx].sets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet?.reps || "10",
      weight: lastSet?.weight || "0",
      rest: lastSet?.rest || 60,
      rpe: lastSet?.rpe,
    });
    setNewSectionExercises(updated);
  };

  // --- Helpers ---
  const toggleDay = (dayId: string) => {
    const newSet = new Set(expandedDays);
    if (newSet.has(dayId)) newSet.delete(dayId);
    else newSet.add(dayId);
    setExpandedDays(newSet);
  };

  const toggleSection = (secId: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(secId)) newSet.delete(secId);
    else newSet.add(secId);
    setExpandedSections(newSet);
  };

  const getSectionTypeIcon = (type: string) => {
    return SECTION_TYPES.find((t) => t.value === type)?.icon || Settings;
  };

  const getSectionTypeColor = (type: string) => {
    return (
      SECTION_TYPES.find((t) => t.value === type)?.color || "text-gray-500"
    );
  };

  // --- Render ---

  const filteredPrograms = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === "all" ||
        (filterType === "template" && p.isTemplate) ||
        (filterType === "custom" && !p.isTemplate))
  );

  const filteredExercises = exercisesList.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

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
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" /> สร้างโปรแกรม
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาโปรแกรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs
            value={filterType}
            onValueChange={(v: any) => setFilterType(v)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="custom">ปรับแต่ง</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
              onClick={() => {
                setSelectedProgramId(program.id);
                setView("detail");
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {program.isTemplate ? (
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-accent/10 text-accent"
                      >
                        Template
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mb-2">
                        Custom
                      </Badge>
                    )}
                    <CardTitle className="text-base line-clamp-1">
                      {program.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs mt-1">
                      {program.description || "ไม่มีรายละเอียด"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneProgram(program.id);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" /> คัดลอก
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProgram(program.id);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" /> ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{program.duration} สัปดาห์</p>
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-muted-foreground">Freq</p>
                    <p className="font-semibold">{program.daysPerWeek} วัน</p>
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-muted-foreground">Clients</p>
                    <p className="font-semibold">
                      {program.assigned_client_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างโปรแกรมใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ชื่อโปรแกรม</Label>
                <Input
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>รายละเอียด</Label>
                <Textarea
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={createFormData.isTemplate}
                  onCheckedChange={(c) =>
                    setCreateFormData({ ...createFormData, isTemplate: c })
                  }
                />
                <Label>ตั้งเป็น Template</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProgram}>สร้าง</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>
                การลบนี้ไม่สามารถกู้คืนได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProgram}
                className="bg-destructive text-white"
              >
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // --- Detail View ---
  if (!selectedProgramDetail)
    return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
        <Button variant="ghost" size="icon" onClick={() => setView("list")}>
          <ChevronDown className="h-5 w-5 rotate-90" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">
              {selectedProgramDetail.name}
            </h1>
            {selectedProgramDetail.isTemplate && (
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                Template
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {selectedProgramDetail.description || "ไม่มีคำอธิบาย"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleCloneProgram(selectedProgramDetail.id)}
          >
            <Copy className="h-4 w-4 mr-2" /> คัดลอก
          </Button>
          <Button onClick={() => setShowAssignModal(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" /> มอบหมาย
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CalendarIcon className="h-5 w-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-bold text-lg">
              {selectedProgramDetail.weeks.length} Weeks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-5 w-5 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Sections</p>
            <p className="font-bold text-lg">
              {selectedProgramDetail.weeks.reduce(
                (acc, w) =>
                  acc +
                  w.days.reduce(
                    (dAcc, d) => dAcc + (d.sections?.length || 0),
                    0
                  ),
                0
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Activity className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Exercises</p>
            <p className="font-bold text-lg">
              {selectedProgramDetail.weeks.reduce(
                (acc, w) =>
                  acc +
                  w.days.reduce(
                    (dAcc, d) =>
                      dAcc +
                      d.sections.reduce(
                        (sAcc, s) => sAcc + s.exercises.length,
                        0
                      ),
                    0
                  ),
                0
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Week/Day Builder */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> ตารางฝึกซ้อม
          </h2>
          {/* Add Day button removed as requested */}
        </div>

        {selectedProgramDetail.weeks.map((week) => (
          <Card key={week.weekNumber} className="overflow-hidden">
            <CardHeader className="bg-muted/30 py-3 border-b flex flex-row justify-between items-center">
              <CardTitle className="text-base">
                สัปดาห์ที่ {week.weekNumber === 0 ? 1 : week.weekNumber}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem className="opacity-50 pointer-events-none text-xs font-semibold">
                    ตั้งค่าความถี่ฝึก
                  </DropdownMenuItem>
                  {[3, 4, 5, 6, 7].map((days) => (
                    <DropdownMenuItem
                      key={days}
                      onClick={() => handleSetWeekFrequency(week, days)}
                      className={week.days.length === days ? "bg-accent" : ""}
                    >
                      <Dumbbell className="h-4 w-4 mr-2" /> {days} วัน/สัปดาห์
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteWeek(week)}
                  >
                    <Trash className="h-4 w-4 mr-2" /> ลบสัปดาห์
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 bg-background">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {week.days.map((day) => {
                  const isExpanded = expandedDays.has(day.id);
                  return (
                    <div key={day.id} className="flex flex-col">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm font-medium">
                          Day {day.dayNumber === 0 ? 1 : day.dayNumber}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDayForOptions(day);
                                setShowDayOptionsDialog(true);
                              }}
                            >
                              จัดการ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleRestDay(day)}
                            >
                              {day.isRestDay
                                ? "เปลี่ยนเป็นวันฝึก"
                                : "ตั้งเป็นวันพัก"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveDay(day.id)}
                            >
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDayForOptions(day);
                          setShowDayOptionsDialog(true);
                        }}
                        className={`group relative border rounded-lg p-4 transition-all hover:shadow-md flex flex-col items-center justify-center min-h-[120px] text-center ${
                          day.isRestDay
                            ? "bg-muted/20 border-dashed"
                            : "bg-card hover:border-primary/50"
                        }`}
                      >
                        {day.isRestDay ? (
                          <>
                            <Moon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">
                              Rest Day
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Dumbbell className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-primary">
                                {day.sections.length} Sections
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                              คลิกเพื่อจัดการ
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Day Details (Inside Week Card) */}
              {week.days
                .filter((d) => expandedDays.has(d.id) && !d.isRestDay)
                .map((day) => (
                  <Card
                    key={`expanded-${day.id}`}
                    className="mt-6 border-2 border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-200"
                  >
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                          รายละเอียด Day{" "}
                          {day.dayNumber === 0 ? 1 : day.dayNumber}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDayId(day.id);
                            setSelectedDayNumber(day.dayNumber);
                            setShowAddSectionModal(true);
                            setIsQuickAddMode(false);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> เพิ่ม Section
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleDay(day.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {day.sections.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                          <p>ยังไม่มี Section การฝึกในวันนี้</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            กด "เพิ่ม Section" เพื่อเริ่มสร้างโปรแกรม
                          </p>
                        </div>
                      ) : (
                        day.sections.map((section) => {
                          const isSecExpanded = expandedSections.has(
                            section.id
                          );
                          const Icon = getSectionTypeIcon(section.sectionType);
                          const color = getSectionTypeColor(
                            section.sectionType
                          );

                          return (
                            <div
                              key={section.id}
                              className="border rounded-xl overflow-hidden bg-white"
                            >
                              {/* Section Header */}
                              <div
                                className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleSection(section.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {isSecExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <div
                                    className={`p-1.5 rounded ${color.replace(
                                      "text-",
                                      "bg-"
                                    )}/10`}
                                  >
                                    <Icon className={`h-4 w-4 ${color}`} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {section.name}
                                    </p>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5"
                                      >
                                        {section.sectionFormat}
                                      </Badge>
                                      <span>
                                        {section.exercises.length} ท่า
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Section Body (Exercises) */}
                              {isSecExpanded && (
                                <div className="p-3 bg-background space-y-2 border-t">
                                  {section.exercises.map((ex, idx) => {
                                    const exData = exercisesList.find(
                                      (e) => e.id.toString() === ex.exerciseId
                                    );
                                    return (
                                      <div
                                        key={idx}
                                        className="border rounded p-3 flex justify-between items-start"
                                      >
                                        <div>
                                          <p className="font-medium text-sm">
                                            {exData?.name ||
                                              `Exercise ID: ${ex.exerciseId}`}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {ex.sets} Sets x {ex.reps} Reps •{" "}
                                            {ex.rest}s Rest
                                          </p>
                                          {ex.notes && (
                                            <p className="text-xs text-blue-600 mt-1">
                                              Note: {ex.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAddWeek}
            className="border-dashed border-2"
          >
            <Plus className="h-5 w-5 mr-2" /> เพิ่มสัปดาห์ใหม่
          </Button>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Add Section Modal (Complex Builder) */}
      <Dialog open={showAddSectionModal} onOpenChange={setShowAddSectionModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              เพิ่ม Section ใหม่ - Day {selectedDayNumber}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 p-1">
              {!isQuickAddMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ประเภท Section</Label>
                    <Select
                      value={newSection.sectionType}
                      onValueChange={(v) =>
                        setNewSection({ ...newSection, sectionType: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>รูปแบบ (Format)</Label>
                    <Select
                      value={newSection.sectionFormat}
                      onValueChange={(v) =>
                        setNewSection({ ...newSection, sectionFormat: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_FORMATS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {!isQuickAddMode && (
                <div className="space-y-2">
                  <Label>ชื่อ Section</Label>
                  <Input
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    placeholder="เช่น Chest & Triceps"
                  />
                </div>
              )}

              {/* Exercise Builder Area */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex justify-between items-center">
                  <Label>ท่าฝึกใน Section ({newSectionExercises.length})</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExercisePicker(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> เพิ่มท่า
                  </Button>
                </div>

                <div className="space-y-3">
                  {newSectionExercises.map((ex, idx) => {
                    const exData = exercisesList.find(
                      (e) => e.id === ex.exerciseId
                    );
                    return (
                      <Card key={idx} className="p-3">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-sm">
                            {exData?.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => {
                              const updated = [...newSectionExercises];
                              updated.splice(idx, 1);
                              setNewSectionExercises(updated);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {ex.sets.map((set, setIdx) => {
                            const trackingFields = exData?.tracking_fields || [
                              "reps",
                              "weight",
                            ];

                            return (
                              <div
                                key={setIdx}
                                className="border rounded-lg p-3 space-y-3 bg-white relative group"
                              >
                                {/* HEADER: Set Number & Delete */}
                                <div className="flex justify-between items-center">
                                  <Badge
                                    variant="secondary"
                                    className="px-2 py-0.5 text-xs font-normal bg-muted text-muted-foreground"
                                  >
                                    Set {set.setNumber}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      const updated = [...newSectionExercises];
                                      updated[idx].sets.splice(setIdx, 1);
                                      // Re-number sets
                                      updated[idx].sets.forEach(
                                        (s, i) => (s.setNumber = i + 1)
                                      );
                                      setNewSectionExercises(updated);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* INPUTS GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {trackingFields.map((field) => (
                                    <div key={field} className="space-y-1">
                                      <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">
                                        {field}
                                      </span>
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-8 text-center"
                                        value={(set as any)[field] || ""}
                                        onChange={(e) => {
                                          let val = e.target.value;
                                          if (parseFloat(val) < 0) val = "0";
                                          const updated = [
                                            ...newSectionExercises,
                                          ];
                                          const currentSet =
                                            updated[idx].sets[setIdx];
                                          (currentSet as any)[field] = val;
                                          setNewSectionExercises(updated);
                                        }}
                                      />
                                    </div>
                                  ))}

                                  {/* Always show Rest */}
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">
                                      Rest (s)
                                    </span>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="h-8 text-center"
                                      value={set.rest || ""}
                                      onChange={(e) => {
                                        let val = parseInt(e.target.value);
                                        if (val < 0) val = 0;
                                        const updated = [
                                          ...newSectionExercises,
                                        ];
                                        updated[idx].sets[setIdx].rest = isNaN(
                                          val
                                        )
                                          ? 0
                                          : val;
                                        setNewSectionExercises(updated);
                                      }}
                                    />
                                  </div>

                                  {/* RPE - Assuming implicit for now or add to trackingFields if needed, but let's add a dedicated spot if not in trackingFields, matching the design which shows RPE explicitly */}
                                  {!trackingFields.includes("rpe") && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">
                                        RPE
                                      </span>
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-8 text-center"
                                        value={set.rpe || ""}
                                        onChange={(e) => {
                                          let val = parseFloat(e.target.value);
                                          if (val < 0) val = 0;
                                          const updated = [
                                            ...newSectionExercises,
                                          ];
                                          updated[idx].sets[setIdx].rpe = isNaN(
                                            val
                                          )
                                            ? undefined
                                            : val;
                                          setNewSectionExercises(updated);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* NOTES */}
                                <div>
                                  <Input
                                    placeholder="หมายเหตุ..."
                                    className="h-8 text-xs border-dashed focus:border-solid bg-transparent"
                                    value={set.notes || ""}
                                    onChange={(e) => {
                                      const updated = [...newSectionExercises];
                                      updated[idx].sets[setIdx].notes =
                                        e.target.value;
                                      setNewSectionExercises(updated);
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-xs"
                            onClick={() =>
                              handleAddSetToNewSectionExercise(idx)
                            }
                          >
                            + เพิ่ม Set
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleAddSection}>บันทึก Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker */}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เลือกท่าฝึก</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="ค้นหา..."
            value={exerciseSearchTerm}
            onChange={(e) => setExerciseSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-2 hover:bg-accent cursor-pointer rounded flex justify-between items-center"
                  onClick={() => handleAddExerciseToNewSection(ex.id)}
                >
                  <span>{ex.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {ex.category}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Day Options Modal */}
      <Dialog
        open={showDayOptionsDialog}
        onOpenChange={setShowDayOptionsDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              จัดการ Day {selectedDayForOptions?.dayNumber}
            </DialogTitle>
            <DialogDescription>เลือกการจัดการสำหรับวันนี้</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* 1. Add Workout Card */}
            <button
              className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all space-y-3 h-[200px]"
              onClick={() => {
                if (selectedDayForOptions) {
                  if (selectedDayForOptions.isRestDay)
                    handleToggleRestDay(selectedDayForOptions);
                  setSelectedDayId(selectedDayForOptions.id);
                  setSelectedDayNumber(selectedDayForOptions.dayNumber);
                  setShowWorkoutChoiceDialog(true);
                  setShowDayOptionsDialog(false);
                }
              }}
            >
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Workout</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  เพิ่มท่าออกกำลังกายใหม่
                </p>
              </div>
            </button>

            {/* 2. Toggle Rest Day Card */}
            <button
              className={`flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-slate-50 transition-all space-y-3 h-[200px] ${
                selectedDayForOptions?.isRestDay
                  ? "border-green-200 bg-green-50/50"
                  : "hover:border-purple-200"
              }`}
              onClick={async () => {
                if (selectedDayForOptions) {
                  console.log("🔵 BEFORE Toggle:", selectedDayForOptions);
                  await handleToggleRestDay(selectedDayForOptions);
                  console.log("🟢 AFTER Toggle Request Sent");
                  setShowDayOptionsDialog(false);
                }
              }}
            >
              {selectedDayForOptions?.isRestDay ? (
                <>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">เปลี่ยนเป็นวันฝึก</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                      เพิ่มการฝึกในวันนี้
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                    <Moon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">ตั้งเป็นวันพัก</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                      ไม่มีการฝึกในวันนี้
                    </p>
                  </div>
                </>
              )}
            </button>

            {/* 3. View Details Card */}
            <button
              className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-slate-50 hover:border-orange-200 transition-all space-y-3 h-[200px]"
              onClick={() => {
                if (selectedDayForOptions) {
                  if (selectedDayForOptions.isRestDay) {
                    // Do nothing or maybe un-rest?
                  } else {
                    // Expand the day
                    toggleDay(selectedDayForOptions.id);
                    // Optional: Scroll to it
                  }
                  setShowDayOptionsDialog(false);
                }
              }}
            >
              <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">ดูรายละเอียด</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ดูและแก้ไข Section ทั้งหมด
                </p>
              </div>
            </button>
          </div>

          <DialogFooter className="sm:justify-center border-t pt-4 mt-2">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
              onClick={() => {
                if (selectedDayForOptions) {
                  handleRemoveDay(selectedDayForOptions.id);
                  setShowDayOptionsDialog(false);
                }
              }}
            >
              <Trash className="h-4 w-4 mr-2" /> ลบวันนี้
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowDayOptionsDialog(false)}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Modal Component */}
      <AssignProgramModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        programId={selectedProgramId ? parseInt(selectedProgramId) : null}
        programName={selectedProgramDetail?.name || ""}
        onSuccess={() => {
          setTimeout(() => {
            setView("list");
          }, 500);
          fetchInitialData();
        }}
      />

      {/* Workout Choice Dialog (Step 2) */}
      <Dialog
        open={showWorkoutChoiceDialog}
        onOpenChange={setShowWorkoutChoiceDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">เพิ่ม Workout</DialogTitle>
            <DialogDescription>
              เลือกวิธีการเพิ่มท่าออกกำลังกาย
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Option 1: Add Section */}
            <button
              className="flex flex-col items-center justify-center p-6 border rounded-xl bg-slate-50/50 hover:bg-slate-100 hover:border-blue-200 transition-all space-y-3 h-[180px]"
              onClick={() => {
                setShowWorkoutChoiceDialog(false);
                setShowAddSectionModal(true);
                setIsQuickAddMode(false);
                // Ensure clear state if needed
                setNewSection({
                  sectionType: "main",
                  sectionFormat: "straight-sets",
                  name: "",
                  duration: 45,
                  exercises: [],
                  notes: "",
                });
                setNewSectionExercises([]);
              }}
            >
              <div className="p-3 bg-slate-200 rounded-full text-slate-700">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Add Section</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  สร้าง Section ใหม่พร้อมกำหนดรูปแบบการฝึก
                </p>
              </div>
            </button>

            {/* Option 2: Add Exercise Directly */}
            <button
              className="flex flex-col items-center justify-center p-6 border rounded-xl bg-white hover:bg-slate-50 hover:border-orange-200 transition-all space-y-3 h-[180px]"
              onClick={() => {
                if (selectedDayForOptions)
                  handleQuickAddExercise(selectedDayForOptions);
              }}
            >
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Add Exercise</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  เลือกท่าออกกำลังกายจากคลังโดยตรง
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
