import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Users, 
  FileText, 
  Play, 
  Plus, 
  Clock,
  TrendingUp,
  CheckCircle2,
  Dumbbell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useApp } from './AppContext';
import NewClientModal from './NewClientModal';

export default function Dashboard() {
  const { clients, sessions, getClientById } = useApp();
  const navigate = useNavigate();
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(session => 
    session.date.startsWith(today) && session.status === 'scheduled'
  );

  // Get clients that need follow-up (no session in last 7 days)
  const followUpClients = clients.filter(client => {
    const lastSession = sessions
      .filter(s => s.clientId === client.id && s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastSession) return true;
    
    const daysSinceLastSession = Math.floor(
      (new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastSession >= 7;
  });

  // Get completed sessions without summary cards
  const incompleteSummaries = sessions.filter(session => 
    session.status === 'completed' && !session.summary
  );

  const handleStartSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleNewClient = (clientId: string) => {
    setShowNewClientModal(false);
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">สวัสดี! 👋</h1>
        <p className="text-blue-100">
          วันนี้คุณมีนัดหมาย {todaySessions.length} เซสชัน และลูกเทรนที่ต้องติดตาม {followUpClients.length} คน
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นัดวันนี้</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">
              เซสชันที่กำหนดไว้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกเทรนที่ต้องตาม</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUpClients.length}</div>
            <p className="text-xs text-muted-foreground">
              นานกว่า 7 วันไม่มีเซสชัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การ์ดสรุปค้าง</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incompleteSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              ยังไม่ได้สร้างการ์ด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกเทรนทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === 'active').length} คน กำลังออกกำลังกาย
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              นัดหมายวันนี้
            </CardTitle>
            <CardDescription>
              เซสชันที่กำหนดไว้สำหรับวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ไม่มีนัดหมายวันนี้</p>
            ) : (
              todaySessions.map(session => {
                const client = getClientById(session.clientId);
                if (!client) return null;
                
                const sessionTime = new Date(session.date).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {sessionTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{client.goal}</Badge>
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
          </CardContent>
        </Card>

        {/* Follow-up Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              ลูกเทรนที่ต้องติดตาม
            </CardTitle>
            <CardDescription>
              ลูกเทรนที่ไม่มีเซสชันมากกว่า 7 วัน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {followUpClients.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">ลูกเทรนทุกคนมีเซสชันสม่ำเสมอ</p>
              </div>
            ) : (
              followUpClients.slice(0, 5).map(client => {
                const lastSession = sessions
                  .filter(s => s.clientId === client.id && s.status === 'completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                const daysSince = lastSession 
                  ? Math.floor((new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Link key={client.id} to={`/clients/${client.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">
                            {daysSince ? `${daysSince} วันที่แล้ว` : 'ยังไม่เคยมีเซสชัน'}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                      >
                        {client.status === 'active' ? 'กำลังออกกำลัง' : 'พักชั่วคราว'}
                      </Badge>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            การดำเนินการที่ใช้บ่อย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  เพิ่มลูกเทรนใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>เพิ่มลูกเทรนใหม่</DialogTitle>
                  <DialogDescription>
                    กรอกข้อมูลพื้นฐานของลูกเทรนใหม่
                  </DialogDescription>
                </DialogHeader>
                <NewClientModal onClientCreated={handleNewClient} />
              </DialogContent>
            </Dialog>

            <Link to="/programs">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Dumbbell className="h-6 w-6" />
                สร้างโปรแกรมใหม่
              </Button>
            </Link>

            <Link to="/calendar">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <CalendarDays className="h-6 w-6" />
                ดูปฏิทิน
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}