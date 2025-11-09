import { useState } from 'react';
import { Plus, StickyNote, Clock, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Client } from '../page/AppContext';
import { useAuth } from '../page/AuthContext';
import { toast } from 'sonner';

interface ClientNotesProps {
  client: Client;
}

interface Note {
  id: string;
  content: string;
  type: 'general' | 'progress' | 'injury' | 'goal' | 'feedback';
  createdAt: string;
  createdBy: string;
}

export default function ClientNotes({ client }: ClientNotesProps) {
  const { user } = useAuth();
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general' as const
  });

  // Mock notes data - in real app, this would come from database
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'มีปัญหาเข่าเล็กน้อย ต้องระวัง squat และ lunges ให้ดูฟอร์มให้ดี',
      type: 'injury',
      createdAt: '2024-09-20T10:30:00',
      createdBy: 'อาจารย์เจมส์'
    },
    {
      id: '2',
      content: 'วันนี้มีความมุ่งมั่นสูง แม้จะเหนื่อยแต่ก็ทำครบทุกเซต ให้กำลังใจและบอกว่าทำได้ดีมาก',
      type: 'feedback',
      createdAt: '2024-09-18T16:45:00',
      createdBy: 'อาจารย์เจมส์'
    },
    {
      id: '3',
      content: 'ปรับเป้าหมายใหม่จาก ลดน้ำหนัก 5 กิโล เป็น ลดน้ำหนัก 3 กิโล และเพิ่มกล้ามเนื้อ',
      type: 'goal',
      createdAt: '2024-09-15T14:20:00',
      createdBy: 'อาจารย์เจมส์'
    },
    {
      id: '4',
      content: 'น้ำหนักลดลง 2 กิโลแล้ว! มีความก้าวหน้าที่ดี ฟอร์มการออกกำลังกายดีขึ้นเยอะ',
      type: 'progress',
      createdAt: '2024-09-10T11:15:00',
      createdBy: 'อาจารย์เจมส์'
    }
  ]);

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      toast.error('กรุณากรอกเนื้อหาโน้ต');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.content,
      type: newNote.type,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'เทรนเนอร์'
    };

    setNotes(prev => [note, ...prev]);
    toast.success('เพิ่มโน้ตเรียบร้อยแล้ว');
    setShowAddNoteDialog(false);
    setNewNote({ content: '', type: 'general' });
  };

  const getNoteTypeInfo = (type: string) => {
    const typeMap = {
      general: { label: 'ทั่วไป', color: 'bg-gray-100 text-gray-800', icon: StickyNote },
      progress: { label: 'ความก้าวหน้า', color: 'bg-green-100 text-green-800', icon: StickyNote },
      injury: { label: 'การบาดเจ็บ', color: 'bg-red-100 text-red-800', icon: StickyNote },
      goal: { label: 'เป้าหมาย', color: 'bg-blue-100 text-blue-800', icon: StickyNote },
      feedback: { label: 'ฟีดแบ็ก', color: 'bg-purple-100 text-purple-800', icon: StickyNote }
    };
    
    return typeMap[type as keyof typeof typeMap] || typeMap.general;
  };

  const noteStats = {
    total: notes.length,
    thisWeek: notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    }).length,
    byType: notes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โน้ตทั้งหมด</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สัปดาห์นี้</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteStats.thisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความก้าวหน้า</CardTitle>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteStats.byType.progress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ฟีดแบ็ก</CardTitle>
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteStats.byType.feedback || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Note */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>โน้ตและฟีดแบ็ก</CardTitle>
              <CardDescription>
                บันทึกข้อมูลสำคัญและความคิดเห็นเกี่ยวกับ {client.name}
              </CardDescription>
            </div>
            
            <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  เพิ่มโน้ต
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มโน้ตใหม่</DialogTitle>
                  <DialogDescription>
                    บันทึกข้อมูลสำคัญหรือความคิดเห็นเกี่ยวกับลูกเทรน
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">ประเภทโน้ต</label>
                    <Select 
                      value={newNote.type} 
                      onValueChange={(value: any) => setNewNote(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">ทั่วไป</SelectItem>
                        <SelectItem value="progress">ความก้าวหน้า</SelectItem>
                        <SelectItem value="injury">การบาดเจ็บ/ข้อควรระวัง</SelectItem>
                        <SelectItem value="goal">เป้าหมาย</SelectItem>
                        <SelectItem value="feedback">ฟีดแบ็ก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">เนื้อหา</label>
                    <Textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="เขียนโน้ตหรือความเห็น..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleAddNote}>
                      บันทึก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Notes Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>โน้ตทั้งหมด ({notes.length})</CardTitle>
          <CardDescription>
            เรียงตามวันที่ล่าสุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีโน้ต</p>
              </div>
            ) : (
              notes.map(note => {
                const typeInfo = getNoteTypeInfo(note.type);
                const noteDate = new Date(note.createdAt);
                
                return (
                  <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          {note.createdBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {noteDate.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} {noteDate.toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>เทมเพลตด่วน</CardTitle>
          <CardDescription>
            เทมเพลตโน้ตที่ใช้บ่อย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'ความก้าวหน้าดี',
                content: 'วันนี้มีความก้าวหน้าที่ดี ฟอร์มการออกกำลังกายดีขึ้น และสามารถยกน้ำหนักที่หนักขึ้นได้',
                type: 'progress'
              },
              {
                title: 'ต้องปรับฟอร์ม',
                content: 'ต้องฝึกปรับฟอร์มให้ถูกต้องมากขึ้น โดยเฉพาะการเก็บแกนและการหายใจ',
                type: 'feedback'
              },
              {
                title: 'มีแรงจูงใจสูง',
                content: 'วันนี้มีแรงจูงใจและพลังในการออกกำลังกายสูงมาก ทำให้เซสชันเป็นไปได้ดี',
                type: 'feedback'
              },
              {
                title: 'ข้อควรระวัง',
                content: 'ระวังการออกกำลังกายที่มีผลกระทบต่อ... ควรหลีกเลี่ยงท่า... และปรับเบาลง',
                type: 'injury'
              }
            ].map((template, index) => (
              <div 
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setNewNote({
                    content: template.content,
                    type: template.type as any
                  });
                  setShowAddNoteDialog(true);
                }}
              >
                <div className="font-medium text-sm mb-1">{template.title}</div>
                <p className="text-xs text-gray-600 line-clamp-2">{template.content}</p>
                <Badge className={`${getNoteTypeInfo(template.type).color} text-xs mt-2`}>
                  {getNoteTypeInfo(template.type).label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}