import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { TrainingGoal, TRAINING_GOALS } from '../types/goals';
import { Info } from 'lucide-react';

interface GoalsManagerProps {
  currentGoal?: TrainingGoal;
  goalNotes?: string;
  onSave: (goal: TrainingGoal, notes: string) => void;
  onCancel?: () => void;
}

export function GoalsManager({ currentGoal, goalNotes = '', onSave, onCancel }: GoalsManagerProps) {
  const [selectedGoal, setSelectedGoal] = React.useState<TrainingGoal>(currentGoal || 'weight_loss');
  const [notes, setNotes] = React.useState(goalNotes);

  const handleSave = () => {
    onSave(selectedGoal, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 เป้าหมายการฝึก</CardTitle>
        <CardDescription>
          เลือกเป้าหมายหลักของลูกเทรน เพื่อปรับโปรแกรมและติดตามผลที่เหมาะสม
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>เลือกเป้าหมายหลัก</Label>
          <RadioGroup
            value={selectedGoal}
            onValueChange={(value) => setSelectedGoal(value as TrainingGoal)}
            className="space-y-3"
          >
            {(Object.keys(TRAINING_GOALS) as TrainingGoal[]).map((goalKey) => {
              const goal = TRAINING_GOALS[goalKey];
              const isSelected = selectedGoal === goalKey;
              
              return (
                <div
                  key={goalKey}
                  className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:border-[#FF6B35]/50 ${
                    isSelected ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedGoal(goalKey)}
                >
                  <RadioGroupItem value={goalKey} id={goalKey} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={goalKey}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{goal.label}</span>
                          <span className="text-sm text-gray-500">({goal.labelEn})</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                      </div>
                    </Label>
                    
                    {/* Metrics Info */}
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-1.5">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          <span className="font-medium">ตัวชี้วัดที่ติดตาม:</span>{' '}
                          {goalKey === 'weight_loss' && 'น้ำหนัก, BMI, รอบหน้าท้อง, รอบสะโพก, การดื่มน้ำ'}
                          {goalKey === 'muscle_building' && 'รอบแขน, รอบขา, รอบไหล่, รอบอก, ปริมาณงาน'}
                          {goalKey === 'strength' && 'น้ำหนักสูงสุด, มวลกล้ามเนื้อ, 1RM ในท่าต่างๆ'}
                          {goalKey === 'general_health' && 'VO₂ Max, Heart Rate พัก, การฟื้นตัว, ความสม่ำเสมอ'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-notes">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
          <Textarea
            id="goal-notes"
            placeholder="เช่น เป้าหมายระยะยาว, ข้อจำกัด, หรือรายละเอียดเพิ่มเติม..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
          )}
          <Button onClick={handleSave} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
            บันทึกเป้าหมาย
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
