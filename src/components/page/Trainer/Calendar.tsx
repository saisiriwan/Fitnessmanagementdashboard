import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  StickyNote,
  Coffee,
  Users,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

// Session color mapping based on client goal or type
const SESSION_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-cyan-500",
];

interface CalendarNote {
  id: string;
  date: string;
  type: "note" | "rest-day";
  title: string;
  content?: string;
}

interface Session {
  id: string;
  clientId: string;
  date: string;
  status: string;
  notes?: string;
  exercises?: any[];
}

interface Client {
  id: string;
  name: string;
  goal: string;
  status: string;
}

interface Assignment {
  id: string;
  clientId: string;
  programId: string;
  programName: string;
  programDay: any; // Mocked structure for now as API might differ
}

export default function Calendar() {
  const navigate = useNavigate();
  // Data State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dialog State
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [showDayDetailsDialog, setShowDayDetailsDialog] = useState(false);
  const [dayDetailsDate, setDayDetailsDate] = useState<Date | null>(null);

  // Form State
  const [newSession, setNewSession] = useState({
    clientId: "",
    date: "",
    time: "10:00",
    endTime: "11:00",
  });

  useEffect(() => {
    fetchData();
  }, [currentDate]); // Re-fetch when month changes (optimizable)

  const fetchData = async () => {
    try {
      setLoading(true);
      // Calculate date range for current view (Month)
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0]; // Include prev month buffer
      const endDate = new Date(year, month + 2, 0).toISOString().split("T")[0]; // Include next month buffer

      const [clientsRes, sessionsRes, notesRes] = await Promise.all([
        api.get("/clients"),
        api.get("/schedules"), // Backend returns all, or filter by range if supported
        api.get(`/calendar/notes?startDate=${startDate}&endDate=${endDate}`),
      ]);

      const mappedClients = (clientsRes.data || []).map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        goal: c.goal || "General",
        status: c.status || "active",
      }));
      setClients(mappedClients);

      const mappedSessions = (sessionsRes.data || []).map((s: any) => ({
        id: s.id.toString(),
        clientId: s.client_id.toString(),
        date: s.start_time,
        status: s.status,
        notes: s.summary, // Assuming summary maps to notes
        exercises: s.exercises || [], // Mocking structure if backend doesn't return full details
      }));
      setSessions(mappedSessions);

      const mappedNotes = (notesRes.data || []).map((n: any) => ({
        id: n.id.toString(),
        date: n.date, // API should return ISO string
        type: n.type,
        title: n.title,
        content: n.content,
      }));
      setCalendarNotes(mappedNotes);
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const getClientById = (id: string) => clients.find((c) => c.id === id);

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates: Date[] = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      dates.push(new Date(year, month, -i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }

    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    return dates;
  };
  const monthDates = getMonthDates(currentDate);

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return sessions.filter((session) => session.date.startsWith(dateStr));
  };

  const getNotesForDate = (dateStr: string) => {
    // Need to handle timezone carefully. Backend likely returns UTC/ISO.
    // Comparing strictly by YYYY-MM-DD string part if properly stored.
    return calendarNotes.filter((n) => n.date.startsWith(dateStr));
  };

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedDateSessions = sessions
    .filter((s) => s.date.startsWith(selectedDateStr))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const selectedDateNotes = getNotesForDate(selectedDateStr);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/trainer/sessions/${sessionId}/log`);
  };

  const openNewSessionDialog = () => {
    setNewSession({
      clientId: "",
      date: selectedDateStr,
      time: "10:00",
      endTime: "11:00",
    });
    setShowNewSessionDialog(true);
  };

  const handleCreateSession = async () => {
    if (
      !newSession.clientId ||
      !newSession.date ||
      !newSession.time ||
      !newSession.endTime
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const startTime = new Date(
        `${newSession.date}T${newSession.time}`
      ).toISOString();
      const endTime = new Date(
        `${newSession.date}T${newSession.endTime}`
      ).toISOString();

      await api.post("/sessions", {
        client_id: parseInt(newSession.clientId),
        start_time: startTime,
        end_time: endTime,
        status: "scheduled",
      });
      toast.success("สร้างนัดหมายสำเร็จ");
      setShowNewSessionDialog(false);
      fetchData();
    } catch (err) {
      toast.error("สร้างนัดหมายล้มเหลว");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      // Optimistic update
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSessionToDelete(null);
      toast.success("ลบนัดหมายเรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  const handleCreateRestDay = async () => {
    const hasRestDay = selectedDateNotes.some((n) => n.type === "rest-day");
    if (hasRestDay) {
      toast.error("วันนี้เป็นวันหยุดแล้ว");
      return;
    }
    try {
      const noteDate = new Date(selectedDate);
      noteDate.setHours(12, 0, 0, 0);

      await api.post("/calendar/notes", {
        date: noteDate.toISOString(),
        type: "rest-day",
        title: "Rest Day",
        content: "",
      });
      toast.success("กำหนดวันหยุดเรียบร้อย");
      setShowRestDayDialog(false);
      fetchData();
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/calendar/notes/${noteId}`);
      setCalendarNotes((prev) => prev.filter((n) => n.id !== noteId));
      setNoteToDelete(null);
      toast.success("ลบโน้ตเรียบร้อย");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  const getSessionColor = (index: number) =>
    SESSION_COLORS[index % SESSION_COLORS.length];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 relative">
      {/* Sidebar Collapse Toggle */}
      <motion.button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 z-50 bg-white hover:shadow-xl shadow-lg rounded-full py-6 px-2.5 transition-all flex items-center justify-center border"
        style={{ left: sidebarCollapsed ? "0rem" : "21rem" }}
        animate={{ left: sidebarCollapsed ? "0rem" : "21rem" }}
        initial={false}
      >
        <ChevronRight
          className={`h-6 w-6 text-primary transition-transform duration-300 ${
            !sidebarCollapsed ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* Sidebar (Details) */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-[21rem] bg-gradient-to-br from-blue-50/50 to-white border-r p-6 overflow-y-auto shrink-0"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#002140]">
                  {selectedDate.toLocaleDateString("th-TH", {
                    weekday: "long",
                  })}
                </h2>
                <p className="text-muted-foreground">
                  {selectedDate.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={openNewSessionDialog}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">นัดหมาย</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => setShowRestDayDialog(true)}
                >
                  <Coffee className="h-4 w-4" />
                  <span className="text-xs">วันหยุด</span>
                </Button>
              </div>

              {/* Notes List */}
              {selectedDateNotes.length > 0 && (
                <div className="space-y-2">
                  {selectedDateNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`relative p-3 rounded-lg border ${
                        note.type === "rest-day"
                          ? "bg-green-50 border-green-200"
                          : "bg-yellow-50 border-yellow-200"
                      } group`}
                    >
                      <button
                        onClick={() => setNoteToDelete(note.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 mb-1">
                        {note.type === "rest-day" ? (
                          <Coffee className="h-4 w-4 text-green-700" />
                        ) : (
                          <StickyNote className="h-4 w-4 text-yellow-700" />
                        )}
                        <span
                          className={`font-medium ${
                            note.type === "rest-day"
                              ? "text-green-900"
                              : "text-yellow-900"
                          }`}
                        >
                          {note.title}
                        </span>
                      </div>
                      {note.content && (
                        <p className="text-sm text-gray-700 ml-6">
                          {note.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sessions List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  นัดหมาย
                </h3>
                {selectedDateSessions.length > 0 ? (
                  selectedDateSessions.map((session, index) => {
                    const client = getClientById(session.clientId);
                    const time = new Date(session.date).toLocaleTimeString(
                      "th-TH",
                      { hour: "2-digit", minute: "2-digit", hour12: false }
                    );
                    const color = getSessionColor(index);

                    return (
                      <div
                        key={session.id}
                        className="bg-white p-3 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group relative"
                        onClick={() => handleStartSession(session.id)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex gap-3">
                          <div className={`w-1 rounded-full ${color}`}></div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm tracking-tight">
                                {time}
                              </span>
                              <Badge
                                variant={
                                  session.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] h-5"
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <div className="font-medium text-sm">
                              {client?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {client?.goal}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    ไม่มีนัดหมายวันนี้
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-[#002140] w-48 text-center">
              {currentDate.toLocaleDateString("th-TH", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDate(now);
            }}
          >
            วันนี้
          </Button>
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] gap-2">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-muted-foreground text-sm py-2"
            >
              {day}
            </div>
          ))}

          <div className="col-span-7 grid grid-cols-7 grid-rows-6 gap-2 h-full">
            {monthDates.map((date, index) => {
              const dateStr = date.toISOString().split("T")[0];
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                date.toDateString() === selectedDate.toDateString();

              const daySessions = getSessionsForDate(date);
              const dayNotes = getNotesForDate(dateStr);
              const isRestDay = dayNotes.some((n) => n.type === "rest-day");

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                                    relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-start
                                    ${
                                      !isCurrentMonth
                                        ? "opacity-30 bg-gray-50"
                                        : "bg-white"
                                    }
                                    ${
                                      isSelected
                                        ? "ring-2 ring-[#FF6B35] ring-offset-2 z-10"
                                        : "hover:border-blue-200"
                                    }
                                    ${isToday ? "bg-blue-50/50" : ""}
                                    ${isRestDay ? "bg-green-50/50" : ""}
                                `}
                >
                  <div
                    className={`
                                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                                    ${
                                      isToday
                                        ? "bg-[#002140] text-white"
                                        : isRestDay
                                        ? "text-green-700"
                                        : "text-gray-700"
                                    }
                                `}
                  >
                    {date.getDate()}
                  </div>

                  {isRestDay && (
                    <Coffee className="absolute top-2 right-2 h-3 w-3 text-green-600" />
                  )}

                  {/* Sessions Dots/Preview */}
                  <div className="w-full space-y-1 mt-auto overflow-hidden">
                    {daySessions.slice(0, 2).map((s, i) => {
                      const color = getSessionColor(i);
                      const client = getClientById(s.clientId);
                      return (
                        <div
                          key={s.id}
                          className={`text-[9px] truncate px-1.5 py-0.5 rounded-sm text-white ${color}`}
                        >
                          {client?.name || "Unknown"}
                        </div>
                      );
                    })}
                    {daySessions.length > 2 && (
                      <div className="text-[9px] text-gray-400 pl-1">
                        +{daySessions.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmations */}
      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={() => setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบนัดหมายนี้ใช่หรือไม่
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                sessionToDelete && handleDeleteSession(sessionToDelete)
              }
              className="bg-red-600"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!noteToDelete}
        onOpenChange={() => setNoteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโน้ต</AlertDialogTitle>
            <AlertDialogDescription>
              ดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noteToDelete && handleDeleteNote(noteToDelete)}
              className="bg-red-600"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Session Dialog */}
      <Dialog
        open={showNewSessionDialog}
        onOpenChange={setShowNewSessionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>นัดหมายใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>ลูกเทรน</Label>
              <Select
                value={newSession.clientId}
                onValueChange={(v) =>
                  setNewSession((p) => ({ ...p, clientId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือก..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>วันที่</Label>
                <Input
                  type="date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>เวลา</Label>
                <Input
                  type="time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>เวลาสิ้นสุด</Label>
                <Input
                  type="time"
                  value={newSession.endTime}
                  onChange={(e) =>
                    setNewSession((p) => ({ ...p, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleCreateSession}>
              สร้างนัดหมาย
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rest Day Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>กำหนดวันหยุด</DialogTitle>
            <DialogDescription>
              กำหนดให้วันที่ {selectedDate.toLocaleDateString()}{" "}
              เป็นวันหยุดพักผ่อน
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRestDayDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button className="bg-green-600" onClick={handleCreateRestDay}>
              ยืนยัน
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
