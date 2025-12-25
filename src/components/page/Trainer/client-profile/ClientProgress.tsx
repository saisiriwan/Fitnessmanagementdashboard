import { useState, useEffect } from "react";
import { TrendingUp, Plus, Scale, Activity, Zap, Trophy } from "lucide-react";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import type { Client } from "../ClientProfilePage";

interface ClientProgressProps {
  client: Client;
}

// Interface สำหรับข้อมูล Progress (ถ้า Backend ส่งมาแบบนี้)
interface ProgressRecord {
  date: string;
  value: number;
}

export default function ClientProgress({ client }: ClientProgressProps) {
  const { id } = useParams<{ id: string }>();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [metricType, setMetricType] = useState<"weight" | "bodyFat" | "muscle">(
    "weight"
  );
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  // State เก็บข้อมูลกราฟ (เริ่มต้นเป็น array ว่าง)
  const [weightData, setWeightData] = useState<ProgressRecord[]>([]);
  const [bodyFatData, setBodyFatData] = useState<ProgressRecord[]>([]);
  const [muscleData, setMuscleData] = useState<ProgressRecord[]>([]);

  // Fetch Progress Data (ถ้ามี API)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!id) return;
      try {
        // ตัวอย่าง: GET /api/v1/clients/:id/metrics
        // (ถ้า Backend ยังไม่ทำ API นี้ มันจะ error แต่เราดัก catch ไว้แล้ว)
        const res = await api.get(`/clients/${id}/metrics`);

        // สมมติ Backend ส่งมาเป็น { weight: [], bodyFat: [], muscle: [] }
        if (res.data) {
          setWeightData(res.data.weight || []);
          setBodyFatData(res.data.bodyFat || []);
          setMuscleData(res.data.muscle || []);
        }
      } catch (err) {
        // ถ้ายังไม่มี API หรือ Error ให้ใช้ข้อมูล Mock ชั่วคราว (เพื่อไม่ให้หน้าขาว)
        console.log("Using mock progress data");
        setWeightData([
          { date: "2024-08-01", value: 78 },
          { date: "2024-09-23", value: 75 },
        ]);
        // ... (Mock อื่นๆ)
      }
    };
    fetchProgress();
  }, [id]);

  const handleUpdateMetric = async () => {
    if (!newValue) {
      toast.error("กรุณากรอกค่าที่ต้องการอัปเดต");
      return;
    }

    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) {
      toast.error("กรุณากรอกตัวเลขที่ถูกต้อง");
      return;
    }

    try {
      setLoading(true);
      // ยิง API อัปเดต (PUT หรือ POST)
      // ตัวอย่าง: POST /api/v1/clients/:id/metrics
      await api.post(`/clients/${id}/metrics`, {
        type: metricType,
        value: numValue,
        date: new Date().toISOString(),
      });

      toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
      setShowUpdateModal(false);
      setNewValue("");

      // อัปเดต State หน้าจอทันที (ไม่ต้องรอ fetch ใหม่)
      const newRecord = { date: new Date().toISOString(), value: numValue };
      if (metricType === "weight") setWeightData([...weightData, newRecord]);
      else if (metricType === "bodyFat")
        setBodyFatData([...bodyFatData, newRecord]);
      else if (metricType === "muscle")
        setMuscleData([...muscleData, newRecord]);
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const getLatestValue = (data: any[]) => {
    return data.length > 0 ? data[data.length - 1].value : null;
  };

  const getChange = (data: any[]) => {
    if (data.length < 2) return null;
    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return latest - previous;
  };

  const renderChart = (data: any[], color: string, unit: string) => {
    // (Logic การ Render Chart เหมือนเดิม)
    if (!data || data.length === 0)
      return <div className="chart-empty">ไม่มีข้อมูล</div>;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="chart-container">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div key={index} className="chart-bar-wrapper">
              <div
                className={`chart-bar ${color}`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.value} ${unit} - ${new Date(
                  point.date
                ).toLocaleDateString("th-TH")}`}
              ></div>
              <div className="chart-date">
                {new Date(point.date).getDate()}/
                {new Date(point.date).getMonth() + 1}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChangeIndicator = (change: number | null, unit: string) => {
    if (change === null) return null;

    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
      <div
        className={`change-indicator ${
          isPositive
            ? "text-green-600"
            : isNegative
            ? "text-red-600"
            : "text-gray-500"
        }`}
      >
        <TrendingUp className={`h-4 w-4 ${isNegative ? "rotate-180" : ""}`} />
        {isPositive ? "+" : ""}
        {change.toFixed(1)} {unit}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-navy-900">พัฒนาการร่างกาย</h3>
          <p className="text-sm text-slate-500">
            ติดตามการเปลี่ยนแปลงของน้ำหนักและสัดส่วน
          </p>
        </div>

        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogTrigger asChild>
            <Button className="bg-navy-900 hover:bg-navy-800 text-white shadow-md rounded-full px-6">
              <Plus className="h-4 w-4 mr-2" />
              อัปเดตข้อมูล
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>อัปเดตข้อมูลร่างกาย</DialogTitle>
              <DialogDescription>
                เลือกประเภทข้อมูลและกรอกค่าใหม่เพื่อบันทึกในประวัติ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    key: "weight",
                    label: "น้ำหนัก",
                    unit: "kg",
                    icon: Scale,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    border: "border-blue-100",
                  },
                  {
                    key: "bodyFat",
                    label: "ไขมัน",
                    unit: "%",
                    icon: Activity,
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                    border: "border-orange-100",
                  },
                  {
                    key: "muscle",
                    label: "กล้ามเนื้อ",
                    unit: "kg",
                    icon: Zap,
                    color: "text-green-600",
                    bg: "bg-green-50",
                    border: "border-green-100",
                  },
                ].map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setMetricType(metric.key as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      metricType === metric.key
                        ? `${metric.bg} ${metric.border} ring-2 ring-offset-1 ring-navy-900/10`
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                        metricType === metric.key ? "bg-white" : metric.bg
                      }`}
                    >
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <div className="text-xs font-medium text-navy-900">
                      {metric.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ({metric.unit})
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newValue" className="text-navy-900">
                  ค่า
                  {metricType === "weight"
                    ? "น้ำหนัก"
                    : metricType === "bodyFat"
                    ? "ไขมัน"
                    : "กล้ามเนื้อ"}
                  ใหม่
                </Label>
                <div className="relative">
                  <Input
                    id="newValue"
                    type="number"
                    step="0.1"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="pr-12 text-lg font-medium"
                    placeholder="0.0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    {metricType === "weight"
                      ? "kg"
                      : metricType === "bodyFat"
                      ? "%"
                      : "kg"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUpdateModal(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleUpdateMetric}
                disabled={loading}
                className="bg-navy-900 hover:bg-navy-800 text-white"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Metrics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              น้ำหนักปัจจุบัน
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Scale className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-navy-900">
                {getLatestValue(weightData) || client.metrics?.weight || "-"}
              </div>
              <span className="text-sm text-slate-400">kg</span>
            </div>
            <div className="mt-1">
              {renderChangeIndicator(getChange(weightData), "kg")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              เปอร์เซ็นต์ไขมัน
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-navy-900">
                {getLatestValue(bodyFatData) || client.metrics?.bodyFat || "-"}
              </div>
              <span className="text-sm text-slate-400">%</span>
            </div>
            <div className="mt-1">
              {renderChangeIndicator(getChange(bodyFatData), "%")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              มวลกล้ามเนื้อ
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-navy-900">
                {getLatestValue(muscleData) || client.metrics?.muscle || "-"}
              </div>
              <span className="text-sm text-slate-400">kg</span>
            </div>
            <div className="mt-1">
              {renderChangeIndicator(getChange(muscleData), "kg")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-white shadow-sm border-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">
                  แนวโน้มน้ำหนักตัว
                </CardTitle>
                <CardDescription>
                  ประวัติการเปลี่ยนแปลงน้ำหนักในช่วงที่ผ่านมา
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart(weightData, "bg-blue-500", "kg")}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">
                  เปอร์เซ็นต์ไขมัน
                </CardTitle>
                <CardDescription>Body Fat %</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart(bodyFatData, "bg-orange-500", "%")}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">
                  มวลกล้ามเนื้อ
                </CardTitle>
                <CardDescription>Muscle Mass (kg)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart(muscleData, "bg-green-500", "kg")}
          </CardContent>
        </Card>
      </div>

      {/* Performance Records (Placeholder) */}
      <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Personal Records (PR)
          </CardTitle>
          <CardDescription className="text-navy-200">
            สถิติที่ดีที่สุดในแต่ละท่าฝึก
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-medium text-white">
              ระบบบันทึก PR กำลังมาเร็วๆ นี้
            </h3>
            <p className="text-navy-200 text-sm max-w-xs mx-auto mt-1">
              คุณจะสามารถติดตามสถิติ New High ของท่า Squat, Bench Press,
              Deadlift และอื่นๆ ได้ที่นี่
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
