import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Save,
  CheckCircle2,
  Circle,
  User,
  Dumbbell,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  BookOpen,
  Trash2,
  MoreHorizontal,
  Info,
  Activity,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
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
} from "@/components/ui/select";
import api from "@/lib/api";

// --- Interfaces Mapping (Frontend UI structure) ---

interface ExerciseSet {
  id?: number; // Backend ID if exists
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
  setType?: number | string; // For backend mapping 'set_number'
}

interface SessionExercise {
  id?: number; // Backend Log ID
  exerciseId: string | number; // ID of the exercise definition
  name: string; // Exercise Name
  category?: string;
  sets: ExerciseSet[];
  notes: string;
  completed: boolean;
}

interface ClientData {
  id: number;
  name: string;
  description?: string;
}

// Mock exercises list for the dropdown (ในระบบจริงควร fetch มาจาก API /exercises)
// เนื่องจากโค้ด API เดิมไม่ได้ดึง list นี้มา ผมจำลองไว้เพื่อให้ Dropdown ทำงานได้
const MOCK_EXERCISES_LIST = [
  { id: 1, name: "Squat", category: "Legs" },
  { id: 2, name: "Bench Press", category: "Chest" },
  { id: 3, name: "Deadlift", category: "Back" },
  { id: 4, name: "Shoulder Press", category: "Shoulders" },
];

