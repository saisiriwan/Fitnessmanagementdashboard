import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash,
  SlidersHorizontal,
  Send,
  Search,
  ArrowLeft,
  Dumbbell,
  Clock,
  Repeat,
  Weight,
  Users,
  Battery,
  Apple,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner@2.0.3";
import { useApp, Program, ProgramDay as AppProgramDay, ProgramExercise as AppProgramExercise } from "./AppContext";
import AssignProgramModal from "./AssignProgramModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface สำหรับ Component (ใช้ร่วมกับ AppContext)
interface ProgramWithCount extends Program {
  assigned_client_count?: number;
  isTemplate?: boolean;
  originalTemplateId?: string;
  clientId?: string;
}

export default function ProgramBuilder() {
  const navigate = useNavigate();
  const { 
    programs: contextPrograms, // ⚠️ DEPRECATED
    programTemplates, // ✅ ใช้ตัวนี้แทน
    exercises: contextExercises, 
    addProgram, // ⚠️ DEPRECATED
    addProgramTemplate, // ✅ ใช้ตัวนี้แทน
    updateProgram, // ⚠️ DEPRECATED
    updateProgramTemplate, // ✅ ใช้ตัวนี้แทน
    deleteProgram, // ⚠️ DEPRECATED
    deleteProgramTemplate // ✅ ใช้ตัวนี้แทน
  } = useApp();
  
  // State
  const [programs, setPrograms] = useState<ProgramWithCount[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // State สำหรับ Form สร้างโปรแกรม
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Program Detail State
  const [programSchedule, setProgramSchedule] = useState<AppProgramDay[]>([]);

  // Modal State
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newExerciseId, setNewExerciseId] = useState<string>("");
  const [truncate, setTruncate] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // View State
  const [view, setView] = useState<"list" | "detail">("list");

  // Clipboard State
  const [clipboard, setClipboard] = useState<{
    exercises: AppProgramExercise[];
  } | null>(null);

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  // Load Programs from Context (✅ ใช้ programTemplates แทน)
  useEffect(() => {
    // ใช้ programTemplates แทน contextPrograms
    const templates = programTemplates.length > 0 ? programTemplates : contextPrograms;
    const mappedData = templates.map((p) => ({
      ...p,
      assigned_client_count: 0, // ⚠️ TODO: นับจาก programInstances แทน assignedClients
    }));
    setPrograms(mappedData);
  }, [programTemplates, contextPrograms]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Load program schedule when selecting a program
  useEffect(() => {
    if (selectedProgram) {
      // Flatten weeks into days
      const allDays: AppProgramDay[] = [];
      selectedProgram.weeks.forEach((week) => {
        week.days.forEach((day) => {
          allDays.push(day);
        });
      });
      setProgramSchedule(allDays);
    }
  }, [selectedProgram]);

  // Create Program Handler
  const handleCreateProgram = () => {
    if (!formData.name) {
      toast.error("กรุณากรอกชื่อโปรแกรม");
      return;
    }

    try {
      // เริ่มต้นด้วย 1 สัปดาห์เท่านั้น (7 วัน)
      const weeks = [{
        weekNumber: 1,
        days: Array.from({ length: 7 }).map((_, dayIdx) => ({
          dayNumber: dayIdx + 1,
          name: `Day ${dayIdx + 1}`,
          exercises: [],
        })),
      }];

      const newProgramId = addProgramTemplate({
        name: formData.name,
        description: formData.description,
        duration: 1, // เริ่มต้นที่ 1 สัปดาห์
        daysPerWeek: 7, // 7 วันต่อสัปดาห์
        weeks: weeks,
        // ✅ createdAt และ id จะถูกสร้างอัตโนมัติใน addProgramTemplate
      });

      toast.success("สร้างโปรแกรมเรียบร้อยแล้ว");
      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
      });

      setSelectedProgramId(newProgramId);
      setView("detail");
    } catch (err) {
      console.error(err);
      toast.error("สร้างโปรแกรมไม่สำเร็จ");
    }
  };

  const handleDeleteProgram = (id: string) => {
    if (!confirm("คุณต้องการลบโปรแกรมนี้ใช่หรือไม่?")) return;
    try {
      // ✅ ใช้ deleteProgramTemplate แทน deleteProgram
      deleteProgramTemplate(id);
      toast.success("ลบโปรแกรมเรียบร้อย");
    } catch (err) {
      console.error("Failed to delete program", err);
      toast.error("ลบโปรแกรมไม่สำเร็จ");
    }
  };

  // Handlers for Exercises
  const handleUpdateExercise = (exerciseId: string, field: string, value: any) => {
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) =>
          ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
        ),
      })),
    }));

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("บันทึกการแก้ไขเรียบร้อย");
  };

  const handleDeleteExercise = (dayNumber: number, exerciseId: string) => {
    if (!confirm("คุณต้องการลบท่าฝึกนี้ใช่หรือไม่?")) return;
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, exercises: day.exercises.filter((ex) => ex.exerciseId !== exerciseId) }
          : day
      ),
    }));

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("ลบท่าฝึกเรียบร้อย");
  };

  const handleAddExercise = () => {
    if (!selectedDay || !newExerciseId || !selectedProgram) return;

    const exercise = contextExercises.find((ex) => ex.id === newExerciseId);
    if (!exercise) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === selectedDay
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  exerciseId: newExerciseId,
                  sets: 3,
                  reps: "10",
                  weight: "0",
                  rest: 60,
                  notes: "",
                },
              ],
            }
          : day
      ),
    }));

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    setNewExerciseId("");
    toast.success("เพิ่มท่าฝึกเรียบร้อย");
  };

  const handleAddWeek = () => {
    if (!selectedProgram) return;

    const newWeekNumber = selectedProgram.weeks.length + 1;
    const newWeek = {
      weekNumber: newWeekNumber,
      days: Array.from({ length: 7 }).map((_, dayIdx) => ({
        dayNumber: (newWeekNumber - 1) * 7 + dayIdx + 1,
        name: `Day ${dayIdx + 1}`,
        exercises: [],
      })),
    };

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, {
      duration: selectedProgram.duration + 1,
      weeks: [...selectedProgram.weeks, newWeek],
    });

    toast.success("เพิ่มสัปดาห์เรียบร้อย");
  };

  const handleDeleteWeek = () => {
    if (!selectedProgram) return;
    if (selectedProgram.duration <= 1) {
      toast.error("ไม่สามารถลบสัปดาห์สุดท้ายได้");
      return;
    }

    if (
      !confirm(
        "คุณต้องการลบสัปดาห์ล่าสุดใช่หรือไม่? ข้อมูลในสัปดาห์นั้นจะหายไป"
      )
    )
      return;

    const updatedWeeks = selectedProgram.weeks.slice(0, -1);
    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, {
      duration: selectedProgram.duration - 1,
      weeks: updatedWeeks,
    });

    toast.success("ลบสัปดาห์เรียบร้อย");
  };

  const handleMakeRestDay = (dayNumber: number) => {
    if (!selectedProgram) return;

    if (
      !confirm(
        `ต้องการกำหนด Day ${dayNumber} เป็นวันพัก? ข้อมูลท่าฝึกทั้งหมดในวันนี้จะถูกลบ`
      )
    )
      return;

    // Find or create "Rest Day" exercise
    let restExercise = contextExercises.find((ex) => ex.name === "Rest Day");
    
    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: restExercise
                ? [
                    {
                      exerciseId: restExercise.id,
                      sets: 0,
                      reps: "0",
                      weight: "0",
                      rest: 0,
                      notes: "พักผ่อนให้เพียงพอ",
                    },
                  ]
                : [],
            }
          : day
      ),
    }));

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success(`กำหนด Day ${dayNumber} เป็นวันพักเรียบร้อย`);
  };

  // Habit State
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitName, setHabitName] = useState("");

  const handleAddHabit = () => {
    if (!habitName || !selectedDay || !selectedProgram) return;

    // For now, treat habits as regular exercises
    // In a real app, you might want a separate category
    
    toast.success("เพิ่ม Habit เรียบร้อย");
    setShowHabitModal(false);
    setHabitName("");
  };

  const handleCopyDay = (dayNumber: number) => {
    const day = programSchedule.find((d) => d.dayNumber === dayNumber);
    if (day && day.exercises && day.exercises.length > 0) {
      setClipboard({ exercises: day.exercises });
      toast.success("คัดลอกข้อมูลวันเรียบร้อย");
    } else {
      toast.info("ไม่มีข้อมูลท่าฝึกให้คัดลอก");
    }
  };

  const handlePasteDay = (dayNumber: number) => {
    if (!clipboard || !selectedProgram) return;

    if (
      !confirm(
        `ต้องการวางข้อมูลท่าฝึก ${clipboard.exercises.length} รายการลงใน Day ${dayNumber}?`
      )
    )
      return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: [...day.exercises, ...clipboard.exercises],
            }
          : day
      ),
    }));

    // ✅ ใช้ updateProgramTemplate แทน updateProgram
    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("วางข้อมูลเรียบร้อย");
  };

  // Duplicate Program Handler
  const handleDuplicateProgram = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;

    try {
      // ✅ ใช้ addProgramTemplate แทน addProgram
      const newProgramId = addProgramTemplate({
        name: `${program.name} (สำเนา)`,
        description: program.description,
        duration: program.duration,
        daysPerWeek: program.daysPerWeek,
        weeks: JSON.parse(JSON.stringify(program.weeks)), // Deep clone
      });

      toast.success("คัดลอกโปรแกรมเรียบร้อย");
      setSelectedProgramId(newProgramId);
      setView("detail");
    } catch (err) {
      console.error("Failed to duplicate program", err);
      toast.error("คัดลอกโปรแกรมไม่สำเร็จ");
    }
  };

  if (loading && programs.length === 0 && !isCreating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (view === "list") {
    return (
      <div className="container mx-auto p-4 lg:p-8 max-w-7xl space-y-8">
        {/* Header with Action Button */}
        <div className="flex items-center justify-end">
          <Button
            onClick={() => setIsCreating(true)}
            className="gap-2 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            สร้างโปรแกรมใหม่
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ค้นหาโปรแกรม..." className="pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            ตัวกรอง
          </Button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 bg-white rounded-2xl overflow-hidden"
              onClick={() => {
                setSelectedProgramId(program.id);
                setView("detail");
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {program.duration * 7} วัน
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{program.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {program.description || "ไม่มีรายละเอียด"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {program.assigned_client_count || 0} ลูกค้าที่ใช้งาน
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProgramId(program.id);
                    setShowAssignModal(true);
                  }}
                >
                  <Send className="mr-2 h-3 w-3" />
                  มอบหมาย
                </Button>
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
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProgramId(program.id);
                        setView("detail");
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      แก้ไขโปรแกรม
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateProgram(program.id);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      คัดลอกโปรแกรม
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProgram(program.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      ลบโปรแกรม
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}

          {programs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                ยังไม่มีโปรแกรมฝึกซ้อม
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                เริ่มต้นสร้างโปรแกรมการฝึกซ้อมแรกของคุณ
                เพื่อมอบหมายให้กับลูกค้าและติดตามผลลัพธ์
              </p>
              <Button onClick={() => setIsCreating(true)}>
                สร้างโปรแกรมแรกของคุณ
              </Button>
            </div>
          )}
        </div>

        {/* Create Program Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 shadow-xl">
              <CardHeader>
                <CardTitle>เพิ่มโปรแกรมใหม่</CardTitle>
                <CardDescription>
                  สร้างโปรแกรมการฝึกซ้อมใหม่สำหรับลูกค้าของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prog-name">ชื่อโปรแกรม</Label>
                  <Input
                    id="prog-name"
                    placeholder="เช่น Hypertrophy Phase 1"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prog-desc">
                    รายละเอียด{" "}
                    <span className="text-muted-foreground font-normal">
                      (ไม่บังคับ)
                    </span>
                  </Label>
                  <Textarea
                    id="prog-desc"
                    placeholder="อธิบายเป้าหมายของโปรแกรมนี้..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button onClick={handleCreateProgram}>สร้างโปรแกรม</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Habit Modal */}
        <Dialog open={showHabitModal} onOpenChange={setShowHabitModal}>
          <DialogContent className="max-w-sm" aria-describedby="habit-modal-description">
            <DialogHeader>
              <DialogTitle>เพิ่ม Habit ใหม่</DialogTitle>
              <DialogDescription id="habit-modal-description">
                สร้างพฤติกรรมหรือเป้าหมายที่ต้องการติดตามในวันนี้ (เช่น ดื่มน้ำ,
                นอนเร็ว)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อ Habit</Label>
                <Input
                  placeholder="เช่น ดื่มน้ำ 3 ลิตร, เดิน 10,000 ก้าว"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowHabitModal(false)}
              >
                ยกเลิก
              </Button>
              <Button onClick={handleAddHabit}>บันทึก</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AssignProgramModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          programId={selectedProgramId}
          programName={
            programs.find((p) => p.id === selectedProgramId)?.name || ""
          }
        />
      </div>
    );
  }

  // --- DETAIL VIEW (Weekly Grid) ---
  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 pb-6 border-b border-slate-100">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:bg-transparent hover:text-orange-600 text-slate-500 transition-colors"
          onClick={() => setView("list")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปหน้ารายการ
        </Button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-navy-900">
                {selectedProgram?.name}
              </h1>
              <Badge
                variant="secondary"
                className="gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100 px-3 py-1 rounded-full"
              >
                {selectedProgram?.duration}{" "}
                {selectedProgram?.duration === 1 ? "สัปดาห์" : "สัปดาห์"}
              </Badge>
            </div>
            <p className="text-slate-500 max-w-2xl text-lg">
              {selectedProgram?.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                <span>
                  มอบหมายแล้ว {selectedProgram?.assigned_client_count || 0} คน
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>
                  แก้ไขล่าสุดเมื่อ {new Date().toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-navy-900"
            >
              <Edit className="h-4 w-4" />
              แก้ไขข้อมูล
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-orange-500/20 bg-navy-900 hover:bg-navy-800 text-white h-11 px-6 rounded-xl"
              onClick={() => setShowAssignModal(true)}
            >
              <Send className="h-4 w-4" />
              มอบหมายโปรแกรม
            </Button>
          </div>
        </div>
      </div>

      {/* Workouts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ตารางฝึกซ้อม</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border shadow-sm">
              <Switch
                id="truncate"
                checked={truncate}
                onCheckedChange={setTruncate}
              />
              <Label htmlFor="truncate" className="text-sm cursor-pointer">
                ย่อมุมมอง
              </Label>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="space-y-8">
          {selectedProgram &&
            Array.from({ length: selectedProgram.duration }).map(
              (_, weekIndex) => {
                const weekNumber = weekIndex + 1;
                return (
                  <Card
                    key={weekNumber}
                    className="overflow-hidden border-none shadow-md"
                  >
                    <CardHeader className="bg-transparent pb-2 px-0 border-b border-slate-100 mb-4 mx-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl font-bold text-navy-900">
                            สัปดาห์ที่ {weekNumber}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                /* Handle week actions */
                              }}
                            >
                              คัดลอกสัปดาห์
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const dayNumber = weekIndex * 7 + dayIndex + 1;
                          const dayData = programSchedule.find(
                            (d) => d.day_number === dayNumber
                          );
                          const exercises = dayData?.exercises || [];
                          const exerciseCount = exercises.length;

                          return (
                            <div
                              key={dayIndex}
                              className="group relative flex flex-col min-h-[180px] p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer text-left"
                              onClick={() => handleDayClick(dayNumber)}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700 transition-colors">
                                  Day {dayIndex + 1}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-full shadow-sm">
                                  #{dayNumber}
                                </span>
                              </div>

                              <div className="flex-1 space-y-2">
                                {exerciseCount > 0 ? (
                                  <>
                                    {!truncate &&
                                      exercises.slice(0, 3).map((ex, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-2 text-xs"
                                        >
                                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                          <span className="truncate">
                                            {ex.exercise_name || "Exercise"}
                                          </span>
                                        </div>
                                      ))}
                                    {truncate && (
                                      <div className="flex flex-col items-center justify-center h-full text-primary font-medium">
                                        <span className="text-2xl">
                                          {exerciseCount}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          รายการ
                                        </span>
                                      </div>
                                    )}
                                    {!truncate && exercises.length > 3 && (
                                      <div className="text-xs text-muted-foreground pl-3.5">
                                        + อีก {exercises.length - 3} รายการ
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 group-hover:text-primary/80 transition-colors">
                                    <Plus className="h-6 w-6 mb-1" />
                                    <span className="text-xs">
                                      แตะเพื่อเพิ่ม
                                    </span>
                                  </div>
                                )}
                              </div>

                              {!truncate && exerciseCount > 0 && (
                                <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                                  <span>{exerciseCount} ท่าฝึก</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
        </div>

        {/* Add Week Button */}
        <div className="flex items-center justify-center gap-4 py-8 border-t border-dashed">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={handleAddWeek}
          >
            <Plus className="h-4 w-4" />
            เพิ่มสัปดาห์
          </Button>

          {selectedProgram && selectedProgram.duration > 1 && (
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteWeek}
            >
              <Trash className="h-4 w-4" />
              ลบสัปดาห์ล่าสุด
            </Button>
          )}
        </div>
      </div>

      {/* Day Editor Dialog */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
      >
        <DialogContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="day-editor-description">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl">
              วันที่ {selectedDay}
            </DialogTitle>
            <DialogDescription id="day-editor-description">
              จัดการท่าฝึกและรายละเอียดสำหรับวันนี้
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-end absolute top-6 right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  เพิ่มเติม
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => selectedDay && handleMakeRestDay(selectedDay)}
                >
                  <Battery className="mr-2 h-4 w-4" />
                  ตั้งเป็นวันพัก
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setShowHabitModal(true);
                  }}
                >
                  <Apple className="mr-2 h-4 w-4" />
                  เพิ่ม Habit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => selectedDay && handleCopyDay(selectedDay)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  คัดลอกวันนี้
                </DropdownMenuItem>
                {clipboard && (
                  <DropdownMenuItem
                    onClick={() =>
                      selectedDay && handlePasteDay(selectedDay)
                    }
                  >
                    <ClipboardPaste className="mr-2 h-4 w-4" />
                    วางข้อมูล ({clipboard.exercises.length} รายการ)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-6 py-6">
            {/* Add Exercise */}
            <div className="space-y-3">
              <Label className="text-base font-medium">เพิ่มท่าฝึกใหม่</Label>
              <div className="flex gap-2">
                <Select value={newExerciseId} onValueChange={setNewExerciseId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="เลือกท่าฝึก..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contextExercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id.toString()}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddExercise}
                  disabled={!newExerciseId}
                  size="icon"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">รายการท่าฝึก</Label>
              <div className="space-y-4">
                {programSchedule
                  .find((d) => d.day_number === selectedDay)
                  ?.exercises?.sort((a, b) => a.order - b.order)
                  .map((ex, idx) => (
                    <Card key={ex.id} className="relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium">
                            {ex.exercise_name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteExercise(ex.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Repeat className="h-3 w-3" /> Sets
                            </Label>
                            <Input
                              type="number"
                              value={ex.sets}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.id,
                                  "sets",
                                  parseInt(e.target.value)
                                )
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Dumbbell className="h-3 w-3" /> Reps
                            </Label>
                            <Input
                              type="text"
                              value={ex.reps}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.id,
                                  "reps",
                                  e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Weight className="h-3 w-3" /> Weight
                            </Label>
                            <Input
                              type="number"
                              value={ex.weight}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.id,
                                  "weight",
                                  parseFloat(e.target.value)
                                )
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Rest (s)
                            </Label>
                            <Input
                              type="number"
                              value={ex.rest_seconds}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.id,
                                  "rest_seconds",
                                  parseInt(e.target.value)
                                )
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {!programSchedule.find((d) => d.day_number === selectedDay)
                  ?.exercises?.length && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Dumbbell className="h-10 w-10 mb-2 opacity-20" />
                    <p>ยังไม่มีท่าฝึกในวันนี้</p>
                    <p className="text-sm opacity-60">
                      เลือกท่าฝึกด้านบนเพื่อเริ่มต้น
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssignProgramModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        programId={selectedProgramId}
        programName={selectedProgram?.name || ""}
      />
    </div>
  );
}