import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Target, 
  Edit, 
  Save, 
  X,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  Activity,
  Zap
} from 'lucide-react';
import { useApp, Client } from '../AppContext';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface ClientGoalsProps {
  client: Client;
}

const goalTypeOptions = [
  { value: 'weight-loss', label: 'ลดน้ำหนัก', icon: TrendingDown, color: 'text-red-500' },
  { value: 'muscle-gain', label: 'เพิ่มกล้ามเนื้อ', icon: TrendingUp, color: 'text-green-500' },
  { value: 'strength', label: 'เพิ่มพละกำลัง', icon: Dumbbell, color: 'text-blue-500' },
  { value: 'endurance', label: 'เพิ่มความอดทน', icon: Activity, color: 'text-purple-500' },
  { value: 'flexibility', label: 'เพิ่มความยืดหยุ่น', icon: Zap, color: 'text-orange-500' },
  { value: 'custom', label: 'กำหนดเอง', icon: Target, color: 'text-gray-500' }
] as const;

export default function ClientGoals({ client }: ClientGoalsProps) {
  const { updateClient, sessions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [goalType, setGoalType] = useState<string>(client.goals?.goalType || 'weight-loss');
  const [targetWeight, setTargetWeight] = useState(client.goals?.targetWeight?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(client.goals?.currentWeight?.toString() || '');
  const [targetBodyFat, setTargetBodyFat] = useState(client.goals?.targetBodyFat?.toString() || '');
  const [targetDate, setTargetDate] = useState(client.goals?.targetDate || '');
  const [customGoal, setCustomGoal] = useState(client.goals?.customGoal || '');
  const [notes, setNotes] = useState(client.goals?.notes || '');

  // Get latest body weight from sessions
  const latestBodyWeight = React.useMemo(() => {
    const sessionsWithWeight = sessions
      .filter(s => s.clientId === client.id && s.bodyWeight)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sessionsWithWeight[0]?.bodyWeight;
  }, [sessions, client.id]);

  // Auto-update current weight from sessions if not manually set
  useEffect(() => {
    if (!currentWeight && latestBodyWeight) {
      setCurrentWeight(latestBodyWeight.toString());
    }
  }, [latestBodyWeight, currentWeight]);

  const handleSave = () => {
    // Validation
    if (goalType === 'weight-loss' || goalType === 'muscle-gain') {
      if (!targetWeight) {
        toast.error('กรุณากรอกน้ำหนักเป้าหมาย');
        return;
      }
    }

    if (goalType === 'custom' && !customGoal) {
      toast.error('กรุณากรอกเป้าหมาย');
      return;
    }

    // Save goals
    updateClient(client.id, {
      goals: {
        goalType: goalType as any,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : undefined,
        targetDate: targetDate || undefined,
        customGoal: customGoal || undefined,
        notes: notes || undefined,
        createdAt: client.goals?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    setIsEditing(false);
    toast.success('บันทึกเป้าหมายสำเร็จ');
  };

  const handleCancel = () => {
    // Reset form
    setGoalType(client.goals?.goalType || 'weight-loss');
    setTargetWeight(client.goals?.targetWeight?.toString() || '');
    setCurrentWeight(client.goals?.currentWeight?.toString() || '');
    setTargetBodyFat(client.goals?.targetBodyFat?.toString() || '');
    setTargetDate(client.goals?.targetDate || '');
    setCustomGoal(client.goals?.customGoal || '');
    setNotes(client.goals?.notes || '');
    setIsEditing(false);
  };

  // Calculate progress
  const progress = React.useMemo(() => {
    if (!client.goals) return null;
    
    const current = latestBodyWeight || client.goals.currentWeight;
    const target = client.goals.targetWeight;
    
    if (!current || !target) return null;

    const goalType = client.goals.goalType;
    if (goalType === 'weight-loss') {
      const totalLoss = (client.goals.currentWeight || current) - target;
      const currentLoss = (client.goals.currentWeight || current) - current;
      return totalLoss > 0 ? Math.min((currentLoss / totalLoss) * 100, 100) : 0;
    } else if (goalType === 'muscle-gain') {
      const totalGain = target - (client.goals.currentWeight || current);
      const currentGain = current - (client.goals.currentWeight || current);
      return totalGain > 0 ? Math.min((currentGain / totalGain) * 100, 100) : 0;
    }

    return null;
  }, [client.goals, latestBodyWeight]);

  const selectedGoalType = goalTypeOptions.find(opt => opt.value === goalType);
  const IconComponent = selectedGoalType?.icon || Target;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#FF6B35]" />
            เป้าหมาย
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // View Mode
          <div className="space-y-4">
            {!client.goals ? (
              <div className="text-center py-8">
                <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  ยังไม่ได้ตั้งเป้าหมาย
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  ตั้งเป้าหมาย
                </Button>
              </div>
            ) : (
              <>
                {/* Goal Type */}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className={`p-3 rounded-full bg-background ${selectedGoalType?.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ประเภทเป้าหมาย</p>
                    <p className="font-medium">{selectedGoalType?.label}</p>
                  </div>
                </div>

                {/* Weight Goals */}
                {(client.goals.goalType === 'weight-loss' || client.goals.goalType === 'muscle-gain') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">น้ำหนักปัจจุบัน</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {latestBodyWeight || client.goals.currentWeight || '-'}
                          {(latestBodyWeight || client.goals.currentWeight) && ' kg'}
                        </p>
                      </div>
                      <div className="p-3 bg-[#FF6B35]/10 rounded-lg">
                        <p className="text-xs text-[#FF6B35] mb-1">เป้าหมาย</p>
                        <p className="text-2xl font-bold text-[#FF6B35]">
                          {client.goals.targetWeight || '-'}
                          {client.goals.targetWeight && ' kg'}
                        </p>
                      </div>
                    </div>

                    {progress !== null && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground">ความก้าวหน้า</p>
                          <p className="text-sm font-medium">{progress.toFixed(1)}%</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}

                {/* Body Fat */}
                {client.goals.targetBodyFat && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">เป้าหมายไขมันในร่างกาย</p>
                    <p className="font-medium">{client.goals.targetBodyFat}%</p>
                  </div>
                )}

                {/* Custom Goal */}
                {client.goals.customGoal && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">เป้าหมาย</p>
                    <p className="font-medium">{client.goals.customGoal}</p>
                  </div>
                )}

                {/* Target Date */}
                {client.goals.targetDate && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">วันที่ต้องการบรรลุเป้าหมาย</p>
                      <p className="font-medium">
                        {format(new Date(client.goals.targetDate), 'd MMMM yyyy', { locale: th })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {client.goals.notes && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
                    <p className="text-sm leading-relaxed">{client.goals.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Goal Type */}
            <div className="space-y-2">
              <Label>ประเภทเป้าหมาย *</Label>
              <RadioGroup value={goalType} onValueChange={setGoalType}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goalTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                          goalType === option.value
                            ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setGoalType(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                        <Label
                          htmlFor={`goal-${option.value}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Icon className={`h-4 w-4 ${option.color}`} />
                          <span className="text-sm">{option.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Weight Fields */}
            {(goalType === 'weight-loss' || goalType === 'muscle-gain') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-weight">น้ำหนักปัจจุบัน (kg)</Label>
                  <Input
                    id="current-weight"
                    type="number"
                    step="0.1"
                    placeholder="เช่น 75.5"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                  />
                  {latestBodyWeight && (
                    <p className="text-xs text-muted-foreground">
                      น้ำหนักล่าสุดจากการฝึก: {latestBodyWeight} kg
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-weight">น้ำหนักเป้าหมาย (kg) *</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    step="0.1"
                    placeholder="เช่น 70"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Body Fat */}
            <div className="space-y-2">
              <Label htmlFor="target-bodyfat">เป้าหมายไขมันในร่างกาย (%) - ถ้ามี</Label>
              <Input
                id="target-bodyfat"
                type="number"
                step="0.1"
                placeholder="เช่น 15"
                value={targetBodyFat}
                onChange={(e) => setTargetBodyFat(e.target.value)}
              />
            </div>

            {/* Custom Goal */}
            {goalType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-goal">เป้าหมาย *</Label>
                <Input
                  id="custom-goal"
                  placeholder="เช่น วิ่ง 5 กิโลเมตร ภายใน 30 นาที"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                />
              </div>
            )}

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="target-date">วันที่ต้องการบรรลุเป้าหมาย</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="goal-notes">หมายเหตุ</Label>
              <Textarea
                id="goal-notes"
                placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับเป้าหมาย..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
