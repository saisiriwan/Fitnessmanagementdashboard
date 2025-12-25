import React, { useState, useEffect } from "react";

// --- 1. UI Components (Themed to User's CSS: shadcn/ui + Navy/Orange) ---

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

const Button = ({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: any) => {
  // Base: 0.75rem radius (rounded-xl), Medium weight, Smooth transition
  const baseStyle =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const variants: any = {
    // Primary: Navy Blue (#0F3460 equivalent)
    default:
      "bg-navy-900 text-white hover:bg-navy-800 shadow-md hover:shadow-lg border border-transparent",
    // Outline: Light Gray border, Dark Gray text
    outline:
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-navy-900 shadow-sm",
    // Ghost: Subtle hover
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-navy-900",
    // Secondary/Accent: Vibrant Orange background
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
    // Soft Accent: Light Orange bg, Orange text
    "accent-soft":
      "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100",
  };

  const sizes: any = {
    default: "h-11 px-5 py-2.5",
    sm: "h-9 rounded-lg px-3 text-xs",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      // Ring color = Orange (Accent)
      "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm text-black",
      className
    )}
    {...props}
  />
);

const Textarea = ({ className, ...props }: any) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none shadow-sm text-black",
      className
    )}
    {...props}
  />
);

const Label = ({ className, children, ...props }: any) => (
  <label
    className={cn(
      "text-xs font-semibold text-navy-900 mb-2 block tracking-tight uppercase",
      className
    )}
    {...props}
  >
    {children}
  </label>
);

const Badge = ({ variant = "default", className, children }: any) => {
  const variants: any = {
    default:
      "border-transparent bg-navy-900 text-white shadow hover:bg-navy-900/80",
    secondary:
      "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "text-slate-700 border-slate-200",
    orange:
      "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

// --- 2. Icons ---
const Icons = {
  X: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 18 18" />
    </svg>
  ),
  Save: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  ),
  ChevronRight: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Plus: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  Trash2: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  ),
  Dumbbell: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  ),
  Clock: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Activity: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Flame: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.243-2.143.5-3.5a6 6 0 1 0 6-6c0 1-1 2-1 3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  StretchHorizontal: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="6" x="2" y="4" rx="2" />
      <rect width="20" height="6" x="2" y="14" rx="2" />
      <path d="M12 10v4" />
    </svg>
  ),
  Check: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  AlignJustify: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  ),
  Zap: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  PenLine: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Layers: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  Target: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Move: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <line x1="12" x2="12" y1="2" y2="22" />
    </svg>
  ),
};

// --- 3. Data ---

const MODALITIES = [
  "เสริมแรง (Strength)",
  "คาร์ดิโอ (Cardio)",
  "ยืดหยุ่น (Flexibility)",
];
const MUSCLE_GROUPS = [
  "หน้าแขน (Biceps)",
  "อก (Chest)",
  "แกนกลาง (Core)",
  "ท่อนแขน (Forearms)",
  "ทั่วร่างกาย (Full Body)",
  "ก้น (Glutes)",
  "ต้นขาหลัง (Hamstrings)",
  "สะโพกและขาหนีบ (Hip & Groin)",
  "หลังล่าง (Lower Back)",
  "ช่วงล่าง (Lower Body)",
  "น่อง/ขาท่อนล่าง (Lower Leg)",
  "หลังส่วนกลาง (Mid Back)",
  "ต้นขาหน้า (Quads)",
  "ไหล่ (Shoulders)",
  "หลังแขน (Triceps)",
  "หลังส่วนบนและคอ (Upper Back & Neck)",
  "ร่างกายท่อนบน (Upper Body)",
];
const MOVEMENT_PATTERNS = [
  "การแบก / การเดิน (Carry / Gait)",
  "การเกร็งแกนกลาง (Core Bracing)",
  "การพับ/เหยียดตัว (Core Flexion / Extension)",
  "การบิดลำตัว (Core Rotation)",
  "การเคลื่อนที่ (Locomotion)",
  "พับสะโพก (Lower Body Hinge)",
  "ดันช่วงล่าง (Lower Body Push)",
  "ดึงแนวราบ (Upper Body Horizontal Pull)",
  "ดันแนวราบ (Upper Body Horizontal Push)",
  "ดึงแนวดิ่ง (Upper Body Vertical Pull)",
  "ดันแนวดิ่ง (Upper Body Vertical Push)",
];

