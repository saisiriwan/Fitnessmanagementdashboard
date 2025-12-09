import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Calendar as CalendarIcon,
  TrendingUp,
  FileText,
  StickyNote,
  User,
  Dumbbell
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useApp } from './AppContext';
import ClientOverview from './client-profile/ClientOverview';
import ClientSchedule from './client-profile/ClientSchedule';
import ClientProgram from './client-profile/ClientProgram';
import ClientSessions from './client-profile/ClientSessions';
import ClientProgress from './client-profile/ClientProgress';
import ClientNotes from './client-profile/ClientNotes';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getClientById, addSession, sessions } = useApp();
  
  const activeTab = searchParams.get('tab') || 'overview';
  const client = getClientById(id!);

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่พบข้อมูลลูกเทรน</p>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          กลับไปรายชื่อลูกเทรน
        </Button>
      </div>
    );
  }

  const handleStartSession = () => {
    const sessionId = addSession({
      clientId: client.id,
      date: new Date().toISOString(),
      status: 'in-progress',
      exercises: []
    });
    navigate(`/sessions/${sessionId}/log`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'กำลังออกกำลัง', variant: 'default' as const },
      paused: { label: 'พักชั่วคราว', variant: 'secondary' as const },
      inactive: { label: 'ไม่ได้ใช้งาน', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const statusBadge = getStatusBadge(client.status);

  // Get last session date and upcoming session
  const clientSessions = sessions.filter(s => s.clientId === client.id);
  const completedSessions = clientSessions.filter(s => s.status === 'completed');
  const upcomingSessions = clientSessions.filter(s => s.status === 'scheduled');
  
  const lastSession = completedSessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const nextSession = upcomingSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const daysSinceLastSession = lastSession
    ? Math.floor((new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="text-lg">
                {client.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
                <Badge variant="outline">{client.goal}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={handleStartSession} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          เริ่มเซสชัน
        </Button>
      </div>

      {/* Key Information - แสดงข้อมูลสำคัญเป็นอันดับแรก */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">เซสชันล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {lastSession ? (
              <>
                <div className="text-2xl font-bold text-accent">
                  {daysSinceLastSession === 0 ? 'วันนี้' : `${daysSinceLastSession} วัน`}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(lastSession.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </>
            ) : (
              <div className="text-xl text-muted-foreground">ยังไม่เคยมีเซสชัน</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">เป้าหมาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{client.goal}</div>
            <p className="text-sm text-muted-foreground mt-1">
              เข้าร่วม {Math.floor((new Date().getTime() - new Date(client.joinDate).getTime()) / (1000 * 60 * 60 * 24))} วันแล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="border-chart-1/30 bg-gradient-to-br from-chart-1/10 to-chart-1/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">นัดหมายถัดไป</CardTitle>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <>
                <div className="text-xl font-bold text-chart-1">
                  {new Date(nextSession.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(nextSession.date).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </>
            ) : (
              <div className="text-xl text-muted-foreground">ไม่มีนัด</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">อีเมล</p>
              <p className="font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">โทรศัพท์</p>
              <p className="font-medium">{client.phone || 'ไม่ระบุ'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">เซสชันทั้งหมด</p>
              <p className="font-medium">{completedSessions.length} เซสชัน</p>
            </div>
            <div>
              <p className="text-muted-foreground">โปรแกรมปัจจุบัน</p>
              <p className="font-medium">{client.currentProgram ? 'มีโปรแกรม' : 'ยังไม่มีโปรแกรม'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        navigate(`/clients/${id}?${params.toString()}`, { replace: true });
      }}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            ตารางเวลา
          </TabsTrigger>
          <TabsTrigger value="program" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            โปรแกรม
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            เซสชัน
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ความก้าวหน้า
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            หมายเหตุ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClientOverview client={client} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <ClientSchedule client={client} />
        </TabsContent>

        <TabsContent value="program" className="space-y-6">
          <ClientProgram client={client} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <ClientSessions client={client} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ClientProgress client={client} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <ClientNotes client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}