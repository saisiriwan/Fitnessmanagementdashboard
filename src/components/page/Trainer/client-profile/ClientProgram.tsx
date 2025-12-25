import React, { useState, useEffect } from "react";
import {
  Plus,
  Dumbbell,
  Calendar,
  Users,
  Clock,
  BookOpen,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

import type { Client } from "../ClientProfilePage";

interface ClientProgramProps {
  client: Client;
}

interface Program {
  id: number;
  name: string;
  description?: string;
  duration_weeks: number;
  days_per_week: number;
  client_id?: number;
  is_template: boolean;
  assignedClients?: any[]; // Mock compatibility if needed
  weeks?: ProgramWeek[]; // Full details
}

interface ProgramWeek {
  weekNumber: number;
  days: ProgramDay[];
}

interface ProgramDay {
  dayNumber: number;
  name: string;
  exercises: ProgramExercise[];
}

interface ProgramExercise {
  name?: string; // Derived?
  sets: number;
  reps: string;
  weight: string;
}

export default function ClientProgram({ client }: ClientProgramProps) {
  const navigate = useNavigate();
  const [showProgramSelector, setShowProgramSelector] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  // Current program tailored for this client
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  // Full details of current program
  const [programDetails, setProgramDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all programs (templates and assigned)
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/programs");
      const allPrograms: Program[] = res.data || [];

      setPrograms(allPrograms);

      // Find program assigned to THIS client
      // Assuming 1 client = 1 assigned program logic for now
      const assigned = allPrograms.find((p) => p.client_id === client.id);

      if (assigned) {
        setCurrentProgram(assigned);
        // Fetch details (Dimensions/Exercises)
        fetchProgramDetails(assigned.id);
      } else {
        setCurrentProgram(null);
        setProgramDetails(null);
      }
    } catch (err) {
      console.error("Failed to fetch programs", err);
      toast.error("โหลดข้อมูลโปรแกรมไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramDetails = async (programId: number) => {
    try {
      const res = await api.get(`/programs/${programId}`);
      // Response structure: { program: ..., schedule: [Days...] }
      setProgramDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (client.id) {
      fetchPrograms();
    }
  }, [client.id]);

  const availablePrograms = programs.filter((p) => p.is_template);

  const handleAssignProgram = async (programId: number) => {
    try {
      // API call to clone program for client
      await api.post(`/programs/${programId}/assign`, { client_id: client.id });
      toast.success("มอบหมายโปรแกรมเรียบร้อยแล้ว");
      setShowProgramSelector(false);
      fetchPrograms(); // Refresh to see the new assigned program
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการมอบหมายโปรแกรม");
    }
  };

  const handleRemoveProgram = async () => {
    if (!currentProgram) return;
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยกเลิกโปรแกรมนี้? การดำเนินการนี้จะลบข้อมูลโปรแกรมของลูกค้า"
      )
    )
      return;

    try {
      await api.delete(`/programs/${currentProgram.id}`);
      toast.success("ยกเลิกโปรแกรมเรียบร้อยแล้ว");
      setCurrentProgram(null);
      setProgramDetails(null);
      // fetchPrograms(); // Optional, local state cleared is enough or refresh
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบโปรแกรม");
    }
  };

  // Helper to structure 'schedule' array from backend into 'weeks'
  const getStructuredWeeks = () => {
    if (!programDetails?.schedule) return [];

    const days: any[] = programDetails.schedule;
    // Group by week
    const weeks: Record<number, any[]> = {};
    days.forEach((d) => {
      if (!weeks[d.week_number]) weeks[d.week_number] = [];
      weeks[d.week_number].push(d);
    });

    return Object.entries(weeks).map(([weekNum, weekDays]) => ({
      weekNumber: parseInt(weekNum),
      days: weekDays.map((d: any) => ({
        dayNumber: d.day_number,
        name: d.name,
        // Flatten exercises from sections
        exercises: d.Sections
          ? d.Sections.flatMap((s: any) => s.Exercises || [])
          : [],
      })),
    }));
  };

  const weeks = getStructuredWeeks();

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
                  <Dialog
                    open={showProgramSelector}
                    onOpenChange={setShowProgramSelector}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        เปลี่ยนโปรแกรม
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>เลือกโปรแกรมใหม่</DialogTitle>
                        <DialogDescription>
                          เลือกโปรแกรมที่ต้องการมอบหมายให้ {client.name}{" "}
                          (โปรแกรมเดิมจะถูกลบ)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {availablePrograms.map((program) => (
                          <Card
                            key={program.id}
                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">
                                {program.name}
                              </CardTitle>
                              <CardDescription className="text-sm line-clamp-2">
                                {program.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">ระยะเวลา</p>
                                    <p className="font-medium">
                                      {program.duration_weeks} สัปดาห์
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">ความถี่</p>
                                    <p className="font-medium">
                                      {program.days_per_week} วัน/สัปดาห์
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full bg-navy-900 hover:bg-navy-800"
                                  onClick={async () => {
                                    // Remove old first? Or let backend handle?
                                    // Safest to remove old first or have backend handle replacement.
                                    // For now, let's just assign new.
                                    if (currentProgram) {
                                      await api.delete(
                                        `/programs/${currentProgram.id}`
                                      );
                                    }
                                    handleAssignProgram(program.id);
                                  }}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveProgram}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    ยกเลิกโปรแกรม
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ระยะเวลา</p>
                  <p className="font-medium">
                    {currentProgram.duration_weeks} สัปดาห์
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ความถี่</p>
                  <p className="font-medium">
                    {currentProgram.days_per_week} วัน/สัปดาห์
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานะ</p>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    กำลังใช้งาน
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Progress (Mocked for now as we don't have session linkage logic fully fleshed out to program days yet) */}
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
                  <p className="text-sm text-gray-600">--</p>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    การฝึกที่เสร็จสิ้น
                  </p>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-500">จากทั้งหมด</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">อัตราการเข้าร่วม</p>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-gray-500">สัปดาห์นี้</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Structure */}
          <Card>
            <CardHeader>
              <CardTitle>โครงสร้างโปรแกรม</CardTitle>
              <CardDescription>รายละเอียดการออกแบบโปรแกรม</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeks.length > 0 ? (
                  weeks.slice(0, 2).map((week: any) => (
                    <div
                      key={week.weekNumber}
                      className="border rounded-lg p-4"
                    >
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        สัปดาห์ที่ {week.weekNumber}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {week.days.map((day: any) => (
                          <div
                            key={day.dayNumber}
                            className="border rounded p-3 bg-slate-50/50"
                          >
                            <div className="font-medium text-sm mb-2">
                              วันที่ {day.dayNumber}: {day.name}
                            </div>
                            <div className="space-y-1">
                              {day.exercises && day.exercises.length > 0 ? (
                                day.exercises
                                  .slice(0, 3)
                                  .map((exercise: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-gray-600"
                                    >
                                      <div className="flex items-center gap-1">
                                        <Dumbbell className="h-3 w-3" />
                                        Exercise {idx + 1}
                                      </div>
                                      <div className="ml-4 text-slate-500">
                                        {exercise.sets}x{exercise.reps}{" "}
                                        {exercise.weight &&
                                          `@ ${exercise.weight}`}
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <div className="text-xs text-muted-foreground italic">
                                  พัก / ไม่มีท่าฝึก
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    กำลังโหลดรายละเอียด...
                  </div>
                )}

                {weeks.length > 2 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      และอีก {weeks.length - 2} สัปดาห์...
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

            <Dialog
              open={showProgramSelector}
              onOpenChange={setShowProgramSelector}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-navy-900 text-white hover:bg-navy-800">
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
                  {availablePrograms.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 mb-4">
                        ยังไม่มีแม่แบบโปรแกรม
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/trainer/programs")}
                      >
                        ไปที่ตัวจัดการโปรแกรมเพื่อสร้างใหม่
                      </Button>
                    </div>
                  ) : (
                    availablePrograms.map((program) => (
                      <Card
                        key={program.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {program.name}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {program.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">ระยะเวลา</p>
                                <p className="font-medium">
                                  {program.duration_weeks} สัปดาห์
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">ความถี่</p>
                                <p className="font-medium">
                                  {program.days_per_week} วัน/สัปดาห์
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full bg-navy-900 hover:bg-navy-800"
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