const CATEGORIES = [
  {
    id: "strength",
    label: "เวทเทรนนิ่ง (Weight Training)",
    desc: "บันทึก เซต, ครั้ง, น้ำหนัก",
    icon: Icons.Dumbbell,
  },
  {
    id: "bodyweight",
    label: "บอดี้เวท (Bodyweight)",
    desc: "บันทึก เซต, ครั้ง",
    icon: Icons.Dumbbell,
  },
  {
    id: "timed",
    label: "จับเวลา (Timed / Cardio)",
    desc: "บันทึก ระยะเวลา",
    icon: Icons.Clock,
  },
  {
    id: "distance_long",
    label: "ระยะทางไกล (Distance)",
    desc: "บันทึก กม., เวลา",
    icon: Icons.Activity,
  },
  {
    id: "distance_short",
    label: "ระยะทางสั้น/สปรินท์",
    desc: "บันทึก เมตร, เวลา",
    icon: Icons.Flame,
  },
  {
    id: "flexibility",
    label: "ยืดเหยียด (Flexibility)",
    desc: "บันทึก เวลาค้างท่า",
    icon: Icons.StretchHorizontal,
  },
];

const FIELDS = [
  "Time (เวลา)",
  "Speed (ความเร็ว)",
  "Cadence (รอบขา)",
  "Distance-Long (ระยะทางไกล)",
  "Distance-Short (ระยะทางสั้น)",
  "%1RM",
  "Weight (น้ำหนัก)",
  "RPE (ความเหนื่อย)",
  "RIR (แรงเหลือ)",
  "Heart Rate (ชีพจร)",
  "%HR (โซนหัวใจ)",
  "Calories (แคลอรี่)",
  "Watts (วัตต์)",
  "RPM (รอบต่อนาที)",
  "Round (จำนวนรอบ)",
];

const CATEGORY_DEFAULT_FIELDS: any = {
  strength: ["Weight (น้ำหนัก)", "Reps (จำนวนครั้ง)"],
  bodyweight: ["Reps (จำนวนครั้ง)"],
  timed: ["Time (เวลา)"],
  distance_long: ["Distance-Long (ระยะทางไกล)", "Time (เวลา)"],
  distance_short: ["Distance-Short (ระยะทางสั้น)", "Time (เวลา)"],
  flexibility: ["Time (เวลา)"],
};

// --- Sub-Components ---

