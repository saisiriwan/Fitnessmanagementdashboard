// Training Goals Types

export type TrainingGoal = 'weight_loss' | 'muscle_building' | 'strength' | 'general_health';

export interface GoalMetadata {
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  description: string;
  metrics: string[];
}

export const TRAINING_GOALS: Record<TrainingGoal, GoalMetadata> = {
  weight_loss: {
    label: 'ลดน้ำหนัก',
    labelEn: 'Weight Loss',
    icon: '🔥',
    color: '#FF6B35',
    description: 'ลดไขมัน ลดน้ำหนักตัว ปรับสัดส่วนร่างกาย',
    metrics: ['weight', 'bmi', 'abdomen', 'hip', 'hydration']
  },
  muscle_building: {
    label: 'เพิ่มกล้ามเนื้อ',
    labelEn: 'Muscle Building',
    icon: '💪',
    color: '#002140',
    description: 'เพิ่มมวลกล้ามเนื้อ สร้างรูปร่าง Hypertrophy',
    metrics: ['arms', 'thighs', 'shoulder', 'chest', 'workload']
  },
  strength: {
    label: 'เพิ่มความแข็งแรง',
    labelEn: 'Strength Gain',
    icon: '🏋️',
    color: '#0066CC',
    description: 'เพิ่มพลังกล้ามเนื้อ ยกน้ำหนักได้มากขึ้น',
    metrics: ['maxLoad', 'muscleMass', 'oneRM']
  },
  general_health: {
    label: 'สุขภาพทั่วไป',
    labelEn: 'General Health',
    icon: '🌟',
    color: '#10B981',
    description: 'ออกกำลังกายเพื่อสุขภาพ รักษาสุขภาพ',
    metrics: ['vo2max', 'restingHR', 'recovery', 'frequency']
  }
};

// Body Metrics Data Structure
export interface BodyMetrics {
  id: string;
  clientId: string;
  recordedAt: string; // ISO date string
  
  // Weight Loss Metrics
  weight?: number;           // kg
  bmi?: number;              // calculated
  abdomen?: number;          // cm
  hip?: number;              // cm
  hydration?: number;        // liters per day
  
  // Muscle Building Metrics
  arms?: number;             // cm (bicep circumference)
  thighs?: number;           // cm
  shoulder?: number;         // cm
  chest?: number;            // cm
  workload?: number;         // total volume (kg × reps)
  
  // Strength Metrics
  maxLoad?: number;          // kg (highest weight lifted)
  muscleMass?: number;       // kg
  oneRM?: {                  // One Rep Max records
    exercise: string;
    weight: number;
  }[];
  
  // General Health Metrics
  vo2max?: number;           // ml/kg/min
  restingHR?: number;        // bpm
  recovery?: number;         // percentage
  frequency?: number;        // sessions per week
  
  // Common
  notes?: string;
  recordedBy?: string;       // trainer ID
}

// Metric Definitions for UI
export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  icon: string;
  description: string;
  category: 'weight_loss' | 'muscle_building' | 'strength' | 'general_health';
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  // Weight Loss
  { key: 'weight', label: 'น้ำหนักตัว', unit: 'kg', icon: '⚖️', description: 'น้ำหนักตัว', category: 'weight_loss' },
  { key: 'bmi', label: 'ดัชนีมวลกาย', unit: 'BMI', icon: '📊', description: 'Body Mass Index', category: 'weight_loss' },
  { key: 'abdomen', label: 'รอบหน้าท้อง', unit: 'cm', icon: '📏', description: 'รอบวัดหน้าท้อง', category: 'weight_loss' },
  { key: 'hip', label: 'รอบสะโพก', unit: 'cm', icon: '📏', description: 'รอบวัดสะโพก', category: 'weight_loss' },
  { key: 'hydration', label: 'การดื่มน้ำ', unit: 'ลิตร/วัน', icon: '💧', description: 'ปริมาณน้ำที่ดื่มต่อวัน', category: 'weight_loss' },
  
  // Muscle Building
  { key: 'arms', label: 'รอบแขน', unit: 'cm', icon: '💪', description: 'รอบวัดแขนบริเวณไบเซ็ป', category: 'muscle_building' },
  { key: 'thighs', label: 'รอบขา', unit: 'cm', icon: '🦵', description: 'รอบวัดขาบริเวณต้นขา', category: 'muscle_building' },
  { key: 'shoulder', label: 'รอบไหล่', unit: 'cm', icon: '👔', description: 'รอบวัดไหล่', category: 'muscle_building' },
  { key: 'chest', label: 'รอบอก', unit: 'cm', icon: '🫁', description: 'รอบวัดหน้าอก', category: 'muscle_building' },
  { key: 'workload', label: 'ปริมาณงาน', unit: 'kg', icon: '📈', description: 'ปริมาณงานรวม (น้ำหนัก × รอบ)', category: 'muscle_building' },
  
  // Strength
  { key: 'maxLoad', label: 'น้ำหนักสูงสุด', unit: 'kg', icon: '🏋️', description: 'น้ำหนักสูงสุดที่ยกได้', category: 'strength' },
  { key: 'muscleMass', label: 'มวลกล้ามเนื้อ', unit: 'kg', icon: '💪', description: 'มวลกล้ามเนื้อ', category: 'strength' },
  
  // General Health
  { key: 'vo2max', label: 'VO₂ Max', unit: 'ml/kg/min', icon: '🫁', description: 'ความสามารถในการใช้ออกซิเจน', category: 'general_health' },
  { key: 'restingHR', label: 'Heart Rate พัก', unit: 'bpm', icon: '❤️', description: 'อัตราการเต้นของหัวใจขณะพัก', category: 'general_health' },
  { key: 'recovery', label: 'การฟื้นตัว', unit: '%', icon: '🔄', description: 'ความสามารถในการฟื้นตัว', category: 'general_health' },
  { key: 'frequency', label: 'ความสม่ำเสมอ', unit: 'ครั้ง/สัปดาห์', icon: '📅', description: 'จำนวนครั้งที่ฝึกต่อสัปดาห์', category: 'general_health' }
];
