import React, { useState } from 'react';
import { Eye, Calendar, Clock, TrendingUp, ClipboardEdit, Play, Check, Plus, Trash2, Dumbbell, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Client, SessionExercise } from '../AppContext';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';

interface ClientScheduleProps {
  client: Client;
}

export default function ClientSchedule({ client }: ClientScheduleProps) {
  const { sessions, addSession, deleteSession, exercises: exerciseLibrary, getActiveProgramInstance, getProgramTemplateById } = useApp();
  const navigate = useNavigate();
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  // State for creating session
  const [sessionMode, setSessionMode] = useState<'program' | 'custom'>('program');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionEndTime, setSessionEndTime] = useState('');
  
  // State for custom session
  const [customExercises, setCustomExercises] = useState<SessionExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState(10);
  const [exerciseWeight, setExerciseWeight] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(30); // in seconds
  const [exerciseRest, setExerciseRest] = useState(60); // in seconds

  // State for duplicate session confirmation
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);

  // Get client's program via ProgramInstance
  const activeInstance = getActiveProgramInstance(client.id);
  const clientProgram = activeInstance 
    ? getProgramTemplateById(activeInstance.templateId)
    : null;

  // Get client's sessions
  const clientSessions = sessions.filter(s => s.clientId === client.id);
  
  // Get scheduled (upcoming) sessions
  const scheduledSessions = clientSessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get completed sessions
  const completedSessions = clientSessions.filter(s => s.status === 'completed');

  // Calculate attendance rate
  const totalScheduled = clientSessions.filter(s => s.status === 'scheduled' || s.status === 'completed').length;
  const attendanceRate = totalScheduled > 0 
    ? Math.round((completedSessions.length / totalScheduled) * 100) 
    : 0;

  // Filter exercises for search
  const filteredExercises = exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected exercise and determine its type
  const selectedExercise = exerciseLibrary.find(ex => ex.id === selectedExerciseId);
  const exerciseType = selectedExercise?.modality || selectedExercise?.category || '';
  
  // Determine which fields to show based on exercise type
  const isStrength = exerciseType.toLowerCase().includes('เสริมแรง') || exerciseType.toLowerCase().includes('strength');
  const isCardio = exerciseType.toLowerCase().includes('คาร์ดิโอ') || exerciseType.toLowerCase().includes('cardio');
  const isFlexibility = exerciseType.toLowerCase().includes('ยืดหยุ่น') || exerciseType.toLowerCase().includes('flexibility');

  const handleAddCustomExercise = () => {
    if (!selectedExerciseId) {
      toast.error('กรุณาเลือกท่าออกกำลังกาย');
      return;
    }

    const newExercise: SessionExercise = {
      exerciseId: selectedExerciseId,
      sets: Array(exerciseSets).fill(null).map(() => ({
        reps: exerciseReps,
        weight: exerciseWeight,
        completed: false
      }))
    };

    setCustomExercises([...customExercises, newExercise]);
    setSelectedExerciseId('');
    setExerciseSets(3);
    setExerciseReps(10);
    setExerciseWeight(0);
    setSearchTerm('');
    toast.success('เพิ่มท่าแล้ว');
  };

  const handleRemoveCustomExercise = (index: number) => {
    setCustomExercises(customExercises.filter((_, i) => i !== index));
  };

  const handleCreateSessionFromProgram = () => {
    if (!sessionDate || !sessionTime) {
      toast.error('กรุณากรอกวันที่และเวลา');
      return;
    }

    if (selectedDay === null) {
      toast.error('กรุณาเลือก Day จากโปรแกรม');
      return;
    }

    if (!clientProgram) {
      toast.error('ไม่พบโปรแกรม');
      return;
    }

    // Find the selected day from program
    const programDay = clientProgram.weeks[0]?.days.find(d => d.dayNumber === selectedDay);
    
    if (!programDay) {
      toast.error('ไม่พบข้อมูล Day');
      return;
    }

    // Convert program exercises to session exercises
    const exercises: SessionExercise[] = [];
    
    if (programDay.sections) {
      // New format with sections
      programDay.sections.forEach(section => {
        section.exercises?.forEach(programEx => {
          const repsNum = parseInt(programEx.reps) || 10;
          exercises.push({
            exerciseId: programEx.exerciseId,
            sets: Array(programEx.sets).fill(null).map(() => ({
              reps: repsNum,
              weight: programEx.weight || 0,
              completed: false
            }))
          });
        });
      });
    } else if (programDay.exercises) {
      // Old format without sections
      programDay.exercises.forEach(programEx => {
        const repsNum = parseInt(programEx.reps) || 10;
        exercises.push({
          exerciseId: programEx.exerciseId,
          sets: Array(programEx.sets).fill(null).map(() => ({
            reps: repsNum,
            weight: programEx.weight || 0,
            completed: false
          }))
        });
      });
    }

    const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
    const sessionId = addSession({
      clientId: client.id,
      programId: clientProgram.id,
      date: sessionDateTime.toISOString(),
      status: 'scheduled',
      exercises: exercises
    });

    toast.success('สร้างนัดหมายจากโปรแกรมเรียบร้อยแล้ว');
    resetForm();
  };

  const handleCreateCustomSession = () => {
    if (!sessionDate || !sessionTime) {
      toast.error('กรุณากรอกวันที่และเวลา');
      return;
    }

    if (customExercises.length === 0) {
      toast.error('กรุณาเพิ่มท่าออกกำลังกายอย่างน้อย 1 ท่า');
      return;
    }

    // ตรวจสอบว่ามีนัดในวันเดียวกันหรือไม่
    const selectedDate = new Date(sessionDate);
    const hasDuplicateSession = scheduledSessions.some(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });

    const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
    
    // สร้าง endTime ถ้ามีการกรอก
    let endTime = undefined;
    if (sessionEndTime) {
      const endDateTime = new Date(`${sessionDate}T${sessionEndTime}`);
      endTime = endDateTime.toISOString();
    }

    const newSessionData = {
      clientId: client.id,
      date: sessionDateTime.toISOString(),
      endTime: endTime,
      status: 'scheduled' as const,
      exercises: customExercises
    };

    // ถ้ามีนัดซ้ำ ให้แสดง dialog ยืนยัน
    if (hasDuplicateSession) {
      setPendingSessionData(newSessionData);
      setShowDuplicateDialog(true);
      return;
    }

    // ถ้าไม่มีนัดซ้ำ สร้างนัดได้เลย
    const sessionId = addSession(newSessionData);
    toast.success('สร้างนัดหมายเรียบร้อยแล้ว');
    resetForm();
  };

  const confirmCreateDuplicateSession = () => {
    if (pendingSessionData) {
      const sessionId = addSession(pendingSessionData);
      toast.success('สร้างนัดหมายเรียบร้อยแล้ว');
      setShowDuplicateDialog(false);
      setPendingSessionData(null);
      resetForm();
    }
  };

  const cancelDuplicateSession = () => {
    setShowDuplicateDialog(false);
    setPendingSessionData(null);
  };

  const resetForm = () => {
    setShowNewSessionDialog(false);
    setSessionMode('program');
    setSelectedDay(null);
    setSessionDate('');
    setSessionTime('');
    setSessionEndTime('');
    setCustomExercises([]);
    setSearchTerm('');
    setSelectedExerciseId('');
  };

  const handleQuickStartSession = () => {
    const sessionId = addSession({
      clientId: client.id,
      date: new Date().toISOString(),
      status: 'in-progress',
      exercises: []
    });
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleViewSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleMarkComplete = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      toast.success('ลบนัดหมายเรียบร้อยแล้ว');
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('th-TH', { month: 'short' }),
      year: date.getFullYear() + 543,
      fullDate: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
      weekday: date.toLocaleDateString('th-TH', { weekday: 'long' })
    };
  };

  const getDayExerciseCount = (dayNumber: number) => {
    const programDay = clientProgram?.weeks[0]?.days.find(d => d.dayNumber === dayNumber);
    if (!programDay) return 0;
    
    let count = 0;
    if (programDay.sections) {
      programDay.sections.forEach(section => {
        count += section.exercises?.length || 0;
      });
    } else if (programDay.exercises) {
      count = programDay.exercises.length;
    }
    return count;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">นัดที่กำหนดไว้</div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-[#002140]">{scheduledSessions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">นัดที่จะมาถึง</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">การฝึกที่เสร็จ</div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-[#002140]">{completedSessions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">การฝึกทั้งหมด</div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">อัตราการเข้าร่วม</div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-3xl font-bold text-[#002140]">{attendanceRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">จากนัดทั้งหมด</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Session */}
      <Card className="border-[#002140]/20 bg-gradient-to-br from-[#002140]/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">เพิ่มนัดหมายใหม่</h3>
              <p className="text-sm text-muted-foreground">
                สร้างนัดหมายการฝึกใหม่สำหรับ <span className="font-medium">{client.name}</span> ได้เลย
              </p>
            </div>
            <Dialog open={showNewSessionDialog} onOpenChange={(open) => {
              setShowNewSessionDialog(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-[#002140] hover:bg-[#002140]/90 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  กำหนดนัด
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" aria-describedby="new-session-description">
                <DialogHeader>
                  <DialogTitle>สร้างนัดหมายใหม่</DialogTitle>
                  <DialogDescription id="new-session-description">
                    สร้างนัดหมายการฝึกใหม่สำหรับลูกเทรน
                  </DialogDescription>
                </DialogHeader>

                {/* Create Custom Session Form */}
                <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date-custom">วันที่</Label>
                      <Input
                        id="date-custom"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="text-foreground [color-scheme:light]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="time-custom">เวลาเริ่ม</Label>
                        <Input
                          id="time-custom"
                          type="time"
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                          className="text-foreground [color-scheme:light]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time-custom">เวลาสิ้นสุด</Label>
                        <Input
                          id="end-time-custom"
                          type="time"
                          value={sessionEndTime}
                          onChange={(e) => setSessionEndTime(e.target.value)}
                          className="text-foreground [color-scheme:light]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exercise Selection */}
                  <div className="space-y-3">
                    <Label>เพิ่มท่าออกกำลังกาย</Label>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาท่าออกกำลังกาย..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Exercise Select */}
                    <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกท่าออกกำลังกาย" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredExercises.length > 0 ? (
                          filteredExercises.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                              {ex.name} ({ex.category || ex.modality})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            ไม่พบท่าออกกำลังกาย
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Dynamic Fields based on Exercise Type */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Sets - Always show */}
                      <div>
                        <Label htmlFor="sets">Sets</Label>
                        <Input
                          id="sets"
                          type="number"
                          min="1"
                          value={exerciseSets}
                          onChange={(e) => setExerciseSets(parseInt(e.target.value) || 1)}
                        />
                      </div>

                      {/* For Strength: KG, REPS, REST */}
                      {(isStrength || !selectedExerciseId) && (
                        <>
                          <div>
                            <Label htmlFor="weight">KG</Label>
                            <Input
                              id="weight"
                              type="number"
                              min="0"
                              step="0.5"
                              value={exerciseWeight}
                              onChange={(e) => setExerciseWeight(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reps">Reps</Label>
                            <Input
                              id="reps"
                              type="number"
                              min="1"
                              value={exerciseReps}
                              onChange={(e) => setExerciseReps(parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rest">Rest (วินาที)</Label>
                            <Input
                              id="rest"
                              type="number"
                              min="0"
                              value={exerciseRest}
                              onChange={(e) => setExerciseRest(parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </>
                      )}

                      {/* For Cardio & Flexibility: TIME, REST */}
                      {(isCardio || isFlexibility) && (
                        <>
                          <div>
                            <Label htmlFor="time">Time (วินาที)</Label>
                            <Input
                              id="time"
                              type="number"
                              min="0"
                              value={exerciseTime}
                              onChange={(e) => setExerciseTime(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rest">Rest (วินาที)</Label>
                            <Input
                              id="rest"
                              type="number"
                              min="0"
                              value={exerciseRest}
                              onChange={(e) => setExerciseRest(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div></div> {/* Empty cell for grid alignment */}
                        </>
                      )}
                    </div>

                    <Button 
                      onClick={handleAddCustomExercise}
                      variant="outline"
                      className="w-full"
                      disabled={!selectedExerciseId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มท่า
                    </Button>
                  </div>

                  {/* Added Exercises List */}
                  <div className="flex-1 overflow-hidden">
                    <Label>ท่าที่เพิ่มแล้ว ({customExercises.length})</Label>
                    <ScrollArea className="h-[200px] mt-2 border rounded-lg">
                      {customExercises.length > 0 ? (
                        <div className="space-y-2 p-3">
                          {customExercises.map((ex, index) => {
                            const exercise = exerciseLibrary.find(e => e.id === ex.exerciseId);
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{exercise?.name || 'Unknown'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {ex.sets.length} Sets × {ex.sets[0].reps} Reps
                                    {ex.sets[0].weight ? ` @ ${ex.sets[0].weight} kg` : ''}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCustomExercise(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-8">
                          ยังไม่มีท่าที่เพิ่ม
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                      ยกเลิก
                    </Button>
                    <Button 
                      onClick={handleCreateCustomSession}
                      className="bg-[#002140] hover:bg-[#002140]/90"
                      disabled={customExercises.length === 0 || !sessionDate || !sessionTime}
                    >
                      สร้างนัด
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Sessions */}
      {scheduledSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 text-[#002140]">นัดหมายที่กำหนดไว้</h2>
          <div className="text-sm text-muted-foreground mb-4">การฝึกที่จะมาถึง</div>
          
          <div className="space-y-3">
            {scheduledSessions.map((session) => {
              const dateInfo = formatSessionDate(session.date);
              
              return (
                <Card key={session.id} className="border-border/40 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-6">
                      {/* Date Box */}
                      <div className="flex-shrink-0">
                        <div className="bg-[#002140] text-white rounded-xl p-4 text-center min-w-[80px]">
                          <div className="text-3xl font-bold leading-none mb-1">{dateInfo.day}</div>
                          <div className="text-xs opacity-90">{dateInfo.month}</div>
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">
                          {dateInfo.weekday}ที่ {dateInfo.day} {dateInfo.month} {dateInfo.year}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{dateInfo.time}</span>
                          {session.exercises.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{session.exercises.length} ท่า</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleViewSession(session.id)}
                          className="bg-[#002140] hover:bg-[#002140]/90 gap-2"
                        >
                          <Play className="h-4 w-4" />
                          เปิดบันทึก
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
      {scheduledSessions.length === 0 && (
        <Card className="border-border/40">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีนัดหมาย</h3>
            <p className="text-sm text-muted-foreground">
              เริ่มต้นสร้างนัดหมายการฝึกแรกสำหรับ {client.name}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completed Sessions History */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 text-[#002140]">ประวัติการฝึกที่เสร็จสิ้น</h2>
          <div className="text-sm text-muted-foreground mb-4">การฝึกที่ผ่านมา ({completedSessions.length})</div>
          
          <div className="space-y-3">
            {completedSessions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((session) => {
                const dateInfo = formatSessionDate(session.date);
                
                return (
                  <Card key={session.id} className="border-border/40 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-6">
                        {/* Date Box */}
                        <div className="flex-shrink-0">
                          <div className="bg-muted text-foreground rounded-xl p-4 text-center min-w-[80px]">
                            <div className="text-3xl font-bold leading-none mb-1">{dateInfo.day}</div>
                            <div className="text-xs opacity-70">{dateInfo.month}</div>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">
                              {dateInfo.fullDate}
                            </h3>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Check className="h-3 w-3" />
                              เสร็จสิ้น
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{dateInfo.time}</span>
                            {session.exercises.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{session.exercises.length} ท่า</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSession(session.id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            ดูรายละเอียด
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          
          {completedSessions.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                แสดง 10 จาก {completedSessions.length} การฝึก
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Session Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent aria-describedby="delete-session-description">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบนัดหมาย</AlertDialogTitle>
            <AlertDialogDescription id="delete-session-description">
              คุณแน่ใจว่าต้องการลบนัดหมายนี้หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSession}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Session Confirmation Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent aria-describedby="duplicate-session-description">
          <AlertDialogHeader>
            <AlertDialogTitle>มีนัดหมายซ้ำ</AlertDialogTitle>
            <AlertDialogDescription id="duplicate-session-description">
              มีนัดหมายในวันเดียวกันแล้ว คุณต้องการสร้างนัดหมายใหม่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDuplicateSession}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreateDuplicateSession}>
              สร้างนัดหมายใหม่
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}