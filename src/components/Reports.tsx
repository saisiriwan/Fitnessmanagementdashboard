import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePickerWithRange } from './ui/date-range-picker';
import { useApp } from './AppContext';

export default function Reports() {
  const { clients, sessions } = useApp();
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('sessions');
  const [dateRange, setDateRange] = useState<any>(null);

  // Calculate stats
  const totalSessions = sessions.filter(s => s.status === 'completed').length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const avgSessionsPerClient = activeClients > 0 ? Math.round(totalSessions / activeClients) : 0;

  // Get session data for chart (mock data)
  const getSessionData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        sessions: Math.floor(Math.random() * 8) + 1
      };
    }).reverse();
    
    return last7Days;
  };

  const sessionData = getSessionData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">รายงานและสถิติ</h1>
          <p className="text-gray-600">ติดตามผลการดำเนินงานและความก้าวหน้า</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          ส่งออกรายงาน
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เซสชันทั้งหมด</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              เซสชันที่เสร็จสิ้น
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกเทรนที่ใช้งาน</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              จาก {clients.length} คนทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เฉลี่ย/ลูกเทรน</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionsPerClient}</div>
            <p className="text-xs text-muted-foreground">
              เซสชันต่อคน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการเข้าร่วม</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              เซสชันที่กำหนดไว้
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
          <CardDescription>
            เลือกเงื่อนไขสำหรับการสร้างรายงาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ลูกเทรน</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกเทรน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ลูกเทรนทั้งหมด</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">ตัวชี้วัด</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตัวชี้วัด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">จำนวนเซสชัน</SelectItem>
                  <SelectItem value="attendance">อัตราการเข้าร่วม</SelectItem>
                  <SelectItem value="progress">ความก้าวหน้า</SelectItem>
                  <SelectItem value="volume">ปริมาณการออกกำลัง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">ช่วงเวลา</label>
              <DatePickerWithRange 
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trend */}
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มเซสชัน (7 วันล่าสุด)</CardTitle>
            <CardDescription>
              จำนวนเซสชันที่ดำเนินการในแต่ละวัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {sessionData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${(day.sessions / 8) * 200}px` }}
                    title={`${day.sessions} เซสชัน`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">{day.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Goal Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>การกระจายเป้าหมายลูกเทรน</CardTitle>
            <CardDescription>
              สัดส่วนลูกเทรนแต่ละเป้าหมาย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...new Set(clients.map(c => c.goal))].map(goal => {
                const count = clients.filter(c => c.goal === goal).length;
                const percentage = Math.round((count / clients.length) * 100);
                
                return (
                  <div key={goal} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{goal}</span>
                      <span>{count} คน ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            รายงานรายละเอียด
          </CardTitle>
          <CardDescription>
            รายงานที่สร้างและพร้อมดาวน์โหลด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">รายงานความก้าวหน้าลูกเทรน - เดือนนี้</h4>
                <p className="text-sm text-gray-500">สร้างเมื่อ 20 ก.ย. 2024</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                ดาวน์โหลด PDF
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">สรุปการออกกำลังกาย - Q3 2024</h4>
                <p className="text-sm text-gray-500">สร้างเมื่อ 15 ก.ย. 2024</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                ดาวน์โหลด CSV
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">รายงานรายได้ - สิงหาคม 2024</h4>
                <p className="text-sm text-gray-500">สร้างเมื่อ 1 ก.ย. 2024</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                ดาวน์โหลด PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}