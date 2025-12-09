import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  FileText,
  Activity,
  Target,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  Award,
  CheckCircle2,
  Brain,
  UserCheck,
  UserX,
  UserPlus,
  Zap,
  Heart,
  Star,
  TrendingDown as TrendDown,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePickerWithRange } from './ui/date-range-picker';
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
import { useApp } from './AppContext';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

function KPICard({ title, value, change, icon: Icon, trend, subtitle }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50 dark:bg-green-950/20',
    down: 'text-red-600 bg-red-50 dark:bg-red-950/20',
    neutral: 'text-muted-foreground bg-muted',
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {change !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </CardContent>
        <div className="h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"></div>
      </Card>
    </motion.div>
  );
}

export default function Reports() {
  const { clients, sessions } = useApp();
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('sessions');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate stats
  const totalSessions = sessions.filter((s) => s.status === 'completed').length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const avgSessionsPerClient = activeClients > 0 ? Math.round(totalSessions / activeClients) : 0;
  const attendanceRate = 85;
  const totalHours = Math.round(totalSessions * 1.5); // Assuming 1.5 hours per session
  const goalsAchieved = 92; // Mock percentage

  // Mock data for charts
  const getLast30DaysData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        sessions: Math.floor(Math.random() * 12) + 3,
        revenue: Math.floor(Math.random() * 3000) + 1000,
        clients: Math.floor(Math.random() * 8) + 2,
      };
    });
  };

  const getSessionsByHour = () => {
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    return hours.map((hour) => ({
      hour,
      sessions: Math.floor(Math.random() * 10) + 1,
    }));
  };

  const getClientGoalDistribution = () => {
    const goals = [...new Set(clients.map((c) => c.goal))];
    return goals.map((goal) => ({
      name: goal,
      value: clients.filter((c) => c.goal === goal).length,
    }));
  };

  const getTopClients = () => {
    return clients
      .slice(0, 5)
      .map((client) => ({
        name: client.name,
        sessions: Math.floor(Math.random() * 20) + 5,
        progress: Math.floor(Math.random() * 40) + 60,
      }));
  };

  const monthlyData = getLast30DaysData();
  const hourlyData = getSessionsByHour();
  const goalData = getClientGoalDistribution();
  const topClients = getTopClients();

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    // Implementation for export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            รายงานและสถิติ
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Pro
            </Badge>
          </h1>
          <p className="text-muted-foreground">ติดตามผลการดำเนินงานและความก้าวหน้าแบบ Real-time</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                ส่งออกรายงาน
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>เลือกรูปแบบ</DropdownMenuLabel>
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

          <Button className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">สร้างรายงาน</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="เซสชันทั้งหมด"
          value={totalSessions}
          change={12.5}
          trend="up"
          icon={Calendar}
          subtitle="เพิ่มขึ้น 15 เซสชันจากเดือนที่แล้ว"
        />
        <KPICard
          title="ลูกเทรนที่ใช้งาน"
          value={activeClients}
          change={8.2}
          trend="up"
          icon={Users}
          subtitle={`จาก ${clients.length} คนทั้งหมด`}
        />
        <KPICard
          title="ชั่วโมงการฝึกรวม"
          value={`${totalHours} ชม.`}
          change={10.3}
          trend="up"
          icon={Clock}
          subtitle="เพิ่มขึ้นจากเดือนที่แล้ว"
        />
        <KPICard
          title="อัตราความสำเร็จ"
          value={`${goalsAchieved}%`}
          change={5.2}
          trend="up"
          icon={Target}
          subtitle="ลูกเทรนบรรลุเป้าหมาย"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>ตัวกรองข้อมูล</CardTitle>
          </div>
          <CardDescription>ปรับแต่งเงื่อนไขการแสดงผลรายงาน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ลูกเทรน</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกเทรน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ลูกเทรนทั้งหมด</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ตัวชี้วัด</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตัวชี้วัด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">จำนวนเซสชัน</SelectItem>
                  <SelectItem value="attendance">อัตราการเข้าร่วม</SelectItem>
                  <SelectItem value="progress">ความก้าวหน้า</SelectItem>
                  <SelectItem value="volume">ปริมาณการฝึก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">ช่วงเวลา</label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="performance">ผลการดำเนินงาน</TabsTrigger>
          <TabsTrigger value="clients">ลูกเทรน</TabsTrigger>
          <TabsTrigger value="financial">การมีส่วนร่วม</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Trend - Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>แนวโน้มเซสชัน (30 วันล่าสุด)</CardTitle>
                <CardDescription>จำนวนเซสชันและรายได้รายวัน</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorSessions)"
                      name="เซสชัน"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sessions by Hour - Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>เซสชันตามช่วงเวลา</CardTitle>
                <CardDescription>ช่วงเวลาที่มีการฝึกมากที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sessions" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="เซสชัน" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Client Goal Distribution - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>การกระจายเป้าหมายลูกเทรน</CardTitle>
                <CardDescription>สัดส่วนลูกเทรนแบ่งตามเป้าหมาย</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={goalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {goalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Clients */}
            <Card>
              <CardHeader>
                <CardTitle>ลูกเทรนที่มีผลงานดี</CardTitle>
                <CardDescription>Top 5 ลูกเทรนที่ทำผลงานได้ดีที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{client.name}</p>
                          <Badge variant="secondary">{client.sessions} เซสชัน</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                              style={{ width: `${client.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{client.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ผลการดำเนินงานรายเดือน</CardTitle>
                <CardDescription>เปรียบเทียบเซสชันและลูกเทรน</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="เซสชัน"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clients"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      name="ลูกเทรน"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>เป้าหมายและผลงาน</CardTitle>
                <CardDescription>ความคืบหน้าตามเป้าหมายที่กำหนด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">เซสชันรายเดือน</span>
                      <span className="text-sm font-medium">{totalSessions}/120</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((totalSessions / 120) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">ลูกเทรนใหม่</span>
                      <span className="text-sm font-medium">{activeClients}/15</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((activeClients / 15) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">อัตราความสำเร็จ</span>
                      <span className="text-sm font-medium">{goalsAchieved}%/100%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${goalsAchieved}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          {/* Client Statistics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ลูกเทรนทั้งหมด</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeClients} คน กำลังใช้งาน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ลูกเทรนใหม่</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.filter(c => {
                    const joinDate = new Date(c.joinDate);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return joinDate > monthAgo;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  ในเดือนนี้
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราการกลับมา</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  กลับมาทำเซสชันต่อเนื่อง
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ค่าเฉลี่ย/คน</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgSessionsPerClient}</div>
                <p className="text-xs text-muted-foreground">
                  เซสชันต่อเดือน
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Client Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>สถานะลูกเทรน</CardTitle>
                <CardDescription>การกระจายตามสถานะปัจจุบัน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      status: 'active', 
                      label: 'กำลังใช้งาน', 
                      count: clients.filter(c => c.status === 'active').length,
                      color: 'from-green-500 to-green-600',
                      icon: UserCheck
                    },
                    { 
                      status: 'inactive', 
                      label: 'ไม่ใช้งาน', 
                      count: clients.filter(c => c.status === 'inactive').length,
                      color: 'from-gray-400 to-gray-500',
                      icon: UserX
                    },
                  ].map((item) => {
                    const percentage = (item.count / clients.length) * 100;
                    return (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.count} คน ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>การกระจายตามเป้าหมาย</CardTitle>
                <CardDescription>สัดส่วนลูกเทรนแต่ละเป้าหมาย</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goalData.map((goal, index) => {
                    const percentage = (goal.value / clients.length) * 100;
                    return (
                      <div key={goal.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{goal.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.value} คน ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Performance List */}
          <Card>
            <CardHeader>
              <CardTitle>ประสิทธิภาพลูกเทรน</CardTitle>
              <CardDescription>ตารางแสดงผลการทำงานของลูกเทรนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.slice(0, 10).map((client, index) => {
                  const clientSessions = sessions.filter(s => s.clientId === client.id && s.status === 'completed').length;
                  const progress = Math.floor(Math.random() * 40) + 60; // Mock progress
                  
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 font-semibold text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{client.name}</p>
                            <Badge 
                              variant={client.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {client.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{clientSessions} เซสชัน</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>{client.goal}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab (แทน Financial) */}
        <TabsContent value="financial" className="space-y-4">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราการเข้าร่วม</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +3% จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ความพึงพอใจ</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5.0</div>
                <p className="text-xs text-muted-foreground">
                  จาก 45 รีวิว
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">เซสชันต่อเนื่อง</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">
                  ทำตามโปรแกรมสม่ำเสมอ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7/5.0</div>
                <p className="text-xs text-muted-foreground">
                  จากลูกเทรนทั้งหมด
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>อัตราการเข้าร่วมรายสัปดาห์</CardTitle>
                <CardDescription>เปอร์เซ็นต์การเข้าร่วมเซสชันที่จอง</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={Array.from({ length: 12 }, (_, i) => ({
                    week: `สัปดาห์ ${i + 1}`,
                    attendance: Math.floor(Math.random() * 15) + 80,
                  }))}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorAttendance)"
                      name="อัตราเข้าร่วม (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ความพึงพอใจตามประเภท</CardTitle>
                <CardDescription>คะแนนความพอใจแบ่งตามประเภทเซสชัน</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { type: 'เสริมแรง', score: 4.8 },
                    { type: 'คาร์ดิโอ', score: 4.6 },
                    { type: 'ยืดหยุ่น', score: 4.9 },
                    { type: 'ผสมผสาน', score: 4.7 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="type" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="คะแนน" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>ฟีดแบ็กล่าสุด</CardTitle>
              <CardDescription>ความคิดเห็นจากลูกเทรนในสัปดาห์นี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    client: 'นายสมชาย ใจดี',
                    rating: 5,
                    comment: 'โค้ชดูแลดีมาก ให้คำแนะนำชัดเจน ได้ผลลัพธ์ตามที่ต้องการ',
                    date: '2 วันที่แล้ว',
                  },
                  {
                    client: 'นางสาวมาลี สวยงาม',
                    rating: 5,
                    comment: 'ประทับใจมากค่ะ โปรแกรมเหมาะสม ไม่หนักเกินไป',
                    date: '3 วันที่แล้ว',
                  },
                  {
                    client: 'นายวิชัย แข็งแรง',
                    rating: 4,
                    comment: 'ดีครับ แต่อยากให้เพิ่มเวลาอบอุ่นร่างกายหน่อย',
                    date: '5 วันที่แล้ว',
                  },
                ].map((feedback, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 font-semibold text-sm">
                          {feedback.client.charAt(3)}
                        </div>
                        <div>
                          <p className="font-medium">{feedback.client}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{feedback.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-13">
                      "{feedback.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            รายงานที่บันทึกไว้
          </CardTitle>
          <CardDescription>รายงานที่สร้างไว้แล้วและพร้อมดาวน์โหลด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                title: 'รายงานความก้าวหน้าลูกเทรน - ธันวาคม 2024',
                date: '7 ธ.ค. 2024',
                type: 'PDF',
                size: '2.4 MB',
              },
              {
                title: 'สรุปการออกกำลังกาย - Q4 2024',
                date: '1 ธ.ค. 2024',
                type: 'Excel',
                size: '1.8 MB',
              },
              {
                title: 'รายงานรายได้ - พฤศจิกายน 2024',
                date: '30 พ.ย. 2024',
                type: 'PDF',
                size: '3.1 MB',
              },
            ].map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {report.date} • {report.type} • {report.size}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}