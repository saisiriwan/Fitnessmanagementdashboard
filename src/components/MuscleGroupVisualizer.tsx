import React, { useState } from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MuscleGroupVisualizerProps {
  selectedMuscleGroup: string;
  onMuscleGroupSelect: (muscleGroup: string) => void;
  exerciseCount: number;
}

// กำหนดกล้ามเนื้อแต่ละกลุ่มตามกายวิภาคจริง
const muscleGroups = [
  // Front
  { name: 'Deltoid', nameTh: 'ไหล่', color: '#FF9800', view: 'front' },
  { name: 'Pectoralis major', nameTh: 'หน้าอก', color: '#F44336', view: 'front' },
  { name: 'Biceps brachii', nameTh: 'ต้นแขนหน้า', color: '#2196F3', view: 'front' },
  { name: 'Rectus abdominis', nameTh: 'กล้ามเนื้อหน้าท้อง', color: '#9C27B0', view: 'front' },
  { name: 'External oblique', nameTh: 'ข้างท้อง', color: '#673AB7', view: 'front' },
  { name: 'Brachialis', nameTh: 'แขนกล้ามใหญ่', color: '#00BCD4', view: 'front' },
  { name: 'Brachioradialis', nameTh: 'แขนล่าง', color: '#03A9F4', view: 'front' },
  { name: 'Adductor longus', nameTh: 'ต้นขาด้านใน', color: '#009688', view: 'front' },
  { name: 'Rectus femoris', nameTh: 'ต้นขาหน้า', color: '#4CAF50', view: 'front' },
  { name: 'Vastus lateralis', nameTh: 'ต้นขาด้านข้าง', color: '#8BC34A', view: 'front' },
  { name: 'Vastus medialis', nameTh: 'ต้นขาด้านใน', color: '#00BFA5', view: 'front' },
  { name: 'Sartorius', nameTh: 'กล้ามเนื้อช่างตัดเสื้อ', color: '#689F38', view: 'front' },
  { name: 'Tibialis anterior', nameTh: 'น่องด้านหน้า', color: '#1976D2', view: 'front' },
  
  // Back
  { name: 'Trapezius', nameTh: 'กล้ามเนื้อคอบ่า', color: '#3F51B5', view: 'back' },
  { name: 'Infraspinatus', nameTh: 'กล้ามเนื้อใต้สะบัก', color: '#7E57C2', view: 'back' },
  { name: 'Teres major', nameTh: 'กล้ามเนื้อกลมใหญ่', color: '#5E35B1', view: 'back' },
  { name: 'Triceps brachii', nameTh: 'ต้นแขนหลัง', color: '#00BCD4', view: 'back' },
  { name: 'Latissimus dorsi', nameTh: 'หลังส่วนล่าง', color: '#303F9F', view: 'back' },
  { name: 'Gluteus maximus', nameTh: 'ก้น', color: '#E91E63', view: 'back' },
  { name: 'Semitendinosus', nameTh: 'หลังขาด้านใน', color: '#FFC107', view: 'back' },
  { name: 'Biceps femoris', nameTh: 'หลังขาด้านข้าง', color: '#FFB300', view: 'back' },
  { name: 'Semimembranosus', nameTh: 'หลังขาชั้นลึก', color: '#FF6F00', view: 'back' },
  { name: 'Gastrocnemius', nameTh: 'น่องชั้นนอก', color: '#EC407A', view: 'back' },
  { name: 'Soleus', nameTh: 'น่องชั้นลึก', color: '#C62828', view: 'back' },
];

