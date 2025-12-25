import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Play,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Client } from "../ClientProfilePage";

interface ClientScheduleProps {
  client: Client;
}

// Interface สำหรับข้อมูล Session (จาก API)
interface Session {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function ClientSchedule({ client }: ClientScheduleProps) {
  const navigate = useNavigate();
  // State เก็บข้อมูลจริง
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Reschedule State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] =
    useState<Session | null>(null);
  const [newDate, setNewDate] = useState("");

  // 1. Fetch Sessions จาก Backend
  const fetchSessions = async () => {
    if (!client.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/clients/${client.id}/sessions`);
      setSessions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
      toast.error("โหลดตารางเวลาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [client.id]);

  // Derived State
  const upcomingSessions = sessions
    .filter((s) => s.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  const pastSessions = sessions.filter((s) => s.status === "completed");

  // Logic for "Sessions List" (History + All)
  let filteredSessions = sessions;

  if (statusFilter !== "all") {
    filteredSessions = filteredSessions.filter(
      (s) => s.status === statusFilter
    );
  }

  filteredSessions.sort((a, b) => {
    const dateA = new Date(a.start_time).getTime();
    const dateB = new Date(b.start_time).getTime();

    switch (sortBy) {
      case "date-desc":
        return dateB - dateA;
      case "date-asc":
        return dateA - dateB;
      default:
        return 0;
    }
  });

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      toast.success("ลบนัดหมายเรียบร้อยแล้ว");
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session", err);
      toast.error("ลบนัดหมายไม่สำเร็จ");
    }
  };

  const handleConfirmReschedule = async () => {
    if (!sessionToReschedule || !newDate) return;

    try {
      await api.patch(`/sessions/${sessionToReschedule.id}`, {
        start_time: new Date(newDate).toISOString(),
        end_time: new Date(
          new Date(newDate).getTime() + 60 * 60 * 1000
        ).toISOString(),
      });

      toast.success("เลื่อนนัดหมายเรียบร้อยแล้ว");
      setIsRescheduleOpen(false);
      fetchSessions(); // Reload
    } catch (err) {
      console.error("Failed to reschedule", err);
      toast.error("ไม่สามารถเลื่อนนัดหมายได้");
    }
  };

  const handleViewSession = (sessionId: number) => {
    navigate(`/trainer/sessions/${sessionId}/log`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "outline" | "destructive";
      }
    > = {
      scheduled: { label: "กำหนดไว้", variant: "default" },
      "in-progress": { label: "กำลังดำเนินการ", variant: "secondary" },
      completed: { label: "เสร็จสิ้น", variant: "outline" },
      cancelled: { label: "ยกเลิก", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดตารางเวลา...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              นัดที่กำหนดไว้
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">
              {upcomingSessions.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">นัดที่จะมาถึง</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              เซสชันที่เสร็จ
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">
              {pastSessions.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">เซสชันทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              อัตราการเข้าร่วม
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">95%</div>
            <p className="text-xs text-slate-400 mt-1">จากนัดทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-slate-100 my-8" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 text-navy-900 font-medium">
          <Filter className="h-4 w-4 text-slate-500" />
          <span>ตัวกรองประวัติการฝึก</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">สถานะทั้งหมด</SelectItem>
              <SelectItem value="scheduled">กำหนดไว้</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              <SelectItem value="cancelled">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">วันที่ใหม่ - เก่า</SelectItem>
              <SelectItem value="date-asc">วันที่เก่า - ใหม่</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions List (History) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">
            ประวัติการฝึกทั้งหมด
          </h3>

          <span className="text-sm text-slate-500">
            ทั้งหมด {filteredSessions.length} รายการ
          </span>

          <Button
            onClick={() =>
              navigate(`/trainer/sessions/new?clientId=${client.id}`)
            }
            className="bg-navy-900 hover:bg-navy-800 text-white shadow-md rounded-full px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Workout Session
          </Button>
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="border-dashed border-slate-200 shadow-none bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-navy-900">ไม่พบเซสชัน</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                ลองปรับตัวกรองหรือสร้างเซสชันใหม่ในหน้าตารางนัดหมาย
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredSessions.map((session) => {
              const sessionDate = new Date(session.start_time);
              const statusBadge = getStatusBadge(session.status);

              // คำนวณระยะเวลา (ถ้ามี end_time)
              const endDate = new Date(session.end_time);
              const durationMinutes = Math.round(
                (endDate.getTime() - sessionDate.getTime()) / 60000
              );

              return (
                <div
                  key={session.id}
                  className="group bg-white rounded-xl border border-slate-100 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-md hover:border-orange-100 transition-all duration-200"
                >
                  {/* Date Box */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg border border-slate-100 overflow-hidden flex flex-col shadow-sm">
                    <div className="h-6 bg-navy-900 text-white text-[10px] font-bold uppercase flex items-center justify-center tracking-wider">
                      {sessionDate.toLocaleDateString("th-TH", {
                        month: "short",
                      })}
                    </div>
                    <div className="flex-1 bg-white flex items-center justify-center text-xl font-bold text-navy-900">
                      {sessionDate.getDate()}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-navy-900 truncate group-hover:text-orange-600 transition-colors">
                        {session.title || "Workout Session"}
                      </h4>
                      <Badge
                        variant={statusBadge.variant}
                        className={
                          session.status === "completed"
                            ? "text-[10px] h-5 px-2 bg-green-500 hover:bg-green-600 border-transparent text-white gap-1"
                            : "text-[10px] h-5 px-2"
                        }
                      >
                        {session.status === "completed" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {sessionDate.toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {durationMinutes > 0 && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          <div>{durationMinutes} นาที</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center ml-auto">
                    {/* Reschedule Start */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSessionToReschedule(session);
                        setIsRescheduleOpen(true);
                      }}
                      className="text-slate-400 hover:text-navy-900 hover:bg-slate-50"
                      title="เลื่อนนัด"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    {/* Reschedule End */}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการลบเซสชันนี้?
                            การดำเนินการนี้ไม่สามารถยกเลิกได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSession(session.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewSession(session.id)}
                      className="text-slate-400 hover:text-navy-900 hover:bg-slate-50 text-xs"
                    >
                      {session.status === "completed" ? (
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                          <Play className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เลื่อนนัดหมาย</DialogTitle>
            <DialogDescription>
              เลือกวันและเวลาใหม่สำหรับนัดหมายนี้
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>วันที่และเวลาใหม่</Label>
              <Input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmReschedule}
              disabled={!newDate}
              className="bg-navy-900 text-white hover:bg-navy-800"
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
