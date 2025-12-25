import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileDown,
  FileText,
  CheckCircle2,
  User,
  Weight,
  Dumbbell,
  BarChart3,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
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
} from "recharts";
import api from "@/lib/api";
import {
  format,
  subDays,
  isSameDay,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import { th } from "date-fns/locale";

const PRIMARY_COLOR = "#002140";
const ACCENT_COLOR = "#FF6B35";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  color: string;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  subtitle,
  color,
}: StatCardProps) {
  const TrendIcon =
    trend === "up"
      ? ArrowUpRight
      : trend === "down"
      ? ArrowDownRight
      : Activity;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center`}
            style={{ background: color }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && trend && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                trend === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : trend === "down"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <TrendIcon className="h-3 w-3" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">{title}</p>
          <div
            className="text-[#002140]"
            style={{ fontSize: "1.75rem", fontWeight: 700 }}
          >
            {value}
          </div>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [clients, setClients] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Corrected endpoint from /sessions to /schedules
        const [clientsRes, sessionsRes] = await Promise.all([
          api.get("/clients"),
          api.get("/schedules"),
        ]);

        // Map Data
        const mappedClients = (clientsRes.data || []).map((c: any) => ({
          ...c,
          id: c.id?.toString(),
          joinDate: c.created_at || c.join_date || new Date().toISOString(),
          phone: c.phone || "-",
          status: c.status || "active",
          goal: c.goal || "General Fitness",
          // Ensure weights are numbers
          currentWeight: Number(c.current_weight) || 0,
          targetWeight: Number(c.target_weight) || 0,
          metrics: c.metrics || {},
        }));

        const mappedSessions = (sessionsRes.data || []).map((s: any) => ({
          ...s,
          clientId: s.client_id
            ? s.client_id.toString()
            : s.clientId?.toString() || "",
          status: s.status,
          date: s.start_time ? new Date(s.start_time) : new Date(),
        }));

        setClients(mappedClients);
        setSessions(mappedSessions);

        if (mappedClients.length > 0) {
          setSelectedClientId(mappedClients[0].id);
        }
      } catch (err) {
        console.error("Failed to load report data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Real Data Calculations ---

  // 1. Overall Stats
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalSessions = completedSessions.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const avgSessionsPerClient =
    activeClients > 0 ? (totalSessions / activeClients).toFixed(1) : 0;

  // Calculate Attendance Rate (Completed / (Completed + Cancelled/NoShow))
  // Simplified: Completed / Total Past Sessions
  const pastSessions = sessions.filter((s) => new Date(s.date) < new Date());
  const attendanceRate =
    pastSessions.length > 0
      ? Math.round((completedSessions.length / pastSessions.length) * 100)
      : 100;

  // 2. Overview Charts Data (Last 30 Days)
  const overviewData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");

      // Count sessions on this day
      const sessionsOnDay = sessions.filter(
        (s) => isSameDay(new Date(s.date), date) && s.status === "completed"
      ).length;

      // Count scheduled
      const scheduledOnDay = sessions.filter(
        (s) => isSameDay(new Date(s.date), date) && s.status === "scheduled"
      ).length;

      data.push({
        date: format(date, "d MMM", { locale: th }),
        sessions: sessionsOnDay,
        scheduled: scheduledOnDay,
      });
    }
    return data;
  }, [sessions]);

  // 3. Selected Client Data
  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

  const clientCompletedSessions = sessions.filter(
    (s) => s.clientId === selectedClientId && s.status === "completed"
  );

  // Client Attendance (Last 6 months)
  const clientAttendanceData = useMemo(() => {
    if (!selectedClientId) return [];

    const data = [];
    const today = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today,
    });

    for (const monthStart of months) {
      const monthEnd = endOfMonth(monthStart);
      // Count sessions in this month
      const count = sessions.filter(
        (s) =>
          s.clientId === selectedClientId &&
          s.status === "completed" &&
          new Date(s.date) >= monthStart &&
          new Date(s.date) <= monthEnd
      ).length;

      data.push({
        month: format(monthStart, "MMM", { locale: th }),
        attended: count,
      });
    }
    return data;
  }, [sessions, selectedClientId]);

  // Client Progress - Real Weight vs Target
  // NOTE: Since we don't have history API, we show relevant current state
  // or a simple comparison point.
  // We can create a simple 2-point line if we had "initialWeight".
  // Assuming client has initialWeight, currentWeight.
  const clientProgressData = useMemo(() => {
    if (!selectedClient) return [];
    const data = [];

    // Point 1: Join Date (Initial Weight)
    if (selectedClient.initial_weight || selectedClient.initialWeight) {
      // check both cases
      data.push({
        name: "เริ่มต้น",
        weight: selectedClient.initial_weight || selectedClient.initialWeight,
        target: selectedClient.targetWeight,
      });
    }

    // Point 2: Current
    data.push({
      name: "ปัจจุบัน",
      weight: selectedClient.currentWeight,
      target: selectedClient.targetWeight,
    });

    // Point 3: Target (Future)
    data.push({
      name: "เป้าหมาย",
      weight: null, // projection
      target: selectedClient.targetWeight,
    });

    return data;
  }, [selectedClient]);

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-navy-900" />
      </div>
    );
  }

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
                <h1 className="text-[#002140] text-2xl font-bold">
                  รายงานและสถิติ
                </h1>
                <p className="text-muted-foreground">
                  วิเคราะห์และติดตามความก้าวหน้า (จากข้อมูลจริง)
                </p>
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
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Spreadsheet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  CSV File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
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
                trend="neutral"
                icon={Calendar}
                subtitle="สะสมทั้งหมด"
                color={PRIMARY_COLOR}
              />
              <StatCard
                title="ลูกเทรนที่ใช้งาน"
                value={activeClients}
                trend="neutral"
                icon={Users}
                subtitle={`จาก ${clients.length} คนทั้งหมด`}
                color={ACCENT_COLOR}
              />
              <StatCard
                title="เฉลี่ยการฝึก/คน"
                value={avgSessionsPerClient}
                icon={Activity}
                subtitle="ครั้ง"
                color="#10B981"
              />
              <StatCard
                title="อัตราการเข้าฝึก"
                value={`${attendanceRate}%`}
                trend="up"
                icon={CheckCircle2}
                subtitle="จากนัดหมายทั้งหมด"
                color="#8B5CF6"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Trend */}
              <Card className="border-[#002140]/10 shadow-sm col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#002140]" />
                    สถิติการฝึก 30 วันล่าสุด
                  </CardTitle>
                  <CardDescription>
                    จำนวนการฝึกที่สำเร็จเทียบกับที่นัดหมาย
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={overviewData}>
                      <defs>
                        <linearGradient
                          id="colorSessions"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={PRIMARY_COLOR}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={PRIMARY_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        stroke="#6b7280"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke={PRIMARY_COLOR}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSessions)"
                        name="การฝึกที่สำเร็จ"
                      />
                      <Area
                        type="monotone"
                        dataKey="scheduled"
                        stroke={ACCENT_COLOR}
                        strokeWidth={2}
                        fillOpacity={0.1}
                        fill={ACCENT_COLOR}
                        name="นัดหมายทั้งหมด"
                      />
                    </AreaChart>
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
                      <CardDescription>
                        วิเคราะห์ความก้าวหน้าและพัฒนาการรายบุคคล
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
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
                        <AvatarFallback
                          className="bg-gradient-to-br from-[#002140] to-[#FF6B35] text-white"
                          style={{ fontSize: "2rem" }}
                        >
                          {selectedClient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className="text-[#002140]"
                              style={{ fontSize: "1.5rem", fontWeight: 700 }}
                            >
                              {selectedClient.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {selectedClient.goal}
                            </p>
                          </div>
                          <Badge
                            className={
                              selectedClient.status === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }
                          >
                            {selectedClient.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-muted-foreground">วันที่เริ่ม</p>
                            <p className="text-[#002140]">
                              {new Date(
                                selectedClient.joinDate
                              ).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              การฝึกทั้งหมด
                            </p>
                            <p className="text-[#002140]">
                              {clientCompletedSessions.length} ครั้ง
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">อีเมล</p>
                            <p
                              className="text-[#002140] truncate"
                              title={selectedClient.email}
                            >
                              {selectedClient.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">โทร</p>
                            <p className="text-[#002140]">
                              {selectedClient.phone}
                            </p>
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
                    value={`${selectedClient.currentWeight || "-"} kg`}
                    icon={Weight}
                    trend="neutral"
                    subtitle={`เป้าหมาย: ${
                      selectedClient.targetWeight || "-"
                    } kg`}
                    color="#10B981"
                  />
                  <StatCard
                    title="มวลกล้ามเนื้อ"
                    value={`${selectedClient.metrics?.muscle || "-"} kg`}
                    icon={Dumbbell}
                    trend="neutral"
                    subtitle="ล่าสุด"
                    color="#002140"
                  />
                  <StatCard
                    title="ไขมันในร่างกาย"
                    value={`${selectedClient.metrics?.bodyFat || "-"}%`}
                    icon={Activity}
                    trend="neutral"
                    subtitle="ล่าสุด"
                    color="#FF6B35"
                  />
                  <StatCard
                    title="การฝึกสะสม"
                    value={clientCompletedSessions.length}
                    icon={Target}
                    trend="neutral"
                    subtitle="ครั้ง"
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
                        บันทึกน้ำหนัก
                      </CardTitle>
                      <CardDescription>
                        เปรียบเทียบ น้ำหนักเริ่มต้น vs ปัจจุบัน vs เป้าหมาย
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full flex items-center justify-center">
                        {clientProgressData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={clientProgressData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                              />
                              <XAxis dataKey="name" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" domain={[0, "auto"]} />
                              <Tooltip contentStyle={{ borderRadius: "8px" }} />
                              <Bar
                                dataKey="weight"
                                fill={PRIMARY_COLOR}
                                name="น้ำหนักจริง"
                                radius={[4, 4, 0, 0]}
                                barSize={50}
                              />
                              <Bar
                                dataKey="target"
                                fill={ACCENT_COLOR}
                                name="เป้าหมาย"
                                radius={[4, 4, 0, 0]}
                                barSize={50}
                                opacity={0.5}
                              />
                              <Legend />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-muted-foreground">
                            ไม่มีข้อมูลน้ำหนัก
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance */}
                  <Card className="border-[#002140]/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#10B981]" />
                        การเข้าร่วมการฝึก (6 เดือนล่าสุด)
                      </CardTitle>
                      <CardDescription>
                        จำนวนครั้งที่ฝึกสำเร็จในแต่ละเดือน
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={clientAttendanceData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="attended"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                            name="จำนวนครั้ง"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* If no selected client */}
            {!selectedClient && clients.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                ยังไม่มีข้อมูลลูกเทรน
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
