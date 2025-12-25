import React, { useState } from 'react';
import { Plus, Calendar, Clock, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';

interface ClientScheduleProps {
  client: Client;
}

export default function ClientSchedule({ client }: ClientScheduleProps) {
  const { sessions, addSession } = useApp();
  const navigate = useNavigate();
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    type: 'strength'
  });

  // Get client's sessions
  const clientSessions = sessions
    .filter(s => s.clientId === client.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingSessions = clientSessions.filter(s => s.status === 'scheduled');
  const pastSessions = clientSessions.filter(s => s.status === 'completed');

  const handleCreateSession = () => {
    if (!newSession.date || !newSession.time) {
      toast.error('กรุณากรอกวันที่และเวลา');
      return;
    }

    const sessionDateTime = new Date(`${newSession.date}T${newSession.time}`);
    const sessionId = addSession({
      clientId: client.id,
      date: sessionDateTime.toISOString(),
      status: 'scheduled',
      exercises: []
    });

    toast.success('สร้างนัดหมายเรียบร้อยแล้ว');
    setShowNewSessionDialog(false);
    setNewSession({ date: '', time: '', type: 'strength' });
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: 'กำหนดไว้', variant: 'default' as const },
      'in-progress': { label: 'กำลังดำเนินการ', variant: 'secondary' as const },
      completed: { label: 'เสร็จสิ้น', variant: 'outline' as const },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นัดที่กำหนดไว้</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              นัดที่จะมาถึง
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เซสชันที่เสร็จ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              เซสชันทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการเข้าร่วม</CardTitle>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              จากนัดทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Session */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>เพิ่มนัดหมายใหม่</CardTitle>
              <CardDescription>
                สร้างนัดหมายเซสชันใหม่สำหรับ {client.name}
              </CardDescription>
            </div>
            
            <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  นัดใหม่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้างนัดหมายใหม่</DialogTitle>
                  <DialogDescription>
                    กำหนดวันเวลาสำหรับเซสชันใหม่
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">วันที่</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSession.date}
                        onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">เวลา</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newSession.time}
                        onChange={(e) => setNewSession(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">ประเภทเซสชัน</Label>
                    <Select 
                      value={newSession.type} 
                      onValueChange={(value) => setNewSession(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">เสริมแรง</SelectItem>
                        <SelectItem value="cardio">คาร์ดิโอ</SelectItem>
                        <SelectItem value="flexibility">ยืดหยุ่น</SelectItem>
                        <SelectItem value="mixed">ผสมผสาน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleCreateSession}>
                      สร้างนัด
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>นัดหมายที่กำหนดไว้</CardTitle>
          <CardDescription>
            เซสชันที่จะมาถึง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ไม่มีนัดหมายที่กำหนดไว้</p>
            ) : (
              upcomingSessions.map(session => {
                const sessionDate = new Date(session.date);
                const statusBadge = getStatusBadge(session.status);
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {sessionDate.getDate()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sessionDate.toLocaleDateString('th-TH', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          {sessionDate.toLocaleDateString('th-TH', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sessionDate.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleStartSession(session.id)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        เริ่มเซสชัน
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติเซสชัน</CardTitle>
          <CardDescription>
            เซสชันที่เสร็จสิ้นแล้ว (10 ครั้งล่าสุด)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pastSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ยังไม่มีเซสชันที่เสร็จสิ้น</p>
            ) : (
              pastSessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(session => {
                  const sessionDate = new Date(session.date);
                  const statusBadge = getStatusBadge(session.status);
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {sessionDate.getDate()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sessionDate.toLocaleDateString('th-TH', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">
                            {sessionDate.toLocaleDateString('th-TH', { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.duration ? `${Math.floor(session.duration / 60)} นาที` : 'ไม่ระบุเวลา'} • 
                            {session.exercises.length} ท่า
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}