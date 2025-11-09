import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Badge } from 'src/components/ui/badge';
import { useApp } from './AppContext';

export default function Calendar() {
  const { sessions, clients, getClientById } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  
  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date.startsWith(dateStr));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ปฏิทิน</h1>
          <p className="text-gray-600">จัดการตารางเวลาและนัดหมาย</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มเซสชัน
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              สัปดาห์ที่ {Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                วันนี้
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {weekDates[0].toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="font-medium text-sm text-gray-600 mb-2">{day}</div>
                <div className={`border rounded-lg p-2 min-h-[200px] ${
                  weekDates[index].toDateString() === new Date().toDateString() 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}>
                  <div className="font-medium text-sm mb-2">
                    {weekDates[index].getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {getSessionsForDate(weekDates[index]).map(session => {
                      const client = getClientById(session.clientId);
                      if (!client) return null;
                      
                      const time = new Date(session.date).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={session.id}
                          className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                          title={`${client.name} - ${time}`}
                        >
                          <div className="font-medium">{time}</div>
                          <div className="truncate">{client.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>เซสชันวันนี้</CardTitle>
          <CardDescription>
            รายการนัดหมายที่กำหนดไว้สำหรับวันนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSessionsForDate(new Date()).length === 0 ? (
              <p className="text-gray-500 text-center py-4">ไม่มีนัดหมายวันนี้</p>
            ) : (
              getSessionsForDate(new Date()).map(session => {
                const client = getClientById(session.clientId);
                if (!client) return null;
                
                const time = new Date(session.date).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-blue-600">{time}</div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {session.status === 'scheduled' ? 'กำหนดไว้' : session.status}
                      </Badge>
                      <Button size="sm">เริ่มเซสชัน</Button>
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