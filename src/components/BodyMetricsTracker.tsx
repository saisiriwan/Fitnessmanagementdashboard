import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { TrainingGoal, TRAINING_GOALS, METRIC_DEFINITIONS, BodyMetrics } from '../types/goals';
import { Calendar } from 'lucide-react';

interface BodyMetricsTrackerProps {
  clientId: string;
  clientGoal: TrainingGoal;
  onSave: (metrics: Partial<BodyMetrics>) => void;
  onCancel?: () => void;
  initialData?: Partial<BodyMetrics>;
}

export function BodyMetricsTracker({ 
  clientId, 
  clientGoal, 
  onSave, 
  onCancel,
  initialData 
}: BodyMetricsTrackerProps) {
  const [date, setDate] = React.useState(
    initialData?.recordedAt ? new Date(initialData.recordedAt).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0]
  );
  const [metrics, setMetrics] = React.useState<Partial<BodyMetrics>>(initialData || {});
  const [notes, setNotes] = React.useState(initialData?.notes || '');

  const goalMetadata = TRAINING_GOALS[clientGoal];
  const relevantMetrics = METRIC_DEFINITIONS.filter(m => m.category === clientGoal);

  const handleMetricChange = (key: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setMetrics(prev => ({ ...prev, [key]: numValue }));
  };

  const handleSave = () => {
    const metricsToSave: Partial<BodyMetrics> = {
      ...metrics,
      clientId,
      recordedAt: new Date(date).toISOString(),
      notes: notes.trim() || undefined
    };

    // Calculate BMI if weight is provided and goal is weight_loss
    if (clientGoal === 'weight_loss' && metrics.weight) {
      // BMI calculation would need height, which we should add to client profile
      // For now, we'll let it be manually entered or calculated elsewhere
    }

    onSave(metricsToSave);
  };

  const hasAnyMetric = Object.keys(metrics).some(key => 
    key !== 'clientId' && key !== 'recordedAt' && key !== 'notes' && metrics[key as keyof BodyMetrics] !== undefined
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{goalMetadata.icon}</span>
          <div>
            <CardTitle>บันทึกข้อมูลร่างกาย</CardTitle>
            <CardDescription>
              เป้าหมาย: {goalMetadata.label} • {goalMetadata.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="record-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            วันที่บันทึก
          </Label>
          <Input
            id="record-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Metrics Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
            <span className="text-sm text-gray-500">ข้อมูลการวัด</span>
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantMetrics.map((metric) => (
              <div key={metric.key} className="space-y-2">
                <Label htmlFor={metric.key} className="flex items-center gap-2">
                  <span>{metric.icon}</span>
                  <span>{metric.label}</span>
                  <span className="text-xs text-gray-500">({metric.unit})</span>
                </Label>
                <Input
                  id={metric.key}
                  type="number"
                  step="0.1"
                  placeholder={`ระบุ${metric.label}`}
                  value={metrics[metric.key as keyof BodyMetrics] ?? ''}
                  onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                />
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special: Workload Helper for Muscle Building */}
        {clientGoal === 'muscle_building' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>ปริมาณงาน</strong> = ผลรวมของ (น้ำหนัก × จำนวนครั้ง × จำนวนเซต) ทุกท่าในเซสชันนั้น
              <br />
              ตัวอย่าง: Bench Press 60kg × 10 reps × 3 sets = 1,800 kg
            </p>
          </div>
        )}

        {/* Special: VO2 Max Info for General Health */}
        {clientGoal === 'general_health' && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-300">
              💡 <strong>VO₂ Max</strong> วัดได้จากการทดสอบบนลู่วิ่งหรือประมาณการจากการวิ่ง
              <br />
              <strong>Resting HR</strong> วัดตอนเช้าก่อนลุกจากเตียง
              <br />
              <strong>Recovery</strong> = (HR Max - HR หลังฟื้น 1 นาที) / (HR Max - HR พัก) × 100
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="metrics-notes">หมายเหตุ (ถ้ามี)</Label>
          <Textarea
            id="metrics-notes"
            placeholder="บันทึกข้อสังเกต เช่น สภาพร่างกาย, สุขภาพในวันนั้น..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            disabled={!hasAnyMetric}
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
