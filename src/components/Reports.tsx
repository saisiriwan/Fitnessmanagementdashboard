import React, { useState } from 'react';
import {
  Download,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileDown,
  FileText,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Award,
  Sparkles,
  Weight,
  Ruler,
  TrendingDown,
  Dumbbell,
  Timer,
  BarChart3,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useApp } from './AppContext';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const PRIMARY_COLOR = '#002140';
const ACCENT_COLOR = '#FF6B35';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, trend, subtitle, color }: StatCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center`} style={{ background: color }}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
              trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
              trend === 'down' ? 'bg-rose-100 text-rose-700' : 
              'bg-slate-100 text-slate-700'
            }`}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">{title}</p>
          <div className="text-[#002140]" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {value}
          </div>
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { clients, sessions } = useApp();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  // Calculate overall stats
  const totalSessions = sessions.filter((s) => s.status === 'completed').length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const avgSessionsPerClient = activeClients > 0 ? Math.round(totalSessions / activeClients) : 0;
  const attendanceRate = 85;

  // Get selected client data
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const clientSessions = sessions.filter(s => s.clientId === selectedClientId && s.status === 'completed');

  // Mock data for charts
  const getClientProgressData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      week: `สัปดาห์ ${i + 1}`,
      weight: 75 - (i * 0.5) + (Math.random() * 2 - 1),
      bodyFat: 25 - (i * 0.3) + (Math.random() * 0.5 - 0.25),
      muscle: 45 + (i * 0.2) + (Math.random() * 0.3 - 0.15),
    }));
  };

  const getClientVolumeData = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      session: `#${i + 1}`,
      volume: Math.floor(Math.random() * 2000) + 3000,
      sets: Math.floor(Math.random() * 10) + 15,
      reps: Math.floor(Math.random() * 50) + 100,
    }));
  };

  const getClientAttendanceData = () => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
    return months.map((month) => ({
      month,
      attended: Math.floor(Math.random() * 5) + 10,
      scheduled: 12,
    }));
  };

  const getClientPerformanceRadar = () => {
    return [
      { category: 'ความแข็งแรง', value: 85 },
      { category: 'ความอดทน', value: 70 },
      { category: 'ความยืดหยุ่น', value: 65 },
      { category: 'การทรงตัว', value: 75 },
      { category: 'สมรรถภาพหัวใจ', value: 80 },
    ];
  };

  const getExerciseProgressData = () => {
    return [
      { exercise: 'Squat', week1: 60, week4: 70, week8: 80, week12: 90 },
      { exercise: 'Bench Press', week1: 50, week4: 57, week8: 65, week12: 72 },
      { exercise: 'Deadlift', week1: 80, week4: 95, week8: 110, week12: 125 },
      { exercise: 'Overhead Press', week1: 35, week4: 40, week8: 45, week12: 50 },
    ];
  };

  const getOverviewData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        sessions: Math.floor(Math.random() * 8) + 3,
        clients: Math.floor(Math.random() * 5) + 2,
      };
    });
  };

  const clientProgressData = getClientProgressData();
  const clientVolumeData = getClientVolumeData();
  const clientAttendanceData = getClientAttendanceData();
  const clientPerformanceRadar = getClientPerformanceRadar();
  const exerciseProgressData = getExerciseProgressData();
  const overviewData = getOverviewData();

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#002140] to-[#003d73] flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#002140]">รายงานและสถิติ</h1>
                <p className="text-muted-foreground">วิเคราะห์และติดตามความก้าวหน้าของลูกเทรน</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-[#002140]/20">
                  <Download className="h-4 w-4" />
                  ส่งออกรายงาน
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>เลือกรูปแบบไฟล์</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                  <FileDown className="h-4 w-4" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Spreadsheet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  CSV File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid bg-white border border-[#002140]/10 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-[#002140] data-[state=active]:text-white"
            >
              ภาพรวมทั้งหมด
            </TabsTrigger>
            <TabsTrigger 
              value="individual"
              className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white"
            >
              รายบุคคล
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="การฝึกทั้งหมด"
                value={totalSessions}
                change={12.5}
                trend="up"
                icon={Calendar}
                subtitle="เดือนนี้"
                color={PRIMARY_COLOR}
              />
              <StatCard
                title="ลูกเทรนที่ใช้งาน"
                value={activeClients}
                change={8.2}
                trend="up"
                icon={Users}
                subtitle={`จาก ${clients.length} คนทั้งหมด`}
                color={ACCENT_COLOR}
              />
              <StatCard
                title="ค่าเฉลี่ยการฝึก/คน"
                value={avgSessionsPerClient}
                icon={Activity}
                subtitle="การฝึกต่อเดือน"
                color="#10B981"
              />
              <StatCard
                title="อัตราการเข้าร่วม"
                value={`${attendanceRate}%`}
                change={3.5}
                trend="up"
                icon={CheckCircle2}
                subtitle="เข้าร่วมตรงเวลา"
                color="#8B5CF6"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Trend */}
              <Card className="border-[#002140]/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#002140]" />
                    แนวโน้มการฝึก
                  </CardTitle>
                  <CardDescription>30 วันล่าสุด</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={overviewData}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke={PRIMARY_COLOR}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSessions)"
                        name="การฝึก"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Activity */}
              <Card className="border-[#002140]/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#FF6B35]" />
                    ลูกเทรนที่ใช้งาน
                  </CardTitle>
                  <CardDescription>จำนวนลูกเทรนที่เข้ารับบริการ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overviewData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clients"
                        stroke={ACCENT_COLOR}
                        strokeWidth={2}
                        name="ลูกเทรน"
                        dot={{ r: 3, fill: ACCENT_COLOR }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Individual Tab */}
          <TabsContent value="individual" className="space-y-6">
            {/* Client Selector */}
            <Card className="border-[#002140]/10 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#002140] to-[#FF6B35] flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>เลือกลูกเทรนเพื่อดูรายละเอียด</CardTitle>
                      <CardDescription>วิเคราะห์ความก้าวหน้าและพัฒนาการ</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-full lg:w-[400px]">
                    <SelectValue placeholder="เลือกลูกเทรน" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-[#002140] text-white text-xs">
                              {client.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {client.name} - {client.goal}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedClient && (
              <>
                {/* Client Info Card */}
                <Card className="border-[#002140]/10 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-gradient-to-br from-[#002140] to-[#FF6B35] text-white" style={{ fontSize: '2rem' }}>
                          {selectedClient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-[#002140]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedClient.name}</h3>
                            <p className="text-muted-foreground">{selectedClient.goal}</p>
                          </div>
                          <Badge className={selectedClient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}>
                            {selectedClient.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-muted-foreground">วันที่เริ่ม</p>
                            <p className="text-[#002140]">{new Date(selectedClient.joinDate).toLocaleDateString('th-TH')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">การฝึกทั้งหมด</p>
                            <p className="text-[#002140]">{clientSessions.length} การฝึก</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">อีเมล</p>
                            <p className="text-[#002140] truncate" title={selectedClient.email}>{selectedClient.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">โทร</p>
                            <p className="text-[#002140]">{selectedClient.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="น้ำหนักปัจจุบัน"
                    value="72 kg"
                    change={-4.2}
                    trend="down"
                    icon={Weight}
                    subtitle="ลดลง 3 kg"
                    color="#10B981"
                  />
                  <StatCard
                    title="มวลกล้ามเนื้อ"
                    value="46 kg"
                    change={3.5}
                    trend="up"
                    icon={Dumbbell}
                    subtitle="เพิ่มขึ้น 1.5 kg"
                    color="#002140"
                  />
                  <StatCard
                    title="ไขมันในร่างกาย"
                    value="22%"
                    change={-8.3}
                    trend="down"
                    icon={Activity}
                    subtitle="ลดลง 3%"
                    color="#FF6B35"
                  />
                  <StatCard
                    title="ปริมาณการฝึกรวม"
                    value="32,450"
                    change={15.2}
                    trend="up"
                    icon={Target}
                    subtitle="kg ยกทั้งหมด"
                    color="#8B5CF6"
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Body Composition Progress */}
                  <Card className="border-[#002140]/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Weight className="h-5 w-5 text-[#002140]" />
                        การเปลี่ยนแปลงองค์ประกอบร่างกาย
                      </CardTitle>
                      <CardDescription>12 สัปดาห์ล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={clientProgressData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="weight" stroke="#002140" strokeWidth={2} name="น้ำหนัก (kg)" />
                          <Line type="monotone" dataKey="bodyFat" stroke="#FF6B35" strokeWidth={2} name="ไขมัน (%)" />
                          <Line type="monotone" dataKey="muscle" stroke="#10B981" strokeWidth={2} name="กล้ามเนื้อ (kg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Training Volume */}
                  <Card className="border-[#002140]/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-[#FF6B35]" />
                        ปริมาณการฝึก (Volume)
                      </CardTitle>
                      <CardDescription>8 การฝึกล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={clientVolumeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="session" tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="volume" fill={ACCENT_COLOR} radius={[8, 8, 0, 0]} name="ปริมาณ (kg)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Attendance */}
                  <Card className="border-[#002140]/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#10B981]" />
                        การเข้าร่วมการฝึก
                      </CardTitle>
                      <CardDescription>6 เดือนล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={clientAttendanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="attended" fill="#10B981" radius={[4, 4, 0, 0]} name="เข้าร่วม" />
                          <Bar dataKey="scheduled" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="นัดหมาย" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Performance Radar */}
                  <Card className="border-[#002140]/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#8B5CF6]" />
                        ประเมินสมรรถภาพ
                      </CardTitle>
                      <CardDescription>คะแนนในแต่ละด้าน</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={clientPerformanceRadar}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis tick={{ fontSize: 11 }} />
                          <Radar name="คะแนน" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Exercise Progress Table */}
                <Card className="border-[#002140]/10 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#002140]" />
                      ความก้าวหน้าท่าหลัก
                    </CardTitle>
                    <CardDescription>น้ำหนักที่ยกได้เพิ่มขึ้นตามเวลา (kg)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={exerciseProgressData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6b7280" />
                        <YAxis dataKey="exercise" type="category" tick={{ fontSize: 11 }} stroke="#6b7280" width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="week1" fill="#94a3b8" name="สัปดาห์ 1" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="week4" fill="#64748b" name="สัปดาห์ 4" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="week8" fill="#FF6B35" name="สัปดาห์ 8" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="week12" fill="#002140" name="สัปดาห์ 12" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Notes Section */}
                <Card className="border-[#002140]/10 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#FF6B35]" />
                      สรุปและข้อสังเกต
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="text-emerald-900">จุดแข็ง</p>
                            <p className="text-emerald-700">
                              มีความมุ่งมั่นสูง เข้าการฝึกสม่ำเสมอ ความแข็งแรงเพิ่มขึ้นต่อเนื่อง
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-2">
                          <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-amber-900">จุดที่ควรพัฒนา</p>
                            <p className="text-amber-700">
                              ควรเพิ่มความยืดหยุ่น และฝึกสมรรถภาพหัวใจและปอดเพิ่มเติม
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-blue-900">แผนถัดไป</p>
                            <p className="text-blue-700">
                              เพิ่มน้ำหนักท่า Squat และ Deadlift ในเดือนหน้า และเน้นการฟื้นตัวให้เพียงพอ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}