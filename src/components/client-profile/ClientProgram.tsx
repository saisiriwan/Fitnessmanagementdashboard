import { useState } from 'react';
import { Plus, Dumbbell, Calendar, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Client } from '../page/AppContext';
import { useApp } from '../page/AppContext';
import { toast } from 'sonner';

interface ClientProgramProps {
  client: Client;
}

export default function ClientProgram({ client }: ClientProgramProps) {
  const { programs, assignProgram, updateClient } = useApp();
  const [showProgramSelector, setShowProgramSelector] = useState(false);

  const currentProgram = client.currentProgram ? programs.find(p => p.id === client.currentProgram) : null;
  const availablePrograms = programs.filter(p => p.id !== client.currentProgram);

  const handleAssignProgram = (programId: string) => {
    assignProgram(client.id, programId);
    toast.success('มอบหมายโปรแกรมเรียบร้อยแล้ว');
    setShowProgramSelector(false);
  };

  const handleRemoveProgram = () => {
    updateClient(client.id, { currentProgram: undefined });
    toast.success('ยกเลิกโปรแกรมเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      {currentProgram ? (
        <>
          {/* Current Program Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {currentProgram.name}
                  </CardTitle>
                  <CardDescription>
                    {currentProgram.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showProgramSelector} onOpenChange={setShowProgramSelector}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        เปลี่ยนโปรแกรม
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>เลือกโปรแกรมใหม่</DialogTitle>
                        <DialogDescription>
                          เลือกโปรแกรมที่ต้องการมอบหมายให้ {client.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {availablePrograms.map(program => (
                          <Card key={program.id} className="cursor-pointer hover:bg-gray-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{program.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {program.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">ระยะเวลา</p>
                                    <p className="font-medium">{program.duration} สัปดาห์</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">ความถี่</p>
                                    <p className="font-medium">{program.daysPerWeek} วัน/สัปดาห์</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => handleAssignProgram(program.id)}
                                >
                                  เลือกโปรแกรมนี้
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={handleRemoveProgram}>
                    ยกเลิกโปรแกรม
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ระยะเวลา</p>
                  <p className="font-medium">{currentProgram.duration} สัปดาห์</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ความถี่</p>
                  <p className="font-medium">{currentProgram.daysPerWeek} วัน/สัปดาห์</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ลูกเทรนทั้งหมด</p>
                  <p className="font-medium">{currentProgram.assignedClients.length} คน</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Progress */}
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
                  <p className="text-sm text-gray-600">สัปดาห์ 3 จาก {currentProgram.duration}</p>
                </div>
                <Progress value={35} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">เซสชันที่เสร็จสิ้น</p>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-gray-500">จาก 24 เซสชัน</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">อัตราการเข้าร่วม</p>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-gray-500">สัปดาห์นี้</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Structure */}
          <Card>
            <CardHeader>
              <CardTitle>โครงสร้างโปรแกรม</CardTitle>
              <CardDescription>
                รายละเอียดการออกแบบโปรแกรม
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentProgram.weeks.slice(0, 2).map(week => (
                  <div key={week.weekNumber} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      สัปดาห์ที่ {week.weekNumber}
                      {week.weekNumber <= 3 && (
                        <Badge variant="secondary" className="text-xs">เสร็จแล้ว</Badge>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {week.days.map(day => (
                        <div key={day.dayNumber} className="border rounded p-3">
                          <div className="font-medium text-sm mb-2">วันที่ {day.dayNumber}: {day.name}</div>
                          <div className="space-y-1">
                            {day.exercises.slice(0, 3).map((exercise, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Dumbbell className="h-3 w-3" />
                                  Exercise {idx + 1}
                                </div>
                                <div className="ml-4">
                                  {exercise.sets}x{exercise.reps} @ {exercise.weight}
                                </div>
                              </div>
                            ))}
                            {day.exercises.length > 3 && (
                              <div className="text-xs text-gray-500 ml-4">
                                และอีก {day.exercises.length - 3} ท่า...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {currentProgram.weeks.length > 2 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      และอีก {currentProgram.weeks.length - 2} สัปดาห์...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No Program Assigned */
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีโปรแกรม</h3>
            <p className="text-gray-500 mb-6">
              {client.name} ยังไม่ได้รับมอบหมายโปรแกรมการออกกำลังกาย
            </p>
            
            <Dialog open={showProgramSelector} onOpenChange={setShowProgramSelector}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  มอบหมายโปรแกรม
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เลือกโปรแกรม</DialogTitle>
                  <DialogDescription>
                    เลือกโปรแกรมที่ต้องการมอบหมายให้ {client.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {programs.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 mb-4">ยังไม่มีโปรแกรม</p>
                      <Button variant="outline">
                        สร้างโปรแกรมใหม่
                      </Button>
                    </div>
                  ) : (
                    programs.map(program => (
                      <Card key={program.id} className="cursor-pointer hover:bg-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {program.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">ระยะเวลา</p>
                                <p className="font-medium">{program.duration} สัปดาห์</p>
                              </div>
                              <div>
                                <p className="text-gray-500">ความถี่</p>
                                <p className="font-medium">{program.daysPerWeek} วัน/สัปดาห์</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {program.assignedClients.length} คนกำลังใช้
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAssignProgram(program.id)}
                            >
                              เลือกโปรแกรมนี้
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}