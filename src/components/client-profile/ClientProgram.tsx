import React, { useState } from 'react';
import { Plus, Dumbbell, Calendar, Users, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { toast } from 'sonner@2.0.3';
import AssignProgramModal from '../AssignProgramModal';

interface ClientProgramProps {
  client: Client;
}

export default function ClientProgram({ client }: ClientProgramProps) {
  const { 
    programTemplates, // ✅ ใช้ programTemplates แทน programs
    programInstances, // ✅ ใช้ programInstances
    getProgramTemplateById,
    sessions,
    deleteProgramInstance, // ✅ สำหรับลบ instance
    deleteSession, // ✅ สำหรับลบ sessions ที่เกี่ยวข้อง
  } = useApp();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // ✅ DEBUG: แสดงข้อมูล programInstances
  console.log('🔍 [ClientProgram] All programInstances:', programInstances);
  console.log('🔍 [ClientProgram] Current client:', client);

  // ✅ หา Active ProgramInstance ของ client นี้
  const activeProgramInstance = programInstances.find(
    instance => instance.clientId === client.id && instance.status === 'active'
  );

  console.log('🔍 [ClientProgram] Active instance for client:', activeProgramInstance);

  // ✅ ดึง Template ของโปรแกรม
  const currentProgramTemplate = activeProgramInstance
    ? getProgramTemplateById(activeProgramInstance.templateId)
    : null;

  // ✅ นับจำนวน sessions ที่เสร็จแล้ว vs ทั้งหมด
  const programSessions = sessions.filter(s => 
    s.programInstanceId === activeProgramInstance?.id
  );
  const completedSessions = programSessions.filter(s => s.status === 'completed');
  const scheduledSessions = programSessions.filter(s => s.status === 'scheduled');
  const totalSessions = programSessions.length;
  const progressPercentage = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;

  // ✅ Handler: มอบหมายโปรแกรมใหม่
  const handleOpenAssignModal = (programId: string) => {
    setSelectedProgramId(programId);
    setShowAssignModal(true);
  };

  // ✅ Handler: ลบโปรแกรมและ Sessions ที่เกี่ยวข้อง
  const handleRemoveProgram = () => {
    if (!activeProgramInstance) return;

    // ลบ Sessions ที่เกี่ยวข้องทั้งหมด
    programSessions.forEach(session => {
      deleteSession(session.id);
    });

    // ลบ ProgramInstance
    deleteProgramInstance(activeProgramInstance.id);

    toast.success(`ยกเลิกโปรแกรมและลบ ${programSessions.length} นัดหมายเรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6">
      {currentProgramTemplate && activeProgramInstance ? (
        <>
          {/* ✅ Current Program Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-5 w-5" />
                    {currentProgramTemplate.name}
                  </CardTitle>
                  <CardDescription className="mb-3">
                    {currentProgramTemplate.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {currentProgramTemplate.duration} สัปดาห์
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {currentProgramTemplate.daysPerWeek} วัน/สัปดาห์
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      สัปดาห์ {activeProgramInstance.currentWeek}, วันที่ {activeProgramInstance.currentDay}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* ✅ Warning Dialog เมื่อต้องการเปลี่ยนโปรแกรม */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        เปลี่ยนโปรแกรม
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent aria-describedby="change-program-description">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-orange-600">
                          <AlertTriangle className="h-5 w-5" />
                          <AlertDialogTitle>คำเตือน: การเปลี่ยนโปรแกรม</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription id="change-program-description" asChild>
                          <div>
                            <p>{client.name} กำลังทำโปรแกรม "{currentProgramTemplate.name}" อยู่</p>
                            <div className="mt-4 space-y-2 text-sm">
                              <p>• นัดหมายที่เหลือ: <strong>{scheduledSessions.length} นัด</strong></p>
                              <p>• นัดหมายทั้งหมดจะถูก<strong className="text-red-600">ลบทิ้ง</strong></p>
                            </div>
                            <p className="mt-4">ต้องการดำเนินการต่อหรือไม่?</p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            handleRemoveProgram();
                            setShowAssignModal(true);
                          }}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          เปลี่ยนโปรแกรม
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* ✅ ยกเลิกโปรแกรม */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        ยกเลิกโปรแกรม
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent aria-describedby="cancel-program-description">
                      <AlertDialogHeader>
                        <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                        <AlertDialogDescription id="cancel-program-description" asChild>
                          <div>
                            <p>คุณต้องการยกเลิกโปรแกรม "{currentProgramTemplate.name}" ของ {client.name} หรือไม่?</p>
                            <p className="mt-2 text-red-600">นัดหมายทั้งหมด ({programSessions.length} นัด) จะถูกลบทิ้ง</p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveProgram}>ยืนยัน</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* ✅ Program Progress */}
          <Card>
            <CardHeader>
              <CardTitle>ความก้าวหน้าโปรแกรม</CardTitle>
              <CardDescription>
                ติดตามความก้าวหน้าตามโปรแกรมที่กำหนด
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">ความก้าวหน้าโดยรวม</p>
                  <p className="text-sm text-gray-600">
                    {completedSessions.length} จาก {totalSessions} วัน
                  </p>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">วันที่เสร็จสิ้น</p>
                  <div className="text-2xl font-bold">{completedSessions.length}</div>
                  <p className="text-xs text-gray-500">จาก {totalSessions} วัน</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">วันที่เหลือ</p>
                  <div className="text-2xl font-bold">{scheduledSessions.length}</div>
                  <p className="text-xs text-gray-500">นัดหมายที่กำลังจะมาถึง</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">อัตราความสำเร็จ</p>
                  <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                  <p className="text-xs text-gray-500">ของโปรแกรม</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Program Structure */}
          <Card>
            <CardHeader>
              <CardTitle>โครงสร้างโปรแกรม</CardTitle>
              <CardDescription>
                รายละเอียดการออกแบบโปรแกรม ({currentProgramTemplate.weeks.length} สัปดาห์)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentProgramTemplate.weeks.slice(0, 2).map(week => (
                  <div key={week.weekNumber} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      สัปดาห์ที่ {week.weekNumber}
                      {week.weekNumber < activeProgramInstance.currentWeek && (
                        <Badge variant="secondary" className="text-xs">เสร็จแล้ว</Badge>
                      )}
                      {week.weekNumber === activeProgramInstance.currentWeek && (
                        <Badge className="text-xs bg-[#FF6B35]">กำลังทำ</Badge>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {week.days.map(day => (
                        <div key={day.dayNumber} className="border rounded p-3">
                          <div className="font-medium text-sm mb-2">
                            Day {day.dayNumber}: {day.name}
                          </div>
                          <div className="space-y-1">
                            {day.exercises && day.exercises.length > 0 ? (
                              <div className="text-xs text-gray-600">
                                {day.exercises.length} ท่าฝึก
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                วันพัก
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {currentProgramTemplate.weeks.length > 2 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      และอีก {currentProgramTemplate.weeks.length - 2} สัปดาห์...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* ✅ No Program Assigned */
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีโปรแกรม</h3>
            <p className="text-gray-500 mb-6">
              {client.name} ยังไม่ได้รับมอบหมายโปรแกรมการออกกำลังกาย
            </p>
            
            <Button 
              className="flex items-center gap-2 mx-auto bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              onClick={() => setShowAssignModal(true)}
            >
              <Plus className="h-4 w-4" />
              มอบหมายโปรแกรม
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ✅ Assign Program Modal */}
      <AssignProgramModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedProgramId(null);
        }}
        preSelectedClientId={client.id}
      />
    </div>
  );
}