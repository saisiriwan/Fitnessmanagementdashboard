import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Client } from './AppContext';
import { useApp } from './AppContext';

interface EditClientModalProps {
  client: Client;
  onSuccess: () => void;
}

export default function EditClientModal({ client, onSuccess }: EditClientModalProps) {
  const { updateClient } = useApp();
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    goal: client.goal,
    status: client.status,
    notes: client.notes || '',
    personalNotes: client.personalNotes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.goal) {
      toast.error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    updateClient(client.id, formData);
    toast.success('อัปเดตข้อมูลเรียบร้อยแล้ว');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="เช่น สมชาย ใจดี"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="081-234-5678"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">เป้าหมาย *</Label>
        <Input
          id="goal"
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          placeholder="เช่น ลดน้ำหนัก 5 กิโล, เพิ่มกล้ามเนื้อ"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">สถานะ *</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'paused' | 'inactive') =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="เลือกสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>กำลังออกกำลัง (Active)</span>
              </div>
            </SelectItem>
            <SelectItem value="paused">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>พักชั่วคราว (Paused)</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>ไม่ใช้งาน (Inactive)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          • Active: ลูกเทรนที่กำลังออกกำลังกายอย่างสม่ำเสมอ<br />
          • Paused: ลูกเทรนที่พักชั่วคราว (เจ็บป่วย, เดินทาง)<br />
          • Inactive: ลูกเทรนที่หยุดเทรนแล้ว
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">หมายเหตุทั่วไป</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="บันทึกข้อมูลทั่วไป เช่น ข้อจำกัดทางสุขภาพ, ความชอบ"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalNotes">โน้ตส่วนตัวของเทรนเนอร์ 💡</Label>
        <Textarea
          id="personalNotes"
          value={formData.personalNotes}
          onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
          placeholder="เช่น ชอบ Deadlift, เข่าเจ็บ, คุยเรื่องงานครั้งที่แล้ว (เห็นเฉพาะเทรนเนอร์)"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          💡 โน้ตนี้จะแสดงบน Dashboard เพื่อช่วยจดจำรายละเอียดสำคัญเกี่ยวกับลูกเทรน
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          บันทึกการแก้ไข
        </Button>
      </div>
    </form>
  );
}