import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Download, Share, Printer, MoreHorizontal, ChevronRight, CheckCircle2, Circle, Minus, Play, Edit3, SkipForward, FileText, Zap, ClipboardPaste } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';

export default function SessionLog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSessionById, getClientById, updateSession, exercises } = useApp();
  
  // Coach Mode States
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showSummaryReview, setShowSummaryReview] = useState(false);
  const [sessionSummary, setSessionSummary] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [editingSet, setEditingSet] = useState<{exerciseIndex: number, setIndex: number} | null>(null);
  const [showQuickFillModal, setShowQuickFillModal] = useState(false);
  const [quickFillMode, setQuickFillMode] = useState<'planned' | 'per-exercise' | 'bulk'>('planned');

  const session = getSessionById(id!);
  const client = session ? getClientById(session.clientId) : null;

  // Mock session data with planned workout
  const [sessionData, setSessionData] = useState({
    exercises: [
      {
        id: '1',
        name: 'Barbell Squat',
        category: 'legs',
        status: 'current', // current, completed, pending, skipped
        sets: [
          { planned: { reps: 10, weight: 60 }, actual: null, completed: false },
          { planned: { reps: 10, weight: 60 }, actual: null, completed: false },
          { planned: { reps: 8, weight: 65 }, actual: null, completed: false },
        ]
      },
      {
        id: '2', 
        name: 'Bench Press',
        category: 'chest',
        status: 'pending',
        sets: [
          { planned: { reps: 8, weight: 50 }, actual: null, completed: false },
          { planned: { reps: 8, weight: 50 }, actual: null, completed: false },
          { planned: { reps: 6, weight: 55 }, actual: null, completed: false },
        ]
      },
      {
        id: '3',
        name: 'Barbell Row',
        category: 'back', 
        status: 'pending',
        sets: [
          { planned: { reps: 12, weight: 40 }, actual: null, completed: false },
          { planned: { reps: 12, weight: 40 }, actual: null, completed: false },
          { planned: { reps: 10, weight: 45 }, actual: null, completed: false },
        ]
      }
    ]
  });

  // Find current exercise
  const currentExercise = sessionData.exercises[currentExerciseIndex];
  
  // Auto-advance to next exercise when all sets are completed
  React.useEffect(() => {
    if (currentExercise && currentExercise.sets.every(set => set.completed)) {
      const nextIncompleteIndex = sessionData.exercises.findIndex((ex, idx) => 
        idx > currentExerciseIndex && ex.status !== 'completed' && ex.status !== 'skipped'
      );
      if (nextIncompleteIndex !== -1) {
        setCurrentExerciseIndex(nextIncompleteIndex);
        // Update exercise status
        setSessionData(prev => ({
          ...prev,
          exercises: prev.exercises.map((ex, idx) => 
            idx === currentExerciseIndex ? { ...ex, status: 'completed' } : ex
          )
        }));
      }
    }
  }, [sessionData, currentExerciseIndex, currentExercise]);

  if (!session || !client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่พบเซสชัน</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          กลับไปแดชบอร์ด
        </Button>
      </div>
    );
  }

  // Handler functions
  const handleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    setSessionData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIdx) => 
        exIdx === exerciseIndex 
          ? {
              ...ex,
              sets: ex.sets.map((set, setIdx) => 
                setIdx === setIndex 
                  ? { 
                      ...set, 
                      completed: true,
                      actual: set.actual || { ...set.planned, rpe: 8, notes: '' }
                    }
                  : set
              )
            }
          : ex
      )
    }));
    toast.success('บันทึกเซตสำเร็จ');
  };

  const handleMarkAllSets = (exerciseIndex: number) => {
    setSessionData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIdx) => 
        exIdx === exerciseIndex 
          ? {
              ...ex,
              status: 'completed',
              sets: ex.sets.map(set => ({ 
                ...set, 
                completed: true,
                actual: set.actual || { ...set.planned, rpe: 8, notes: '' }
              }))
            }
          : ex
      )
    }));
    toast.success('เสร็จสิ้นท่านี้แล้ว');
  };

  const handleSkipExercise = (exerciseIndex: number) => {
    setSessionData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIdx) => 
        exIdx === exerciseIndex ? { ...ex, status: 'skipped' } : ex
      )
    }));
    toast.success('ข้ามท่านี้แล้ว');
  };

  const handleQuickFillPlanned = () => {
    setSessionData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => ({
        ...ex,
        status: 'completed',
        sets: ex.sets.map(set => ({
          ...set,
          completed: true,
          actual: { ...set.planned, rpe: 8, notes: '' }
        }))
      }))
    }));
    toast.success('เติมข้อมูลตามแผนทั้งเซสชันแล้ว');
    setShowQuickFillModal(false);
  };

  const handlePrintSession = () => {
    // Mock print functionality
    toast.success('กำลังสร้างชีทการออกกำลังกายสำหรับพิมพ์');
  };

  const handleEndSession = () => {
    updateSession(session.id, {
      status: 'completed',
      summary: sessionSummary
    });
    setShowEndSessionDialog(false);
    setShowSummaryReview(true);
  };

  const handleFinalizeSummary = () => {
    toast.success('เซสชันสิ้นสุดแล้ว');
    navigate(`/clients/${client.id}?tab=sessions`);
  };

  const getExerciseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'current': return <Play className="h-4 w-4 text-blue-500" />;
      case 'skipped': return <Minus className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const isReadOnly = session.status === 'completed';

  if (showSummaryReview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSummaryReview(false)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1>Summary Review</h1>
            <p className="text-gray-600">{client.name} - สรุปเซสชัน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ผลการออกกำลังกาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionData.exercises.map((exercise, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getExerciseStatusIcon(exercise.status)}
                    <span className="font-medium">{exercise.name}</span>
                    <Badge variant={exercise.status === 'completed' ? 'default' : 
                                  exercise.status === 'skipped' ? 'secondary' : 'outline'}>
                      {exercise.status === 'completed' ? 'เสร็จ' : 
                       exercise.status === 'skipped' ? 'ข้าม' : 'รอ'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex justify-between">
                        <span>Set {setIdx + 1}:</span>
                        <span>
                          {set.completed && set.actual ? 
                            `${set.actual.reps} ครั้ง × ${set.actual.weight} กก.` :
                            `${set.planned.reps} ครั้ง × ${set.planned.weight} กก. (แผน)`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>สรุปและหมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>สรุปเซสชัน</Label>
                <Textarea
                  value={sessionSummary}
                  onChange={(e) => setSessionSummary(e.target.value)}
                  placeholder="ฟอร์มดีขึ้น, แข็งแรงเพิ่มขึ้น, ปรับน้ำหนักครั้งหน้า..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>หมายเหตุระหว่างเซสชัน</Label>
                <Textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="ข้อสังเกต, อาการบาดเจ็บ, การปรับปรุง..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4>สร้างการ์ดสรุป</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-1" />
                    แชร์ให้ลูกเทรน
                  </Button>
                </div>
              </div>

              <Button onClick={handleFinalizeSummary} className="w-full">
                เสร็จสิ้นเซสชัน
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1>Coach Mode - Session Log</h1>
            <p className="text-gray-600">{client.name} - {client.goal}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintSession}>
            <Printer className="h-4 w-4 mr-1" />
            พิมพ์ชีท
          </Button>
          
          <Dialog open={showQuickFillModal} onOpenChange={setShowQuickFillModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-1" />
                Quick Fill
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="quick-fill-description">
              <DialogHeader>
                <DialogTitle>Quick Fill Options</DialogTitle>
                <DialogDescription id="quick-fill-description">เลือกวิธีเติมข้อมูลแบบรวดเร็ว</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleQuickFillPlanned}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Fill as Planned - เติมตามแผนทั้งเซสชัน
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Per-Exercise Fill - เลือกท่าทีละตัว
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Bulk Paste - วางจาก Clipboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {!isReadOnly && (
            <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  จบเซสชัน
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="end-session-description">
                <DialogHeader>
                  <DialogTitle>จบเซสชัน</DialogTitle>
                  <DialogDescription id="end-session-description">
                    ต้องการจบเซสชันและไปยังหน้าสรุปผลหรือไม่?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEndSessionDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleEndSession}>
                    จบเซสชัน
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">วันที่</p>
              <p className="font-medium">
                {new Date(session.date).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">เวลา</p>
              <p className="font-medium">
                {new Date(session.date).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">ความคืบหน้า</p>
              <p className="font-medium">
                {sessionData.exercises.filter(ex => ex.status === 'completed').length}/
                {sessionData.exercises.length} ท่า
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Plan - Left Sidebar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Today's Plan
                {!isReadOnly && (
                  <Dialog open={showAddExerciseModal} onOpenChange={setShowAddExerciseModal}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่ม
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby="add-exercise-description">
                      <DialogHeader>
                        <DialogTitle>เพิ่มท่าออกกำลังกาย</DialogTitle>
                        <DialogDescription id="add-exercise-description">เลือกท่าจากไลบรารีหรือสร้างใหม่</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกท่าจากไลบรารี" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deadlift">Deadlift</SelectItem>
                            <SelectItem value="pullup">Pull-up</SelectItem>
                            <SelectItem value="pushup">Push-up</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddExerciseModal(false)}>
                            ยกเลิก
                          </Button>
                          <Button onClick={() => {
                            toast.success('เพิ่มท่าเรียบร้อย');
                            setShowAddExerciseModal(false);
                          }}>
                            เพิ่มท่า
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionData.exercises.map((exercise, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    index === currentExerciseIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentExerciseIndex(index)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getExerciseStatusIcon(exercise.status)}
                    <span className="font-medium text-sm">{exercise.name}</span>
                  </div>
                  <div className="space-y-1">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center justify-between text-xs">
                        <span>Set {setIndex + 1}:</span>
                        <span className="text-gray-600">
                          {set.planned.reps} × {set.planned.weight}kg
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          set.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Current Exercise - Center */}
        <div className="lg:col-span-6">
          {currentExercise ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{currentExercise.name}</span>
                      <Badge variant="outline">{currentExercise.category}</Badge>
                    </CardTitle>
                    <CardDescription>
                      กำลังทำท่าที่ {currentExerciseIndex + 1} จาก {sessionData.exercises.length}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSkipExercise(currentExerciseIndex)}
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      ข้ามท่า
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleMarkAllSets(currentExerciseIndex)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      เสร็จทั้งท่า
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Set {setIndex + 1}</span>
                        <span className="text-gray-600">
                          แผน: {set.planned.reps} ครั้ง × {set.planned.weight} กก.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSet({ exerciseIndex: currentExerciseIndex, setIndex });
                            setShowEditSetModal(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          แก้ไข
                        </Button>
                      </div>
                    </div>
                    
                    {set.completed ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">เสร็จแล้ว</span>
                        </div>
                        <span className="text-green-700">
                          {set.actual ? 
                            `${set.actual.reps} ครั้ง × ${set.actual.weight} กก. RPE: ${set.actual.rpe}` :
                            'ตามแผน'
                          }
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => handleSetCompleted(currentExerciseIndex, setIndex)}
                      >
                        <Check className="h-5 w-5 mr-2" />
                        ✓ Done - บันทึกเซตนี้
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">เลือกท่าจากรายการด้านซ้ายเพื่อเริ่มบันทึก</p>
                <Button onClick={() => setCurrentExerciseIndex(0)}>
                  เริ่มท่าแรก
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions - Right Sidebar */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {/* Quick Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quick Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="บันทึกข้อสังเกตระหว่างเซสชัน..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Issues & Contraindications */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อควรระวัง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <span className="text-sm">⚠️ เฝ้าระวังหัวเข่าขวา</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <span className="text-sm">💡 เน้นฟอร์มมากกว่าน้ำหนัก</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  เพิ่มข้อควรระวัง
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Set Modal */}
      <Dialog open={showEditSetModal} onOpenChange={setShowEditSetModal}>
        <DialogContent aria-describedby="edit-set-description">
          <DialogHeader>
            <DialogTitle>แก้ไขเซต</DialogTitle>
            <DialogDescription id="edit-set-description">
              ปรับค่าจริงที่ทำได้ (Reps/Weight/RPE/Notes)
            </DialogDescription>
          </DialogHeader>
          {editingSet && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>จำนวนครั้ง</Label>
                  <Input placeholder="10" />
                </div>
                <div>
                  <Label>น้ำหนัก (กก.)</Label>
                  <Input placeholder="60" />
                </div>
                <div>
                  <Label>RPE (1-10)</Label>
                  <Input placeholder="8" />
                </div>
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <Textarea placeholder="ฟอร์มดี, รู้สึกแข็งแรง..." rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditSetModal(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={() => {
                  toast.success('บันทึกการแก้ไขแล้ว');
                  setShowEditSetModal(false);
                }}>
                  บันทึก
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Summary for Read-Only */}
      {isReadOnly && session.summary && (
        <Card>
          <CardHeader>
            <CardTitle>สรุปเซสชัน</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{session.summary}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                ดาวน์โหลดการ์ด
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-1" />
                แชร์ให้ลูกเทรน
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}