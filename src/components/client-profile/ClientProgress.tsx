import React, { useState } from 'react';
import { TrendingUp, Plus, Scale, Activity, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { toast } from 'sonner@2.0.3';

interface ClientProgressProps {
  client: Client;
}

export default function ClientProgress({ client }: ClientProgressProps) {
  const { updateClient } = useApp();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [metricType, setMetricType] = useState<'weight' | 'bodyFat' | 'muscle'>('weight');
  const [newValue, setNewValue] = useState('');

  // Mock progress data - in real app, this would come from database
  const weightData = [
    { date: '2024-08-01', value: 78 },
    { date: '2024-08-15', value: 77.5 },
    { date: '2024-09-01', value: 76.8 },
    { date: '2024-09-15', value: 75.5 },
    { date: '2024-09-23', value: 75 }
  ];

  const bodyFatData = [
    { date: '2024-08-01', value: 22 },
    { date: '2024-08-15', value: 21.5 },
    { date: '2024-09-01', value: 20.8 },
    { date: '2024-09-15', value: 20.2 },
    { date: '2024-09-23', value: 20 }
  ];

  const muscleData = [
    { date: '2024-08-01', value: 33 },
    { date: '2024-08-15', value: 33.5 },
    { date: '2024-09-01', value: 34.2 },
    { date: '2024-09-15', value: 34.8 },
    { date: '2024-09-23', value: 35 }
  ];

  const handleUpdateMetric = () => {
    if (!newValue) {
      toast.error('กรุณากรอกค่าที่ต้องการอัปเดต');
      return;
    }

    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) {
      toast.error('กรุณากรอกตัวเลขที่ถูกต้อง');
      return;
    }

    const currentMetrics = client.metrics || {};
    const updatedMetrics = {
      ...currentMetrics,
      [metricType]: numValue
    };

    updateClient(client.id, { metrics: updatedMetrics });
    toast.success('อัปเดตข้อมูลเรียบร้อยแล้ว');
    setShowUpdateModal(false);
    setNewValue('');
  };

  const getLatestValue = (data: any[]) => {
    return data.length > 0 ? data[data.length - 1].value : null;
  };

  const getChange = (data: any[]) => {
    if (data.length < 2) return null;
    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return latest - previous;
  };

  const renderChart = (data: any[], color: string, unit: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="h-32 flex items-end justify-between gap-1">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.value} ${unit} - ${new Date(point.date).toLocaleDateString('th-TH')}`}
              ></div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChangeIndicator = (change: number | null, unit: string) => {
    if (change === null) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
      }`}>
        <TrendingUp className={`h-4 w-4 ${isNegative ? 'rotate-180' : ''}`} />
        {isPositive ? '+' : ''}{change.toFixed(1)} {unit}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">น้ำหนัก</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestValue(weightData) || client.metrics?.weight || '-'} 
              <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
            </div>
            {renderChangeIndicator(getChange(weightData), 'kg')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เปอร์เซ็นต์ไขมัน</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestValue(bodyFatData) || client.metrics?.bodyFat || '-'}
              <span className="text-sm font-normal text-gray-500 ml-1">%</span>
            </div>
            {renderChangeIndicator(getChange(bodyFatData), '%')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มวลกล้ามเนื้อ</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestValue(muscleData) || client.metrics?.muscle || '-'}
              <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
            </div>
            {renderChangeIndicator(getChange(muscleData), 'kg')}
          </CardContent>
        </Card>
      </div>

      {/* Update Metrics Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>อัปเดตข้อมูลร่างกาย</CardTitle>
              <CardDescription>
                บันทึกการเปลี่ยนแปลงของร่างกาย
              </CardDescription>
            </div>
            
            <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  อัปเดต
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>อัปเดตข้อมูลร่างกาย</DialogTitle>
                  <DialogDescription>
                    เลือกประเภทข้อมูลและกรอกค่าใหม่
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'weight', label: 'น้ำหนัก', unit: 'kg', icon: Scale },
                      { key: 'bodyFat', label: 'ไขมัน', unit: '%', icon: Activity },
                      { key: 'muscle', label: 'กล้ามเนื้อ', unit: 'kg', icon: Zap }
                    ].map(metric => (
                      <button
                        key={metric.key}
                        onClick={() => setMetricType(metric.key as any)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          metricType === metric.key 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <metric.icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">{metric.label}</div>
                        <div className="text-xs text-gray-500">({metric.unit})</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="newValue">
                      ค่า{metricType === 'weight' ? 'น้ำหนัก' : metricType === 'bodyFat' ? 'ไขมัน' : 'กล้ามเนื้อ'}ใหม่
                    </Label>
                    <Input
                      id="newValue"
                      type="number"
                      step="0.1"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={`กรอก${metricType === 'weight' ? 'น้ำหนัก' : metricType === 'bodyFat' ? 'เปอร์เซ็นต์ไขมัน' : 'มวลกล้ามเนื้อ'}`}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleUpdateMetric}>
                      บันทึก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              กราฟน้ำหนัก
            </CardTitle>
            <CardDescription>
              การเปลี่ยนแปลงของน้ำหนักในช่วง 2 เดือนล่าสุด
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart(weightData, 'bg-blue-500', 'kg')}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>เป้าหมาย: 70 kg</span>
              <span>ปัจจุบัน: {getLatestValue(weightData)} kg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              กราฟเปอร์เซ็นต์ไขมัน
            </CardTitle>
            <CardDescription>
              การเปลี่ยนแปลงของเปอร์เซ็นต์ไขมัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart(bodyFatData, 'bg-orange-500', '%')}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>เป้าหมาย: 18%</span>
              <span>ปัจจุบัน: {getLatestValue(bodyFatData)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              กราฟมวลกล้ามเนื้อ
            </CardTitle>
            <CardDescription>
              การเปลี่ยนแปลงของมวลกล้ามเนื้อ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart(muscleData, 'bg-green-500', 'kg')}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>เป้าหมาย: 38 kg</span>
              <span>ปัจจุบัน: {getLatestValue(muscleData)} kg</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Records (PR)</CardTitle>
          <CardDescription>
            สถิติส่วนตัวที่ดีที่สุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { exercise: 'Squat', weight: '100 kg', date: '15 ก.ย. 2024' },
              { exercise: 'Bench Press', weight: '80 kg', date: '10 ก.ย. 2024' },
              { exercise: 'Deadlift', weight: '120 kg', date: '20 ก.ย. 2024' },
              { exercise: 'Running 5K', weight: '24:30', date: '5 ก.ย. 2024' },
              { exercise: 'Plank', weight: '3:45', date: '18 ก.ย. 2024' },
              { exercise: 'Push-ups', weight: '50 ครั้ง', date: '12 ก.ย. 2024' }
            ].map((record, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium">{record.exercise}</div>
                <div className="text-2xl font-bold text-blue-600">{record.weight}</div>
                <div className="text-sm text-gray-500">{record.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>การวิเคราะห์ปริมาณการออกกำลังกาย</CardTitle>
          <CardDescription>
            สถิติปริมาณการออกกำลังกายในช่วงเวลาต่างๆ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2,450</div>
              <div className="text-sm text-gray-600">กิโลกรัมรวมสัปดาห์นี้</div>
              <div className="text-xs text-green-600 mt-1">+12% จากสัปดาห์ก่อน</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">156</div>
              <div className="text-sm text-gray-600">เซตรวมสัปดาห์นี้</div>
              <div className="text-xs text-green-600 mt-1">+8% จากสัปดาห์ก่อน</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">180</div>
              <div className="text-sm text-gray-600">นาทีรวมสัปดาห์นี้</div>
              <div className="text-xs text-red-600 mt-1">-5% จากสัปดาห์ก่อน</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}