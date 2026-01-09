import { Exercise } from '../components/AppContext';

// 🏋️ Default Exercises - ท่าพื้นฐานที่มากับระบบ
// แบ่งเป็น 3 ประเภทหลัก:
// 1. Weight Training (เวทเทรนนิ่ง) - สีน้ำเงิน
// 2. Cardio (คาร์ดิโอ) - สีส้ม
// 3. Flexibility (เฟล็กซ์) - สีเขียว

export const defaultExercises: Omit<Exercise, 'id'>[] = [
  // ============================================================
  // 🏋️ WEIGHT TRAINING (เวทเทรนนิ่ง)
  // ============================================================
  
  // ========== CHEST (หน้าอก) ==========
  {
    name: 'Barbell Bench Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    movementPattern: 'Push',
    instructions: 'นอนหงายบนม้านอน ยกบาร์เบลขึ้นเหนือหน้าอก ลดลงจนแตะหน้าอก แล้วผลักขึ้น',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dumbbell Bench Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    movementPattern: 'Push',
    instructions: 'นอนหงายบนม้านอน ถือดัมเบลทั้งสองข้าง ผลักขึ้นพร้อมกัน',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Incline Dumbbell Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'],
    movementPattern: 'Push',
    instructions: 'นอนบนม้านอนปรับเอียง 30-45 องศา ผลักดัมเบลขึ้นเหนือหน้าอกส่วนบน',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Push-ups',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Chest', 'Triceps', 'Core'],
    movementPattern: 'Push',
    instructions: 'ท่าพื้น ลดตัวลงจนอกเกือบแตะพื้น แล้วผลักตัวขึ้น',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Cable Fly',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Chest'],
    movementPattern: 'Fly',
    instructions: 'ยืนตรงกลางเครื่อง Cable ดึงสายทั้งสองข้างเข้าหากันด้านหน้า',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dumbbell Fly',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Chest'],
    movementPattern: 'Fly',
    instructions: 'นอนหงาย กางดัมเบลออกข้างแล้วนำเข้าหากันเหนือหน้าอก',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ========== BACK (หลัง) ==========
  {
    name: 'Deadlift',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Lower Back', 'Glutes', 'Hamstrings', 'Traps'],
    movementPattern: 'Hinge',
    instructions: 'ยืนหน้าบาร์เบล ก้มหยิบบาร์ แล้วยืดตัวขึ้นจนตัวตรง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Barbell Row',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Upper Back', 'Lats', 'Biceps'],
    movementPattern: 'Pull',
    instructions: 'ก้มตัวข้างหน้า ดึงบาร์เบลเข้าหาท้อง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Pull-ups',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Lats', 'Biceps', 'Upper Back'],
    movementPattern: 'Pull',
    instructions: 'ห้อยตัวบนบาร์ ดึงตัวขึ้นจนคางเกินบาร์',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Lat Pulldown',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Lats', 'Biceps', 'Upper Back'],
    movementPattern: 'Pull',
    instructions: 'นั่งบนเครื่อง Lat Pulldown ดึงบาร์ลงมาที่หน้าอก',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Seated Cable Row',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Middle Back', 'Lats', 'Biceps'],
    movementPattern: 'Pull',
    instructions: 'นั่งบนเครื่อง Cable Row ดึงมือจับเข้าหาท้อง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'T-Bar Row',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Middle Back', 'Lats'],
    movementPattern: 'Pull',
    instructions: 'ก้มตัว ดึง T-Bar เข้าหาท้อง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ========== LEGS (ขา) ==========
  {
    name: 'Barbell Squat',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    movementPattern: 'Squat',
    instructions: 'แบกบาร์เบลบนไหล่ ย่อเข่าลงจนต้นขาขนานพื้น แล้วยืนขึ้น',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Front Squat',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Core', 'Glutes'],
    movementPattern: 'Squat',
    instructions: 'แบกบาร์เบลด้านหน้าบนไหล่ ย่อเข่าลง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Leg Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    movementPattern: 'Push',
    instructions: 'นั่งบนเครื่อง Leg Press ผลักแผ่นออกด้วยเท้า',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Romanian Deadlift',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    movementPattern: 'Hinge',
    instructions: 'ถือบาร์เบล ก้มตัวลงโดยเข่างอเล็กน้อย จนรู้สึกยืดที่หลังขา',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Leg Extension',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps'],
    movementPattern: 'Extension',
    instructions: 'นั่งบนเครื่อง Leg Extension ยืดเข่าออกจนขาตรง',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Leg Curl',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Hamstrings'],
    movementPattern: 'Curl',
    instructions: 'นอนคว่ำหรือนั่งบนเครื่อง งอเข่าดึงน่องเข้าหาต้นขา',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Lunges',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    movementPattern: 'Lunge',
    instructions: 'ก้าวขาหน้าไปข้างหน้า ย่อเข่าลงจนขาหลังเกือบแตะพื้น',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Bulgarian Split Squat',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Quadriceps', 'Glutes'],
    movementPattern: 'Lunge',
    instructions: 'วางเท้าหลังบนม้า ย่อเข่าขาหน้าลง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Calf Raise',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Calves'],
    movementPattern: 'Raise',
    instructions: 'ยืนปลายเท้า ยกส้นขึ้นสูงสุด',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ========== SHOULDERS (ไหล่) ==========
  {
    name: 'Overhead Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Shoulders', 'Triceps'],
    movementPattern: 'Push',
    instructions: 'ยืนหรือนั่ง ผลักบาร์เบลหรือดัมเบลขึ้นเหนือศีรษะ',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dumbbell Shoulder Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Shoulders', 'Triceps'],
    movementPattern: 'Push',
    instructions: 'นั่ง ผลักดัมเบลขึ้นเหนือศีรษะ',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dumbbell Lateral Raise',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Shoulders'],
    movementPattern: 'Raise',
    instructions: 'ยืนตรง ยกดัมเบลออกข้างจนระดับไหล่',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Front Raise',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Front Shoulders'],
    movementPattern: 'Raise',
    instructions: 'ยืนตรง ยกดัมเบลขึ้นข้างหน้าจนระดับไหล่',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Rear Delt Fly',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Rear Shoulders', 'Upper Back'],
    movementPattern: 'Fly',
    instructions: 'ก้มตัว ยกดัมเบลออกข้างแบบกางแขน',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Arnold Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Shoulders', 'Triceps'],
    movementPattern: 'Push',
    instructions: 'นั่ง เริ่มต้นดัมเบลหันฝ่ามือเข้าหาตัว หมุนขณะผลักขึ้น',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ========== ARMS (แขน) ==========
  {
    name: 'Barbell Curl',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Biceps'],
    movementPattern: 'Curl',
    instructions: 'ยืนตรง งอข้อศอกดึงบาร์เบลขึ้นมาที่หน้าอก',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dumbbell Curl',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Biceps'],
    movementPattern: 'Curl',
    instructions: 'ยืนหรือนั่ง งอข้อศอกดึงดัมเบลขึ้น',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Hammer Curl',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Biceps', 'Forearms'],
    movementPattern: 'Curl',
    instructions: 'จับดัมเบลแนวตั้ง งอข้อศอกขึ้นเหมือนถือค้อน',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Preacher Curl',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Biceps'],
    movementPattern: 'Curl',
    instructions: 'นั่งบนม้า Preacher ดึงบาร์หรือดัมเบลขึ้น',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Tricep Dips',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Triceps', 'Chest'],
    movementPattern: 'Push',
    instructions: 'ค้อมมือบนบาร์คู่ ลดตัวลงโดยงอศอก แล้วดันตัวขึ้น',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Tricep Pushdown',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Triceps'],
    movementPattern: 'Extension',
    instructions: 'ยืนหน้าเครื่อง Cable ดันบาร์ลงโดยยืดศอก',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Overhead Tricep Extension',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Triceps'],
    movementPattern: 'Extension',
    instructions: 'ยกดัมเบลเหนือศีรษะ ลดลงหลังศีรษะโดยงอศอก',
    category: 'Isolation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Close-Grip Bench Press',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Triceps', 'Chest'],
    movementPattern: 'Push',
    instructions: 'นอนหงาย จับบาร์แคบกว่าปกติ ผลักขึ้น',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ========== CORE (แกนกลางลำตัว) ==========
  {
    name: 'Plank',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Core', 'Abs'],
    movementPattern: 'Static',
    instructions: 'ท่าแพลงค์ ค้อมข้อศอกและปลายเท้า ตัวตรง',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Side Plank',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Obliques', 'Core'],
    movementPattern: 'Static',
    instructions: 'ค้อมข้อศอกข้างเดียว ตัวตรงด้านข้าง',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Crunches',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Abs'],
    movementPattern: 'Crunch',
    instructions: 'นอนหงาย งอเข่า ยกหัวไหล่ขึ้นโดยหดหน้าท้อง',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Bicycle Crunches',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Abs', 'Obliques'],
    movementPattern: 'Rotation',
    instructions: 'นอนหงาย สลับศอกกับเข่าตรงข้าม',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Russian Twist',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Obliques', 'Core'],
    movementPattern: 'Rotation',
    instructions: 'นั่งเอนตัวหลัง ยกเท้าลอย หมุนตัวซ้าย-ขวา',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Mountain Climbers',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Core', 'Shoulders', 'Legs'],
    movementPattern: 'Dynamic',
    instructions: 'ท่าพื้น สลับเข่าเข้าหาอกเร็วๆ',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Hanging Leg Raise',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Lower Abs', 'Hip Flexors'],
    movementPattern: 'Raise',
    instructions: 'ห้อยบาร์ ยกขาขึ้นจนขนานพื้น',
    category: 'Bodyweight',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Cable Wood Chop',
    trainingType: 'weight-training',
    modality: 'strength',
    muscleGroups: ['Obliques', 'Core'],
    movementPattern: 'Rotation',
    instructions: 'ดึง Cable จากบนลงล่างในแนวทแยง',
    category: 'Compound',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ============================================================
  // 🏃 CARDIO (คาร์ดิโอ)
  // ============================================================
  
  {
    name: 'Running',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Cardiovascular'],
    movementPattern: 'Locomotion',
    instructions: 'วิ่งบนลู่วิ่งหรือกลางแจ้ง รักษาจังหวะการหายใจสม่ำเสมอ',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Treadmill Sprints',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Cardiovascular'],
    movementPattern: 'Sprint',
    instructions: 'วิ่งเร็วบนลู่วิ่งช่วงสั้นๆ สลับกับการพัก',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Cycling',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Cardiovascular'],
    movementPattern: 'Cycling',
    instructions: 'ปั่นจักรยานหรือจักรยานนั่งปั่น รักษาความเร็วคงที่',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Spin Bike Intervals',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Cardiovascular'],
    movementPattern: 'Cycling',
    instructions: 'ปั่นเร็วสูงสุด 30 วินาที พัก 30 วินาที',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Jump Rope',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Calves', 'Cardiovascular'],
    movementPattern: 'Jump',
    instructions: 'กระโดดเชือก รักษาจังหวะสม่ำเสมอ',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Burpees',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Full Body', 'Cardiovascular'],
    movementPattern: 'Compound',
    instructions: 'ลงท่าพื้น กระโดดเข้า แล้วกระโดดขึ้น',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Rowing Machine',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Back', 'Legs', 'Cardiovascular'],
    movementPattern: 'Pull',
    instructions: 'พายเรือบนเครื่อง ดึงมือจับเข้าหาท้อง',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Rowing Intervals',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Back', 'Legs', 'Cardiovascular'],
    movementPattern: 'Pull',
    instructions: 'พายเร็วสุด 500m พัก 1 นาที ทำซ้ำ',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Elliptical',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Cardiovascular'],
    movementPattern: 'Locomotion',
    instructions: 'ใช้เครื่อง Elliptical รักษาจังหวะสม่ำเสมอ',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Swimming',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Full Body', 'Cardiovascular'],
    movementPattern: 'Swim',
    instructions: 'ว่ายน้ำท่าใดก็ได้ รักษาจังหวะการหายใจ',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Battle Ropes',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Arms', 'Shoulders', 'Core', 'Cardiovascular'],
    movementPattern: 'Wave',
    instructions: 'โบกเชือกหนักสลับมือหรือพร้อมกัน',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Box Jumps',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Glutes', 'Cardiovascular'],
    movementPattern: 'Jump',
    instructions: 'กระโดดขึ้นกล่อง ลงมาพักเบาๆ',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Stair Climber',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Glutes', 'Cardiovascular'],
    movementPattern: 'Climb',
    instructions: 'เดินขึ้นบันไดเครื่อง รักษาจังหวะสม่ำเสมอ',
    category: 'Steady State',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Assault Bike',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Full Body', 'Cardiovascular'],
    movementPattern: 'Cycling',
    instructions: 'ปั่นและดันจักรยานแบบใช้แขนและขาร่วมกัน',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'High Knees',
    trainingType: 'cardio',
    modality: 'cardio',
    muscleGroups: ['Legs', 'Core', 'Cardiovascular'],
    movementPattern: 'Run-in-place',
    instructions: 'วิ่งที่เดิม ยกเข่าสูงสุด',
    category: 'HIIT',
    isDefault: true,
    createdAt: new Date().toISOString()
  },

  // ============================================================
  // 🧘 FLEXIBILITY (เฟล็กซ์)
  // ============================================================
  
  {
    name: 'Hamstring Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Hamstrings'],
    movementPattern: 'Stretch',
    instructions: 'นั่งเหยียดขา ก้มตัวลงจับปลายเท้า กดค้างไว้ 30 วินาที',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Quad Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Quadriceps'],
    movementPattern: 'Stretch',
    instructions: 'ยืนดึงเท้าขึ้นหลัง จับข้อเท้า กดค้างไว้ 30 วินาที',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Calf Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Calves'],
    movementPattern: 'Stretch',
    instructions: 'ก้าวขาหน้าไปข้างหน้า ขาหลังยืดตรง กดส้นลงพื้น',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Shoulder Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Shoulders'],
    movementPattern: 'Stretch',
    instructions: 'ยกแขนข้ามตัว ดันด้วยมืออีกข้าง กดค้างไว้ 30 วินาที',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Tricep Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Triceps', 'Shoulders'],
    movementPattern: 'Stretch',
    instructions: 'ยกแขนขึ้น งอศอกลงหลังหัว ดันด้วยมืออีกข้าง',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Chest Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Chest', 'Shoulders'],
    movementPattern: 'Stretch',
    instructions: 'ยืนหน้าเสา เอามือจับเสา หันตัวออก',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Hip Flexor Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Hip Flexors', 'Quadriceps'],
    movementPattern: 'Stretch',
    instructions: 'คุกเข่าขาหลัง ดันสะโพกไปข้างหน้า',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Pigeon Pose',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Glutes', 'Hips'],
    movementPattern: 'Stretch',
    instructions: 'งอขาหน้าไขว้ ขาหลังยืดตรง เอนตัวลงข้างหน้า',
    category: 'Yoga',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Child Pose',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Back', 'Hips', 'Shoulders'],
    movementPattern: 'Stretch',
    instructions: 'คุกเข่า เอนตัวลงไปข้างหน้า แขนยื่นไปข้างหน้า',
    category: 'Yoga',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Cat-Cow Stretch',
    trainingType: 'flexibility',
    modality: 'mobility',
    muscleGroups: ['Spine', 'Back'],
    movementPattern: 'Flexion-Extension',
    instructions: 'คุกเข่า ส่ายหลังขึ้นลงสลับกัน',
    category: 'Dynamic Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Downward Dog',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Hamstrings', 'Calves', 'Shoulders', 'Back'],
    movementPattern: 'Stretch',
    instructions: 'ท่าสามเหลี่ยม มือและเท้าบนพื้น สะโพกชี้ขึ้น',
    category: 'Yoga',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Cobra Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Abs', 'Hip Flexors', 'Chest'],
    movementPattern: 'Extension',
    instructions: 'นอนคว่ำ ดันตัวขึ้นด้วยแขน โก่งหลัง',
    category: 'Yoga',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Spinal Twist',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Obliques', 'Back'],
    movementPattern: 'Rotation',
    instructions: 'นอนหงาย ไขว้ขาข้ามตัว หันหน้าไปอีกทาง',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Butterfly Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Inner Thighs', 'Hips'],
    movementPattern: 'Stretch',
    instructions: 'นั่ง เอาฝ่าเท้าชิดกัน กดเข่าลง',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Seated Forward Bend',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Hamstrings', 'Back'],
    movementPattern: 'Stretch',
    instructions: 'นั่งเหยียดขา ก้มตัวไปหาปลายเท้า',
    category: 'Yoga',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Standing Quad Stretch',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Quadriceps'],
    movementPattern: 'Stretch',
    instructions: 'ยืนดึงเท้าขึ้นหลัง จับข้อเท้าด้วยมือ',
    category: 'Static Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Hip Circles',
    trainingType: 'flexibility',
    modality: 'mobility',
    muscleGroups: ['Hips'],
    movementPattern: 'Rotation',
    instructions: 'หมุนสะโพกเป็นวงกลมทั้ง 2 ทิศทาง',
    category: 'Dynamic Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Arm Circles',
    trainingType: 'flexibility',
    modality: 'mobility',
    muscleGroups: ['Shoulders'],
    movementPattern: 'Rotation',
    instructions: 'หมุนแขนเป็นวงกลมทั้งขนาดเล็กและใหญ่',
    category: 'Dynamic Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Leg Swings',
    trainingType: 'flexibility',
    modality: 'mobility',
    muscleGroups: ['Hip Flexors', 'Hamstrings'],
    movementPattern: 'Swing',
    instructions: 'ยืนจับราวหรือผนัง แกว่งขาไปข้างหน้าข้างหลัง',
    category: 'Dynamic Stretch',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Foam Rolling - IT Band',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['IT Band', 'Quads'],
    movementPattern: 'Self-Myofascial Release',
    instructions: 'นอนตะแคง กลิ้งโฟมด้านข้างขา',
    category: 'Foam Rolling',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Foam Rolling - Quads',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Quadriceps'],
    movementPattern: 'Self-Myofascial Release',
    instructions: 'นอนคว่ำ กลิ้งโฟมที่ต้นขาด้านหน้า',
    category: 'Foam Rolling',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'Foam Rolling - Back',
    trainingType: 'flexibility',
    modality: 'flexibility',
    muscleGroups: ['Upper Back', 'Middle Back'],
    movementPattern: 'Self-Myofascial Release',
    instructions: 'นอนหงาย วางโฟมที่หลัง กลิ้งขึ้นลง',
    category: 'Foam Rolling',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

