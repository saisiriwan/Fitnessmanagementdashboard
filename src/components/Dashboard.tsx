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
      {/* Welcome Section - แสดงภาพรวมสิ่งสำคัญที่สุด */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-accent rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">สวัสดี! 👋</h1>
        <p className="text-white/95 text-lg">
          {todaySessions.length > 0 
            ? `วันนี้คุณมีนัดหมาย ${todaySessions.length} เซสชัน` 
            : 'วันนี้คุณไม่มีนัดหมาย'}
        </p>
      </div>

      {/* Today's Sessions - หัวใจสำคัญของหน้า Dashboard */}
      <Card className="border-accent/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarDays className="h-6 w-6 text-accent" />
                นัดหมายวันนี้
              </CardTitle>
              <CardDescription className="mt-1">
                เซสชันที่กำหนดไว้สำหรับวันนี้
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/calendar')}
              variant="outline"
              size="sm"
            >
              ดูปฏิทินทั้งหมด
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaySessions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">ไม่มีนัดหมายวันนี้</p>
              <p className="text-sm text-muted-foreground mt-2">คุณมีเวลาว่างสำหรับการวางแผนหรือติดตามลูกเทรน</p>
            </div>
          ) : (
            todaySessions.map(session => {
              const client = getClientById(session.clientId);
              if (!client) return null;
              
              const sessionTime = new Date(session.date).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="text-lg">{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{client.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {sessionTime}
                        </div>
                        <Badge variant="outline">{client.goal}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => handleStartSession(session.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    เริ่มเซสชัน
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกเทรนทั้งหมด</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === 'active').length} คน กำลังเทรนอยู่
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-accent/40"
          onClick={() => followUpClients.length > 0 && navigate('/clients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{followUpClients.length}</div>
            <p className="text-xs text-muted-foreground">
              ไม่มีเซสชันมากกว่า 7 วัน
            </p>
          </CardContent>
        </Card>

        <Card className="border-chart-3/20 bg-gradient-to-br from-chart-3/10 to-chart-3/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-chart-3/40"
          onClick={() => incompleteSummaries.length > 0 && navigate('/reports')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การ์ดสรุปค้าง</CardTitle>
            <FileText className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{incompleteSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              ยังไม่ได้สร้างการ์ด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Clients - แสดงเฉพาะเมื่อมีลูกเทรนที่ต้องติดตาม */}
      {followUpClients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  ลูกเทรนที่ต้องติดตาม
                </CardTitle>
                <CardDescription>
                  ลูกเทรนที่ไม่มีเซสชันมากกว่า 7 วัน
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/clients')}
                variant="outline"
                size="sm"
              >
                ดูทั้งหมด
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUpClients.slice(0, 5).map(client => {
              const lastSession = sessions
                .filter(s => s.clientId === client.id && s.status === 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              const daysSince = lastSession 
                ? Math.floor((new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Link key={client.id} to={`/clients/${client.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {daysSince ? `${daysSince} วันที่แล้ว` : 'ยังไม่เคยมีเซสชัน'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                    >
                      {client.status === 'active' ? 'กำลังเทรนอยู่' : 'พักชั่วคราว'}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* New Client Modal */}
      <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
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
    </div>
  );
}