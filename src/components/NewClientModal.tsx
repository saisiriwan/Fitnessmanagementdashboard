import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';
import { TrainingGoal, TRAINING_GOALS } from '../types/goals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    goal: '', // Legacy field - kept for old goal text
    primaryGoal: '' as TrainingGoal | '', // ✅ NEW: Training Goal (4 options)
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
    
    if (!formData.name || !formData.email || !formData.primaryGoal) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    // ✅ เช็ค duplicate email
    const existingClientWithEmail = clients.find(
      c => c.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (existingClientWithEmail) {
      if (existingClientWithEmail.userId) {
        // ลูกเทรนสมัคร account แล้ว → ไม่สามารถเพิ่มซ้ำได้
        toast.error('อีเมลนี้มีการสมัครใช้งานแล้ว ไม่สามารถเพิ่มซ้ำได้');
        return;
      } else {
        // มี profile แล้วแต่ยังไม่สมัคร (ไม่น่าจะเกิด แต่ป้องกันไว้)
        toast.warning('พบข้อมูลลูกเทรนที่ใช้อีเมลนี้อยู่แล้ว');
        return;
      }
    }

    // สร้าง client ใหม่
    const clientId = addClient({
      ...formData,
      goal: TRAINING_GOALS[formData.primaryGoal as TrainingGoal].label, // Set legacy goal field
      primaryGoal: formData.primaryGoal as TrainingGoal, // ✅ NEW: Set training goal
      status: 'active',
      tags: [],
      joinDate: new Date().toISOString().split('T')[0],
      trainers: [] // เริ่มต้นยังไม่มีเทรนเนอร์ รอให้ลูกเทรนเชื่อมโยงเอง
    });

    toast.success('เพิ่มลูกเทรนใหม่เรียบร้อยแล้ว!');
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
        <p className="text-xs text-muted-foreground">
          💡 อีเมลใช้ในการเชื่อมโยง account อัตโนมัติเมื่อลูกเทรนสมัครสมาชิก
        </p>
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

      {/* ✅ UPDATED: Training Goal Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="primaryGoal">เป้าหมาย *</Label>
        <Select
          value={formData.primaryGoal}
          onValueChange={(value) => setFormData(prev => ({ ...prev, primaryGoal: value as TrainingGoal }))}
        >
          <SelectTrigger id="primaryGoal" className="w-full">
            <SelectValue placeholder="กรอกเป้าหมายของโปรแกรม" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TRAINING_GOALS) as TrainingGoal[]).map((goalKey) => {
              const goal = TRAINING_GOALS[goalKey];
              return (
                <SelectItem key={goalKey} value={goalKey}>
                  <div className="flex items-center gap-2">
                    <span>{goal.icon}</span>
                    <span>{goal.label}</span>
                    <span className="text-xs text-gray-500">({goal.labelEn})</span>
                  </div>
                </SelectItem>
              );
            })}
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