// Helper function to add default exercises to the system
export const getDefaultExercisesWithIds = (): Exercise[] => {
  return defaultExercises.map((exercise, index) => ({
    ...exercise,
    id: `default-${index + 1}`
  }));
};

// ✨ NEW: Helper functions สำหรับ filter ตาม trainingType
export const getExercisesByTrainingType = (type: 'weight-training' | 'cardio' | 'flexibility'): Exercise[] => {
  return getDefaultExercisesWithIds().filter(ex => ex.trainingType === type);
};

export const getTrainingTypeConfig = (type: 'weight-training' | 'cardio' | 'flexibility') => {
  const configs = {
    'weight-training': {
      label: 'เวทเทรนนิ่ง',
      icon: '🏋️',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100',
      description: 'พัฒนาความแข็งแรง มวลกล้ามเนื้อ เพิ่มอัตราการเผาผลาญ',
      frequency: '2-4 ครั้ง/สัปดาห์'
    },
    'cardio': {
      label: 'คาร์ดิโอ',
      icon: '🏃',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100',
      description: 'พัฒนาระบบหัวใจและหลอดเลือด เผาผลาญไขมัน เพิ่มความทนทาน',
      frequency: '3-5 ครั้ง/สัปดาห์'
    },
    'flexibility': {
      label: 'เฟล็กซ์',
      icon: '🧘',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100',
      description: 'ป้องกันการบาดเจ็บ เพิ่มช่วงการเคลื่อนไหว ช่วยการฟื้นตัว',
      frequency: '3-5 ครั้ง/สัปดาห์ หรือทุกวัน'
    }
  };
  return configs[type];
};
