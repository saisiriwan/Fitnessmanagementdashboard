import React, { useRef } from 'react';
import { Download, Share, X, Dumbbell, TrendingUp, Award, Target, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useApp } from './AppContext';

interface SessionExercise {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
    rpe?: number;
    completed: boolean;
  }>;
  notes: string;
  completed: boolean;
}

interface SessionSummaryCardProps {
  session: any;
  client: any;
  program: any;
  sessionExercises: SessionExercise[];
  sessionNotes: string;
  sessionDate: string;
  completedExercises: number;
  onClose: () => void;
  onNavigate: () => void;
}

export default function SessionSummaryCard({
  session,
  client,
  program,
  sessionExercises,
  sessionNotes,
  sessionDate,
  completedExercises,
  onClose,
  onNavigate
}: SessionSummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { getExerciseById, updateSession } = useApp();

  // Calculate statistics
  const completedExercisesList = sessionExercises.filter(ex => ex.completed);
  const totalSets = completedExercisesList.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
  const totalReps = completedExercisesList.reduce((sum, ex) => 
    sum + ex.sets.filter(s => s.completed).reduce((s, set) => s + set.reps, 0), 0
  );
  const totalVolume = completedExercisesList.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).reduce((s, set) => 
      s + (set.weight * set.reps), 0
    ), 0
  );

  // Handle download as image
  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Use html2canvas library to convert card to image
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-summary-${client.name.replace(/\s+/g, '-')}-${new Date(sessionDate).toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('ดาวน์โหลดการ์ดสรุปผลสำเร็จ!');
      });
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการสร้างการ์ด');
      console.error(error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Check if Web Share API is supported
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], 'session-summary.png', { type: 'image/png' });
            await navigator.share({
              title: 'สรุปผลการออกกำลังกาย',
              text: `สรุปผลการออกกำลังกายของ ${client.name}`,
              files: [file],
            });
            toast.success('แชร์การ์ดสรุปผลสำเร็จ!');
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              // Fallback: copy to clipboard
              await copyToClipboard(blob);
            }
          }
        } else {
          // Fallback: copy to clipboard
          await copyToClipboard(blob);
        }
      });
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการแชร์การ์ด');
      console.error(error);
    }
  };

  const copyToClipboard = async (blob: Blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('คัดลอกการ์ดไปยังคลิปบอร์ดแล้ว!');
    } catch (err) {
      toast.error('ไม่สามารถคัดลอกการ์ดได้');
      console.error(err);
    }
  };

  // Handle send to client
  const handleSendToClient = () => {
    updateSession(session.id, { sharedWithClient: true });
    toast.success(`ส่งการ์ดสรุปผลให้ ${client.name} แล้ว! 🎉`);
    onClose();
    onNavigate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="session-summary-description">
        <DialogHeader>
          <DialogTitle>การ์ดสรุปผลการออกกำลังกาย</DialogTitle>
          <DialogDescription id="session-summary-description">
            บันทึกผลการฝึกออกกำลังกาย สำหรับการติดตามความก้าวหน้า
          </DialogDescription>
        </DialogHeader>

        {/* Preview Card */}
        <div className="space-y-4">
          <div 
            ref={cardRef}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                ยอดเยี่ยม!
              </h2>
              <p className="text-slate-300">{client.name}</p>
              <p className="text-xs text-slate-400">
                {new Date(sessionDate).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <Dumbbell className="h-4 w-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-400">{completedExercises}</div>
                <div className="text-xs text-slate-300">ท่าออกกำลังกาย</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <Target className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">{totalSets}</div>
                <div className="text-xs text-slate-300">เซต</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">{totalReps}</div>
                <div className="text-xs text-slate-300">ครั้ง</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <Award className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {totalVolume.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300">kg ทั้งหมด</div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                ท่าที่ทำวันนี้
              </h3>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 space-y-1.5 max-h-28 overflow-y-auto">
                {completedExercisesList.map((exercise, idx) => {
                  const exerciseData = getExerciseById(exercise.exerciseId);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">{exerciseData?.name}</span>
                      <span className="text-orange-400 font-medium">
                        {exercise.sets.filter(s => s.completed).length} เซต
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Note */}
            {sessionNotes && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  บันทึกจากเทรนเนอร์
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">{sessionNotes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-xs text-slate-400">
                เก่งมาก! พร้อมสำหรับการฝึกครั้งต่อไป 💪
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={() => {
              onClose();
              onNavigate();
            }}>
              <X className="h-4 w-4 mr-2" />
              ปิด
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              ดาวน์โหลด
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              แชร์
            </Button>
            <Button 
              onClick={handleSendToClient}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
              disabled={session.sharedWithClient}
            >
              <Send className="h-4 w-4 mr-2" />
              {session.sharedWithClient ? 'ส่งแล้ว ✓' : 'ส่งไปยังลูกเทรน'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
