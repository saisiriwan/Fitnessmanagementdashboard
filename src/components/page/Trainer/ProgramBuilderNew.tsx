import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Settings,
  Dumbbell,
  Users,
  Save,
  ArrowLeft,
  Activity,
  Flame,
  Target,
  Wind,
  Info,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import api from "@/lib/api";
import AssignProgramModal from "./AssignProgramModal";
import { cn } from "@/lib/utils";

// --- Interfaces based on User Request ---

interface ProgramExercise {
  id?: string;
  exerciseId: string;
  name?: string; // For display
  sets: number;
  reps: string;
  weight: string;
  rest: number;
  rpe?: number;
  notes?: string;
}

interface ProgramSection {
  id: string;
  sectionType: "warmup" | "main" | "skill" | "cooldown" | "custom";
  sectionFormat:
    | "straight"
    | "circuit"
    | "superset"
    | "amrap"
    | "emom"
    | "tabata";
  name: string;
  duration?: number;
  exercises: ProgramExercise[];
}

interface ProgramDay {
  id: string;
  dayNumber: number;
  name: string;
  isRestDay: boolean;
  sections: ProgramSection[];
}

interface ProgramWeek {
  id: string; // Added for keying
  weekNumber: number;
  days: ProgramDay[];
}

interface Program {
  id: number; // Backend usually uses number
  name: string;
  description: string;
  duration: number; // in weeks
  daysPerWeek: number;
  isTemplate: boolean;
  assigned_client_count?: number; // from API
  weeks: ProgramWeek[];
}

// Mock Data for Exercises (Fallback)
const MOCK_EXERCISES = [
  { id: "1", name: "Squat", category: "Legs" },
  { id: "2", name: "Bench Press", category: "Chest" },
  { id: "3", name: "Deadlift", category: "Back" },
  { id: "4", name: "Overhead Press", category: "Shoulders" },
  { id: "5", name: "Pull Up", category: "Back" },
  { id: "6", name: "Dumbbell Row", category: "Back" },
  { id: "7", name: "Lunge", category: "Legs" },
  { id: "8", name: "Plank", category: "Core" },
];

