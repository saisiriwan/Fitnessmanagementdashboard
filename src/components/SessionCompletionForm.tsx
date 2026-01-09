import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Star, Plus, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface SessionCompletionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SessionCompletionData) => void;
  clientName: string;
  defaultDate: string; // ISO string
}

export interface SessionCompletionData {
  type: 'strength' | 'cardio' | 'flexibility' | 'recovery';
  startTime: string; // ISO string
  endTime: string; // ISO string
  rating: number; // 1-5
  bodyWeight?: number; // kg
  summary: string; // Feedback from trainer
  improvements?: string;
  nextGoals?: string;
  achievements: string[];
}

export default function SessionCompletionForm({
  open,
  onClose,
  onSubmit,
  clientName,
  defaultDate
}: SessionCompletionFormProps) {
  const [type, setType] = useState<'strength' | 'cardio' | 'flexibility' | 'recovery'>('strength');
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(defaultDate);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  });
  const [endTime, setEndTime] = useState(() => {
    const date = new Date(defaultDate);
    date.setHours(date.getHours() + 1); // Default 1 hour later
    return date.toISOString().slice(0, 16);
  });
  const [rating, setRating] = useState(5);
  const [bodyWeight, setBodyWeight] = useState('');
  const [summary, setSummary] = useState('');
  const [improvements, setImprovements] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState('');

  const handleAddAchievement = () => {
    if (achievementInput.trim() && achievements.length < 5) {
      setAchievements([...achievements, achievementInput.trim()]);
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validation
    if (!summary.trim()) {
      toast.error('กรุณากรอกบันทึกจากเทรนเนอร์');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast.error('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    const data: SessionCompletionData = {
      type,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      rating,
      bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      summary: summary.trim(),
      improvements: improvements.trim() || undefined,
      nextGoals: nextGoals.trim() || undefined,
      achievements: achievements.length > 0 ? achievements : []
    };

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="session-completion-description">
        <DialogHeader>
          <DialogTitle>สรุปผลการฝึก - {clientName}</DialogTitle>
          <DialogDescription id="session-completion-description">
            กรอกข้อมูลเพิ่มเติมเพื่อสร้างการ์ดสรุปผลที่ครบถ้วน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Type */}
          <div className="space-y-2">
            <Label>ประเภทการฝึก *</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as any)}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setType('strength')}>
                  <RadioGroupItem value="strength" id="type-strength" />
                  <Label htmlFor="type-strength" className="cursor-pointer">💪 Strength</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setType('cardio')}>
                  <RadioGroupItem value="cardio" id="type-cardio" />
                  <Label htmlFor="type-cardio" className="cursor-pointer">🏃 Cardio</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setType('flexibility')}>
                  <RadioGroupItem value="flexibility" id="type-flexibility" />
                  <Label htmlFor="type-flexibility" className="cursor-pointer">🧘 Flexibility</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setType('recovery')}>
                  <RadioGroupItem value="recovery" id="type-recovery" />
                  <Label htmlFor="type-recovery" className="cursor-pointer">😌 Recovery</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">เวลาเริ่มต้น *</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">เวลาสิ้นสุด *</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>ให้คะแนนการฝึกวันนี้ *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-[#FF6B35] text-[#FF6B35]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">({rating}/5 ดาว)</span>
            </div>
          </div>

          {/* Body Weight */}
          <div className="space-y-2">
            <Label htmlFor="body-weight">น้ำหนักตัววันนี้ (kg) - ถ้ามีชั่ง</Label>
            <Input
              id="body-weight"
              type="number"
              step="0.1"
              placeholder="เช่น 75.5"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ใช้สำหรับติดตามความก้าวหน้าด้านน้ำหนักตัว
            </p>
          </div>

          {/* Summary/Feedback */}
          <div className="space-y-2">
            <Label htmlFor="summary">บันทึกจากเทรนเนอร์ *</Label>
            <Textarea
              id="summary"
              placeholder="เช่น การฝึกวันนี้ดีมาก ฟอร์มดีขึ้นเยอะ ให้กำลังใจลูกเทรนต่อไป..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">พัฒนาการที่เห็นได้ชัด - ถ้ามี</Label>
            <Input
              id="improvements"
              placeholder="เช่น +5kg on Bench Press, วิ่งได้เร็วขึ้น 10 วินาที"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
            />
          </div>

          {/* Next Goals */}
          <div className="space-y-2">
            <Label htmlFor="next-goals">เป้าหมายครั้งหน้า - ถ้ามี</Label>
            <Input
              id="next-goals"
              placeholder="เช่น พยายามยก 50kg ใน Squat, วิ่ง 5km ใน 30 นาที"
              value={nextGoals}
              onChange={(e) => setNextGoals(e.target.value)}
            />
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <Label>ความสำเร็จที่ทำได้วันนี้ - ถ้ามี</Label>
            <div className="flex gap-2">
              <Input
                placeholder="เช่น ยกได้ 100kg ครั้งแรก 🎉"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddAchievement}
                disabled={!achievementInput.trim() || achievements.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {achievement}
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              กด Enter หรือคลิก + เพื่อเพิ่ม (สูงสุด 5 รายการ)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
            >
              ต่อไป: สร้างการ์ดสรุปผล
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
