import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { 
  ArrowLeft, 
  Edit, 
  ClipboardEdit, 
  Calendar as CalendarIcon,
  Dumbbell,
  TrendingUp,
  StickyNote,
  MoreVertical,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import ClientSchedule from './client-profile/ClientSchedule';
import ClientProgram from './client-profile/ClientProgram';
import ClientProgress from './client-profile/ClientProgress';
import ClientNotes from './client-profile/ClientNotes';
import ClientGoals from './client-profile/ClientGoals';
import EditClientModal from './EditClientModal';
import { ClientGoalsAndMetrics } from './ClientGoalsAndMetrics';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    getClientById, 
    addSession, 
    sessions, 
  } = useApp();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  const activeTab = searchParams.get('tab') || 'schedule';
  const client = getClientById(id!);

  if (!client) {
    return (
      <div className="text-center py-8 px-4">
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

  const sessionCount = completedSessions.length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header - Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/clients')}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl">{client.name}</h1>
              <Badge variant={statusBadge.variant} className="text-xs px-2.5 py-1">
                {statusBadge.label}
              </Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-1 bg-primary/10 border-primary/30">
                มาฝึกแล้ว {sessionCount} ครั้ง
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {client.email} {client.phone && `• ${client.phone}`}
              </p>
              {client.goal && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
                  <p className="text-sm text-muted-foreground">
                    🎯 {client.goal}
                  </p>
                </>
              )}
            </div>
            {client.personalNotes && (
              <p className="text-xs text-primary/80 italic mt-1">
                💡 {client.personalNotes}
              </p>
            )}
          </div>
        </div>
        
        {/* Quick Actions - Desktop */}
        <div className="flex items-center gap-3">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                แก้ไขข้อมูล
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" aria-describedby="edit-client-profile-description">
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลลูกเทรน</DialogTitle>
                <DialogDescription id="edit-client-profile-description">
                  อัพเดทข้อมูลของลูกเทรนของคุณ
                </DialogDescription>
              </DialogHeader>
              <EditClientModal client={client} onSuccess={() => setShowEditDialog(false)} />
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleStartSession} 
            size="sm"
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            <ClipboardEdit className="h-4 w-4 mr-2" />
            บันทึกการฝึกปัจจุบัน
          </Button>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/clients')}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Mobile Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                แก้ไขข้อมูล
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStartSession}>
                <ClipboardEdit className="h-4 w-4 mr-2" />
                บันทึกการฝึก
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client Info - Mobile */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl">{client.name}</h1>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs mb-2 bg-primary/10 border-primary/30">
            มาฝึกแล้ว {sessionCount} ครั้ง
          </Badge>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {client.email}
            </p>
            {client.phone && (
              <p className="text-sm text-muted-foreground">
                {client.phone}
              </p>
            )}
            {client.goal && (
              <p className="text-sm text-muted-foreground">
                🎯 {client.goal}
              </p>
            )}
          </div>
          {client.personalNotes && (
            <p className="text-xs text-primary/80 italic mt-2">
              💡 {client.personalNotes}
            </p>
          )}
        </div>

        {/* Mobile Edit Dialog */}
        <Sheet open={showEditDialog} onOpenChange={setShowEditDialog}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>แก้ไขข้อมูลลูกเทรน</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <EditClientModal client={client} onSuccess={() => setShowEditDialog(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Next Appointment Card */}
      {nextSession && (
        <Card className="border-[#FF6B35]/20 bg-[#FF6B35]/5">
          <CardContent className="py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                <CalendarIcon className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1">
                  <p className="text-xs text-[#FF6B35] mb-0.5">นัดหมายถัดไป</p>
                  <p className="text-sm md:text-base">
                    {new Date(nextSession.date).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    เวลา {new Date(nextSession.date).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {nextSession.endTime && (
                      <> - {new Date(nextSession.endTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</>
                    )}
                    {' น.'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex items-center gap-2 sm:block">
                <p className="text-xs text-muted-foreground">เหลืออีก</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl md:text-3xl text-[#FF6B35]">
                    {Math.max(0, Math.ceil((new Date(nextSession.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-xs text-muted-foreground">วัน</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        navigate(`/clients/${id}?${params.toString()}`, { replace: true });
      }}>
        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="text-xs md:text-sm">
            <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            ตารางเวลา
          </TabsTrigger>
          <TabsTrigger value="program" className="text-xs md:text-sm">
            <Dumbbell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            โปรแกรม
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs md:text-sm">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            ความก้าวหน้า
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs md:text-sm">
            <StickyNote className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            หมายเหตุ
          </TabsTrigger>
        </TabsList>

        {/* Mobile Tabs - Scrollable */}
        <TabsList className="md:hidden flex w-full overflow-x-auto">
          <TabsTrigger value="schedule" className="text-xs flex-shrink-0 px-3">
            <CalendarIcon className="h-3 w-3 mr-1" />
            ตารางเวลา
          </TabsTrigger>
          <TabsTrigger value="program" className="text-xs flex-shrink-0 px-3">
            <Dumbbell className="h-3 w-3 mr-1" />
            โปรแกรม
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs flex-shrink-0 px-3">
            <TrendingUp className="h-3 w-3 mr-1" />
            ความก้าวหน้า
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs flex-shrink-0 px-3">
            <StickyNote className="h-3 w-3 mr-1" />
            หมายเหตุ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <ClientSchedule client={client} />
        </TabsContent>

        <TabsContent value="program" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <ClientProgram client={client} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <ClientProgress client={client} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <ClientNotes client={client} />
        </TabsContent>
      </Tabs>

      {/* Mobile FAB - Quick Start Session */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          onClick={handleStartSession}
          size="lg"
          className="rounded-full w-14 h-14 shadow-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90"
        >
          <ClipboardEdit className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}