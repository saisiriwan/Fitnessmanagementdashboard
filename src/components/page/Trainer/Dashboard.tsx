import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  FileText,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  Activity,
  Calendar,
  CheckSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewClientModal from "./NewClientModal";
import api from "@/lib/api";

interface Client {
  id: string;
  name: string;
  avatar?: string;
  goal: string;
  status?: string;
}

interface Session {
  id: string;
  clientId: string;
  date: string;
  status: string;
  summary?: boolean; // Mock field for now if not in API
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "ออกแบบโปรแกรมฝึกคุณสมชาย",
      description: "ปรับตารางเวทเทรนนิ่งช่วงเช้า",
      completed: false,
      priority: "high",
      dueDate: new Date().toISOString(),
    },
    {
      id: 2,
      title: "ตรวจสอบโภชนาการคุณนิด",
      completed: true,
      priority: "medium",
      dueDate: new Date().toISOString(),
    },
    {
      id: 3,
      title: "อัพเดทตารางนัดหมายสัปดาห์หน้า",
      completed: false,
      priority: "low",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, sessionsRes] = await Promise.all([
        api.get("/clients"),
        api.get("/schedules"),
      ]);

      // Map Clients
      const mappedClients = (clientsRes.data || []).map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        avatar: c.avatar_url,
        goal: c.goal || "General Fitness",
        status: "active", // Default to active as backend might not have this yet
      }));
      setClients(mappedClients);

      // Map Sessions
      // Backend might return different structure, adapting as seen in Calendar.tsx
      const mappedSessions = (sessionsRes.data || []).map((s: any) => ({
        id: s.id.toString(),
        clientId: s.client_id.toString(),
        date: s.start_time, // ISO string
        status: s.status,
        summary: s.summary || false, // Assuming potential field
      }));
      setSessions(mappedSessions);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const getClientById = (id: string) => clients.find((c) => c.id === id);

  // Get today's sessions (Local Time safe)
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  const todaySessions = sessions.filter(
    (session) =>
      session.date.startsWith(todayStr) && session.status === "scheduled"
  );

  // Get clients that need follow-up (no session in last 7 days)
  const followUpClients = clients.filter((client) => {
    const clientSessions = sessions.filter(
      (s) => s.clientId === client.id && s.status === "completed"
    );
    if (clientSessions.length === 0) return true; // Never trained

    const lastSession = clientSessions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const daysSinceLastSession = Math.floor(
      (new Date().getTime() - new Date(lastSession.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSinceLastSession >= 7;
  });

  // Get completed sessions without summary cards
  const incompleteSummaries = sessions.filter(
    (session) => session.status === "completed" && !session.summary
  );

  // Calculate stats
  // const activeClients = clients.filter(c => c.status === 'active').length; // All are 'active' for now
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const thisMonthSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    return (
      s.status === "completed" &&
      sessionDate.getMonth() === now.getMonth() &&
      sessionDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Last 7 days sessions data for chart
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString("en-CA");

    const completedCount = sessions.filter(
      (s) => s.date.startsWith(dateStr) && s.status === "completed"
    ).length;

    const scheduledCount = sessions.filter(
      (s) => s.date.startsWith(dateStr) && s.status === "scheduled"
    ).length;

    return {
      date: date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      }),
      เทรนแล้ว: completedCount,
      นัดไว้: scheduledCount,
    };
  });

  // Goal distribution for pie chart
  const goalStats = clients.reduce((acc, client) => {
    acc[client.goal] = (acc[client.goal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const goalData = Object.entries(goalStats).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#1e40af", "#f97316", "#10b981", "#8b5cf6", "#ef4444"];

  const handleStartSession = (sessionId: string) => {
    navigate(`/trainer/sessions/${sessionId}/log`); // Updated path to match known routes
  };

  const handleNewClient = (clientId: string) => {
    setShowNewClientModal(false);
    navigate(`/trainer/clients/${clientId}`); // Updated path
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-4 p-4 lg:p-6 pb-20">
      {/* 1. 🚨 URGENT: นัดหมายวันนี้ - แสดงก่อนสุด */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  นัดหมายวันนี้
                </CardTitle>
                <CardDescription className="text-xs text-orange-700 dark:text-orange-300">
                  {new Date().toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-lg px-3 py-1 bg-orange-500 text-white"
            >
              {todaySessions.length} การฝึก
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-70" />
              <p className="text-base font-medium text-muted-foreground mb-2">
                ว่างวันนี้ 🎉
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ไม่มีนัดหมาย - พักผ่อนหรือวางแผนงานอื่นได้เลย
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/trainer/calendar")}
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  ดูปฏิทิน
                </Button>
                <Button size="sm" onClick={() => navigate("/trainer/clients")}>
                  <Users className="h-4 w-4 mr-1" />
                  ดูลูกเทรน
                </Button>
              </div>
            </div>
          ) : (
            todaySessions.map((session) => {
              const client = getClientById(session.clientId);
              if (!client) return null;

              const sessionTime = new Date(session.date).toLocaleTimeString(
                "th-TH",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-orange-500">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="text-sm bg-orange-100 dark:bg-orange-900">
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{client.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {sessionTime} น.
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs py-0 bg-primary/10 border-primary/30"
                        >
                          {client.goal}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartSession(session.id)}
                    className="flex items-center gap-1 shadow-md bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 2. ⚠️ ACTION REQUIRED: งานค้าง/To-do */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
        {/* การ์ดสรุปค้าง */}
        {incompleteSummaries.length > 0 && (
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-purple-900 dark:text-purple-100">
                      การ์ดสรุปค้าง
                    </CardTitle>
                    <CardDescription className="text-xs text-purple-700 dark:text-purple-300">
                      ต้องสร้างการ์ดสรุป
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-purple-500 text-white">
                  {incompleteSummaries.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => navigate("/trainer/reports")}
                className="w-full bg-purple-500 hover:bg-purple-600"
                size="sm"
              >
                ไปสร้างการ์ด
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ลูกเทรนต้องติดตาม - แบบขยาย */}
        {followUpClients.length > 0 && (
          <Card className="border-blue-200 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                      โปรแกรมที่ต้องติดตาม
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      รายชื่อลูกเทรนที่ไม่มีการฝึกซ้อมมานานกว่า 7 วัน
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {followUpClients.length} คน
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {followUpClients.map((client) => {
                  const clientSessions = sessions.filter(
                    (s) => s.clientId === client.id && s.status === "completed"
                  );
                  const lastSession = clientSessions.sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];

                  const daysSince = lastSession
                    ? Math.floor(
                        (new Date().getTime() -
                          new Date(lastSession.date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;

                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/trainer/clients/${client.id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                            {client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 truncate">
                            {client.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {daysSince
                                ? `ไม่มีการฝึก ${daysSince} วัน`
                                : "ยังไม่เคยเทรน"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trainer/clients/${client.id}`);
                        }}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. 📊 INFO: สถิติภาพรวม */}
      <Card className="shadow-md border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">สรุปภาพรวม</CardTitle>
          <CardDescription className="text-xs">
            สถิติและข้อมูลสำคัญ
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  ลูกเทรน
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {clients.length}
                </p>
                <p className="text-xs text-blue-600/60 dark:text-blue-400/60">
                  {clients.length} Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900">
              <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  เดือนนี้
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {thisMonthSessions}
                </p>
                <p className="text-xs text-orange-600/60 dark:text-orange-400/60">
                  การฝึก
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900">
              <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center shadow-md flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ทั้งหมด
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {completedSessions}
                </p>
                <p className="text-xs text-green-600/60 dark:text-green-400/60">
                  การฝึก
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  วันนี้
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {todaySessions.length}
                </p>
                <p className="text-xs text-purple-600/60 dark:text-purple-400/60">
                  นัดหมาย
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ รายการสิ่งที่ต้องทำ (Tasks) */}
      <Card className="shadow-md border-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">สิ่งที่ต้องทำ</CardTitle>
                <CardDescription className="text-xs">
                  รายการงานสำหรับเทรนเนอร์
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">
              {tasks.filter((t) => !t.completed).length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[300px]">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ไม่มีงานค้าง</p>
                <p className="text-xs mt-1">คุณทำงานเสร็จหมดแล้ว! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      task.completed
                        ? "bg-gray-50 dark:bg-gray-900 opacity-60"
                        : "bg-white dark:bg-gray-800 hover:shadow-sm"
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString(
                              "th-TH",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        task.priority === "high"
                          ? "border-red-500 text-red-700"
                          : task.priority === "medium"
                          ? "border-yellow-500 text-yellow-700"
                          : "border-gray-500 text-gray-700"
                      }`}
                    >
                      {task.priority === "high"
                        ? "สูง"
                        : task.priority === "medium"
                        ? "กลาง"
                        : "ต่ำ"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Client Modal */}
      <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
        <DialogContent
          className="max-w-md"
          aria-describedby="new-client-dashboard-description"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มลูกเทรนใหม่</DialogTitle>
            <DialogDescription id="new-client-dashboard-description">
              กรอกข้อมูลพื้นฐานของลูกเทรนใหม่
            </DialogDescription>
          </DialogHeader>
          <NewClientModal onClientCreated={handleNewClient} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
