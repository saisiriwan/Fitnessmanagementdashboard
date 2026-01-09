import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Cloud,
  Sun,
  CloudRain,
  Video,
  Users,
  MapPin,
  Trash2,
  X,
  StickyNote,
  Coffee,
  Edit,
  Zap,
  Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from './AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Session color mapping based on client goal or type
const SESSION_COLORS = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export default function Calendar() {
  const { sessions, clients, getClientById, deleteSession, addSession, calendarNotes, addCalendarNote, deleteCalendarNote, getNotesForDate, programTemplates, programInstances, getProgramTemplateById, getExerciseById } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  // Mobile states
  const [showMobileDayDetails, setShowMobileDayDetails] = useState(false);
  
  // Dialogs
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [showDayDetailsDialog, setShowDayDetailsDialog] = useState(false);
  const [dayDetailsDate, setDayDetailsDate] = useState<Date | null>(null);
  
  // Form states
  const [newSession, setNewSession] = useState({
    clientId: '',
    date: '',
    time: '10:00',
    endTime: '11:00',
  });
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
  });

  // Get month dates for calendar grid
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates: Date[] = [];
    
    // Add previous month days
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      dates.push(prevDate);
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    
    // Add next month days to complete the grid
    const remainingDays = 42 - dates.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    
    return dates;
  };

  const monthDates = getMonthDates(currentDate);

  // Get sessions for the selected date
  const getSessionsForSelectedDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return sessions
      .filter(session => session.date.startsWith(dateStr))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const selectedDateSessions = getSessionsForSelectedDate();
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDateNotes = getNotesForDate(selectedDateStr);

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date.startsWith(dateStr));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getSessionColor = (index: number) => {
    return SESSION_COLORS[index % SESSION_COLORS.length];
  };

  const getDayLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === today.getTime()) {
      return 'วันนี้';
    } else if (sessionDate.getTime() === tomorrow.getTime()) {
      return 'พรุ่งนี้';
    } else {
      return sessionDate.toLocaleDateString('th-TH', { weekday: 'long' });
    }
  };

  const formatSessionDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    setSessionToDelete(null);
    toast.success('ลบนัดหมายเรียบร้อยแล้ว');
  };

  const handleDeleteNote = (noteId: string) => {
    deleteCalendarNote(noteId);
    setNoteToDelete(null);
    toast.success('ลบโน้ตเรียบร้อยแล้ว');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // If clicked date is in a different month, navigate to that month
    if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    // Open mobile sheet on mobile devices
    if (window.innerWidth < 768) {
      setShowMobileDayDetails(true);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleSessionDotClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    navigate(`/sessions/${sessionId}/log`);
  };

  const handleCreateSession = () => {
    if (!newSession.clientId) {
      toast.error('กรุณาเลือกลูกเทรน');
      return;
    }
    if (!newSession.date || !newSession.time) {
      toast.error('กรุณากรอกวันที่และเวลา');
      return;
    }

    const sessionDateTime = new Date(`${newSession.date}T${newSession.time}`);
    const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);

    addSession({
      clientId: newSession.clientId,
      date: sessionDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: 'scheduled',
      exercises: [],
    });

    toast.success('สร้างนัดหมายเรียบร้อยแล้ว');
    setShowNewSessionDialog(false);
    setNewSession({ clientId: '', date: '', time: '10:00', endTime: '11:00' });
  };

  const handleCreateNote = () => {
    if (!newNote.title) {
      toast.error('กรุณาระบุหัวข้อ');
      return;
    }

    addCalendarNote({
      date: selectedDateStr,
      type: 'note',
      title: newNote.title,
      content: newNote.content,
    });

    toast.success('เพิ่มโน้ตเรียบร้อยแล้ว');
    setShowNoteDialog(false);
    setNewNote({ title: '', content: '' });
  };

  const handleCreateRestDay = () => {
    // Check if already has rest day
    const hasRestDay = selectedDateNotes.some(note => note.type === 'rest-day');
    if (hasRestDay) {
      toast.error('วันนี้ถูกกำหนดเป็นวันหยุดแล้ว');
      return;
    }

    addCalendarNote({
      date: selectedDateStr,
      type: 'rest-day',
    });

    toast.success('กำหนดวันหยุดเรียบร้อยแล้ว');
    setShowRestDayDialog(false);
  };

  const openNewSessionDialog = () => {
    setNewSession({
      clientId: '',
      date: selectedDateStr,
      time: '10:00',
      endTime: '11:00',
    });
    setShowNewSessionDialog(true);
  };

  const hasRestDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const notes = getNotesForDate(dateStr);
    return notes.some(note => note.type === 'rest-day');
  };

  const handleOpenDayDetails = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    setDayDetailsDate(date);
    setShowDayDetailsDialog(true);
  };

  // Render Session Card Component
  const SessionCard = ({ session, index, showDelete = true }: { session: any; index: number; showDelete?: boolean }) => {
    const client = getClientById(session.clientId);
    if (!client) return null;

    const time = new Date(session.date).toLocaleTimeString('th-TH', {
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
      : new Date(new Date(session.date).getTime() + 60 * 60 * 1000).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

    const colorClass = getSessionColor(index);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => handleStartSession(session.id)}
      >
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSessionToDelete(session.id);
            }}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        )}

        <div className="flex items-start gap-3">
          <div className={`w-1 h-full ${colorClass} rounded-full`}></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{time} - {endTime}</span>
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                {session.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังรอ'}
              </Badge>
            </div>
            <div className="text-sm font-medium text-primary">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.goal}</div>
            {session.notes && (
              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {session.notes}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 md:gap-6 relative p-4 md:p-0">
      {/* Desktop Collapse/Expand Button */}
      <motion.button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-50 bg-white hover:shadow-xl shadow-lg rounded-full py-6 px-2.5 transition-all items-center justify-center"
        style={{ left: sidebarCollapsed ? '0rem' : '21rem' }}
        animate={{ left: sidebarCollapsed ? '0rem' : '21rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="h-6 w-6 text-accent" />
        </motion.div>
      </motion.button>

      {/* Desktop Left Sidebar - Selected Date Sessions */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block w-[21rem] bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-6 overflow-y-auto shadow-lg"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">
                  {getDayLabel(selectedDate)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatSessionDate(selectedDate.toISOString())}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={openNewSessionDialog}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">นัดหมาย</span>
                </Button>
                <Button
                  onClick={() => setShowNoteDialog(true)}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  variant="outline"
                >
                  <StickyNote className="h-4 w-4" />
                  <span className="text-xs">โน้ต</span>
                </Button>
                <Button
                  onClick={() => setShowRestDayDialog(true)}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  variant="outline"
                >
                  <Coffee className="h-4 w-4" />
                  <span className="text-xs">วันหยุด</span>
                </Button>
              </div>

              {/* Notes Section */}
              {selectedDateNotes.length > 0 && (
                <div className="space-y-2">
                  {selectedDateNotes.map(note => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative rounded-xl p-3 ${
                        note.type === 'rest-day' 
                          ? 'bg-green-100 border-2 border-green-300' 
                          : 'bg-yellow-50 border-2 border-yellow-200'
                      }`}
                    >
                      <button
                        onClick={() => setNoteToDelete(note.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded-lg"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                      
                      {note.type === 'rest-day' ? (
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-green-700" />
                          <span className="font-medium text-green-900">วันหยุด</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <StickyNote className="h-4 w-4 text-yellow-700" />
                            <span className="font-medium text-yellow-900">{note.title}</span>
                          </div>
                          {note.content && (
                            <p className="text-xs text-yellow-800 ml-6">{note.content}</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Sessions */}
              {selectedDateSessions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">นัดหมาย</h3>
                  {selectedDateSessions.map((session, index) => (
                    <SessionCard key={session.id} session={session} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    ไม่มีนัดหมายในวันนี้
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet for Day Details */}
      <Sheet open={showMobileDayDetails} onOpenChange={setShowMobileDayDetails}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-xl">
              {getDayLabel(selectedDate)}
            </SheetTitle>
            <SheetDescription>
              {formatSessionDate(selectedDate.toISOString())}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4 overflow-y-auto h-[calc(100%-5rem)] pb-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => {
                  setShowMobileDayDetails(false);
                  openNewSessionDialog();
                }}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">นัดหมาย</span>
              </Button>
              <Button
                onClick={() => {
                  setShowMobileDayDetails(false);
                  setShowNoteDialog(true);
                }}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                variant="outline"
              >
                <StickyNote className="h-4 w-4" />
                <span className="text-xs">โน้ต</span>
              </Button>
              <Button
                onClick={() => {
                  setShowMobileDayDetails(false);
                  setShowRestDayDialog(true);
                }}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                variant="outline"
              >
                <Coffee className="h-4 w-4" />
                <span className="text-xs">วันหยุด</span>
              </Button>
            </div>

            {/* Notes Section */}
            {selectedDateNotes.length > 0 && (
              <div className="space-y-2">
                {selectedDateNotes.map(note => (
                  <div
                    key={note.id}
                    className={`group relative rounded-xl p-3 ${
                      note.type === 'rest-day' 
                        ? 'bg-green-100 border-2 border-green-300' 
                        : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}
                  >
                    <button
                      onClick={() => setNoteToDelete(note.id)}
                      className="absolute top-2 right-2 p-1.5 hover:bg-white/50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    
                    {note.type === 'rest-day' ? (
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-green-700" />
                        <span className="font-medium text-green-900">วันหยุด</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StickyNote className="h-4 w-4 text-yellow-700" />
                          <span className="font-medium text-yellow-900">{note.title}</span>
                        </div>
                        {note.content && (
                          <p className="text-xs text-yellow-800 ml-6">{note.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sessions */}
            {selectedDateSessions.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">นัดหมาย ({selectedDateSessions.length})</h3>
                {selectedDateSessions.map((session, index) => (
                  <SessionCard key={session.id} session={session} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  ไม่มีนัดหมายในวันนี้
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToToday}
              className="hover:bg-accent/10 hover:text-accent border-accent/30 text-xs md:text-sm"
            >
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">วันนี้</span>
            </Button>
          </div>
          
          <h2 className="text-lg md:text-2xl font-bold text-accent">
            {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </h2>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateMonth('next')}
            className="hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-3">
          {/* Day Headers */}
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
            <div key={day} className="text-center font-medium text-xs md:text-sm text-muted-foreground pb-1 md:pb-2">
              {day}
            </div>
          ))}

          {/* Calendar Dates */}
          {monthDates.map((date, index) => {
            const dateSessions = getSessionsForDate(date);
            const dateStr = date.toISOString().split('T')[0];
            const dateNotes = getNotesForDate(dateStr);
            const isRestDay = dateNotes.some(note => note.type === 'rest-day');
            const regularNotes = dateNotes.filter(note => note.type === 'note');
            const isCurrentMonth = isSameMonth(date);
            const isTodayDate = isToday(date);
            const isSelected = isSameDate(date, selectedDate);

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  aspect-square flex flex-col items-center justify-start p-1 md:p-2 rounded-lg md:rounded-2xl
                  cursor-pointer transition-all relative
                  ${isTodayDate ? 'bg-gradient-to-br from-[#002140] to-[#003a73] text-white shadow-lg ring-2 ring-[#FF6B35]/50' : 'hover:bg-gray-50'}
                  ${isSelected && !isTodayDate ? 'bg-accent/10 ring-2 ring-accent' : ''}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isRestDay && !isTodayDate ? 'bg-green-50 border-2 border-green-300' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className={`text-sm md:text-lg font-medium mb-0.5 md:mb-1 ${isTodayDate ? 'text-white' : isRestDay ? 'text-green-700' : ''}`}>
                  {date.getDate()}
                </div>
                
                {/* Rest Day Indicator */}
                {isRestDay && (
                  <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1">
                    <Coffee className="h-2 w-2 md:h-3 md:w-3 text-green-600" />
                  </div>
                )}

                {/* Note Indicator */}
                {regularNotes.length > 0 && (
                  <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1">
                    <StickyNote className="h-2 w-2 md:h-3 md:w-3 text-yellow-600" />
                  </div>
                )}
                
                {/* Session Indicators */}
                {dateSessions.length > 0 && (
                  <div className="w-full space-y-0.5 mt-auto overflow-hidden">
                    {/* Mobile: Show dots */}
                    <div className="md:hidden flex gap-0.5 justify-center">
                      {dateSessions.slice(0, 3).map((session, idx) => {
                        const colorClass = getSessionColor(idx);
                        return (
                          <div
                            key={session.id}
                            className={`w-1 h-1 ${colorClass} rounded-full`}
                          />
                        );
                      })}
                      {dateSessions.length > 3 && (
                        <div className="text-[8px] ml-0.5">+{dateSessions.length - 3}</div>
                      )}
                    </div>

                    {/* Desktop: Show cards */}
                    <div className="hidden md:block">
                      {dateSessions.slice(0, 2).map((session, idx) => {
                        const client = getClientById(session.clientId);
                        const time = new Date(session.date).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        });
                        const colorClass = getSessionColor(idx);
                        
                        return (
                          <motion.div
                            key={session.id}
                            whileHover={{ scale: 1.02 }}
                            className={`group/session ${colorClass} text-white rounded-md px-1.5 py-0.5 text-[9px] font-medium truncate cursor-pointer relative`}
                            onClick={(e) => handleSessionDotClick(e, session.id)}
                            title={`${client?.name} - ${time}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(session.id);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 opacity-0 group-hover/session:opacity-100 transition-opacity shadow-lg z-10"
                              title="ลบนัดหมาย"
                            >
                              <X className="h-2.5 w-2.5 text-white" />
                            </button>
                            
                            <div className="truncate">{client?.name}</div>
                            <div className="text-[8px] opacity-90">{time}</div>
                          </motion.div>
                        );
                      })}
                      {dateSessions.length > 2 && (
                        <div 
                          className={`text-[9px] text-center font-medium cursor-pointer hover:underline ${isTodayDate ? 'text-white/80' : 'text-muted-foreground'}`}
                          onClick={(e) => handleOpenDayDetails(e, date)}
                        >
                          +{dateSessions.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile FAB for Quick Actions */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          onClick={openNewSessionDialog}
          size="lg"
          className="rounded-full w-14 h-14 shadow-xl bg-accent hover:bg-accent/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Delete Session Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent aria-describedby="delete-session-alert-description">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบนัดหมาย</AlertDialogTitle>
            <AlertDialogDescription id="delete-session-alert-description">
              คุณแน่ใจหรือไม่ว่าต้องการลบนัดหมายนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent aria-describedby="delete-note-alert-description">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโน้ต</AlertDialogTitle>
            <AlertDialogDescription id="delete-note-alert-description">
              คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noteToDelete && handleDeleteNote(noteToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Session Dialog */}
      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent className="max-w-md" aria-describedby="calendar-new-session-description">
          <DialogHeader>
            <DialogTitle>สร้างนัดหมายใหม่</DialogTitle>
            <DialogDescription id="calendar-new-session-description">
              กำหนดวันเวลาสำหรับการฝึกกับลูกเทรน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">ลูกเทรน</Label>
              <Select value={newSession.clientId} onValueChange={(value) => setNewSession(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกเทรน" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.status === 'active').map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">เวลาเริ่มต้น</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateSession} className="bg-[#002140] hover:bg-[#002140]/90">
                สร้างนัดหมาย
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-md" aria-describedby="calendar-note-description">
          <DialogHeader>
            <DialogTitle>เพิ่มโน้ต</DialogTitle>
            <DialogDescription id="calendar-note-description">
              {selectedDate ? `บันทึกข้อความสำคัญในวัน ${formatSessionDate(selectedDate.toISOString())}` : 'บันทึกข้อความสำคัญ'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-title">หัวข้อ</Label>
              <Input
                id="note-title"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="เช่น การประชุม, เตือนความจำ"
              />
            </div>
            <div>
              <Label htmlFor="note-content">รายละเอียด (ไม่จำเป็น)</Label>
              <Textarea
                id="note-content"
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="เขียนรายละเอียดเพิ่มเติม..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateNote} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rest Day Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent className="max-w-md" aria-describedby="calendar-rest-day-description">
          <DialogHeader>
            <DialogTitle>กำหนดวันหยุด</DialogTitle>
            <DialogDescription id="calendar-rest-day-description">
              {selectedDate ? `ทำเครื่องหมายวัน ${formatSessionDate(selectedDate.toISOString())} เป็นวันหยุด` : 'ทำเครื่องหมายวันนี้เป็นวันหยุด'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Coffee className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">วันหยุดพักผ่อน</p>
                <p className="text-sm text-green-700">ไม่มีการเทรนในวันนี้</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRestDayDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateRestDay} className="bg-green-600 hover:bg-green-700">
              ยืนยัน
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Details Dialog - Show All Sessions */}
      <Dialog open={showDayDetailsDialog} onOpenChange={setShowDayDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="day-details-description">
          <DialogHeader>
            <DialogTitle>
              {dayDetailsDate ? `นัดหมายวันที่ ${formatSessionDate(dayDetailsDate.toISOString())}` : 'รายละเอียดนัดหมาย'}
            </DialogTitle>
            <DialogDescription id="day-details-description">
              รายละเอียดนัดหมายทั้งหมดในวันนี้
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {dayDetailsDate && getSessionsForDate(dayDetailsDate).map((session, index) => {
              const client = getClientById(session.clientId);
              if (!client) return null;

              const time = new Date(session.date).toLocaleTimeString('th-TH', {
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
                : new Date(new Date(session.date).getTime() + 60 * 60 * 1000).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

              const colorClass = getSessionColor(index);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-2 border-gray-100 hover:border-accent/30 cursor-pointer"
                  onClick={() => {
                    setShowDayDetailsDialog(false);
                    handleStartSession(session.id);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session.id);
                      setShowDayDetailsDialog(false);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className={`w-1.5 h-full ${colorClass} rounded-full`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{time} - {endTime}</span>
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {session.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังรอ'}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-primary mb-1">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.goal}</div>
                      {session.notes && (
                        <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded-lg">
                          {session.notes}
                        </div>
                      )}
                      {session.exercises && session.exercises.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {session.exercises.length} ท่าออกกำลังกาย
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