export default function SessionLog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [sessionData, setSessionData] = useState<any>(null); // Raw API data

  // Session Editable State
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  // UI States
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set([0])
  );
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  // Add Exercise Dialog States
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState(10);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/sessions/${id}`);
        const data = response.data;

        setSessionData(data);
        setSessionDate(
          data.start_time || data.date || new Date().toISOString()
        );
        setSessionNotes(data.notes || ""); // Assuming backend has notes field on session

        // Fetch Client Info
        if (data.client_id) {
          try {
            const clientRes = await api.get(`/clients/${data.client_id}`);
            setClient(clientRes.data);
          } catch (e) {
            console.warn("Could not fetch client", e);
          }
        }

        // Map Backend Logs to UI Structure
        const mappedExercises: SessionExercise[] = (data.logs || []).map(
          (log: any) => ({
            id: log.id,
            exerciseId: log.exercise_id || log.id, // Fallback
            name: log.exercise_name || "Unknown Exercise",
            category: log.category || "General",
            notes: log.notes || "",
            completed: false, // Default, logic to check all sets below
            sets: (log.sets || []).map((s: any) => ({
              id: s.id,
              reps: s.actual_reps || s.planned_reps || 0,
              weight: s.actual_weight_kg || s.planned_weight_kg || 0,
              rpe: s.rpe || undefined,
              completed: s.completed || false,
              setType: s.set_number,
            })),
          })
        );

        // Calculate completion status for exercises
        mappedExercises.forEach((ex) => {
          ex.completed =
            ex.sets.length > 0 && ex.sets.every((s) => s.completed);
        });

        setSessionExercises(mappedExercises);
      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถโหลดข้อมูลเซสชันได้");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  // --- Logic Helpers ---

  const isCompleted = sessionData?.status === "completed";
  const completedExercisesCount = sessionExercises.filter(
    (ex) => ex.completed
  ).length;

  // Format Date Helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
          weekday: "long",
        }),
        time: date.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    } catch (e) {
      return { full: "-", time: "-" };
    }
  };

  // --- Handlers ---

  const toggleExercise = (idx: number) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  const updateSetValue = (
    exerciseIdx: number,
    setIdx: number,
    field: "reps" | "weight" | "rpe",
    value: string
  ) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const set = updated[exerciseIdx].sets[setIdx];
      const numValue = parseFloat(value) || 0;

      if (field === "reps") set.reps = numValue;
      else if (field === "weight") set.weight = numValue;
      else if (field === "rpe") set.rpe = numValue;

      return updated;
    });
  };

  const toggleSetCompleted = (exerciseIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx].sets[setIdx].completed =
        !updated[exerciseIdx].sets[setIdx].completed;

      // Update parent exercise completion status
      updated[exerciseIdx].completed = updated[exerciseIdx].sets.every(
        (s) => s.completed
      );

      return updated;
    });
  };

  const toggleExerciseCompleted = (exerciseIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const newState = !updated[exerciseIdx].completed;
      updated[exerciseIdx].completed = newState;

      // Toggle all sets
      updated[exerciseIdx].sets.forEach((set) => {
        set.completed = newState;
      });
      return updated;
    });
  };

  const updateExerciseNotes = (exerciseIdx: number, notes: string) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx].notes = notes;
      return updated;
    });
  };

  // --- API Actions ---

  const handleSave = async (markCompleted = false) => {
    if (!id) return;
    try {
      // Construct payload for backend
      // Note: This structure depends on how your backend accepts bulk updates.
      // Assuming it accepts an array of logs/exercises.
      const payload = {
        notes: sessionNotes,
        status: markCompleted ? "completed" : sessionData.status,
        summary: `Completed ${completedExercisesCount}/${sessionExercises.length} exercises`,
        logs: sessionExercises.map((ex) => ({
          id: ex.id, // Send ID to update existing
          exercise_id: ex.exerciseId,
          exercise_name: ex.name,
          category: ex.category,
          notes: ex.notes,
          sets: ex.sets.map((s, i) => ({
            id: s.id, // Send ID to update existing
            set_number: i + 1,
            actual_reps: s.reps,
            actual_weight_kg: s.weight,
            rpe: s.rpe,
            completed: s.completed,
          })),
        })),
      };

      await api.put(`/sessions/${id}`, payload);

      toast.success(
        markCompleted ? "บันทึกและจบเซสชันเรียบร้อย" : "บันทึกข้อมูลเรียบร้อย"
      );

      if (markCompleted) {
        navigate(
          client ? `/trainer/clients/${client.id}` : "/trainer/calendar"
        );
      } else {
        // Refresh data (optional)
      }
    } catch (err) {
      console.error(err);
      toast.error("บันทึกข้อมูลล้มเหลว");
    }
  };

  const handleComplete = () => {
    if (confirm("ยืนยันการจบเซสชัน?")) {
      handleSave(true);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("กำลังพิมพ์...");
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      toast.error("กรุณาเลือกท่าออกกำลังกาย");
      return;
    }

    // Find exercise name from mock list or (ideally) fetched list
    const exerciseInfo = MOCK_EXERCISES_LIST.find(
      (e) => e.id.toString() === selectedExerciseId
    ) || { name: "New Exercise", category: "General" };

    const sets: ExerciseSet[] = [];
    for (let i = 0; i < exerciseSets; i++) {
      sets.push({
        reps: exerciseReps,
        weight: 0,
        completed: false,
      });
    }

    const newExercise: SessionExercise = {
      exerciseId: selectedExerciseId,
      name: exerciseInfo.name,
      category: exerciseInfo.category,
      sets,
      notes: "",
      completed: false,
    };

    setSessionExercises((prev) => [...prev, newExercise]);
    setShowExerciseDialog(false);
    setSelectedExerciseId("");
    setExerciseSets(3);
    setExerciseReps(10);
    toast.success("เพิ่มท่าออกกำลังกายเรียบร้อย");
  };

  const handleDeleteExercise = (exerciseIdx: number) => {
    if (window.confirm(`คุณต้องการลบท่านี้ใช่หรือไม่?`)) {
      setSessionExercises((prev) =>
        prev.filter((_, idx) => idx !== exerciseIdx)
      );
      toast.success("ลบท่าออกกำลังกายเรียบร้อย");
    }
  };

  const handleAddSet = (exerciseIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const lastSet =
        updated[exerciseIdx].sets[updated[exerciseIdx].sets.length - 1];

      const newSet: ExerciseSet = {
        reps: lastSet?.reps || 10,
        weight: lastSet?.weight || 0,
        rpe: lastSet?.rpe,
        completed: false,
      };

      updated[exerciseIdx].sets.push(newSet);
      return updated;
    });
    toast.success("เพิ่มเซตเรียบร้อย");
  };

  const handleDeleteSet = (exerciseIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      if (updated[exerciseIdx].sets.length > 1) {
        updated[exerciseIdx].sets.splice(setIdx, 1);
        updated[exerciseIdx].completed = updated[exerciseIdx].sets.every(
          (s) => s.completed
        );
      } else {
        toast.error("ต้องมีอย่างน้อย 1 เซต");
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#002140]" size={48} />
          <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // --- Render UI ---

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20 animate-in fade-in duration-500">
      {/* Header Section (Dark Blue) */}
      <div className="bg-[#002140] text-white py-6 print:hidden sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="text-white hover:bg-white/10"
              >
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave(false)}
                className="text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
              {!isCompleted && (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white border-none"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  เสร็จสิ้น
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl mb-1 font-bold">
                {client?.name || "Loading..."}
              </h1>
              <p className="text-sm text-white/70">
                {formatDate(sessionDate).full} • {formatDate(sessionDate).time}
              </p>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500 text-white border-none px-3 py-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 max-w-5xl">
        {/* Info & Progress Card */}
        <Card className="border-[#002140]/20 bg-gradient-to-br from-[#002140]/5 to-transparent mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-[#002140]" />
                  <h2 className="text-lg font-semibold">
                    {sessionData?.title || "Session Log"}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {client?.description || "Training Program"}
                </p>
              </div>
              <Badge variant="outline" className="gap-1 bg-white">
                <Activity className="h-3 w-3" />
                {completedExercisesCount}/{sessionExercises.length} ท่า
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ความก้าวหน้าในเซสชัน
                </span>
                <span className="font-medium">
                  {sessionExercises.length > 0
                    ? Math.round(
                        (completedExercisesCount / sessionExercises.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  sessionExercises.length > 0
                    ? (completedExercisesCount / sessionExercises.length) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {!isCompleted && (
          <Card className="border-[#002140]/20 mb-6 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MoreHorizontal size={18} /> เครื่องมือ
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExerciseDialog(true)}
                  className="gap-2 border-dashed border-2 hover:border-solid hover:border-[#002140]"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มท่าใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercises List */}
        {sessionExercises.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Dumbbell className="h-5 w-5 text-[#002140]" />
                ท่าออกกำลังกาย
              </h2>
            </div>

            {sessionExercises.map((sessionEx, exerciseIdx) => {
              const isExpanded = expandedExercises.has(exerciseIdx);

              return (
                <Card
                  key={exerciseIdx}
                  className={`border transition-all duration-200 ${
                    sessionEx.completed
                      ? "border-green-200 bg-green-50/20"
                      : "border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Exercise Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExerciseCompleted(exerciseIdx)}
                          className="h-8 w-8 p-0 mt-0.5 rounded-full hover:bg-slate-100"
                          disabled={isCompleted}
                        >
                          {sessionEx.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-slate-300" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-800">
                              {sessionEx.name}
                            </h3>
                            {sessionEx.category && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {sessionEx.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {sessionEx.sets.length} เซต
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExercise(exerciseIdx)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-500" />
                          )}
                        </Button>

                        {!isCompleted && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-5 w-5 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleAddSet(exerciseIdx)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                เพิ่มเซต
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteExercise(exerciseIdx)
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบท่า
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {/* Sets Table */}
                    {isExpanded && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="border rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                              <tr>
                                <th className="p-3 text-center w-12 font-medium text-slate-500">
                                  #
                                </th>
                                <th className="p-3 text-center font-medium text-slate-500">
                                  Reps
                                </th>
                                <th className="p-3 text-center font-medium text-slate-500">
                                  Weight (kg)
                                </th>
                                <th className="p-3 text-center font-medium text-slate-500">
                                  RPE
                                </th>
                                <th className="p-3 text-center w-16 font-medium text-slate-500">
                                  ✓
                                </th>
                                {!isCompleted && <th className="p-3 w-10"></th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {sessionEx.sets.map((set, setIdx) => (
                                <tr
                                  key={setIdx}
                                  className={
                                    set.completed ? "bg-green-50/50" : ""
                                  }
                                >
                                  <td className="p-2 text-center text-slate-500 font-medium">
                                    {setIdx + 1}
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={set.reps || ""}
                                      onChange={(e) =>
                                        updateSetValue(
                                          exerciseIdx,
                                          setIdx,
                                          "reps",
                                          e.target.value
                                        )
                                      }
                                      className="h-9 text-center font-medium"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      step="0.5"
                                      value={set.weight || ""}
                                      onChange={(e) =>
                                        updateSetValue(
                                          exerciseIdx,
                                          setIdx,
                                          "weight",
                                          e.target.value
                                        )
                                      }
                                      className="h-9 text-center font-medium"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={set.rpe || ""}
                                      onChange={(e) =>
                                        updateSetValue(
                                          exerciseIdx,
                                          setIdx,
                                          "rpe",
                                          e.target.value
                                        )
                                      }
                                      className="h-9 text-center text-muted-foreground"
                                      placeholder="-"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleSetCompleted(exerciseIdx, setIdx)
                                      }
                                      className={`h-9 w-9 p-0 rounded-full ${
                                        set.completed
                                          ? "bg-green-100 hover:bg-green-200"
                                          : "hover:bg-slate-100"
                                      }`}
                                      disabled={isCompleted}
                                    >
                                      {set.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-slate-300" />
                                      )}
                                    </Button>
                                  </td>
                                  {!isCompleted && (
                                    <td className="p-2 text-center">
                                      {sessionEx.sets.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteSet(exerciseIdx, setIdx)
                                          }
                                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Exercise Notes */}
                        <div>
                          <Label className="text-xs text-muted-foreground ml-1 mb-1.5 block">
                            บันทึกช่วยจำ (Notes)
                          </Label>
                          <Textarea
                            value={sessionEx.notes}
                            onChange={(e) =>
                              updateExerciseNotes(exerciseIdx, e.target.value)
                            }
                            placeholder="บันทึกเทคนิค หรือความรู้สึกสำหรับท่านี้..."
                            className="min-h-[80px] bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none"
                            disabled={isCompleted}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                ยังไม่มีท่าออกกำลังกาย
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                เริ่มต้นด้วยการเพิ่มท่าออกกำลังกายใหม่ลงในเซสชันนี้
              </p>
              {!isCompleted && (
                <Button
                  onClick={() => setShowExerciseDialog(true)}
                  className="bg-[#002140]"
                >
                  <Plus className="h-4 w-4 mr-2" /> เพิ่มท่าแรก
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Global Session Notes */}
        {sessionExercises.length > 0 && (
          <Card className="border-[#002140]/20 mt-6 shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={18} /> โน้ตสรุปเซสชัน
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="สรุปภาพรวมการฝึกวันนี้..."
                className="min-h-[120px] text-base border-slate-200 focus:border-[#002140] focus:ring-[#002140]"
                disabled={isCompleted}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มท่าออกกำลังกาย</DialogTitle>
            <DialogDescription>
              เลือกท่าและกำหนดจำนวนเซตเริ่มต้น
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ท่าออกกำลังกาย</Label>
              <Select
                value={selectedExerciseId}
                onValueChange={setSelectedExerciseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ค้นหาหรือเลือกท่า..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EXERCISES_LIST.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id.toString()}>
                      {ex.name}{" "}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({ex.category})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>จำนวนเซต</Label>
                <Input
                  type="number"
                  min="1"
                  value={exerciseSets}
                  onChange={(e) =>
                    setExerciseSets(parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reps เป้าหมาย</Label>
                <Input
                  type="number"
                  min="1"
                  value={exerciseReps}
                  onChange={(e) =>
                    setExerciseReps(parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExerciseDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleAddExercise} className="bg-[#002140]">
              เพิ่มท่า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