const SelectionRow = ({
  label,
  value,
  onClick,
  placeholder = "เลือก...",
  icon: Icon,
}: any) => (
  <div
    onClick={onClick}
    className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-all duration-200"
  >
    <div className="flex items-center gap-4">
      {Icon && (
        <div
          className={`p-2.5 rounded-xl ${
            value
              ? "bg-navy-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-400"
          } transition-all duration-300 group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
          {label}
        </span>
        <span
          className={cn(
            "text-sm font-semibold transition-colors",
            value ? "text-navy-900" : "text-slate-400 italic"
          )}
        >
          {value || placeholder}
        </span>
      </div>
    </div>
    <Icons.ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
  </div>
);

const SelectItem = ({ label, sub, isSelected, onClick, icon: Icon }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center justify-between p-3.5 mx-2 my-1.5 rounded-xl cursor-pointer transition-all duration-200 border",
      isSelected
        ? "bg-orange-50/50 border-orange-200 shadow-sm"
        : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-navy-900"
    )}
  >
    <div className="flex items-center gap-3.5">
      {Icon && (
        <div
          className={cn(
            "p-2 rounded-lg transition-colors",
            isSelected
              ? "bg-orange-100 text-orange-600"
              : "bg-slate-100 text-slate-400"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-semibold",
            isSelected ? "text-navy-900" : "text-navy-900"
          )}
        >
          {label}
        </span>
        {sub && (
          <span
            className={cn(
              "text-xs mt-0.5",
              isSelected ? "text-orange-600/90" : "text-slate-400"
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
    {isSelected && (
      <div className="bg-orange-500 rounded-full p-0.5 mr-1 shadow-sm">
        <Icons.Check className="w-3.5 h-3.5 text-white" />
      </div>
    )}
  </div>
);

// --- Main Form Component ---

export interface ExerciseFormData {
  name: string;
  modality: string;
  muscleGroups: string[]; // Changed to Array
  movementPattern: string;
  category: string;
  fields: string[];
  instructions: string;
  caloriesEstimate?: string;
}

export default function ExerciseForm({
  isOpen = true,
  onClose,
  onSave,
  initialData,
  onSubmit,
  onCancel,
}: any) {
  const handleClose = onClose || onCancel;
  const handleSaveAction = onSave || onSubmit;

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: "",
    modality: "",
    muscleGroups: [], // Initialize as array
    movementPattern: "",
    category: "",
    fields: [],
    instructions: "",
    caloriesEstimate: "",
  });

  const [activeSelector, setActiveSelector] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        modality: initialData.modality || "",
        muscleGroups:
          initialData.muscleGroups ||
          (initialData.muscleGroup ? [initialData.muscleGroup] : []),
        movementPattern: initialData.movementPattern || "",
        category: initialData.category || "",
        fields: initialData.fields || [],
        instructions: initialData.instructions || "",
        caloriesEstimate: initialData.caloriesEstimate || "",
      });
    }
  }, [initialData]);

  const handleSelect = (field: string, value: any) => {
    let newFields = formData.fields;

    // Muscle Group Logic: Multi-select (Max 3)
    if (field === "muscleGroups") {
      let currentMuscles = [...(formData.muscleGroups || [])];
      if (currentMuscles.includes(value)) {
        // Remove
        currentMuscles = currentMuscles.filter((m) => m !== value);
      } else {
        // Add (if < 3)
        if (currentMuscles.length < 3) {
          currentMuscles.push(value);
        } else {
          alert("เลือกได้สูงสุด 3 กลุ่มกล้ามเนื้อ");
          return;
        }
      }
      setFormData((prev) => ({ ...prev, muscleGroups: currentMuscles }));
      // Don't close selector immediately for multi-select
      return;
    }

    if (field === "category") {
      const defaults = CATEGORY_DEFAULT_FIELDS[value];
      if (defaults) newFields = [...defaults];
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      fields: field === "category" ? newFields : prev.fields,
    }));
    setActiveSelector(null);
  };

  const handleAddField = (fieldToAdd: string) => {
    if (!formData.fields.includes(fieldToAdd)) {
      setFormData((prev) => ({
        ...prev,
        fields: [...prev.fields, fieldToAdd],
      }));
    }
    setActiveSelector(null);
  };

  const handleRemoveField = (fieldToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f !== fieldToRemove),
    }));
  };

  const handleSave = () => {
    console.log("SAVE BUTTON CLICKED", formData);
    alert("บันทึกข้อมูลเรียบร้อย (ดูใน Console)");
    if (handleSaveAction) handleSaveAction(formData);
    if (handleClose) handleClose();
  };

  const getSelectorTitle = (selector: string | null) => {
    switch (selector) {
      case "modality":
        return "เลือกประเภทการฝึก";
      case "muscle":
        return "เลือกกลุ่มกล้ามเนื้อ";
      case "movement":
        return "เลือกรูปแบบการเคลื่อนไหว";
      case "category":
        return "เลือกหมวดหมู่การติดตาม";
      case "fields":
        return "เพิ่มตัวชี้วัด";
      default:
        return "เลือกรายการ";
    }
  };
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-[4px] transition-all duration-300"
        aria-hidden="true"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-2xl bg-slate-50/50 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 ring-1 ring-navy-900/5">
          {/* Header */}
          <div className="flex-none px-6 py-5 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-900 tracking-tight">
                  {initialData
                    ? "แก้ไขท่าออกกำลังกาย"
                    : "เพิ่มท่าออกกำลังกายใหม่"}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">
                  {initialData
                    ? "แก้ไขรายละเอียดท่าออกกำลังกาย"
                    : "สร้างเทมเพลตท่าออกกำลังกายใหม่"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Icons.X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
            <div className="px-6 py-8 space-y-8">
              {/* Exercise Name */}
              <div className="space-y-3">
                <Label className="ml-1">
                  ชื่อท่าออกกำลังกาย <span className="text-orange-500">*</span>
                </Label>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all group hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-center px-3">
                    <div className="p-2 bg-slate-100 rounded-xl mr-3 text-slate-500 group-focus-within:bg-navy-900 group-focus-within:text-white transition-colors duration-300">
                      <Icons.Dumbbell className="w-5 h-5" />
                    </div>
                    <Input
                      value={formData.name}
                      onChange={(e: any) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="เช่น Barbell Back Squat"
                      className="border-none shadow-none h-12 text-lg font-semibold px-0 placeholder:text-slate-300 focus:ring-0 bg-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specs Card */}
              <div className="space-y-3">
                <Label className="ml-1">ข้อมูลหลัก (Primary Focus)</Label>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                  <SelectionRow
                    label="ประเภทการฝึก (Modality)"
                    value={formData.modality}
                    onClick={() => setActiveSelector("modality")}
                    icon={Icons.Layers}
                  />
                  <SelectionRow
                    label="กลุ่มกล้ามเนื้อ (Muscle Group)"
                    value={
                      formData.muscleGroups && formData.muscleGroups.length > 0
                        ? formData.muscleGroups.join(", ")
                        : ""
                    }
                    onClick={() => setActiveSelector("muscle")}
                    icon={Icons.Target}
                  />
                  <SelectionRow
                    label="รูปแบบการเคลื่อนไหว (Movement Pattern)"
                    value={formData.movementPattern}
                    onClick={() => setActiveSelector("movement")}
                    icon={Icons.Move}
                  />
                </div>
              </div>

              {/* Tracking Logic Card */}
              <div className="space-y-3">
                <Label className="ml-1">หมวดหมู่และการวัดผล (Category)</Label>
                <div
                  className={cn(
                    "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
                    formData.category
                      ? "border-orange-300 ring-4 ring-orange-50"
                      : "border-slate-200"
                  )}
                >
                  <SelectionRow
                    label="ประเภทการติดตามผล (Tracking Type)"
                    value={
                      CATEGORIES.find((c) => c.id === formData.category)
                        ?.label || ""
                    }
                    placeholder="เลือกประเภทการติดตาม"
                    onClick={() => setActiveSelector("category")}
                    icon={
                      CATEGORIES.find((c) => c.id === formData.category)
                        ?.icon || Icons.Activity
                    }
                  />
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="mb-0">ตัวชี้วัด (Tracking Fields)</Label>
                  {formData.fields.length > 0 && (
                    <Badge variant="orange" className="shadow-sm">
                      {formData.fields.length} รายการ
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  {formData.fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-center">
                      <div className="p-3 bg-slate-100 rounded-full mb-3">
                        <Icons.Activity className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        ยังไม่มีตัวชี้วัด
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        เลือกหมวดหมู่ด้านบน หรือเพิ่มเอง
                      </p>
                    </div>
                  )}

                  {formData.fields.map((field, index) => (
                    <div
                      key={field}
                      className="flex items-center gap-3 group animate-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex-1 flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all cursor-default group-hover:translate-x-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {field}
                          </span>
                        </div>
                        <Icons.AlignJustify className="w-4 h-4 text-slate-300 group-hover:text-slate-400 cursor-grab" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(field)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-12 w-12 shrink-0 border border-transparent hover:border-red-100 transition-all"
                      >
                        <Icons.Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}

                  {formData.category && (
                    <Button
                      variant="accent-light"
                      onClick={() => setActiveSelector("fields")}
                      className="w-full h-12 mt-4 justify-center gap-2 rounded-xl transition-all font-semibold"
                    >
                      <Icons.Plus className="w-4 h-4" />
                      <span>เพิ่มตัวชี้วัดอื่น</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <Label className="ml-1">คำแนะนำเพิ่มเติม</Label>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-navy-900 focus-within:border-transparent transition-all">
                  <div className="flex items-center border-b border-slate-50 px-4 py-2.5">
                    <Icons.Zap className="w-4 h-4 text-orange-500 mr-3" />
                    <Input
                      className="border-none shadow-none h-9 text-sm focus-visible:ring-0 placeholder:text-slate-400 p-0 focus:ring-0 font-medium"
                      placeholder="ประมาณการแคลอรี่ (Kcal)..."
                      value={formData.caloriesEstimate}
                      onChange={(e: any) =>
                        setFormData({
                          ...formData,
                          caloriesEstimate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e: any) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="เพิ่มคำแนะนำทีละขั้นตอน หรือข้อควรระวัง..."
                    className="min-h-[120px] border-none shadow-none resize-none focus-visible:ring-0 text-slate-700 placeholder:text-slate-400 text-sm px-4 py-4 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer (Sticky) */}
          <div className="flex-none px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-12 px-6 font-semibold rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              className="h-12 px-8 rounded-xl"
            >
              <Icons.Save className="w-4 h-4 mr-2" />
              บันทึกข้อมูล
            </Button>
          </div>

          {/* --- Selector Nested Modal --- */}
          {activeSelector && (
            <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/20 backdrop-blur-[2px]">
              <div
                className="w-full h-[85%] sm:h-auto sm:max-h-[600px] sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-navy-900/5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-bold text-navy-900 tracking-tight">
                    {getSelectorTitle(activeSelector)}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveSelector(null)}
                    className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <Icons.X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  {activeSelector === "modality" &&
                    MODALITIES.map((item) => (
                      <SelectItem
                        key={item}
                        label={item}
                        isSelected={formData.modality === item}
                        onClick={() => handleSelect("modality", item)}
                      />
                    ))}
                  {activeSelector === "muscle" &&
                    MUSCLE_GROUPS.map((item) => (
                      <SelectItem
                        key={item}
                        label={item}
                        isSelected={formData.muscleGroups?.includes(item)}
                        onClick={() => handleSelect("muscleGroups", item)}
                      />
                    ))}
                  {activeSelector === "movement" &&
                    MOVEMENT_PATTERNS.map((item) => (
                      <SelectItem
                        key={item}
                        label={item}
                        isSelected={formData.movementPattern === item}
                        onClick={() => handleSelect("movementPattern", item)}
                      />
                    ))}
                  {activeSelector === "category" &&
                    CATEGORIES.map((item) => (
                      <SelectItem
                        key={item.id}
                        label={item.label}
                        sub={item.desc}
                        isSelected={formData.category === item.id}
                        onClick={() => handleSelect("category", item.id)}
                        icon={item.icon}
                      />
                    ))}
                  {activeSelector === "fields" &&
                    FIELDS.filter((f) => !formData.fields.includes(f)).map(
                      (item) => (
                        <SelectItem
                          key={item}
                          label={item}
                          onClick={() => handleAddField(item)}
                          icon={Icons.Plus}
                        />
                      )
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
