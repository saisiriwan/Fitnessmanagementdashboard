import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardEdit,
  Calendar as CalendarIcon,
  TrendingUp,
  StickyNote,
  Dumbbell,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import ClientSchedule from "./client-profile/ClientSchedule";
import ClientProgram from "./client-profile/ClientProgram";
import ClientProgress from "./client-profile/ClientProgress";
import ClientNotes from "./client-profile/ClientNotes";
import EditClientModal from "./EditClientModal";
import { toast } from "sonner";

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive" | "paused";
  joinDate?: string;
  goal?: string;
  currentProgram?: number;
  initialWeight?: number;
  currentWeight?: number;
  targetWeight?: number;
  notes?: string;
  tags?: string[];
  metrics?: {
    weight?: number;
    bodyFat?: number;
    muscle?: number;
  };
}

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const activeTab = searchParams.get("tab") || "schedule";

  const fetchClientData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // 1. Fetch Client Details
      const clientRes = await api.get(`/clients/${id}`);
      setClient(clientRes.data);

      // 2. Fetch Sessions for stats
      const sessionRes = await api.get(`/clients/${id}/sessions`);
      setSessions(sessionRes.data || []);
    } catch (err) {
      console.error("Failed to fetch client data", err);
      toast.error("ไม่สามารถโหลดข้อมูลลูกเทรนได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่พบข้อมูลลูกเทรน</p>
        <Button onClick={() => navigate("/trainer/clients")} className="mt-4">
          กลับไปรายชื่อลูกเทรน
        </Button>
      </div>
    );
  }

  const handleStartSession = async () => {
    try {
      const res = await api.post("/sessions", {
        client_id: client.id,
        date: new Date().toISOString(),
        status: "in-progress",
        notes: "Started from Client Profile",
      });
      navigate(`/trainer/sessions/${res.data.id}/log`);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเริ่มเซสชันได้");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "กำลังออกกำลัง", variant: "default" as const },
      paused: { label: "พักชั่วคราว", variant: "secondary" as const },
      inactive: { label: "ไม่ได้ใช้งาน", variant: "outline" as const },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  const statusBadge = getStatusBadge(client.status || "active");

  // Get last session date and upcoming session
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");

  const nextSession = upcomingSessions.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header - ข้อมูลระบุตัวตน */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/trainer/clients")}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-navy-900">
                {client.name}
              </h1>
              <Badge
                variant={statusBadge.variant}
                className="text-xs px-2.5 py-1"
              >
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {client.email} {client.phone && `• ${client.phone}`}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                แก้ไขข้อมูล
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-lg"
              aria-describedby="edit-client-profile-description"
            >
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลลูกเทรน</DialogTitle>
                <DialogDescription id="edit-client-profile-description">
                  อัปเดตข้อมูลส่วนตัวและสถานะของลูกเทรน
                </DialogDescription>
              </DialogHeader>
              <EditClientModal
                client={client}
                onSuccess={() => {
                  setShowEditDialog(false);
                  fetchClientData();
                }}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleStartSession}
            size="sm"
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          >
            <ClipboardEdit className="h-4 w-4 mr-2" />
            บันทึกการฝึก
          </Button>
        </div>
      </div>

      {/* 🎯 นัดหมายถัดไป */}
      {nextSession && (
        <Card className="border-[#FF6B35]/20 bg-[#FF6B35]/5 shadow-none">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#FF6B35]">
                    นัดหมายถัดไป
                  </p>
                  <p className="font-bold text-navy-900">
                    {new Date(nextSession.start_time).toLocaleDateString(
                      "th-TH",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    เวลา{" "}
                    {new Date(nextSession.start_time).toLocaleTimeString(
                      "th-TH",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    น.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">เหลืออีก</p>
                <p className="text-3xl font-bold text-[#FF6B35]">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(nextSession.start_time).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">วัน</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 📋 Tabs - รายละเอียดเพิ่มเติม */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams);
          params.set("tab", value);
          navigate(`/trainer/clients/${id}?${params.toString()}`, {
            replace: true,
          });
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="schedule" className="text-xs">
            <CalendarIcon className="h-3 w-3 mr-1" />
            ตารางเวลา
          </TabsTrigger>
          <TabsTrigger value="program" className="text-xs">
            <Dumbbell className="h-3 w-3 mr-1" />
            โปรแกรม
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            ความก้าวหน้า
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            <StickyNote className="h-3 w-3 mr-1" />
            หมายเหตุ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <ClientSchedule client={client} />
        </TabsContent>

        <TabsContent value="program" className="mt-6">
          <ClientProgram client={client} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ClientProgress client={client} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <ClientNotes client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