export default function MuscleGroupVisualizer({ 
  selectedMuscleGroup, 
  onMuscleGroupSelect,
  exerciseCount 
}: MuscleGroupVisualizerProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const handleMuscleClick = (muscleName: string) => {
    if (selectedMuscleGroup === muscleName) {
      onMuscleGroupSelect('all');
    } else {
      onMuscleGroupSelect(muscleName);
    }
  };

  const getMuscleColor = (muscleName: string) => {
    const muscle = muscleGroups.find(m => m.name === muscleName);
    return muscle?.color || '#999';
  };

  const getMuscleOpacity = (muscleName: string) => {
    if (selectedMuscleGroup === muscleName) return 0.9;
    if (hoveredMuscle === muscleName) return 0.7;
    if (selectedMuscleGroup !== 'all') return 0.2;
    return 0.6;
  };

  const activeMuscles = muscleGroups.filter(m => m.view === view);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FF6B35]" />
              เลือกกล้ามเนื้อ
            </CardTitle>
            {selectedMuscleGroup !== 'all' && (
              <Badge variant="outline" className="mt-2">
                {exerciseCount} ท่า
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showLabels ? 'แสดงป้าย' : 'ซ่อนป้าย'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="front">ด้านหน้า (Front)</TabsTrigger>
            <TabsTrigger value="back">ด้านหลัง (Back)</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="mt-0">
            <div className="relative w-full mx-auto bg-gray-50 rounded-lg p-4" style={{ maxWidth: '600px' }}>
              <svg viewBox="0 0 400 800" className="w-full h-auto">
                {/* Head */}
                <ellipse cx="200" cy="50" rx="35" ry="45" fill="#FFE0BD" stroke="#333" strokeWidth="2"/>
                
                {/* Neck */}
                <rect x="185" y="85" width="30" height="25" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                
                {/* Deltoid - Left */}
                <path 
                  d="M 135 110 Q 120 115 115 130 L 125 155 Q 135 150 145 145 L 155 120 Z"
                  fill={getMuscleColor('Deltoid')}
                  opacity={getMuscleOpacity('Deltoid')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Deltoid')}
                  onMouseEnter={() => setHoveredMuscle('Deltoid')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Deltoid - Right */}
                <path 
                  d="M 265 110 Q 280 115 285 130 L 275 155 Q 265 150 255 145 L 245 120 Z"
                  fill={getMuscleColor('Deltoid')}
                  opacity={getMuscleOpacity('Deltoid')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Deltoid')}
                  onMouseEnter={() => setHoveredMuscle('Deltoid')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Pectoralis major */}
                <path 
                  d="M 155 120 L 170 115 L 200 110 L 230 115 L 245 120 L 240 160 L 220 165 L 200 167 L 180 165 L 160 160 Z"
                  fill={getMuscleColor('Pectoralis major')}
                  opacity={getMuscleOpacity('Pectoralis major')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Pectoralis major')}
                  onMouseEnter={() => setHoveredMuscle('Pectoralis major')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Biceps brachii - Left */}
                <ellipse 
                  cx="125" cy="190" rx="15" ry="35"
                  fill={getMuscleColor('Biceps brachii')}
                  opacity={getMuscleOpacity('Biceps brachii')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Biceps brachii')}
                  onMouseEnter={() => setHoveredMuscle('Biceps brachii')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Biceps brachii - Right */}
                <ellipse 
                  cx="275" cy="190" rx="15" ry="35"
                  fill={getMuscleColor('Biceps brachii')}
                  opacity={getMuscleOpacity('Biceps brachii')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Biceps brachii')}
                  onMouseEnter={() => setHoveredMuscle('Biceps brachii')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Brachialis - Left */}
                <ellipse 
                  cx="120" cy="230" rx="12" ry="25"
                  fill={getMuscleColor('Brachialis')}
                  opacity={getMuscleOpacity('Brachialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Brachialis')}
                  onMouseEnter={() => setHoveredMuscle('Brachialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Brachialis - Right */}
                <ellipse 
                  cx="280" cy="230" rx="12" ry="25"
                  fill={getMuscleColor('Brachialis')}
                  opacity={getMuscleOpacity('Brachialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Brachialis')}
                  onMouseEnter={() => setHoveredMuscle('Brachialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Rectus abdominis */}
                <path 
                  d="M 175 170 L 225 170 L 225 290 L 175 290 Z"
                  fill={getMuscleColor('Rectus abdominis')}
                  opacity={getMuscleOpacity('Rectus abdominis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Rectus abdominis')}
                  onMouseEnter={() => setHoveredMuscle('Rectus abdominis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Six-pack lines */}
                <line x1="200" y1="180" x2="200" y2="285" stroke="#333" strokeWidth="1" opacity="0.3"/>
                <line x1="177" y1="200" x2="223" y2="200" stroke="#333" strokeWidth="1" opacity="0.3"/>
                <line x1="177" y1="230" x2="223" y2="230" stroke="#333" strokeWidth="1" opacity="0.3"/>
                <line x1="177" y1="260" x2="223" y2="260" stroke="#333" strokeWidth="1" opacity="0.3"/>
                
                {/* External oblique - Left */}
                <path 
                  d="M 155 180 Q 145 200 145 230 L 155 270 L 173 260 L 173 180 Z"
                  fill={getMuscleColor('External oblique')}
                  opacity={getMuscleOpacity('External oblique')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('External oblique')}
                  onMouseEnter={() => setHoveredMuscle('External oblique')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* External oblique - Right */}
                <path 
                  d="M 245 180 Q 255 200 255 230 L 245 270 L 227 260 L 227 180 Z"
                  fill={getMuscleColor('External oblique')}
                  opacity={getMuscleOpacity('External oblique')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('External oblique')}
                  onMouseEnter={() => setHoveredMuscle('External oblique')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Brachioradialis - Left */}
                <path 
                  d="M 115 260 L 108 310 L 115 315 L 122 310 L 125 265 Z"
                  fill={getMuscleColor('Brachioradialis')}
                  opacity={getMuscleOpacity('Brachioradialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Brachioradialis')}
                  onMouseEnter={() => setHoveredMuscle('Brachioradialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Brachioradialis - Right */}
                <path 
                  d="M 285 260 L 292 310 L 285 315 L 278 310 L 275 265 Z"
                  fill={getMuscleColor('Brachioradialis')}
                  opacity={getMuscleOpacity('Brachioradialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Brachioradialis')}
                  onMouseEnter={() => setHoveredMuscle('Brachioradialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Sartorius - Left */}
                <path 
                  d="M 160 300 Q 150 380 155 450 L 165 445 Q 168 370 175 300 Z"
                  fill={getMuscleColor('Sartorius')}
                  opacity={getMuscleOpacity('Sartorius')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Sartorius')}
                  onMouseEnter={() => setHoveredMuscle('Sartorius')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Sartorius - Right */}
                <path 
                  d="M 240 300 Q 250 380 245 450 L 235 445 Q 232 370 225 300 Z"
                  fill={getMuscleColor('Sartorius')}
                  opacity={getMuscleOpacity('Sartorius')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Sartorius')}
                  onMouseEnter={() => setHoveredMuscle('Sartorius')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Rectus femoris - Left */}
                <ellipse 
                  cx="170" cy="370" rx="16" ry="55"
                  fill={getMuscleColor('Rectus femoris')}
                  opacity={getMuscleOpacity('Rectus femoris')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Rectus femoris')}
                  onMouseEnter={() => setHoveredMuscle('Rectus femoris')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Rectus femoris - Right */}
                <ellipse 
                  cx="230" cy="370" rx="16" ry="55"
                  fill={getMuscleColor('Rectus femoris')}
                  opacity={getMuscleOpacity('Rectus femoris')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Rectus femoris')}
                  onMouseEnter={() => setHoveredMuscle('Rectus femoris')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Vastus lateralis - Left */}
                <path 
                  d="M 145 320 L 135 400 L 145 430 L 155 420 L 155 325 Z"
                  fill={getMuscleColor('Vastus lateralis')}
                  opacity={getMuscleOpacity('Vastus lateralis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Vastus lateralis')}
                  onMouseEnter={() => setHoveredMuscle('Vastus lateralis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Vastus lateralis - Right */}
                <path 
                  d="M 255 320 L 265 400 L 255 430 L 245 420 L 245 325 Z"
                  fill={getMuscleColor('Vastus lateralis')}
                  opacity={getMuscleOpacity('Vastus lateralis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Vastus lateralis')}
                  onMouseEnter={() => setHoveredMuscle('Vastus lateralis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Vastus medialis - Left */}
                <ellipse 
                  cx="185" cy="400" rx="12" ry="35"
                  fill={getMuscleColor('Vastus medialis')}
                  opacity={getMuscleOpacity('Vastus medialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Vastus medialis')}
                  onMouseEnter={() => setHoveredMuscle('Vastus medialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Vastus medialis - Right */}
                <ellipse 
                  cx="215" cy="400" rx="12" ry="35"
                  fill={getMuscleColor('Vastus medialis')}
                  opacity={getMuscleOpacity('Vastus medialis')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Vastus medialis')}
                  onMouseEnter={() => setHoveredMuscle('Vastus medialis')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Adductor longus - Left */}
                <path 
                  d="M 185 300 Q 192 340 195 380 L 187 378 Q 183 335 180 300 Z"
                  fill={getMuscleColor('Adductor longus')}
                  opacity={getMuscleOpacity('Adductor longus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Adductor longus')}
                  onMouseEnter={() => setHoveredMuscle('Adductor longus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Adductor longus - Right */}
                <path 
                  d="M 215 300 Q 208 340 205 380 L 213 378 Q 217 335 220 300 Z"
                  fill={getMuscleColor('Adductor longus')}
                  opacity={getMuscleOpacity('Adductor longus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Adductor longus')}
                  onMouseEnter={() => setHoveredMuscle('Adductor longus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Tibialis anterior - Left */}
                <ellipse 
                  cx="165" cy="560" rx="12" ry="65"
                  fill={getMuscleColor('Tibialis anterior')}
                  opacity={getMuscleOpacity('Tibialis anterior')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Tibialis anterior')}
                  onMouseEnter={() => setHoveredMuscle('Tibialis anterior')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Tibialis anterior - Right */}
                <ellipse 
                  cx="235" cy="560" rx="12" ry="65"
                  fill={getMuscleColor('Tibialis anterior')}
                  opacity={getMuscleOpacity('Tibialis anterior')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Tibialis anterior')}
                  onMouseEnter={() => setHoveredMuscle('Tibialis anterior')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Knee joints */}
                <ellipse cx="165" cy="445" rx="15" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="235" cy="445" rx="15" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1.5"/>
                
                {/* Lower legs */}
                <rect x="155" y="450" width="25" height="80" fill="#FFE0BD" stroke="#333" strokeWidth="1" opacity="0.3"/>
                <rect x="220" y="450" width="25" height="80" fill="#FFE0BD" stroke="#333" strokeWidth="1" opacity="0.3"/>
                
                {/* Feet */}
                <ellipse cx="167" cy="640" rx="20" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                <ellipse cx="233" cy="640" rx="20" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                
                {/* Labels */}
                {showLabels && hoveredMuscle && (
                  <g>
                    <rect x="10" y="10" width="200" height="35" fill="white" stroke="#FF6B35" strokeWidth="2" rx="5"/>
                    <text x="20" y="32" fill="#333" fontSize="16">
                      {muscleGroups.find(m => m.name === hoveredMuscle)?.nameTh}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="back" className="mt-0">
            <div className="relative w-full mx-auto bg-gray-50 rounded-lg p-4" style={{ maxWidth: '600px' }}>
              <svg viewBox="0 0 400 800" className="w-full h-auto">
                {/* Head */}
                <ellipse cx="200" cy="50" rx="35" ry="45" fill="#FFE0BD" stroke="#333" strokeWidth="2"/>
                
                {/* Neck */}
                <rect x="185" y="85" width="30" height="25" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                
                {/* Trapezius */}
                <path 
                  d="M 155 110 L 170 100 L 200 95 L 230 100 L 245 110 L 250 145 L 235 155 L 200 160 L 165 155 L 150 145 Z"
                  fill={getMuscleColor('Trapezius')}
                  opacity={getMuscleOpacity('Trapezius')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Trapezius')}
                  onMouseEnter={() => setHoveredMuscle('Trapezius')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Infraspinatus - Left */}
                <path 
                  d="M 140 130 Q 130 140 128 155 L 145 170 L 155 160 L 152 135 Z"
                  fill={getMuscleColor('Infraspinatus')}
                  opacity={getMuscleOpacity('Infraspinatus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Infraspinatus')}
                  onMouseEnter={() => setHoveredMuscle('Infraspinatus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Infraspinatus - Right */}
                <path 
                  d="M 260 130 Q 270 140 272 155 L 255 170 L 245 160 L 248 135 Z"
                  fill={getMuscleColor('Infraspinatus')}
                  opacity={getMuscleOpacity('Infraspinatus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Infraspinatus')}
                  onMouseEnter={() => setHoveredMuscle('Infraspinatus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Teres major - Left */}
                <ellipse 
                  cx="135" cy="175" rx="14" ry="20"
                  fill={getMuscleColor('Teres major')}
                  opacity={getMuscleOpacity('Teres major')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Teres major')}
                  onMouseEnter={() => setHoveredMuscle('Teres major')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Teres major - Right */}
                <ellipse 
                  cx="265" cy="175" rx="14" ry="20"
                  fill={getMuscleColor('Teres major')}
                  opacity={getMuscleOpacity('Teres major')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Teres major')}
                  onMouseEnter={() => setHoveredMuscle('Teres major')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Triceps brachii - Left */}
                <path 
                  d="M 122 165 L 115 205 L 120 230 L 132 225 L 135 170 Z"
                  fill={getMuscleColor('Triceps brachii')}
                  opacity={getMuscleOpacity('Triceps brachii')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Triceps brachii')}
                  onMouseEnter={() => setHoveredMuscle('Triceps brachii')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Triceps brachii - Right */}
                <path 
                  d="M 278 165 L 285 205 L 280 230 L 268 225 L 265 170 Z"
                  fill={getMuscleColor('Triceps brachii')}
                  opacity={getMuscleOpacity('Triceps brachii')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Triceps brachii')}
                  onMouseEnter={() => setHoveredMuscle('Triceps brachii')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Latissimus dorsi */}
                <path 
                  d="M 160 165 L 240 165 L 250 240 L 235 260 L 200 265 L 165 260 L 150 240 Z"
                  fill={getMuscleColor('Latissimus dorsi')}
                  opacity={getMuscleOpacity('Latissimus dorsi')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Latissimus dorsi')}
                  onMouseEnter={() => setHoveredMuscle('Latissimus dorsi')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Spine line */}
                <line x1="200" y1="100" x2="200" y2="265" stroke="#333" strokeWidth="1.5" opacity="0.3"/>
                
                {/* Gluteus maximus - Left */}
                <path 
                  d="M 165 270 L 155 310 L 165 330 L 185 325 L 195 280 Z"
                  fill={getMuscleColor('Gluteus maximus')}
                  opacity={getMuscleOpacity('Gluteus maximus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Gluteus maximus')}
                  onMouseEnter={() => setHoveredMuscle('Gluteus maximus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Gluteus maximus - Right */}
                <path 
                  d="M 235 270 L 245 310 L 235 330 L 215 325 L 205 280 Z"
                  fill={getMuscleColor('Gluteus maximus')}
                  opacity={getMuscleOpacity('Gluteus maximus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Gluteus maximus')}
                  onMouseEnter={() => setHoveredMuscle('Gluteus maximus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Biceps femoris - Left */}
                <path 
                  d="M 150 340 L 142 415 L 150 430 L 162 420 L 165 345 Z"
                  fill={getMuscleColor('Biceps femoris')}
                  opacity={getMuscleOpacity('Biceps femoris')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Biceps femoris')}
                  onMouseEnter={() => setHoveredMuscle('Biceps femoris')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Biceps femoris - Right */}
                <path 
                  d="M 250 340 L 258 415 L 250 430 L 238 420 L 235 345 Z"
                  fill={getMuscleColor('Biceps femoris')}
                  opacity={getMuscleOpacity('Biceps femoris')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Biceps femoris')}
                  onMouseEnter={() => setHoveredMuscle('Biceps femoris')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Semitendinosus - Left */}
                <ellipse 
                  cx="180" cy="380" rx="10" ry="40"
                  fill={getMuscleColor('Semitendinosus')}
                  opacity={getMuscleOpacity('Semitendinosus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Semitendinosus')}
                  onMouseEnter={() => setHoveredMuscle('Semitendinosus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Semitendinosus - Right */}
                <ellipse 
                  cx="220" cy="380" rx="10" ry="40"
                  fill={getMuscleColor('Semitendinosus')}
                  opacity={getMuscleOpacity('Semitendinosus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Semitendinosus')}
                  onMouseEnter={() => setHoveredMuscle('Semitendinosus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Semimembranosus - Left */}
                <ellipse 
                  cx="172" cy="385" rx="9" ry="35"
                  fill={getMuscleColor('Semimembranosus')}
                  opacity={getMuscleOpacity('Semimembranosus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Semimembranosus')}
                  onMouseEnter={() => setHoveredMuscle('Semimembranosus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Semimembranosus - Right */}
                <ellipse 
                  cx="228" cy="385" rx="9" ry="35"
                  fill={getMuscleColor('Semimembranosus')}
                  opacity={getMuscleOpacity('Semimembranosus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Semimembranosus')}
                  onMouseEnter={() => setHoveredMuscle('Semimembranosus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Gastrocnemius - Left */}
                <path 
                  d="M 158 450 L 152 510 L 160 530 L 172 525 L 175 455 Z"
                  fill={getMuscleColor('Gastrocnemius')}
                  opacity={getMuscleOpacity('Gastrocnemius')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Gastrocnemius')}
                  onMouseEnter={() => setHoveredMuscle('Gastrocnemius')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Gastrocnemius - Right */}
                <path 
                  d="M 242 450 L 248 510 L 240 530 L 228 525 L 225 455 Z"
                  fill={getMuscleColor('Gastrocnemius')}
                  opacity={getMuscleOpacity('Gastrocnemius')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Gastrocnemius')}
                  onMouseEnter={() => setHoveredMuscle('Gastrocnemius')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Soleus - Left */}
                <path 
                  d="M 160 540 L 157 590 L 165 600 L 173 595 L 172 545 Z"
                  fill={getMuscleColor('Soleus')}
                  opacity={getMuscleOpacity('Soleus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Soleus')}
                  onMouseEnter={() => setHoveredMuscle('Soleus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Soleus - Right */}
                <path 
                  d="M 240 540 L 243 590 L 235 600 L 227 595 L 228 545 Z"
                  fill={getMuscleColor('Soleus')}
                  opacity={getMuscleOpacity('Soleus')}
                  stroke="#333"
                  strokeWidth="1.5"
                  onClick={() => handleMuscleClick('Soleus')}
                  onMouseEnter={() => setHoveredMuscle('Soleus')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Knee joints */}
                <ellipse cx="165" cy="445" rx="15" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="235" cy="445" rx="15" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1.5"/>
                
                {/* Lower legs base */}
                <rect x="155" y="450" width="25" height="80" fill="#FFE0BD" stroke="#333" strokeWidth="1" opacity="0.2"/>
                <rect x="220" y="450" width="25" height="80" fill="#FFE0BD" stroke="#333" strokeWidth="1" opacity="0.2"/>
                
                {/* Feet */}
                <ellipse cx="167" cy="640" rx="20" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                <ellipse cx="233" cy="640" rx="20" ry="12" fill="#FFE0BD" stroke="#333" strokeWidth="1"/>
                
                {/* Labels */}
                {showLabels && hoveredMuscle && (
                  <g>
                    <rect x="10" y="10" width="200" height="35" fill="white" stroke="#FF6B35" strokeWidth="2" rx="5"/>
                    <text x="20" y="32" fill="#333" fontSize="16">
                      {muscleGroups.find(m => m.name === hoveredMuscle)?.nameTh}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium mb-3">กลุ่มกล้ามเนื้อ:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeMuscles.filter((muscle, index, self) => 
              index === self.findIndex((m) => m.name === muscle.name)
            ).map((muscle) => {
              const isSelected = selectedMuscleGroup === muscle.name;
              return (
                <Button
                  key={muscle.name}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMuscleClick(muscle.name)}
                  className={`justify-start ${isSelected ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90' : ''}`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: muscle.color }}
                  />
                  {muscle.nameTh}
                </Button>
              );
            })}
          </div>
          
          {selectedMuscleGroup !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMuscleGroupSelect('all')}
              className="w-full mt-3"
            >
              ล้างการเลือก
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
