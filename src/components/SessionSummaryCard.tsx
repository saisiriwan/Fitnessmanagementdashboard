import React, { useRef } from 'react';
import { Download, Share, X, Dumbbell, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface SessionSummaryCardProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  sessionDate: string;
  sessionData: {
    exercises: Array<{
      name: string;
      category: string;
      sets: Array<{
        actual: { reps: number; weight: number } | null;
        completed: boolean;
      }>;
      status: string;
    }>;
  };
  sessionSummary?: string;
}

export default function SessionSummaryCard({
  isOpen,
  onClose,
  clientName,
  sessionDate,
  sessionData,
  sessionSummary
}: SessionSummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate statistics
  const completedExercises = sessionData.exercises.filter(ex => ex.status === 'completed');
  const totalSets = completedExercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
  const totalReps = completedExercises.reduce((sum, ex) => 
    sum + ex.sets.filter(s => s.completed && s.actual).reduce((s, set) => s + (set.actual?.reps || 0), 0), 0
  );
  const totalVolume = completedExercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed && s.actual).reduce((s, set) => 
      s + ((set.actual?.weight || 0) * (set.actual?.reps || 0)), 0
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
        link.download = `session-summary-${clientName.replace(/\s+/g, '-')}-${new Date(sessionDate).toISOString().split('T')[0]}.png`;
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
              text: `สรุปผลการออกกำลังกายของ ${clientName}`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="session-summary-card-description">
        <DialogHeader>
          <DialogTitle>การ์ดสรุปผลการออกกำลังกาย</DialogTitle>
        </DialogHeader>
        <div id="session-summary-card-description" className="sr-only">
          การ์ดสรุปผลการออกกำลังกายของ {clientName} เมื่อวันที่ {new Date(sessionDate).toLocaleDateString('th-TH')}
        </div>

        {/* Preview Card */}
        <div className="space-y-4">
          <div 
            ref={cardRef}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white rounded-2xl p-8 space-y-6 shadow-2xl"
            style={{ minHeight: '500px' }}
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                ยอดเยี่ยม!
              </h2>
              <p className="text-lg text-slate-300">{clientName}</p>
              <p className="text-sm text-slate-400">
                {new Date(sessionDate).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Dumbbell className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-orange-400">{completedExercises.length}</div>
                <div className="text-sm text-slate-300">ท่าออกกำลังกาย</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400">{totalSets}</div>
                <div className="text-sm text-slate-300">เซต</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{totalReps}</div>
                <div className="text-sm text-slate-300">ครั้ง</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-slate-300">kg ทั้งหมด</div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                ท่าที่ทำวันนี้
              </h3>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-2 max-h-32 overflow-y-auto">
                {completedExercises.map((exercise, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">{exercise.name}</span>
                    <span className="text-orange-400 font-medium">
                      {exercise.sets.filter(s => s.completed).length} เซต
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Note */}
            {sessionSummary && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
                  บันทึกจากเทรนเนอร์
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">{sessionSummary}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400">
                เก่งมาก! พร้อมสำหรับการฝึกครั้งต่อไป 💪
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              ปิด
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              ดาวน์โหลด
            </Button>
            <Button onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              แชร์ให้ลูกเทรน
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
