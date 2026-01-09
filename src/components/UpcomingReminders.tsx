import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, Clock, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';

interface ReminderSession {
  id: string;
  clientName: string;
  time: string;
  endTime: string;
  date: Date;
  minutesUntil: number;
}

export default function UpcomingReminders() {
  const { sessions, getClientById } = useApp();
  const navigate = useNavigate();
  const [upcomingReminders, setUpcomingReminders] = useState<ReminderSession[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateReminders = () => {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // หา sessions ที่จะมาถึงใน 24 ชั่วโมงข้างหน้า
      const upcoming = sessions
        .filter(session => {
          if (session.status !== 'scheduled') return false;
          if (dismissedReminders.has(session.id)) return false;
          
          const sessionDate = new Date(session.date);
          return sessionDate >= now && sessionDate <= next24Hours;
        })
        .map(session => {
          const client = getClientById(session.clientId);
          const sessionDate = new Date(session.date);
          const minutesUntil = Math.floor((sessionDate.getTime() - now.getTime()) / (1000 * 60));
          
          const time = sessionDate.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          const endTime = session.endTime 
            ? new Date(session.endTime).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            : new Date(sessionDate.getTime() + 60 * 60 * 1000).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

          return {
            id: session.id,
            clientName: client?.name || 'ไม่ทราบชื่อ',
            time,
            endTime,
            date: sessionDate,
            minutesUntil
          };
        })
        .sort((a, b) => a.minutesUntil - b.minutesUntil)
        .slice(0, 3); // แสดงแค่ 3 รายการแรก

      setUpcomingReminders(upcoming);

      // แจ้งเตือนถ้ามีนัดที่ใกล้จะถึงมาก (น้อยกว่า 30 นาที)
      upcoming.forEach(reminder => {
        if (reminder.minutesUntil <= 30 && reminder.minutesUntil > 0) {
          const reminderKey = `reminder-${reminder.id}-${Math.floor(reminder.minutesUntil / 10)}`;
          const hasShown = localStorage.getItem(reminderKey);
          
          if (!hasShown) {
            toast.warning(`⏰ นัดหมายใกล้เข้ามาแล้ว!`, {
              description: `คุณมีนัดกับ ${reminder.clientName} ในอีก ${reminder.minutesUntil} นาที (${reminder.time})`,
              duration: 10000,
              action: {
                label: 'ดูรายละเอียด',
                onClick: () => navigate(`/sessions/${reminder.id}/log`)
              }
            });
            localStorage.setItem(reminderKey, 'true');
            
            // ลบ reminder key หลังจาก 15 นาที
            setTimeout(() => {
              localStorage.removeItem(reminderKey);
            }, 15 * 60 * 1000);
          }
        }
      });
    };

    updateReminders();
    const interval = setInterval(updateReminders, 60 * 1000); // อัพเดททุก 1 นาที

    return () => clearInterval(interval);
  }, [sessions, dismissedReminders, getClientById, navigate]);

  const getTimeLabel = (minutesUntil: number) => {
    if (minutesUntil < 0) return 'ผ่านมาแล้ว';
    if (minutesUntil === 0) return 'ตอนนี้!';
    if (minutesUntil < 60) return `${minutesUntil} นาที`;
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชั่วโมง`;
  };

  const getUrgencyColor = (minutesUntil: number) => {
    if (minutesUntil <= 15) return 'bg-red-500';
    if (minutesUntil <= 30) return 'bg-orange-500';
    if (minutesUntil <= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const handleDismiss = (reminderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedReminders(prev => new Set([...prev, reminderId]));
  };

  if (upcomingReminders.length === 0) {
    return null;
  }

  return (
    <Card className="border-[#FF6B35]/20 bg-gradient-to-br from-[#FF6B35]/5 to-[#FF6B35]/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#002140]">
          <Bell className="h-5 w-5 text-[#FF6B35] animate-pulse" />
          การแจ้งเตือน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {upcomingReminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/sessions/${reminder.id}/log`)}
              className="group relative bg-white border-2 border-[#FF6B35]/20 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer hover:border-[#FF6B35]/40"
            >
              {/* Dismiss Button */}
              <button
                onClick={(e) => handleDismiss(reminder.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
              >
                <X className="h-3 w-3 text-red-500" />
              </button>

              <div className="flex items-start gap-3">
                {/* Urgency Indicator */}
                <div className={`w-1 h-full ${getUrgencyColor(reminder.minutesUntil)} rounded-full`}></div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-[#FF6B35]" />
                    <span className="font-semibold text-sm">
                      {reminder.time} - {reminder.endTime}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        reminder.minutesUntil <= 30 
                          ? 'bg-red-100 text-red-700 border-red-300' 
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                      }`}
                    >
                      {getTimeLabel(reminder.minutesUntil)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-[#002140]">{reminder.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {reminder.date.toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {upcomingReminders.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            💡 คลิกเพื่อดูรายละเอียดหรือเริ่มบันทึก
          </p>
        )}
      </CardContent>
    </Card>
  );
}
