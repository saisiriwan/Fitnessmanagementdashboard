import React from 'react';
import { Client } from './AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GoalsManager } from './GoalsManager';
import { BodyMetricsTracker } from './BodyMetricsTracker';
import { ProgressDashboard } from './ProgressChart';
import { TrainingGoal, TRAINING_GOALS } from '../types/goals';
import { addBodyMetrics, getBodyMetricsByClient } from '../utils/bodyMetricsStorage';
import { Target, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ClientGoalsAndMetricsProps {
  client: Client;
  onUpdateClient: (updates: Partial<Client>) => void;
}

export function ClientGoalsAndMetrics({ client, onUpdateClient }: ClientGoalsAndMetricsProps) {
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [isAddingMetrics, setIsAddingMetrics] = React.useState(false);
  const [metricsHistory, setMetricsHistory] = React.useState(() => getBodyMetricsByClient(client.id));

  // Reload metrics when component mounts or client changes
  React.useEffect(() => {
    setMetricsHistory(getBodyMetricsByClient(client.id));
  }, [client.id]);

  // ✅ Auto-open Goal editing if no goal is set
  React.useEffect(() => {
    if (!client.primaryGoal) {
      setIsEditingGoal(true);
    }
  }, [client.primaryGoal]);

  const handleSaveGoal = (goal: TrainingGoal, notes: string) => {
    onUpdateClient({
      primaryGoal: goal,
      goalNotes: notes
    });
    setIsEditingGoal(false);
    toast.success('บันทึกเป้าหมายสำเร็จ');
  };

  const handleSaveMetrics = (metrics: any) => {
    try {
      addBodyMetrics(metrics);
      setMetricsHistory(getBodyMetricsByClient(client.id));
      setIsAddingMetrics(false);
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const currentGoal = client.primaryGoal;
  const goalMetadata = currentGoal ? TRAINING_GOALS[currentGoal] : null;

  return (
    <div className="space-y-6">
      {/* Current Goal Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FF6B35]" />
              <CardTitle>เป้าหมายการฝึก</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
            >
              {isEditingGoal ? 'ยกเลิก' : currentGoal ? 'แก้ไข' : 'กำหนดเป้าหมาย'}
            </Button>
          </div>
          {!isEditingGoal && goalMetadata && (
            <CardDescription>
              เป้าหมายปัจจุบันของลูกเทรน
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isEditingGoal ? (
            <GoalsManager
              currentGoal={currentGoal}
              goalNotes={client.goalNotes}
              onSave={handleSaveGoal}
              onCancel={() => setIsEditingGoal(false)}
            />
          ) : goalMetadata ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-4xl">{goalMetadata.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{goalMetadata.label}</h3>
                    <span className="text-sm text-gray-500">({goalMetadata.labelEn})</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {goalMetadata.description}
                  </p>
                  {client.goalNotes && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>หมายเหตุ:</strong> {client.goalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>ยังไม่ได้กำหนดเป้าหมาย</p>
              <p className="text-sm mt-1">คลิก "กำหนดเป้าหมาย" เพื่อเริ่มต้น</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Tracker and Progress */}
      {currentGoal && (
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              กราฟพัฒนาการ
            </TabsTrigger>
            <TabsTrigger value="add-metrics" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              บันทึกข้อมูล
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <ProgressDashboard
              metricsHistory={metricsHistory}
              clientGoal={currentGoal}
            />
          </TabsContent>

          <TabsContent value="add-metrics" className="mt-6">
            <BodyMetricsTracker
              clientId={client.id}
              clientGoal={currentGoal}
              onSave={handleSaveMetrics}
              onCancel={() => {}}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}