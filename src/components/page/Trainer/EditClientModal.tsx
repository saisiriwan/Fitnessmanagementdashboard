import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "src/components/ui/alert-dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { toast } from "sonner";

interface ClientData {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  goal?: string;
  injuries?: string;
  gender?: string;
  weight?: number;
  height?: number;
  medicalConditions?: string;
  avatar?: string;
  status?: string;
  joinDate?: string;
}

interface EditClientModalProps {
  client: ClientData;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditClientModal({
  client,
  onSuccess,
  onCancel,
}: EditClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [existingClients, setExistingClients] = useState<
    { id: string; name: string }[]
  >([]);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    goal: "",
    notes: "",
    gender: "",
    weight: "",
    height: "",
    status: "",
  });

  useEffect(() => {
    // Fetch existing clients for duplicate check
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        const data = res.data || [];
        setExistingClients(
          data.map((c: any) => ({ id: c.id.toString(), name: c.name }))
        );
      } catch (err) {
        console.error("Failed to fetch clients list", err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        goal: client.goal || "",
        notes: client.injuries || "",
        gender: client.gender || "",
        weight: client.weight?.toString() || "",
        height: client.height?.toString() || "",
        status: client.status || "active",
      });
    }
  }, [client]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitData = async () => {
    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        goal: formData.goal,
        weight_kg: formData.weight ? parseFloat(formData.weight) : 0,
        height_cm: formData.height ? parseFloat(formData.height) : 0,
        gender: formData.gender || "Not Specified",
        injuries: formData.notes,
        medical_conditions: client.medicalConditions,
        avatar_url: client.avatar,
        status: formData.status,
        join_date: client.joinDate,
      };

      await api.put(`/clients/${client.id}`, payload);

      toast.success("แก้ไขข้อมูลเรียบร้อยแล้ว");
      onSuccess();
    } catch (err: any) {
      console.error("Error updating client:", err);
      toast.error(
        err.response?.data?.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล"
      );
    } finally {
      setLoading(false);
      setShowDuplicateAlert(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, อีเมล)");
      return;
    }

    // Check for duplicates (exclude self)
    const isDuplicate = existingClients.some(
      (c) =>
        c.name.toLowerCase() === formData.name.toLowerCase() &&
        c.id !== client.id.toString()
    );

    if (isDuplicate) {
      setShowDuplicateAlert(true);
      return;
    }

    await submitData();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">อีเมล *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="กรอกอีเมล"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="08x-xxx-xxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="ระบุเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">ชาย</SelectItem>
                <SelectItem value="Female">หญิง</SelectItem>
                <SelectItem value="Other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">น้ำหนัก (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="เช่น 60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">ส่วนสูง (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => handleChange("height", e.target.value)}
              placeholder="เช่น 170"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">เป้าหมาย</Label>
          <Select
            value={formData.goal}
            onValueChange={(value) => handleChange("goal", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกเป้าหมาย" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ลดน้ำหนัก">ลดน้ำหนัก</SelectItem>
              <SelectItem value="เพิ่มกล้ามเนื้อ">เพิ่มกล้ามเนื้อ</SelectItem>
              <SelectItem value="เพิ่มความแข็งแรง">เพิ่มความแข็งแรง</SelectItem>
              <SelectItem value="เพิ่มความอดทน">เพิ่มความอดทน</SelectItem>
              <SelectItem value="สุขภาพทั่วไป">สุขภาพทั่วไป</SelectItem>
              <SelectItem value="ฟื้นฟูสมรรถภาพ">ฟื้นฟูสมรรถภาพ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">สถานะ</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (กำลังเทรน)</SelectItem>
              <SelectItem value="paused">Paused (พักชั่วคราว)</SelectItem>
              <SelectItem value="inactive">Inactive (เลิกเทรน)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">หมายเหตุ / อาการบาดเจ็บ</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="ข้อมูลเพิ่มเติม เช่น ประวัติการบาดเจ็บ"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-navy-900 text-white hover:bg-navy-800"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>พบรายชื่อซ้ำในระบบ</AlertDialogTitle>
            <AlertDialogDescription>
              มีลูกเทรนชื่อ "{formData.name}" อยู่ในระบบแล้ว
              <br />
              หากเป็นคนเดียวกัน แนะนำให้ใช้ชื่อเดิม หรือเติม (2)
              ต่อท้ายหากเป็นคนละคน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>กลับไปแก้ไข</AlertDialogCancel>
            <AlertDialogAction onClick={submitData}>
              ยืนยัน (บันทึก)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
