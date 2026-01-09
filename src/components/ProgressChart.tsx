import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BodyMetrics, TrainingGoal, TRAINING_GOALS, METRIC_DEFINITIONS } from '../types/goals';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressChartProps {
  metricsHistory: BodyMetrics[];
  clientGoal: TrainingGoal;
  metricKey: string;
}

export function ProgressChart({ metricsHistory, clientGoal, metricKey }: ProgressChartProps) {
  const goalMetadata = TRAINING_GOALS[clientGoal];
  const metricDef = METRIC_DEFINITIONS.find(m => m.key === metricKey);

  if (!metricDef) return null;

  // Prepare data for chart
  const chartData = metricsHistory
    .filter(m => m[metricKey as keyof BodyMetrics] !== undefined)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(m => ({
      date: new Date(m.recordedAt).toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'short' 
      }),
      value: m[metricKey as keyof BodyMetrics] as number,
      fullDate: m.recordedAt
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">{metricDef.icon}</span>
            <CardTitle className="text-base">{metricDef.label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">ยังไม่มีข้อมูล{metricDef.label}</p>
            <p className="text-sm text-gray-400 mt-1">เริ่มบันทึกข้อมูลเพื่อดูกราฟพัฒนาการ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const firstValue = chartData[0].value;
  const lastValue = chartData[chartData.length - 1].value;
  const change = lastValue - firstValue;
  const changePercent = ((change / firstValue) * 100).toFixed(1);

  let trendIcon = <Minus className="h-4 w-4" />;
  let trendColor = 'text-gray-500';
  let trendText = 'ไม่เปลี่ยนแปลง';

  if (change > 0) {
    trendIcon = <TrendingUp className="h-4 w-4" />;
    // For weight loss, increase is bad. For others, increase is good
    trendColor = clientGoal === 'weight_loss' ? 'text-red-500' : 'text-green-500';
    trendText = `เพิ่มขึ้น ${Math.abs(change).toFixed(1)} ${metricDef.unit}`;
  } else if (change < 0) {
    trendIcon = <TrendingDown className="h-4 w-4" />;
    // For weight loss, decrease is good. For others, decrease is bad
    trendColor = clientGoal === 'weight_loss' ? 'text-green-500' : 'text-red-500';
    trendText = `ลดลง ${Math.abs(change).toFixed(1)} ${metricDef.unit}`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{metricDef.icon}</span>
            <div>
              <CardTitle className="text-base">{metricDef.label}</CardTitle>
              <CardDescription className="text-xs">{metricDef.description}</CardDescription>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 ${trendColor}`}>
            {trendIcon}
            <div className="text-right">
              <div className="text-sm font-medium">{trendText}</div>
              <div className="text-xs">({changePercent}%)</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: metricDef.unit, angle: -90, position: 'insideLeft', className: 'text-xs' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={(label) => `วันที่: ${label}`}
              formatter={(value: number) => [
                `${value.toFixed(1)} ${metricDef.unit}`,
                metricDef.label
              ]}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={() => metricDef.label}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={goalMetadata.color}
              strokeWidth={2}
              dot={{ fill: goalMetadata.color, r: 4 }}
              activeDot={{ r: 6 }}
              name={metricDef.label}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-xs text-gray-500">เริ่มต้น</div>
            <div className="text-sm font-medium mt-1">
              {firstValue.toFixed(1)} {metricDef.unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">ล่าสุด</div>
            <div className="text-sm font-medium mt-1">
              {lastValue.toFixed(1)} {metricDef.unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">จำนวนครั้ง</div>
            <div className="text-sm font-medium mt-1">
              {chartData.length} ครั้ง
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to show all relevant charts for a goal
interface ProgressDashboardProps {
  metricsHistory: BodyMetrics[];
  clientGoal: TrainingGoal;
}

export function ProgressDashboard({ metricsHistory, clientGoal }: ProgressDashboardProps) {
  const goalMetadata = TRAINING_GOALS[clientGoal];
  const relevantMetrics = METRIC_DEFINITIONS.filter(m => m.category === clientGoal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{goalMetadata.icon}</span>
        <div>
          <h3 className="font-semibold">กราฟพัฒนาการ</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            เป้าหมาย: {goalMetadata.label}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {relevantMetrics.map(metric => (
          <ProgressChart
            key={metric.key}
            metricsHistory={metricsHistory}
            clientGoal={clientGoal}
            metricKey={metric.key}
          />
        ))}
      </div>

      {metricsHistory.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-4xl mb-3">{goalMetadata.icon}</div>
              <h3 className="font-semibold mb-2">ยังไม่มีข้อมูลการวัด</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                เริ่มบันทึกข้อมูลร่างกายเพื่อติดตามพัฒนาการของลูกเทรน
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
