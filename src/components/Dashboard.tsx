import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Users, 
  FileText, 
  BookOpen, 
  Plus, 
  Clock,
  TrendingUp,
  CheckCircle2,
  Dumbbell,
  Activity,
  Target,
  Award,
  Zap,
  Calendar,
  AlertCircle,
  Bell,
  AlertTriangle,
  CheckSquare,
  Square,
  CircleDot,
  TrendingDown,
  Timer,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useApp } from './AppContext';
import NewClientModal from './NewClientModal';
import UpcomingReminders from './UpcomingReminders';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import type { Client, ProgramInstance } from './AppContext';

// ✅ เพิ่ม Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

// ✅ เพิ่ม Activity interface
interface ActivityItem {
  id: string;
  type: 'session_completed' | 'session_missed' | 'program_assigned' | 'client_joined' | 'milestone';
  clientId: string;
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients, sessions, programInstances, getProgramTemplateById, getClientById } = useApp();
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  
  // ✅ Tasks state (stored in localStorage)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('trainer-tasks');
    return stored ? JSON.parse(stored) : [];
  });

  // Save tasks to localStorage
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('trainer-tasks', JSON.stringify(newTasks));
  };

  const toggleTask = (taskId: string) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    updateTasks(newTasks);
  };

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(session => 
    session.date.startsWith(today) && session.status === 'scheduled'
  );

  // Get completed sessions without summary cards
  const incompleteSummaries = sessions.filter(session => 
    session.status === 'completed' && !session.summary
  );

  // Calculate stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const thisMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const now = new Date();
    return s.status === 'completed' && 
           sessionDate.getMonth() === now.getMonth() && 
           sessionDate.getFullYear() === now.getFullYear();
  }).length;

  // ✅ คำนวณ Compliance Rate (อัตราการปฏิบัติตามแผน)
  const complianceRate = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= last30Days;
    });
    
    const scheduledCount = recentSessions.filter(s => 
      s.status === 'scheduled' || s.status === 'completed'
    ).length;
    
    const completedCount = recentSessions.filter(s => 
      s.status === 'completed'
    ).length;
    
    if (scheduledCount === 0) return 0;
    return Math.round((completedCount / scheduledCount) * 100);
  }, [sessions]);

  // ✅ คำนวณ Program Health สำหรับแต่ละลูกค้า (Traffic Light System)
  const getProgramHealth = (client: Client): { status: 'good' | 'warning' | 'danger'; label: string; color: string } => {
    const activeProgramInstance = programInstances.find(
      pi => pi.clientId === client.id && pi.status === 'active'
    );

    // ไม่มีโปรแกรม = Danger (แดง)
    if (!activeProgramInstance) {
      return { 
        status: 'danger', 
        label: 'ต้องดำเนินการ', 
        color: 'bg-red-500' 
      };
    }

    const template = getProgramTemplateById(activeProgramInstance.templateId);
    if (!template) {
      return { status: 'danger', label: 'ต้องดำเนินการ', color: 'bg-red-500' };
    }

    // คำนวณจำนวนวันที่เหลือ
    const startDate = new Date(activeProgramInstance.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (template.duration * 7));
    
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // โปรแกรมจะสิ้นสุดใน 14 วัน = Warning (เหลือง)
    if (daysRemaining <= 14 && daysRemaining > 0) {
      return { 
        status: 'warning', 
        label: 'ต้องจับตาดู', 
        color: 'bg-yellow-500' 
      };
    }

    // โปรแกรมหมดอายุแล้ว = Danger (แดง)
    if (daysRemaining <= 0) {
      return { 
        status: 'danger', 
        label: 'ต้องดำเนินการ', 
        color: 'bg-red-500' 
      };
    }

    // หาว่าลูกค้าทำตามโปรแกรมหรือไม่ (ใน 7 วันล่าสุด)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentClientSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return s.clientId === client.id && 
             sessionDate >= last7Days && 
             s.programInstanceId === activeProgramInstance.id;
    });
    
    const scheduledCount = recentClientSessions.filter(s => 
      s.status === 'scheduled' || s.status === 'completed'
    ).length;
    
    const completedCount = recentClientSessions.filter(s => 
      s.status === 'completed'
    ).length;

    const clientCompliance = scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 100;

    // Compliance ต่ำกว่า 60% = Warning (เหลือง)
    if (clientCompliance < 60) {
      return { 
        status: 'warning', 
        label: 'ต้องจับตาดู', 
        color: 'bg-yellow-500' 
      };
    }

    // ทุกอย่างปกติ = Good (เขียว)
    return { 
      status: 'good', 
      label: 'กำลังดำเนินการดี', 
      color: 'bg-green-500' 
    };
  };

  // ✅ สร้าง Activity Feed
  const activityFeed = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    // เพิ่ม completed sessions ใน 7 วันล่าสุด
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        return s.status === 'completed' && sessionDate >= last7Days;
      })
      .forEach(session => {
        const client = getClientById(session.clientId);
        if (client) {
          activities.push({
            id: `session-${session.id}`,
            type: 'session_completed',
            clientId: client.id,
            message: `${client.name} ทำการฝึกเสร็จสิ้น`,
            timestamp: session.date,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: 'text-green-600'
          });
        }
      });

    // เพิ่ม missed sessions (scheduled แต่เลยวันไปแล้ว)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        return s.status === 'scheduled' && sessionDate < yesterday && sessionDate >= last7Days;
      })
      .forEach(session => {
        const client = getClientById(session.clientId);
        if (client) {
          activities.push({
            id: `missed-${session.id}`,
            type: 'session_missed',
            clientId: client.id,
            message: `${client.name} พลาดการฝึก`,
            timestamp: session.date,
            icon: <AlertCircle className="h-4 w-4" />,
            color: 'text-red-600'
          });
        }
      });

    // เรียงลำดับตามเวลาล่าสุด
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 10); // แสดงแค่ 10 รายการล่าสุด
  }, [sessions, getClientById]);

  // ✅ ระบุลูกค้าที่ต้องใส่ใจ (Action Needed)
  const actionNeededClients = useMemo(() => {
    return clients
      .filter(client => {
        const health = getProgramHealth(client);
        return health.status === 'danger' || health.status === 'warning';
      })
      .sort((a, b) => {
        const healthA = getProgramHealth(a);
        const healthB = getProgramHealth(b);
        // แสดง danger ก่อน warning
        if (healthA.status === 'danger' && healthB.status !== 'danger') return -1;
        if (healthA.status !== 'danger' && healthB.status === 'danger') return 1;
        return 0;
      });
  }, [clients, programInstances]);

  const handleStartSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleNewClient = (clientId: string) => {
    setShowNewClientModal(false);
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="space-y-4">
      {/* ✅ 0. 🔔 REMINDERS: การแจ้งเตือนนัดหมายที่กำลังจะมาถึง */}
      <UpcomingReminders />

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
                  {new Date().toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-500 text-white">
              {todaySessions.length} การฝึก
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-70" />
              <p className="text-base font-medium text-muted-foreground mb-2">ว่างวันนี้ 🎉</p>
              <p className="text-sm text-muted-foreground mb-4">ไม่มีนัดหมาย - พักผ่อนหรือวางแผนงานอื่นได้เลย</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/calendar')}
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  ดูปฏิทิน
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/clients')}
                >
                  <Users className="h-4 w-4 mr-1" />
                  ดูลูกเทรน
                </Button>
              </div>
            </div>
          ) : (
            todaySessions.map(session => {
              const client = getClientById(session.clientId);
              if (!client) return null;
              
              const sessionTime = new Date(session.date).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              });

              // ✅ นับจำนวนครั้งที่ลูกเทรนมาฝึก (completed sessions)
              const sessionCount = sessions.filter(s => 
                s.clientId === client.id && s.status === 'completed'
              ).length;

              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 border-2 border-orange-500">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="text-sm bg-orange-100 dark:bg-orange-900">{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{client.name}</p>
                        {/* ✅ แสดง Session Count */}
                        <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
                          ครั้งที่ {sessionCount + 1}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {sessionTime} น.
                        </div>
                        <Badge variant="outline" className="text-xs py-0 bg-primary/10 border-primary/30">
                          {client.goal}
                        </Badge>
                      </div>
                      {/* ✅ แสดง Personal Notes ถ้ามี */}
                      {client.personalNotes && (
                        <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">
                          💡 {client.personalNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartSession(session.id)}
                    className="flex items-center gap-1 shadow-md bg-accent hover:bg-accent/90 text-accent-foreground ml-2"
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
                onClick={() => navigate('/reports')}
                className="w-full bg-purple-500 hover:bg-purple-600"
                size="sm"
              >
                ไปสร้างการ์ด
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. 📊 INFO: สถิติภาพรวม */}
      <Card className="shadow-md border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">สรุปภาพรวม</CardTitle>
          <CardDescription className="text-xs">สถิติและข้อมูลสำคัญ</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* ✅ จำนวนลูกค้า */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">ลูกค้า</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{clients.length}</p>
                <p className="text-xs text-blue-600/60 dark:text-blue-400/60">{activeClients} Active</p>
              </div>
            </div>

            {/* ✅ อัตราการปฏิบัติตามแผน (Compliance Rate) */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900">
              <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center shadow-md flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Compliance</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{complianceRate}%</p>
                <p className="text-xs text-green-600/60 dark:text-green-400/60">30 วันล่าสุด</p>
              </div>
            </div>

            {/* ✅ เดือนนี้ */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900">
              <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400">เดือนนี้</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{thisMonthSessions}</p>
                <p className="text-xs text-orange-600/60 dark:text-orange-400/60">การฝึก</p>
              </div>
            </div>

            {/* ✅ ทั้งหมด */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-md flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">ทั้งหมด</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{completedSessions}</p>
                <p className="text-xs text-purple-600/60 dark:text-purple-400/60">การฝึก</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ 4. 🚦 TRAFFIC LIGHT SYSTEM: สถานะสุขภาพโปรแกรม + สิ่งที่ต้องใส่ใจ */}
      {actionNeededClients.length > 0 && (
        <Card className="shadow-md border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-red-900 dark:text-red-100">
                    ลูกค้าที่ต้องดำเนินการ
                  </CardTitle>
                  <CardDescription className="text-xs text-red-700 dark:text-red-300">
                    ต้องติดตามและดำเนินการ
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-red-500 text-white">
                {actionNeededClients.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {actionNeededClients.map(client => {
              const health = getProgramHealth(client);
              const activeProgramInstance = programInstances.find(
                pi => pi.clientId === client.id && pi.status === 'active'
              );
              
              let actionMessage = '';
              if (!activeProgramInstance) {
                actionMessage = 'ไม่มีโปรแกรม - ต้องมอบหมายโปรแกรมใหม่';
              } else {
                const template = getProgramTemplateById(activeProgramInstance.templateId);
                if (template) {
                  const startDate = new Date(activeProgramInstance.startDate);
                  const endDate = new Date(startDate);
                  endDate.setDate(startDate.getDate() + (template.duration * 7));
                  const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (daysRemaining <= 0) {
                    actionMessage = `โปรแกรมหมดอายุแล้ว - ต้องมอบหมายโปรแกรมใหม่`;
                  } else if (daysRemaining <= 14) {
                    actionMessage = `โปรแกรมจะสิ้นสุดในอีก ${daysRemaining} วัน`;
                  } else {
                    actionMessage = 'Compliance ต่ำ - ควรติดตามผล';
                  }
                }
              }

              return (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Traffic Light Indicator */}
                    <div className={`h-3 w-3 rounded-full ${health.color} shadow-md`}></div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="text-sm">{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{client.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            health.status === 'danger' ? 'border-red-500 text-red-700 bg-red-50' :
                            health.status === 'warning' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                            'border-green-500 text-green-700 bg-green-50'
                          }`}
                        >
                          {health.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{actionMessage}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ✅ 5. 📋 TO-DO LIST & 📰 ACTIVITY FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ✅ รายการสิ่งที่ต้องทำ (Tasks) */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm">สิ่งที่ต้องทำ</CardTitle>
                  <CardDescription className="text-xs">รายการงานสำหรับเทรนเนอร์</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                {tasks.filter(t => !t.completed).length}
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
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        task.completed 
                          ? 'bg-gray-50 dark:bg-gray-900 opacity-60' 
                          : 'bg-white dark:bg-gray-800 hover:shadow-sm'
                      }`}
                    >
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
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
                              {new Date(task.dueDate).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.priority === 'high' ? 'border-red-500 text-red-700' :
                          task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-gray-500 text-gray-700'
                        }`}
                      >
                        {task.priority === 'high' ? 'สูง' : task.priority === 'medium' ? 'กลาง' : 'ต่ำ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ✅ Activity Feed */}
        <Card className="shadow-md border-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">กิจกรรมล่าสุด</CardTitle>
                <CardDescription className="text-xs">อัปเดตใน 7 วันล่าสุด</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[300px]">
              {activityFeed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ยังไม่มีกิจกรรม</p>
                  <p className="text-xs mt-1">เมื่อมีการฝึกจะแสดงที่นี่</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityFeed.map(activity => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clients/${activity.clientId}`)}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === 'session_completed' ? 'bg-green-100 dark:bg-green-900' :
                        activity.type === 'session_missed' ? 'bg-red-100 dark:bg-red-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <span className={activity.color}>
                          {activity.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(activity.timestamp).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* New Client Modal */}
      <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
        <DialogContent className="max-w-md" aria-describedby="new-client-dashboard-description">
          <DialogHeader>
            <DialogTitle>เพิ่มลูกเทรนใหม่</DialogTitle>
            <DialogDescription id="new-client-dashboard-description">
              กรอกข้อมูลลูกเทรนใหม่ของคุณ
            </DialogDescription>
          </DialogHeader>
          <NewClientModal onClientCreated={handleNewClient} />
        </DialogContent>
      </Dialog>
    </div>
  );
}