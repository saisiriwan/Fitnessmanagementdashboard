import React, { useState, useMemo } from 'react';
import { Check, Dumbbell, Search, AlertTriangle, Calendar, Clock, Bell, Info, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { useApp } from './AppContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Switch } from './ui/switch';

interface AssignProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Mode 1: เปิดจากหน้า Client Profile (เลือกโปรแกรม)
  preSelectedClientId?: string;
  // Mode 2: เปิดจากหน้า Program Builder (เลือกลูกเทรน)
  programId?: string | number | null;
  programName?: string;
}

export default function AssignProgramModal({
  isOpen,
  onClose,
  preSelectedClientId,
  programId,
  programName,
}: AssignProgramModalProps) {
  const { 
    clients, 
    createProgramInstance,
    getProgramTemplateById,
    addSession,
    programInstances,
    deleteProgramInstance,
    deleteSession,
    sessions,
    programTemplates,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [defaultStartTime, setDefaultStartTime] = useState<string>('10:00');
  const [defaultEndTime, setDefaultEndTime] = useState<string>('11:00');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [reminderValue, setReminderValue] = useState<number>(1);

  // ✅ ตรวจสอบว่าเป็น mode ไหน
  const isClientProfileMode = !!preSelectedClientId;
  const isProgramBuilderMode = !!programId && !preSelectedClientId;

  // ✅ Auto-select client เมื่อเปิด Modal (ถ้ามี preSelectedClientId)
  React.useEffect(() => {
    if (isOpen && preSelectedClientId && !selectedClients.includes(preSelectedClientId)) {
      setSelectedClients([preSelectedClientId]);
    }
  }, [isOpen, preSelectedClientId]);

  // ✅ Auto-select program เมื่อเปิด Modal
  React.useEffect(() => {
    if (isOpen) {
      if (programId) {
        // Mode 2: มี programId ส่งมา
        setSelectedProgramId(String(programId));
      } else if (programTemplates.length > 0) {
        // Mode 1: เลือกโปรแกรมแรกเป็น default
        setSelectedProgramId(programTemplates[0].id);
      }
    }
  }, [isOpen, programId, programTemplates]);

  // ✅ Reset เมื่อเปิด Modal
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDefaultStartTime('10:00');
      setDefaultEndTime('11:00');
      if (!preSelectedClientId) {
        setSelectedClients([]);
      }
    }
  }, [isOpen, preSelectedClientId]);

  // ✅ Filter programs based on search
  const filteredPrograms = programTemplates.filter((program) =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  // ✅ ดึงข้อมูลลูกเทรนที่เลือก
  const selectedClient = preSelectedClientId 
    ? clients.find(c => c.id === preSelectedClientId)
    : null;

  // ✅ ตรวจสอบว่า clients มี active program หรือไม่
  const getClientsWithActivePrograms = () => {
    return selectedClients
      .map(clientId => {
        const client = clients.find(c => c.id === clientId);
        const activeInstance = programInstances.find(
          instance => instance.clientId === clientId && instance.status === 'active'
        );
        if (!activeInstance || !client) return null;

        const programSessions = sessions.filter(s => 
          s.programInstanceId === activeInstance.id
        );
        const scheduledSessions = programSessions.filter(s => s.status === 'scheduled');
        const currentProgram = getProgramTemplateById(activeInstance.templateId);

        return {
          client,
          activeInstance,
          currentProgramName: currentProgram?.name || 'โปรแกรมไม่ระบุชื่อ',
          remainingSessions: scheduledSessions.length,
        };
      })
      .filter(Boolean);
  };

  // ✅ คำนวณรายละเอียดโปรแกรม
  const programDetails = useMemo(() => {
    if (!selectedProgramId) return null;
    
    const template = getProgramTemplateById(selectedProgramId);
    if (!template || !template.weeks || !Array.isArray(template.weeks)) return null;

    let totalDays = 0;
    template.weeks.forEach(week => {
      if (week.days && Array.isArray(week.days)) {
        totalDays += week.days.length;
      }
    });

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    return {
      totalWeeks: template.weeks.length,
      totalDays: totalDays,
      endDate: end.toISOString().split('T')[0],
      endDateFormatted: end.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    };
  }, [selectedProgramId, startDate, getProgramTemplateById]);

  const handleAssign = () => {
    if (!selectedProgramId) {
      toast.error('กรุณาเลือกโปรแกรม');
      return;
    }

    if (selectedClients.length === 0) {
      toast.error('กรุณาเลือกลูกเทรนอย่างน้อย 1 คน');
      return;
    }

    if (!startDate) {
      toast.error('กรุณาเลือกวันเริ่มต้น');
      return;
    }

    // ✅ ถ้ามี clients ที่มี active program ให้เตือน
    const clientsWithActivePrograms = getClientsWithActivePrograms();
    if (clientsWithActivePrograms.length > 0) {
      setShowConfirmDialog(true);
      return;
    }

    // ถ้าไม่มี active program ให้ assign เลย
    performAssignment();
  };

  const performAssignment = () => {
    if (!selectedProgramId) return;

    try {
      const template = getProgramTemplateById(selectedProgramId);
      if (!template) {
        toast.error('ไม่พบเทมเพลตโปรแกรม');
        return;
      }

      let totalSessionsCreated = 0;

      selectedClients.forEach((clientId) => {
        // ✅ ลบโปรแกรมเก่าถ้ามี
        const existingInstance = programInstances.find(
          instance => instance.clientId === clientId && instance.status === 'active'
        );
        if (existingInstance) {
          const oldSessions = sessions.filter(s => s.programInstanceId === existingInstance.id);
          oldSessions.forEach(session => {
            deleteSession(session.id);
          });
          deleteProgramInstance(existingInstance.id);
        }

        // ✅ สร้าง ProgramInstance ใหม่
        const newInstanceId = createProgramInstance({
          templateId: selectedProgramId,
          clientId: clientId,
          trainerId: 'trainer-1',
          startDate: startDate,
          status: 'active',
          currentWeek: 1,
          currentDay: 1,
          completedWeeks: [],
          completedDays: [],
        });

        console.log('✅ [AssignProgram] Created ProgramInstance:', newInstanceId, 'for client:', clientId);
        
        // ✅ Auto-generate WorkoutSessions
        let currentDate = new Date(startDate);

        if (!template.weeks || !Array.isArray(template.weeks)) {
          console.error('Template weeks is undefined or not an array:', template);
          toast.error('โครงสร้างโปรแกรมไม่ถูกต้อง');
          return;
        }

        template.weeks.forEach((week) => {
          if (!week.days || !Array.isArray(week.days)) {
            console.error('Week days is undefined or not an array:', week);
            return;
          }

          week.days.forEach((day) => {
            let exercisesToAdd: any[] = [];

            if (day.isRestDay) {
              exercisesToAdd = [];
            } else if (day.sections && Array.isArray(day.sections)) {
              day.sections.forEach(section => {
                if (section.exercises && Array.isArray(section.exercises)) {
                  exercisesToAdd.push(...section.exercises);
                }
              });
            } else if (day.exercises && Array.isArray(day.exercises)) {
              exercisesToAdd = day.exercises;
            }

            addSession({
              clientId: clientId,
              date: currentDate.toISOString().split('T')[0],
              time: defaultStartTime,
              endTime: defaultEndTime,
              programInstanceId: newInstanceId,
              weekNumber: week.weekNumber,
              dayNumber: day.dayNumber,
              exercises: exercisesToAdd.map(ex => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets || 3,
                reps: ex.reps || '10',
                weight: ex.weight || '0',
                rest: ex.rest || 60,
                notes: ex.notes || '',
                actualSets: [],
              })),
              notes: day.isRestDay ? 'วันพัก' : '',
              status: 'scheduled',
            });

            totalSessionsCreated++;
            currentDate.setDate(currentDate.getDate() + 1);
          });
        });
      });

      toast.success(
        `มอบหมายโปรแกรม \"${template.name}\" ให้กับ ${selectedClients.length} คน และสร้าง ${totalSessionsCreated} นัดหมายเรียบร้อย`
      );

      setShowConfirmDialog(false);
      setSelectedClients([]);
      setSearchTerm('');
      onClose();
    } catch (err) {
      console.error('Failed to assign program', err);
      toast.error('มอบหมายโปรแกรมไม่สำเร็จ');
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedClients([]);
    onClose();
  };

  const clientsWithActivePrograms = getClientsWithActivePrograms();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby="assign-program-modal-description"
        >
          <DialogHeader>
            <DialogTitle>มอบหมายโปรแกรมให้ลูกค้า</DialogTitle>
            <DialogDescription id="assign-program-modal-description">
              {isClientProfileMode ? (
                <>เลือกโปรแกรมที่ต้องการมอบหมายให้ &ldquo;{selectedClient?.name || 'ลูกเทรน'}&rdquo;</>
              ) : (
                <>เลือกลูกเทรนที่ต้องการมอบหมายโปรแกรม &ldquo;{programName || 'โปรแกรม'}&rdquo;</>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* ✅ แสดงข้อมูลที่ pre-selected */}
          {isClientProfileMode && selectedClient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#002140]" />
              <p className="text-sm text-[#002140]">
                มอบหมายให้ <strong>{selectedClient.name}</strong>
              </p>
            </div>
          )}

          {isProgramBuilderMode && programName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#002140]" />
              <p className="text-sm text-[#002140]">
                โปรแกรม: <strong>{programName}</strong>
              </p>
            </div>
          )}

          {/* ✅ ค้นหา (โปรแกรมหรือลูกเทรน) */}
          <div className="space-y-2">
            <Label htmlFor="search">
              {isClientProfileMode ? 'ค้นหาโปรแกรม' : 'ค้นหาลูกเทรน'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={isClientProfileMode ? 'ค้นหาด้วยชื่อหรือรายละเอียด...' : 'ค้นหาด้วยชื่อหรืออีเมล...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* ✅ รายการโปรแกรม (Client Profile Mode) */}
          {isClientProfileMode && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              <div className="divide-y">
                {filteredPrograms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Dumbbell className="h-12 w-12 text-muted-foreground/20 mb-2" />
                    <p className="text-muted-foreground">ไม่พบโปรแกรม</p>
                  </div>
                ) : (
                  filteredPrograms.map((program) => {
                    const isSelected = selectedProgramId === program.id;
                    return (
                      <div
                        key={program.id}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                          isSelected ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedProgramId(program.id)}
                      >
                        <div
                          className={`flex items-center justify-center h-5 w-5 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        <Dumbbell className="h-8 w-8 text-[#FF6B35]" />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{program.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {program.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {program.duration} สัปดาห์
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ✅ รายการลูกเทรน (Program Builder Mode) */}
          {isProgramBuilderMode && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              <div className="divide-y">
                {filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-2" />
                    <p className="text-muted-foreground">ไม่พบลูกเทรน</p>
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClients.includes(client.id);
                    return (
                      <div
                        key={client.id}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                          isSelected ? 'bg-accent' : ''
                        }`}
                        onClick={() => toggleClient(client.id)}
                      >
                        <div
                          className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-all ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{client.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {client.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              client.status === 'active'
                                ? 'default'
                                : client.status === 'paused'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {client.status === 'active'
                              ? 'กำลังเทรน'
                              : client.status === 'paused'
                              ? 'พักชั่วคราว'
                              : 'ไม่ได้ใช้งาน'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ✅ Selected Count (Program Builder Mode) */}
          {isProgramBuilderMode && selectedClients.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <Users className="h-4 w-4" />
              <span>เลือกแล้ว {selectedClients.length} คน</span>
            </div>
          )}

          {/* ✅ วันเริ่มต้นโปรแกรม */}
          <div className="space-y-2">
            <Label htmlFor="start-date">วันเริ่มต้นโปรแกรม</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* ✅ เวลาเริ่มต้น-สิ้นสุด */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">เวลาเริ่มต้น</Label>
              <Input
                id="start-time"
                type="time"
                value={defaultStartTime}
                onChange={(e) => setDefaultStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">เวลาสิ้นสุด</Label>
              <Input
                id="end-time"
                type="time"
                value={defaultEndTime}
                onChange={(e) => setDefaultEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ Program Details Preview */}
          {programDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#002140]">
                <Info className="h-4 w-4" />
                <span className="font-medium">รายละเอียดโปรแกรม</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ระยะเวลา</p>
                  <p className="font-medium">{programDetails.totalWeeks} สัปดาห์ ({programDetails.totalDays} วัน)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">วันสิ้นสุดโปรแกรม</p>
                  <p className="font-medium">{programDetails.endDateFormatted}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">เวลาการฝึกแต่ละครั้ง</p>
                  <p className="font-medium">{defaultStartTime} - {defaultEndTime} น.</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Reminder Settings */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#FF6B35]" />
                <Label htmlFor="reminder-toggle" className="cursor-pointer">การแจ้งเตือน</Label>
              </div>
              <Switch
                id="reminder-toggle"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-3 pl-6 border-l-2 border-orange-200">
                <Label>แจ้งเตือนล่วงหน้า</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="999"
                    value={reminderValue}
                    onChange={(e) => setReminderValue(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Select 
                    value={reminderType} 
                    onValueChange={(value: 'minutes' | 'hours' | 'days') => setReminderType(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">นาที</SelectItem>
                      <SelectItem value="hours">ชั่วโมง</SelectItem>
                      <SelectItem value="days">วัน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  ระบบจะแจ้งเตือนลูกเทรนก่อนนัดหมาย {reminderValue} {
                    reminderType === 'minutes' ? 'นาที' : 
                    reminderType === 'hours' ? 'ชั่วโมง' : 'วัน'
                  }
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedProgramId || selectedClients.length === 0}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              มอบหมายโปรแกรม ({selectedClients.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent aria-describedby="alert-dialog-description">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>คำเตือน: การเปลี่ยนโปรแกรม</AlertDialogTitle>
            </div>
            <AlertDialogDescription id="alert-dialog-description" className="space-y-4">
              <p>ลูกเทรนบางคนกำลังทำโปรแกรมอยู่ การมอบหมายโปรแกรมใหม่จะ<strong className="text-red-600">ลบโปรแกรมเก่าและนัดหมายที่เหลือทั้งหมด</strong></p>
              
              <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                {clientsWithActivePrograms.map((item: any) => (
                  <div key={item.client.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <p className="font-medium">{item.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      โปรแกรมปัจจุบัน: <strong>{item.currentProgramName}</strong>
                    </p>
                    <p className="text-sm text-red-600">
                      นัดหมายที่เหลือ: <strong>{item.remainingSessions} นัด</strong>
                    </p>
                  </div>
                ))}
              </div>

              <p className="font-medium">ต้องการดำเนินการต่อหรือไม่?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={performAssignment}
              className="bg-orange-600 hover:bg-orange-700"
            >
              ยืนยันและมอบหมายโปรแกรมใหม่
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
