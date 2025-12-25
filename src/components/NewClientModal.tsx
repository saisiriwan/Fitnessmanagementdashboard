import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';

interface NewClientModalProps {
  onClientCreated: (clientId: string) => void;
}

export default function NewClientModal({ onClientCreated }: NewClientModalProps) {
  const { addClient, clients } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    goal: '',
    notes: ''
  });
  const [duplicateNameWarning, setDuplicateNameWarning] = useState<string | null>(null);

  const checkDuplicateName = (name: string) => {
    if (!name.trim()) {
      setDuplicateNameWarning(null);
      return;
    }

    const duplicateClients = clients.filter(
      client => client.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (duplicateClients.length > 0) {
      setDuplicateNameWarning(
        `พบชื่อซ้ำกับลูกเทรนที่มีอยู่แล้ว (${duplicateClients.length} คน) แนะนำให้ตั้งชื่อเล่นเพื่อแยกความแตกต่าง`
      );
    } else {
      setDuplicateNameWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.goal) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    const clientId = addClient({
      ...formData,
      status: 'active',
      tags: [],
      joinDate: new Date().toISOString().split('T')[0]
    });

    toast.success('เพิ่มลูกเทรนใหม่เรียบร้อยแล้ว');
    onClientCreated(clientId);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check for duplicate name when name field changes
    if (field === 'name') {
      checkDuplicateName(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="กรอกชื่อ-นามสกุล"
          required
        />
        {duplicateNameWarning && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {duplicateNameWarning}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">ชื่อเล่น (สำหรับแยกความแตกต่าง)</Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) => handleChange('nickname', e.target.value)}
          placeholder="เช่น มลิวัน 1, มลิวัน 2"
        />
        <p className="text-xs text-muted-foreground">
          ใช้ชื่อเล่นเพื่อแยกความแตกต่างเมื่อมีชื่อซ้ำกัน
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">อีเมล *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="กรอกอีเมล"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="กรอกเบอร์โทรศัพท์"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">เป้าหมาย *</Label>
        <Select onValueChange={(value) => handleChange('goal', value)}>
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
        <Label htmlFor="notes">หมายเหตุ</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="ข้อมูลเพิ่มเติม เช่น ประวัติการบาดเจ็บ อาหารที่แพ้"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          บันทึก
        </Button>
      </div>
    </form>
  );
}