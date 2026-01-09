import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, WorkoutSession } from './AppContext';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Award,
  Star,
  Clock,
  Target,
  Activity,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clients, sessions, getExerciseById, getClientById, getProgramTemplateById, programInstances } = useApp();
  const [selectedTab, setSelectedTab] = useState('sessions');

  // Find current client
  const currentClient = useMemo(() => {
    if (!currentUser) return null;
    return clients.find(c => c.userId === currentUser.id);
  }, [clients, currentUser]);

  // Get client's sessions (completed only)
  const clientSessions = useMemo(() => {
    if (!currentClient) return [];
    return sessions
      .filter(s => s.clientId === currentClient.id && s.status === 'completed' && s.sharedWithClient)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, currentClient]);

  // Get active program
  const activeProgram = useMemo(() => {
    if (!currentClient) return null;
    const instance = programInstances.find(
      pi => pi.clientId === currentClient.id && pi.status === 'active'
    );
    if (!instance) return null;
    return getProgramTemplateById(instance.templateId);
  }, [programInstances, currentClient, getProgramTemplateById]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = clientSessions.length;
    const last7Days = clientSessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length;

    const avgRating = total > 0
      ? (clientSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / total).toFixed(1)
      : '0.0';

    const totalExercises = clientSessions.reduce((sum, s) => sum + s.exercises.length, 0);

    return { total, last7Days, avgRating, totalExercises };
  }, [clientSessions]);

  // Prepare weight chart data
  const weightChartData = useMemo(() => {
    const data = clientSessions
      .filter(s => s.bodyWeight)
      .slice(0, 10) // Last 10 sessions with body weight
      .reverse()
      .map(s => ({
        date: new Date(s.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        weight: s.bodyWeight
      }));
    return data;
  }, [clientSessions]);

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูลลูกเทรน</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl">สวัสดี, {currentClient.name} 👋</h1>
          <p className="text-muted-foreground mt-1">
            ติดตามความก้าวหน้าของคุณที่นี่
          </p>
        </div>
        {activeProgram && (
          <Badge variant="secondary" className="w-fit">
            <Dumbbell className="h-3 w-3 mr-1" />
            {activeProgram.name}
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">ครั้งทั้งหมด</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{stats.last7Days}</p>
              <p className="text-xs text-muted-foreground">7 วันล่าสุด</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-[#FF6B35]/10 rounded-full mb-2">
                <Star className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
              <p className="text-xs text-muted-foreground">คะแนนเฉลี่ย</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{stats.totalExercises}</p>
              <p className="text-xs text-muted-foreground">ท่าทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">ประวัติการฝึก</TabsTrigger>
          <TabsTrigger value="progress">ความก้าวหน้า</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4 mt-6">
          {clientSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ยังไม่มีประวัติการฝึก</h3>
                  <p className="text-sm text-muted-foreground">
                    เทรนเนอร์จะส่งการ์ดสรุปผลให้คุณหลังการฝึกแต่ละครั้ง
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {clientSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4 mt-6">
          {/* Weight Chart */}
          {weightChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  กราฟน้ำหนักตัว
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      name="น้ำหนัก (kg)"
                      stroke="#FF6B35" 
                      strokeWidth={2}
                      dot={{ fill: '#FF6B35', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Improvements */}
          {clientSessions.some(s => s.improvements) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  พัฒนาการล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clientSessions
                    .filter(s => s.improvements)
                    .slice(0, 5)
                    .map((session, idx) => (
                      <div key={session.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-[#FF6B35]/10 rounded-full mt-0.5">
                          <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{session.improvements}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(session.date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Goals */}
          {clientSessions.some(s => s.nextGoals) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  เป้าหมายครั้งถัดไป
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clientSessions
                    .filter(s => s.nextGoals)
                    .slice(0, 3)
                    .map((session, idx) => (
                      <div key={session.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{session.nextGoals}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ตั้งเมื่อ {new Date(session.date).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Session Card Component
function SessionCard({ session }: { session: WorkoutSession }) {
  const { getExerciseById } = useApp();

  const getTypeIcon = () => {
    switch (session.type) {
      case 'strength': return '💪';
      case 'cardio': return '🏃';
      case 'flexibility': return '🧘';
      case 'recovery': return '😌';
      default: return '🏋️';
    }
  };

  const getTypeName = () => {
    switch (session.type) {
      case 'strength': return 'Strength';
      case 'cardio': return 'Cardio';
      case 'flexibility': return 'Flexibility';
      case 'recovery': return 'Recovery';
      default: return 'Workout';
    }
  };

  const completedExercises = session.exercises.filter(e => 
    e.sets.some(s => s.completed)
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {getTypeIcon()} {getTypeName()}
              </Badge>
              {session.rating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: session.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#FF6B35] text-[#FF6B35]" />
                  ))}
                </div>
              )}
            </div>
            <CardTitle className="text-lg">
              {new Date(session.date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
            {session.endTime && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {new Date(session.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {new Date(session.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          {session.bodyWeight && (
            <Badge variant="outline" className="ml-2">
              {session.bodyWeight} kg
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Exercises */}
        {completedExercises.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              ท่าที่ฝึก ({completedExercises.length})
            </h4>
            <div className="space-y-1.5">
              {completedExercises.slice(0, 5).map((ex, idx) => {
                const exercise = getExerciseById(ex.exerciseId);
                const completedSets = ex.sets.filter(s => s.completed).length;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-2">
                    <span className="text-foreground">{exercise?.name || 'Unknown'}</span>
                    <span className="text-[#FF6B35] font-medium">{completedSets} เซต</span>
                  </div>
                );
              })}
              {completedExercises.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  และอีก {completedExercises.length - 5} ท่า...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {session.summary && (
          <div>
            <h4 className="text-sm font-semibold mb-2">บันทึกจากเทรนเนอร์</h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded p-3">
              {session.summary}
            </p>
          </div>
        )}

        {/* Improvements */}
        {session.improvements && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                พัฒนาการ
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {session.improvements}
              </p>
            </div>
          </div>
        )}

        {/* Next Goals */}
        {session.nextGoals && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                เป้าหมายครั้งถัดไป
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {session.nextGoals}
              </p>
            </div>
          </div>
        )}

        {/* Achievements */}
        {session.achievements && session.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              ความสำเร็จ
            </h4>
            <div className="flex flex-wrap gap-2">
              {session.achievements.map((achievement, idx) => (
                <Badge key={idx} className="bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20">
                  🎉 {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
