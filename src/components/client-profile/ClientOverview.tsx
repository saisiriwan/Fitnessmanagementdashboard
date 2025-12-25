import React from 'react';
import { Play, Calendar, TrendingUp, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';

interface ClientOverviewProps {
  client: Client;
}

export default function ClientOverview({ client }: ClientOverviewProps) {
  const { sessions, programs, addSession } = useApp();
  const navigate = useNavigate();

  // Get client's sessions
  const clientSessions = sessions.filter(s => s.clientId === client.id);
  const completedSessions = clientSessions.filter(s => s.status === 'completed');
  const upcomingSessions = clientSessions.filter(s => s.status === 'scheduled');
  
  // Get current program
  const currentProgram = client.currentProgram ? programs.find(p => p.id === client.currentProgram) : null;

  // Get next session
  const nextSession = upcomingSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Calculate progress (mock data)
  const weeklyGoal = 3; // sessions per week
  const thisWeekSessions = 2; // completed this week
  const progressPercentage = Math.min((thisWeekSessions / weeklyGoal) * 100, 100);

  const handleStartSession = () => {
    const sessionId = addSession({
      clientId: client.id,
      date: new Date().toISOString(),
      status: 'in-progress',
      exercises: []
    });
    navigate(`/sessions/${sessionId}/log`);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เซสชันทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              เซสชันที่เสร็จสิ้น
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สัปดาห์นี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekSessions}</div>
            <p className="text-xs text-muted-foreground">
              จาก {weeklyGoal} ที่กำหนด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นัดถัดไป</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextSession ? new Date(nextSession.date).getDate() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextSession 
                ? new Date(nextSession.date).toLocaleDateString('th-TH', { month: 'short' })
                : 'ไม่มีนัด'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals & Progress */}
        <Card>
          <CardHeader>
            <CardTitle>เป้าหมายและความก้าวหน้า</CardTitle>
            <CardDescription>
              ติดตามความก้าวหน้าต่อเป้าหมายรายสัปดาห์
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">เป้าหมายหลัก</p>
                <Badge variant="outline">{client.goal}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {client.notes || 'ไม่มีหมายเหตุเพิ่มเติม'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">ความก้าวหน้าสัปดาห์นี้</p>
                <p className="text-sm text-gray-600">{thisWeekSessions}/{weeklyGoal} เซสชัน</p>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {client.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">แท็ก</p>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Program */}
        <Card>
          <CardHeader>
            <CardTitle>โปรแกรมปัจจุบัน</CardTitle>
            <CardDescription>
              โปรแกรมการออกกำลังกายที่กำลังดำเนินการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentProgram ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{currentProgram.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentProgram.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ระยะเวลา</p>
                    <p className="font-medium">{currentProgram.duration} สัปดาห์</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ความถี่</p>
                    <p className="font-medium">{currentProgram.daysPerWeek} วัน/สัปดาห์</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">ความก้าวหน้าโปรแกรม</p>
                  <Progress value={35} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">สัปดาห์ 3 จาก 8</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">ยังไม่มีโปรแกรมที่กำหนด</p>
                <Button variant="outline" size="sm">
                  มอบหมายโปรแกรม
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
          <CardDescription>
            ดำเนินการที่ใช้บ่อยสำหรับลูกเทรนคนนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleStartSession} className="h-16 flex-col gap-2">
              <Play className="h-5 w-5" />
              เริ่มเซสชันใหม่
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Calendar className="h-5 w-5" />
              จองนัดถัดไป
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              อัปเดตข้อมูล
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>เซสชันล่าสุด</CardTitle>
          <CardDescription>
            เซสชันที่เสร็จสิ้นล่าสุด 5 ครั้ง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ยังไม่มีเซสชันที่เสร็จสิ้น</p>
            ) : (
              completedSessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(session.date).toLocaleDateString('th-TH')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.duration ? `${Math.floor(session.duration / 60)} นาที` : 'ไม่ระบุเวลา'} • 
                        {session.exercises.length} ท่า
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">เสร็จสิ้น</Badge>
                      <Button variant="ghost" size="sm">
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}