import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Save,
  CheckCircle2, 
  Circle, 
  Calendar,
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
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';
import { Progress } from './ui/progress';
import SessionSummaryCard from './SessionSummaryCard';
import SessionCompletionForm, { SessionCompletionData } from './SessionCompletionForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

interface SessionExercise {
  exerciseId: string;
  sets: ExerciseSet[];
  notes: string;
  completed: boolean;
}

export default function SessionLog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getSessionById, 
    getClientById, 
    getExerciseById, 
    getProgramTemplateById,
    updateSession,
    programInstances,
    exercises, 
    sessions,
  } = useApp();
  
  const session = getSessionById(id!);
  const client = session ? getClientById(session.clientId) : null;
  
  // Session State
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set([0]));
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionData, setCompletionData] = useState<SessionCompletionData | null>(null);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  
  // Dialog states
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState(10);

  // Get assigned program for this client
  const assignedProgramInstance = client 
    ? programInstances.find(pi => pi.clientId === client.id && pi.status === 'active')
    : null;
  const assignedProgram = assignedProgramInstance
    ? getProgramTemplateById(assignedProgramInstance.templateId)
    : null;

  // Get client's completed sessions for this program
  const clientCompletedSessions = client && assignedProgramInstance
    ? sessions.filter(s => 
        s.clientId === client.id && 
        s.status === 'completed' && 
        s.programInstanceId === assignedProgramInstance.id
      )
    : [];

  // Calculate current day in program
  const getCurrentProgramDay = () => {
    if (!assignedProgram || !assignedProgramInstance) return null;

    // Count completed sessions to determine current day
    const completedCount = clientCompletedSessions.length;
    
    // Calculate which day we should be on (0-indexed, then +1 for display)
    let currentDayIndex = completedCount;
    
    // Flatten all days from all weeks
    const allDays: Array<{ week: number; day: any; dayIndex: number }> = [];
    let dayCounter = 0;
    
    assignedProgram.weeks.forEach(week => {
      week.days.forEach(day => {
        allDays.push({
          week: week.weekNumber,
          day: day,
          dayIndex: dayCounter
        });
        dayCounter++;
      });
    });

    // Get current day (or loop back if completed all days)
    const totalDays = allDays.length;
    if (totalDays === 0) return null;
    
    const currentIndex = currentDayIndex % totalDays;
    const currentDayInfo = allDays[currentIndex];

    return {
      weekNumber: currentDayInfo.week,
      day: currentDayInfo.day,
      dayNumber: currentDayInfo.day.dayNumber,
      totalCompleted: completedCount,
      totalDays: totalDays,
      progress: totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0
    };
  };

  const currentProgramDay = getCurrentProgramDay();

  // Auto-load exercises from current program day
  useEffect(() => {
    if (!session || !assignedProgram || !currentProgramDay || autoLoadAttempted) return;
    
    // Only auto-load if session has no exercises yet
    if (session.exercises && session.exercises.length > 0) {
      const exercises: SessionExercise[] = session.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: Array.isArray(ex.sets) 
          ? ex.sets.map(set => ({
              reps: set.reps || 0,
              weight: set.weight || 0,
              rpe: set.rpe,
              completed: set.completed
            }))
          : [],
        notes: ex.notes || '',
        completed: Array.isArray(ex.sets) ? ex.sets.every(s => s.completed) : false
      }));
      setSessionExercises(exercises);
      setSessionNotes(session.notes || '');
      setSessionDate(session.date || '');
      setAutoLoadAttempted(true);
      return;
    }

    const day = currentProgramDay.day;
    
    if (day.isRestDay) {
      setSessionNotes(`${assignedProgram.name} - สัปดาห์ ${currentProgramDay.weekNumber}, ${day.name} (วันพักผ่อน)`);
      setAutoLoadAttempted(true);
      return;
    }

    // Load exercises from program day
    const newExercises: SessionExercise[] = [];

    if (day.sections && day.sections.length > 0) {
      day.sections.forEach(section => {
        section.exercises?.forEach((programEx) => {
          const sets: ExerciseSet[] = [];
          const numSets = programEx.sets || 3;
          const repsValue = typeof programEx.reps === 'string' 
            ? parseInt(programEx.reps.split('-')[0]) || 10 
            : 10;

          for (let i = 0; i < numSets; i++) {
            sets.push({
              reps: repsValue,
              weight: programEx.weight || 0,
              rpe: programEx.rpe,
              completed: false
            });
          }

          newExercises.push({
            exerciseId: programEx.exerciseId,
            sets,
            notes: programEx.notes || '',
            completed: false
          });
        });
      });
    } else if (day.exercises && day.exercises.length > 0) {
      day.exercises.forEach(programEx => {
        const sets: ExerciseSet[] = [];
        const numSets = programEx.sets || 3;
        const repsValue = typeof programEx.reps === 'string' 
          ? parseInt(programEx.reps.split('-')[0]) || 10 
          : 10;

        for (let i = 0; i < numSets; i++) {
          sets.push({
            reps: repsValue,
            weight: programEx.weight || 0,
            rpe: programEx.rpe,
            completed: false
          });
        }

        newExercises.push({
          exerciseId: programEx.exerciseId,
          sets,
          notes: programEx.notes || '',
          completed: false
        });
      });
    }

    if (newExercises.length > 0) {
      setSessionExercises(newExercises);
      const newNotes = `${assignedProgram.name} - สัปดาห์ ${currentProgramDay.weekNumber}, ${day.name}`;
      setSessionNotes(newNotes);
      
      // Update session with program info
      updateSession(session.id, { 
        programInstanceId: assignedProgramInstance?.id,
        notes: newNotes,
        exercises: newExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map(s => ({ ...s, rest: 60 })),
          notes: ex.notes
        }))
      });
      
      toast.success(`โหลดท่าจาก ${day.name} เรียบร้อย (${newExercises.length} ท่า)`);
    }
    
    setAutoLoadAttempted(true);
  }, [session, assignedProgram, currentProgramDay, autoLoadAttempted]);

  // Initialize session date
  useEffect(() => {
    if (session) {
      setSessionDate(session.date || new Date().toISOString());
      if (session.notes) {
        setSessionNotes(session.notes);
      }
    }
  }, [session]);

  if (!session || !client) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">ไม่พบข้อมูลการฝึก</p>
          <Button onClick={() => navigate('/calendar')}>กลับไปปฏิทิน</Button>
        </div>
      </div>
    );
  }

  const isCompleted = session.status === 'completed';
  const completedExercises = sessionExercises.filter(ex => ex.completed).length;

  // Toggle Exercise Expansion
  const toggleExercise = (idx: number) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  // Update Set Value
  const updateSetValue = (exerciseIdx: number, setIdx: number, field: 'reps' | 'weight' | 'rpe', value: string) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      const set = updated[exerciseIdx].sets[setIdx];
      const numValue = parseFloat(value) || 0;
      
      if (field === 'reps') set.reps = numValue;
      else if (field === 'weight') set.weight = numValue;
      else if (field === 'rpe') set.rpe = numValue;
      
      return updated;
    });
  };

  // Toggle Set Completed
  const toggleSetCompleted = (exerciseIdx: number, setIdx: number) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      updated[exerciseIdx].sets[setIdx].completed = !updated[exerciseIdx].sets[setIdx].completed;
      updated[exerciseIdx].completed = Array.isArray(updated[exerciseIdx].sets) 
        ? updated[exerciseIdx].sets.every(s => s.completed)
        : false;
      return updated;
    });
  };

  // Toggle Exercise Completed
  const toggleExerciseCompleted = (exerciseIdx: number) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      const newState = !updated[exerciseIdx].completed;
      updated[exerciseIdx].completed = newState;
      if (Array.isArray(updated[exerciseIdx].sets)) {
        updated[exerciseIdx].sets.forEach(set => {
          set.completed = newState;
        });
      }
      return updated;
    });
  };

  // Update Exercise Notes
  const updateExerciseNotes = (exerciseIdx: number, notes: string) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      updated[exerciseIdx].notes = notes;
      return updated;
    });
  };

  // Save Session
  const handleSave = () => {
    const updatedExercises = sessionExercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: Array.isArray(ex.sets)
        ? ex.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            completed: set.completed,
            rest: 60
          }))
        : [],
      notes: ex.notes
    }));

    const allCompleted = sessionExercises.length > 0 && sessionExercises.every(ex => ex.completed);

    updateSession(session.id, {
      exercises: updatedExercises,
      notes: sessionNotes,
      status: allCompleted ? 'completed' : session.status,
      summary: `บันทึก ${completedExercises}/${sessionExercises.length} ท่า`
    });

    toast.success('บันทึกข้อมูลเรียบร้อย');
  };

  // Complete Session
  const handleComplete = () => {
    handleSave();
    updateSession(session.id, { status: 'completed' });
    setShowCompletionForm(true); // เปิด Completion Form ก่อน
  };

  // Handle Completion Form Submit
  const handleCompletionSubmit = (data: SessionCompletionData) => {
    // บันทึกข้อมูลเพิ่มเติมลง session
    updateSession(session.id, {
      type: data.type,
      date: data.startTime,
      endTime: data.endTime,
      rating: data.rating,
      bodyWeight: data.bodyWeight,
      summary: data.summary,
      improvements: data.improvements,
      nextGoals: data.nextGoals,
      achievements: data.achievements
    });
    
    // ปิด Completion Form และเปิด Summary Card
    setShowCompletionForm(false);
    setCompletionData(data);
    setShowSummaryCard(true);
    toast.success('บันทึกข้อมูลการฝึกเสร็จสมบูรณ์!');
  };

  // Print
  const handlePrint = () => {
    window.print();
    toast.success('กำลังพิมพ์...');
  };

  // Add single exercise
  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      toast.error('กรุณาเลือกท่าออกกำลังกาย');
      return;
    }

    const sets: ExerciseSet[] = [];
    for (let i = 0; i < exerciseSets; i++) {
      sets.push({
        reps: exerciseReps,
        weight: 0,
        completed: false
      });
    }

    const newExercise: SessionExercise = {
      exerciseId: selectedExerciseId,
      sets,
      notes: '',
      completed: false
    };

    setSessionExercises(prev => [...prev, newExercise]);
    setShowExerciseDialog(false);
    setSelectedExerciseId('');
    setExerciseSets(3);
    setExerciseReps(10);
    toast.success('เพิ่มท่าออกกำลังกายเรียบร้อย');
  };

  // Delete exercise
  const handleDeleteExercise = (exerciseIdx: number) => {
    const exercise = getExerciseById(sessionExercises[exerciseIdx].exerciseId);
    if (window.confirm(`คุณต้องการลบท่า "${exercise?.name}" ใช่หรือไม่?`)) {
      setSessionExercises(prev => prev.filter((_, idx) => idx !== exerciseIdx));
      toast.success('ลบท่าออกกำลังกายเรียบร้อย');
    }
  };

  // Add set to exercise
  const handleAddSet = (exerciseIdx: number) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      if (!Array.isArray(updated[exerciseIdx].sets)) {
        updated[exerciseIdx].sets = [];
      }
      const lastSet = updated[exerciseIdx].sets[updated[exerciseIdx].sets.length - 1];
      
      const newSet: ExerciseSet = {
        reps: lastSet?.reps || 10,
        weight: lastSet?.weight || 0,
        rpe: lastSet?.rpe,
        completed: false
      };
      
      updated[exerciseIdx].sets.push(newSet);
      return updated;
    });
    toast.success('เพิ่มเซตเรียบร้อย');
  };

  // Delete set from exercise
  const handleDeleteSet = (exerciseIdx: number, setIdx: number) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIdx].sets.length > 1) {
        updated[exerciseIdx].sets.splice(setIdx, 1);
        updated[exerciseIdx].completed = updated[exerciseIdx].sets.every(s => s.completed);
      } else {
        toast.error('ต้องมีอย่างน้อย 1 เซต');
      }
      return updated;
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      }),
      time: date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#002140] text-white py-6 print:hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/clients/${client.id}`)}
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
                onClick={handleSave}
                className="text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
              {!isCompleted && sessionExercises.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
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
              <h1 className="text-2xl mb-1">{client.name}</h1>
              <p className="text-sm text-white/70">
                {formatDate(sessionDate).full} • {formatDate(sessionDate).time}
              </p>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                เสร็จสิ้น
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Program Progress Card */}
        {assignedProgram && currentProgramDay && (
          <Card className="border-[#002140]/20 bg-gradient-to-br from-[#002140]/5 to-transparent mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-[#002140]" />
                    <h2 className="text-lg">{assignedProgram.name}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    สัปดาห์ {currentProgramDay.weekNumber} • {currentProgramDay.day.name}
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {currentProgramDay.totalCompleted}/{currentProgramDay.totalDays} วัน
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ความก้าวหน้าโดยรวม</span>
                  <span className="font-medium">{currentProgramDay.progress}%</span>
                </div>
                <Progress value={currentProgramDay.progress} className="h-2" />
              </div>

              {currentProgramDay.day.isRestDay && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">วันนี้เป็นวันพักผ่อน</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Program Warning */}
        {!assignedProgram && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-900 dark:text-orange-200 mb-1">
                    ลูกเทรนยังไม่มีโปรแกรม
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    กรุณามอบหมายโปรแกรมให้ลูกเทรนก่อน เพื่อให้ระบบสามารถโหลดท่าออกกำลังกายอัตโนมัติได้
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    ไปที่โปรไฟล์ลูกเทรน
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {!isCompleted && (
          <Card className="border-[#002140]/20 mb-6">
            <CardHeader>
              <CardTitle className="text-base">เครื่องมือ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExerciseDialog(true)}
                  className="gap-2"
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[#002140]" />
                ท่าออกกำลังกาย ({completedExercises}/{sessionExercises.length})
              </h2>
            </div>

            {sessionExercises.map((sessionEx, exerciseIdx) => {
              const exercise = getExerciseById(sessionEx.exerciseId);
              const isExpanded = expandedExercises.has(exerciseIdx);

              return (
                <Card key={exerciseIdx} className="border-border/40">
                  <CardContent className="p-4">
                    {/* Exercise Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExerciseCompleted(exerciseIdx)}
                          className="h-6 w-6 p-0 mt-1"
                          disabled={isCompleted}
                        >
                          {sessionEx.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{exercise?.name || 'Unknown'}</h3>
                            {exercise?.category && (
                              <Badge variant="outline" className="text-xs">
                                {exercise.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sessionEx.sets.length} เซต
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExercise(exerciseIdx)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        {!isCompleted && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAddSet(exerciseIdx)}>
                                <Plus className="h-4 w-4 mr-2" />
                                เพิ่มเซต
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteExercise(exerciseIdx)}
                                className="text-red-600"
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
                      <div className="space-y-3">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="p-2 text-left w-12">Set</th>
                                <th className="p-2 text-center">Reps</th>
                                <th className="p-2 text-center">น้ำหนัก (kg)</th>
                                <th className="p-2 text-center">RPE</th>
                                <th className="p-2 text-center w-12">✓</th>
                                {!isCompleted && <th className="p-2 w-12"></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {sessionEx.sets.map((set, setIdx) => (
                                <tr key={setIdx} className="border-t">
                                  <td className="p-2 text-muted-foreground">{setIdx + 1}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={set.reps || ''}
                                      onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'reps', e.target.value)}
                                      className="h-8 text-center"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      step="0.5"
                                      value={set.weight || ''}
                                      onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'weight', e.target.value)}
                                      className="h-8 text-center"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={set.rpe || ''}
                                      onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'rpe', e.target.value)}
                                      className="h-8 text-center"
                                      placeholder="-"
                                      disabled={isCompleted}
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleSetCompleted(exerciseIdx, setIdx)}
                                      className="h-8 w-8 p-0"
                                      disabled={isCompleted}
                                    >
                                      {set.completed ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </td>
                                  {!isCompleted && (
                                    <td className="p-2">
                                      {sessionEx.sets.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteSet(exerciseIdx, setIdx)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Trash2 className="h-3 w-3 text-muted-foreground" />
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
                          <Label className="text-xs text-muted-foreground">โน้ต</Label>
                          <Textarea
                            value={sessionEx.notes}
                            onChange={(e) => updateExerciseNotes(exerciseIdx, e.target.value)}
                            placeholder="บันทึกโน้ตสำหรับท่านี้..."
                            className="mt-1 min-h-[60px]"
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
          <Card className="border-border/40">
            <CardContent className="p-12 text-center">
              <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg mb-2">ยังไม่มีท่าออกกำลังกาย</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {assignedProgram 
                  ? 'กำลังโหลดท่าจากโปรแกรม...' 
                  : 'กรุณามอบหมายโปรแกรมให้ลูกเทรนก่อน'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Session Notes */}
        {sessionExercises.length > 0 && (
          <Card className="border-[#002140]/20 mt-6">
            <CardHeader>
              <CardTitle className="text-base">โน้ตการฝึก</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="บันทึกโน้ตสำหรับการฝึกครั้งนี้..."
                className="min-h-[100px]"
                disabled={isCompleted}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent aria-describedby="add-exercise-description">
          <DialogHeader>
            <DialogTitle>เพิ่มท่าออกกำลังกาย</DialogTitle>
            <DialogDescription id="add-exercise-description">
              เลือกท่าออกกำลังกายและกำหนดจำนวนเซต
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ท่าออกกำลังกาย</Label>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกท่า" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>จำนวนเซต</Label>
                <Input
                  type="number"
                  min="1"
                  value={exerciseSets}
                  onChange={(e) => setExerciseSets(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Reps ต่อเซต</Label>
                <Input
                  type="number"
                  min="1"
                  value={exerciseReps}
                  onChange={(e) => setExerciseReps(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddExercise} className="bg-[#002140] hover:bg-[#002140]/90">
              เพิ่มท่า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Card */}
      {showSummaryCard && (
        <SessionSummaryCard
          session={session}
          client={client}
          onClose={() => {
            setShowSummaryCard(false);
            navigate(`/clients/${client.id}`);
          }}
        />
      )}

      {/* Completion Form */}
      {showCompletionForm && (
        <SessionCompletionForm
          open={showCompletionForm}
          onClose={() => setShowCompletionForm(false)}
          onSubmit={handleCompletionSubmit}
          clientName={client.name}
          defaultDate={sessionDate}
        />
      )}
    </div>
  );
}