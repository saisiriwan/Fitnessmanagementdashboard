import React, { useState } from 'react';
import { Eye, Download, Share, FileText, Play, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';

interface ClientSessionsProps {
  client: Client;
}

export default function ClientSessions({ client }: ClientSessionsProps) {
  const { sessions, getExerciseById } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Get client's sessions
  let clientSessions = sessions.filter(s => s.clientId === client.id);

  // Apply filters
  if (statusFilter !== 'all') {
    clientSessions = clientSessions.filter(s => s.status === statusFilter);
  }

  // Apply sorting
  clientSessions = clientSessions.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'duration-desc':
        return (b.duration || 0) - (a.duration || 0);
      case 'duration-asc':
        return (a.duration || 0) - (b.duration || 0);
      default:
        return 0;
    }
  });

  const handleViewSession = (sessionId: string) => {
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

  const getSessionSummary = (session: any) => {
    const exerciseCount = session.exercises.length;
    const totalSets = session.exercises.reduce((total: number, ex: any) => total + ex.sets.length, 0);
    
    return {
      exerciseCount,
      totalSets
    };
  };

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เซสชันทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clientSessions.length}</div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
            <div className="w-4 h-4 bg-accent rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {clientSessions.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-3/20 bg-gradient-to-br from-chart-3/10 to-chart-3/5 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <div className="w-4 h-4 bg-chart-3 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {clientSessions.filter(s => s.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำหนดไว้</CardTitle>
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {clientSessions.filter(s => s.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            กรองและเรียงลำดับ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="scheduled">กำหนดไว้</SelectItem>
                  <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">วันที่ใหม่ - เก่า</SelectItem>
                  <SelectItem value="date-asc">วันที่เก่า - ใหม่</SelectItem>
                  <SelectItem value="duration-desc">ระยะเวลานาน - สั้น</SelectItem>
                  <SelectItem value="duration-asc">ระยะเวลาสั้น - นาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการเซสชัน</CardTitle>
          <CardDescription>
            ประวัติเซสชันของ {client.name} ({clientSessions.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientSessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบเซสชันตามเงื่อนไขที่เลือก</p>
              </div>
            ) : (
              clientSessions.map(session => {
                const sessionDate = new Date(session.date);
                const statusBadge = getStatusBadge(session.status);
                const summary = getSessionSummary(session);
                
                return (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {sessionDate.getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sessionDate.toLocaleDateString('th-TH', { month: 'short' })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {sessionDate.toLocaleDateString('th-TH', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </h4>
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {sessionDate.toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {session.duration && ` • ${Math.floor(session.duration / 60)} นาที`}
                              {summary.exerciseCount > 0 && ` • ${summary.exerciseCount} ท่า • ${summary.totalSets} เซต`}
                            </p>
                          </div>
                        </div>

                        {/* Exercise Preview */}
                        {session.exercises.length > 0 && (
                          <div className="ml-12 mb-3">
                            <p className="text-sm text-gray-500 mb-1">ท่าที่ทำ:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.exercises.slice(0, 3).map((sessionEx, idx) => {
                                const exercise = getExerciseById(sessionEx.exerciseId);
                                return exercise ? (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {exercise.name}
                                  </Badge>
                                ) : null;
                              })}
                              {session.exercises.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{session.exercises.length - 3} ท่า
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Session Summary */}
                        {session.summary && (
                          <div className="ml-12 p-2 bg-gray-50 rounded text-sm">
                            <p className="text-gray-700">{session.summary}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {session.status === 'scheduled' && (
                          <Button 
                            size="sm"
                            onClick={() => handleViewSession(session.id)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-4 w-4" />
                            เริ่ม
                          </Button>
                        )}
                        
                        {session.status === 'completed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewSession(session.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              ดู
                            </Button>
                            
                            {session.summary && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}
                        
                        {session.status === 'in-progress' && (
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewSession(session.id)}
                          >
                            ดำเนินการต่อ
                          </Button>
                        )}
                      </div>
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