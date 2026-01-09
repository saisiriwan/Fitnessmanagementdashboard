import React from 'react';
import { Play, Calendar, TrendingUp, FileText, Edit, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';

interface ClientOverviewProps {
  client: Client;
}

export default function ClientOverview({ client }: ClientOverviewProps) {
  const { sessions, addSession, updateClient } = useApp();
  const navigate = useNavigate();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [personalNotes, setPersonalNotes] = useState(client.personalNotes || '');

  // Get client's sessions
  const clientSessions = sessions.filter(s => s.clientId === client.id);
  const completedSessions = clientSessions.filter(s => s.status === 'completed');
  const upcomingSessions = clientSessions.filter(s => s.status === 'scheduled');
  
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

  const handleSaveNotes = () => {
    updateClient(client.id, { personalNotes });
    setIsEditingNotes(false);
    toast.success('บันทึกโน้ตส่วนตัวเรียบร้อย');
  };

  return (
    <div className="space-y-6">
      {/* ✅ Personal Notes Section */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                โน้ตส่วนตัว
              </CardTitle>
              <CardDescription>
                บันทึกข้อมูลสำคัญที่ต้องจำ - สิ่งที่คุยครั้งที่แล้ว, ความชอบ/ไม่ชอบ, หรือข้อควรระวัง
              </CardDescription>
            </div>
            {isEditingNotes ? (
              <Button size="sm" onClick={handleSaveNotes}>
                <Save className="h-4 w-4 mr-1" />
                บันทึก
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                <Edit className="h-4 w-4 mr-1" />
                แก้ไข
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <Textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="เช่น: ชอบ Deadlift, ไม่ชอบ Burpee, มีปัญหาเข่าเล็กน้อย, คุยเรื่องงานครั้งที่แล้ว..."
              rows={4}
              className="resize-none"
            />
          ) : (
            <div className="min-h-[100px] p-4 bg-muted/30 rounded-md">
              {personalNotes ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{personalNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  ยังไม่มีโน้ตส่วนตัว - คลิก \"แก้ไข\" เพื่อเพิ่มข้อมูล
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Session Count Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            สถิติการฝึก
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-primary">{completedSessions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">ครั้งที่มาฝึกแล้ว</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-accent">{upcomingSessions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">นัดหมายที่รออยู่</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              เปิดบันทึก
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
          <CardTitle>การฝึกล่าสุด</CardTitle>
          <CardDescription>
            การฝึกที่เสร็จสิ้นล่าสุด 5 ครั้ง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ยังไม่มีการฝึกที่เสร็จสิ้น</p>
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
                      <p className="text-sm text-gray-500">{
                        session.duration ? `${Math.floor(session.duration / 60)} นาที` : 'ไม่ระบุเวลา'} • 
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