export default function ProgramBuilderNew() {
  // --- View State ---
  const [view, setView] = useState<"list" | "detail">("list");
  const [loading, setLoading] = useState(false);

  // --- Data State ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [exercisesList, setExercisesList] = useState<any[]>(MOCK_EXERCISES);

  // --- Modals State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDayOptions, setShowDayOptions] = useState<{
    open: boolean;
    day: ProgramDay | null;
  }>({ open: false, day: null });
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // --- Form State (Create/Edit) ---
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    daysPerWeek: 4,
    isTemplate: true,
  });

  // --- Builder State (Active Day/Section for editing) ---
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState<Partial<ProgramSection>>({
    sectionType: "main",
    sectionFormat: "straight",
    name: "Main Workout",
    exercises: [],
  });

  // --- Initial Fetch ---
  useEffect(() => {
    fetchPrograms();
    fetchExercises();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/programs");
      // Map API response to our structure if needed. Assuming direct match for now or basic mapping.
      // Ideally, backend returns basics. standardizing here:
      const mapped = res.data.map((p: any) => ({
        ...p,
        weeks: p.weeks || [], // Ensure weeks exist
      }));
      setPrograms(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await api.get("/exercises");
      setExercisesList(res.data);
    } catch (e) {
      // use mock
    }
  };

  const fetchProgramDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/programs/${id}`);
      setSelectedProgram(res.data.program || res.data); // Adjust based on actual API wrapper
      setView("detail");
    } catch (err) {
      toast.error("Could not load program details");
    } finally {
      setLoading(false);
    }
  };

  // --- Phase 1: Create Program ---

  const handleCreateProgram = async () => {
    if (!createForm.name) return toast.error("Please enter a name");

    // Auto-create Week 1 with X Days
    const initialWeeks: ProgramWeek[] = [
      {
        id: `week-1-${Date.now()}`,
        weekNumber: 1,
        days: Array.from({ length: createForm.daysPerWeek }, (_, i) => ({
          id: `day-${1}-${i + 1}-${Date.now()}`,
          dayNumber: i + 1,
          name: `Day ${i + 1}`,
          isRestDay: false,
          sections: [],
        })),
      },
    ];

    try {
      const payload = {
        ...createForm,
        duration: 1,
        weeks: initialWeeks,
      };

      const res = await api.post("/programs", payload);
      toast.success("Program Created!");
      setShowCreateModal(false);
      fetchPrograms(); // refresh list
      // Optionally jump to detail
      if (res.data && res.data.id) {
        fetchProgramDetail(res.data.id);
      }
    } catch (err) {
      toast.error("Failed to create program");
    }
  };

  // --- Phase 2: Program Structure Management ---

  const handleAddWeek = () => {
    if (!selectedProgram) return;
    const nextWeekNum = selectedProgram.weeks.length + 1;
    const newWeek: ProgramWeek = {
      id: `week-${nextWeekNum}-${Date.now()}`,
      weekNumber: nextWeekNum,
      days: Array.from(
        { length: selectedProgram.daysPerWeek || 7 },
        (_, i) => ({
          // Default to freq setting
          id: `day-${nextWeekNum}-${i + 1}-${Date.now()}`,
          dayNumber: i + 1,
          name: `Day ${i + 1}`,
          isRestDay: false,
          sections: [],
        })
      ),
    };

    const updated = {
      ...selectedProgram,
      weeks: [...selectedProgram.weeks, newWeek],
      duration: nextWeekNum,
    };
    setSelectedProgram(updated);
    // Ideally, debounce save or explicit save. For builder, explicit save is often better or auto-save.
    // We will save on "Save" button for now to avoid chatty API, or implement auto-save later.
  };

  const updateProgram = async () => {
    if (!selectedProgram) return;
    try {
      await api.put(`/programs/${selectedProgram.id}`, selectedProgram);
      toast.success("Changes saved!");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const toggleRestDay = (weekIdx: number, dayIdx: number) => {
    if (!selectedProgram) return;
    const newWeeks = [...selectedProgram.weeks];
    const day = newWeeks[weekIdx].days[dayIdx];
    day.isRestDay = !day.isRestDay;
    // Clear sections if rest day? Optional.
    setSelectedProgram({ ...selectedProgram, weeks: newWeeks });
  };

  // --- Phase 3: Content (Sections & Exercises) ---

  const handleOpenAddSection = (day: ProgramDay) => {
    setActiveDayId(day.id);
    setNewSection({
      sectionType: "main",
      sectionFormat: "straight",
      name: "Main Workout",
      exercises: [],
    });
    // Close Day Options if open
    setShowDayOptions({ open: false, day: null });
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (!selectedProgram || !activeDayId) return;

    // Find the day
    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        if (day.id === activeDayId) {
          return {
            ...day,
            sections: [
              ...day.sections,
              {
                ...newSection,
                id: `sec-${Date.now()}`,
                exercises: newSection.exercises || [],
              } as ProgramSection,
            ],
          };
        }
        return day;
      }),
    }));

    setSelectedProgram({ ...selectedProgram, weeks: updatedWeeks });
    setShowSectionModal(false);
    toast.success("Section added");
  };

  const handleAddExerciseToSection = (exercise: any) => {
    const newEx: ProgramExercise = {
      exerciseId: exercise.id.toString(),
      name: exercise.name,
      sets: 3,
      reps: "10",
      weight: "0",
      rest: 60,
    };

    setNewSection((prev) => ({
      ...prev,
      exercises: [...(prev.exercises || []), newEx],
    }));
    setShowExercisePicker(false);
  };

  const removeExerciseFromSection = (idx: number) => {
    setNewSection((prev) => {
      const exs = [...(prev.exercises || [])];
      exs.splice(idx, 1);
      return { ...prev, exercises: exs };
    });
  };

  // Helper to render section icon
  const getSectionIcon = (type: string) => {
    switch (type) {
      case "warmup":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "main":
        return <Dumbbell className="w-4 h-4 text-blue-500" />;
      case "skill":
        return <Target className="w-4 h-4 text-purple-500" />;
      case "cooldown":
        return <Wind className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleQuickAddExercise = (day: ProgramDay) => {
    // 1. Prepare a new "Main Workout" section
    setActiveDayId(day.id);
    setNewSection({
      sectionType: "main",
      sectionFormat: "straight",
      name: "Main Workout",
      exercises: [],
    });
    // 2. Open Picker directly
    setShowDayOptions({ open: false, day: null });
    setShowExercisePicker(true);
    setShowSectionModal(true);
  };

  // --- Render ---

  if (view === "list") {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Program Builder
            </h1>
            <p className="text-slate-500">
              Create, manage, and assign training programs
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#002140] hover:bg-[#002140]/90"
          >
            <Plus className="w-4 h-4 mr-2" /> New Program
          </Button>
        </div>

        {/* Filters / Search could go here */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => fetchProgramDetail(program.id)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                    {program.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {program.isTemplate && (
                      <Badge variant="secondary" className="text-xs">
                        Template
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {program.duration} Weeks
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAssignModal(true); /* Set selected logic */
                      }}
                    >
                      Assign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {program.description || "No description"}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />{" "}
                    {program.assigned_client_count || 0} Active
                  </span>
                  <span>Last edited: Recently</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogDescription>
                Start building a new training plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="e.g. Hypertrophy Phase 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Days Per Week</Label>
                <Select
                  value={createForm.daysPerWeek.toString()}
                  onValueChange={(v) =>
                    setCreateForm({ ...createForm, daysPerWeek: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(7)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} Days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Goal, difficulty, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-mode"
                  checked={createForm.isTemplate}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, isTemplate: checked })
                  }
                />
                <Label htmlFor="template-mode">Save as Template</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProgram}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Detail View ---
  if (!selectedProgram) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h2 className="font-bold text-lg leading-tight">
              {selectedProgram.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{selectedProgram.duration} Weeks</span>
              <span>•</span>
              <span>{selectedProgram.daysPerWeek} Days/Week</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssignModal(true)}
          >
            <Users className="w-4 h-4 mr-2" /> Assign
          </Button>
          <Button size="sm" onClick={updateProgram} className="bg-[#002140]">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Weeks & Days Grid */}
        <div className="space-y-8">
          {selectedProgram.weeks.map((week, weekIdx) => (
            <div key={week.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" /> Week {week.weekNumber}
                </h3>
                {/* Week Actions could go here */}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {week.days.map((day, dayIdx) => (
                  <Card
                    key={day.id}
                    className={cn(
                      "flex flex-col h-full transition-all border-2",
                      day.isRestDay
                        ? "bg-slate-50 border-dashed border-slate-200"
                        : "hover:border-blue-200 hover:shadow-md cursor-pointer bg-white"
                    )}
                    onClick={() => {
                      if (!day.isRestDay)
                        setShowDayOptions({ open: true, day });
                    }}
                  >
                    <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start space-y-0">
                      <span className="font-bold text-sm text-slate-700">
                        Day {day.dayNumber}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-slate-200 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3 h-3 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDayOptions({ open: true, day });
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" /> Manage Day
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRestDay(weekIdx, dayIdx);
                            }}
                          >
                            {day.isRestDay
                              ? "Set as Training Day"
                              : "Set as Rest Day"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-3 flex-1 flex flex-col justify-center items-center min-h-[120px]">
                      {day.isRestDay ? (
                        <div className="text-center text-slate-400">
                          <div className="bg-slate-100 p-2 rounded-full inline-flex mb-2">
                            <Info className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-medium">Rest Day</p>
                        </div>
                      ) : day.sections.length === 0 ? (
                        <div className="text-center group">
                          <div className="bg-blue-50 p-2 rounded-full inline-flex mb-2 text-blue-500 group-hover:bg-blue-100 transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-medium text-slate-500 group-hover:text-blue-600">
                            Add Content
                          </p>
                        </div>
                      ) : (
                        <div className="w-full space-y-1.5 self-start mt-2">
                          {day.sections.map((section) => (
                            <div
                              key={section.id}
                              className="text-xs bg-slate-50 p-2 rounded border flex items-center gap-2"
                            >
                              {getSectionIcon(section.sectionType)}
                              <span className="truncate flex-1 font-medium">
                                {section.name}
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {section.exercises.length}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full py-8 border-dashed"
            onClick={handleAddWeek}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Next Week
          </Button>
        </div>
      </div>

      {/* --- Dialogs --- */}

      {/* Day Options / Manager Dialog */}
      <Dialog
        open={showDayOptions.open}
        onOpenChange={(open) => setShowDayOptions({ ...showDayOptions, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {showDayOptions.day?.name}</DialogTitle>
            <DialogDescription>
              Choose an action for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button
              className="justify-start h-auto p-4 space-x-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
              onClick={() =>
                showDayOptions.day && handleOpenAddSection(showDayOptions.day)
              }
            >
              <div className="p-2 bg-white rounded-full">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Add Workout Section</div>
                <div className="text-xs opacity-70">
                  Add a new block like Warmup, Main Work, etc.
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4 space-x-4"
              onClick={() => {
                if (showDayOptions.day)
                  handleQuickAddExercise(showDayOptions.day);
              }}
            >
              <div className="p-2 bg-slate-100 rounded-full">
                <Dumbbell className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Quick Add Exercises</div>
                <div className="text-xs text-muted-foreground">
                  Add exercises directly without a named section.
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Section Modal */}
      <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Build Workout Section</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Section Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newSection.sectionType}
                    onValueChange={(v: any) =>
                      setNewSection({ ...newSection, sectionType: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warmup">Warm Up</SelectItem>
                      <SelectItem value="main">Main Work</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="cooldown">Cool Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={newSection.sectionFormat}
                    onValueChange={(v: any) =>
                      setNewSection({ ...newSection, sectionFormat: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight Sets</SelectItem>
                      <SelectItem value="circuit">Circuit</SelectItem>
                      <SelectItem value="superset">Superset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Section Name</Label>
                  <Input
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    Exercises ({newSection.exercises?.length || 0})
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExercisePicker(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Exercise
                  </Button>
                </div>

                <div className="space-y-3">
                  {(newSection.exercises || []).map((ex, idx) => (
                    <Card key={idx} className="relative">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{ex.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => removeExerciseFromSection(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label className="text-[10px]">Sets</Label>
                            <Input
                              className="h-7 text-xs"
                              value={ex.sets}
                              onChange={(e) => {
                                const exs = [...(newSection.exercises || [])];
                                exs[idx].sets = parseInt(e.target.value) || 0;
                                setNewSection({
                                  ...newSection,
                                  exercises: exs,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Reps</Label>
                            <Input
                              className="h-7 text-xs"
                              value={ex.reps}
                              onChange={(e) => {
                                const exs = [...(newSection.exercises || [])];
                                exs[idx].reps = e.target.value;
                                setNewSection({
                                  ...newSection,
                                  exercises: exs,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Rest (s)</Label>
                            <Input
                              className="h-7 text-xs"
                              value={ex.rest}
                              onChange={(e) => {
                                const exs = [...(newSection.exercises || [])];
                                exs[idx].rest = parseInt(e.target.value) || 0;
                                setNewSection({
                                  ...newSection,
                                  exercises: exs,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">RPE</Label>
                            <Input
                              className="h-7 text-xs"
                              value={ex.rpe || ""}
                              onChange={(e) => {
                                const exs = [...(newSection.exercises || [])];
                                exs[idx].rpe = parseFloat(e.target.value);
                                setNewSection({
                                  ...newSection,
                                  exercises: exs,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!newSection.exercises ||
                    newSection.exercises.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-slate-400">
                      No exercises yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleSaveSection}>Save Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker */}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search exercises..." />
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {exercisesList.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2 hover:bg-slate-100 rounded cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddExerciseToSection(ex)}
                  >
                    <span>{ex.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {ex.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal reused */}
      <AssignProgramModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        programId={selectedProgram.id} // Ensure ID matches number/string expectations
        programName={selectedProgram.name}
      />
    </div>
  );
}
