import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  X,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Dumbbell,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import ExerciseLibrary from "./ExerciseLibrary";

// --- UI Components ---

// --- UI Components ---

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

const Button = ({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: any) => {
  const variants: any = {
    default:
      "bg-navy-900 text-white hover:bg-navy-800 shadow-md active:scale-95 bg-[#003366]",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-95",
    ghost: "hover:bg-slate-100 text-slate-600",
    secondary:
      "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100 active:scale-95",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700",
  };
  const sizes: any = {
    default: "h-12 px-6 py-3 text-base rounded-full",
    sm: "h-9 rounded-lg px-3 text-xs",
    lg: "h-14 rounded-xl px-8 text-lg",
    icon: "h-10 w-10",
    circle:
      "h-12 w-12 rounded-full p-0 flex items-center justify-center text-sm font-semibold shadow-sm border active:scale-95 transition-all",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, suffix, icon, ...props }: any) => (
  <div className="relative flex items-center w-full">
    {icon && <div className="absolute left-4 text-slate-400">{icon}</div>}
    <input
      className={cn(
        "flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
        icon ? "pl-11" : "",
        className
      )}
      {...props}
    />
    {suffix && (
      <span className="absolute right-4 text-slate-400 text-sm font-medium">
        {suffix}
      </span>
    )}
  </div>
);

const Label = ({ className, children }: any) => (
  <label
    className={cn(
      "text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block",
      className
    )}
  >
    {children}
  </label>
);

// --- 4. EXERCISE LIBRARY ---

// --- Helper Components (Wheel, Modals) ---

const WheelColumn = ({ items, selectedValue, onSelect, label }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      const selectedIndex = items.indexOf(selectedValue);
      if (selectedIndex !== -1) {
        const itemHeight = 48;
        containerRef.current.scrollTop =
          selectedIndex * itemHeight -
          containerRef.current.clientHeight / 2 +
          itemHeight / 2;
      }
    }
  }, [selectedValue, items]);
  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          {label}
        </span>
      )}
      <div
        ref={containerRef}
        className="h-48 overflow-y-auto scrollbar-hide snap-y snap-mandatory relative w-24 text-center"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-10 pointer-events-none bg-slate-50/50 rounded-lg -z-10" />
        <div className="py-[72px]">
          {items.map((item: any) => (
            <div
              key={item}
              onClick={() => onSelect(item)}
              className={cn(
                "h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 select-none",
                item === selectedValue
                  ? "text-orange-500 font-bold text-3xl scale-110"
                  : "text-slate-300 text-xl font-medium hover:text-slate-400"
              )}
            >
              {typeof item === "number"
                ? item.toString().padStart(2, "0")
                : item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SET_TYPES = [
  {
    id: "R",
    label: "Regular",
    desc: "เซ็ตปกติ",
    color: "text-navy-900",
    badge: "bg-slate-100 text-slate-700",
  },
  {
    id: "W",
    label: "Warm Up",
    desc: "เซ็ตวอร์มอัพ",
    color: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    id: "D",
    label: "Drop Set",
    desc: "ลดน้ำหนักลง",
    color: "text-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    id: "F",
    label: "Failure",
    desc: "เล่นจนยกไม่ไหว",
    color: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
];

const DEFAULT_FIELDS_BY_TYPE: any = {
  activation: ["sets", "reps", "rest"],
  agility: ["sets", "reps", "rest"],
  cardio: ["sets", "distance_short", "time", "rest"],
  strength: ["sets", "weight", "reps", "rest"],
  default: ["sets", "reps", "rest"],
};

const SetTypePickerModal = ({
  isOpen,
  onClose,
  currentType,
  onSelect,
}: any) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 px-6 pb-4 text-center relative">
          <h3 className="text-lg font-bold text-navy-900">Select set type</h3>
        </div>
        <div className="px-4 space-y-1">
          {SET_TYPES.map((type) => (
            <div
              key={type.id}
              onClick={() => {
                onSelect(type.id);
                onClose();
              }}
              className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm",
                    type.id === currentType
                      ? "bg-navy-900 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {type.id}
                </span>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-navy-900">
                    {type.label}
                  </span>
                </div>
              </div>
              {type.id === currentType && (
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NumberPickerModal = ({
  isOpen,
  onClose,
  title,
  value,
  type,
  onConfirm,
}: any) => {
  const [localValue, setLocalValue] = useState(value);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (isOpen) {
      if (type === "time") {
        let m = 0,
          s = 0;
        if (typeof value === "string" && value.includes(":"))
          [m, s] = value.split(":").map(Number);
        setMinutes(isNaN(m) ? 0 : m);
        setSeconds(isNaN(s) ? 0 : s);
      } else {
        setLocalValue(value === "-" ? 0 : Number(value));
      }
    }
  }, [isOpen, value, type]);
  if (!isOpen) return null;
  const handleConfirm = () => {
    if (type === "time") {
      onConfirm(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    } else {
      onConfirm(localValue);
    }
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xs bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="relative pt-5 px-6 pb-2 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-slate-500 font-medium text-sm"
          >
            Cancel
          </button>
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          <button
            onClick={handleConfirm}
            className="text-orange-600 font-bold text-sm flex items-center gap-1"
          >
            Done <Check className="w-4 h-4" />
          </button>
        </div>
        <div className="pb-8 pt-2 bg-white flex flex-col items-center justify-center">
          {type === "number" ? (
            <div className="w-full flex justify-center py-4">
              <WheelColumn
                items={Array.from({ length: 101 }, (_, i) => i)}
                selectedValue={localValue}
                onSelect={setLocalValue}
              />
            </div>
          ) : (
            <div className="flex w-full justify-center gap-8 items-center px-8 relative">
              <WheelColumn
                label="MIN"
                items={Array.from({ length: 11 }, (_, i) => i)}
                selectedValue={minutes}
                onSelect={(v: any) => setMinutes(Number(v))}
              />
              <div className="h-48 flex items-center pt-6">
                <span className="text-slate-300 text-3xl font-light">:</span>
              </div>
              <WheelColumn
                label="SEC"
                items={Array.from({ length: 12 }, (_, i) => i * 5)}
                selectedValue={seconds}
                onSelect={(v: any) => setSeconds(Number(v))}
              />
            </div>
          )}
          <div className="w-full px-6 mt-4 mb-2">
            <Button
              onClick={handleConfirm}
              className="w-full rounded-full text-lg h-14 font-bold"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CreateSessionForm ---

export default function CreateSessionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sectionName, setSectionName] = useState("");
  // Unused states removed
  // Unused states removed
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [exercises, setExercises] = useState<any[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<any>({ isOpen: false });
  const [setTypePickerConfig, setSetTypePickerConfig] = useState<any>({
    isOpen: false,
  });

  // Load clients and auto-select based on URL param or default
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        const clientData = res.data || [];
        setClients(clientData);

        // Check for clientId in URL
        const params = new URLSearchParams(location.search);
        const paramClientId = params.get("clientId");

        if (paramClientId) {
          setSelectedClientId(paramClientId);
        } else if (clientData.length > 0) {
          setSelectedClientId(clientData[0].id.toString());
        }
      } catch (err) {
        const mockClients = [{ id: 1, name: "สมชาย ใจดี" }];
        setClients(mockClients);
        setSelectedClientId(mockClients[0].id.toString());
      }
    };
    fetchClients();
  }, [location.search]);

  const handleSelectExercise = (ex: any) => {
    const modality = ex.modality ? ex.modality.toLowerCase() : "default";
    const defaultFields =
      DEFAULT_FIELDS_BY_TYPE[modality] || DEFAULT_FIELDS_BY_TYPE["default"];
    const newExercise = {
      id: Date.now(),
      exerciseId: ex.id,
      name: ex.name,
      img: ex.image || "🏋️",
      type: ex.modality || "strength",
      note: "",
      eachSide: false,
      sets: [
        {
          id: 1,
          setType: "R",
          fields: defaultFields.reduce((acc: any, field: any) => {
            acc[field] = field === "rest" || field === "time" ? "00:00" : "-";
            return acc;
          }, {}),
        },
      ],
      visibleFields: defaultFields,
    };
    setExercises((prev) => [...prev, newExercise]);
    setIsExerciseSelectorOpen(false);
  };

  const handleAddSet = (exId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet = {
            id: ex.sets.length + 1,
            setType: lastSet ? lastSet.setType : "R",
            fields: lastSet
              ? { ...lastSet.fields }
              : ex.visibleFields.reduce((acc: any, f: any) => {
                  acc[f] = f === "rest" ? "00:00" : "-";
                  return acc;
                }, {}),
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const handleRemoveSet = (exId: number, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.filter((s: any) => s.id !== setId) }
          : ex
      )
    );
  };

  const handlePickerConfirm = (newValue: any) => {
    if (pickerConfig.targetId) {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === pickerConfig.targetId) {
            return {
              ...ex,
              sets: ex.sets.map((s: any) =>
                s.id === pickerConfig.setId
                  ? {
                      ...s,
                      fields: {
                        ...s.fields,
                        [pickerConfig.field]: newValue === 0 ? "-" : newValue,
                      },
                    }
                  : s
              ),
            };
          }
          return ex;
        })
      );
    }
    setPickerConfig({ ...pickerConfig, isOpen: false });
  };

  const handleSetTypeConfirm = (newType: string) => {
    if (setTypePickerConfig.targetId) {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === setTypePickerConfig.targetId
            ? {
                ...ex,
                sets: ex.sets.map((s: any) =>
                  s.id === setTypePickerConfig.setId
                    ? { ...s, setType: newType }
                    : s
                ),
              }
            : ex
        )
      );
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("กรุณาระบุวันและเวลา");
      return;
    }

    try {
      const startDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

      const payload = {
        title: sectionName,
        client_id: parseInt(selectedClientId),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: "scheduled",
        summary: "",
      };

      const res = await api.post("/sessions", payload);
      const newSessionId = res.data.id;

      // Create Logs for each exercise
      for (const [index, ex] of exercises.entries()) {
        const logPayload = {
          schedule_id: newSessionId,
          exercise_id: ex.exerciseId,
          exercise_name: ex.name, // Added for backend redundancy if needed
          category: ex.type,
          notes: ex.note || "",
          status: "pending",
          order: index + 1,
          sets: ex.sets.map((s: any) => ({
            set_number: index + 1, // Or s.id if it represents set number
            planned_weight_kg: parseFloat(s.fields.weight) || 0,
            planned_reps: parseInt(s.fields.reps) || 0,
            actual_weight_kg: 0,
            actual_reps: 0,
            actual_rpe: 0,
            completed: false,
          })),
        };
        // Fix set_number logic: usually sets are 1, 2, 3...
        // The s.id from handleAddSet is length+1, so it is 1-based index.
        logPayload.sets = ex.sets.map((s: any, setIndex: number) => ({
          set_number: setIndex + 1,
          planned_weight_kg: parseFloat(s.fields.weight) || 0,
          planned_reps: parseInt(s.fields.reps) || 0,
          actual_weight_kg: 0,
          actual_reps: 0,
          actual_rpe: 0,
          completed: false,
        }));

        await api.post(`/sessions/${newSessionId}/logs`, logPayload);
      }

      toast.success("สร้างนัดหมายเรียบร้อยแล้ว");
      setShowDatePicker(false);

      navigate(`/trainer/sessions/${newSessionId}/log`);
    } catch (err) {
      console.error("Failed to create session", err);
      toast.error("ไม่สามารถสร้างนัดหมายได้");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-navy-900 pb-24">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/trainer/calendar")}
          className="hover:bg-slate-100 -ml-2 rounded-full text-navy-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-base font-bold text-navy-900 tracking-tight">
          สร้าง Workout Session ใหม่
        </h1>
        <Button
          onClick={() => {
            if (!selectedClientId) return toast.error("กรุณาเลือกลูกค้า");
            if (!sectionName)
              return toast.error("กรุณาระบุชื่อ Workout Session");
            setShowDatePicker(true);
          }}
          className="bg-navy-900 text-white hover:bg-navy-800 rounded-full px-6 h-9 text-sm font-semibold shadow-sm"
        >
          บันทึก
        </Button>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-8">
        <div className="space-y-2">
          <Label>เลือกลูกค้า (Client)</Label>
          <div className="relative">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="" disabled>
                -- กรุณาเลือกลูกค้า --
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>ชื่อ Workout Session</Label>
          <Input
            placeholder="ระบุชื่อช่วงการฝึก"
            value={sectionName}
            onChange={(e: any) => setSectionName(e.target.value)}
            className="font-semibold text-lg"
          />
        </div>

        {/* Exercise List */}
        <div className="space-y-4 pt-4">
          {exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-0 relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl">
                        {ex.img}
                      </div>
                      <span className="font-bold text-navy-900 text-sm">
                        {ex.name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {ex.sets.map((set: any, index: number) => (
                      <div
                        key={set.id}
                        className="relative flex items-center gap-2"
                      >
                        <div
                          className="grid gap-2 text-center flex-1"
                          style={{
                            gridTemplateColumns: `repeat(${ex.visibleFields.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {ex.visibleFields.map((fieldKey: any) => (
                            <div
                              key={fieldKey}
                              onClick={() =>
                                fieldKey === "sets"
                                  ? setSetTypePickerConfig({
                                      isOpen: true,
                                      targetId: ex.id,
                                      setId: set.id,
                                      currentType: set.setType,
                                    })
                                  : setPickerConfig({
                                      isOpen: true,
                                      title: fieldKey,
                                      value: set.fields[fieldKey],
                                      type:
                                        fieldKey === "time" ||
                                        fieldKey === "rest"
                                          ? "time"
                                          : "number",
                                      targetId: ex.id,
                                      setId: set.id,
                                      field: fieldKey,
                                    })
                              }
                              className={cn(
                                "h-10 flex items-center justify-center font-bold text-base rounded-lg border cursor-pointer active:scale-95",
                                fieldKey === "sets"
                                  ? "bg-slate-50 border-slate-100"
                                  : "bg-white border-slate-100"
                              )}
                            >
                              {fieldKey === "sets"
                                ? set.setType === "R"
                                  ? index + 1
                                  : set.setType
                                : set.fields[fieldKey]}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleRemoveSet(ex.id, set.id)}
                          className="w-8 h-10 flex items-center justify-center text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 w-full border border-dashed border-orange-200"
                      onClick={() => handleAddSet(ex.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> เพิ่มเซต
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-4">
                <Button
                  variant="default"
                  className="w-full bg-[#003366] text-white rounded-xl shadow-sm h-12"
                  onClick={() => setIsExerciseSelectorOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" /> เพิ่มท่าออกกำลังกาย
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-20">
              <Button
                variant="default"
                className="rounded-xl px-8 shadow-lg bg-[#003366] text-white h-12"
                onClick={() => setIsExerciseSelectorOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" /> เพิ่มท่าออกกำลังกาย
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4">
            <h3 className="font-bold text-lg text-navy-900">กำหนดวันและเวลา</h3>
            <div className="space-y-2">
              <Label>วันที่</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e: any) => setScheduleDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>เวลาเริ่ม</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e: any) => setScheduleTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(false)}
              >
                ยกเลิก
              </Button>
              <Button onClick={handleConfirmSchedule}>ยืนยันการนัดหมาย</Button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      <NumberPickerModal
        isOpen={pickerConfig.isOpen}
        onClose={() => setPickerConfig({ ...pickerConfig, isOpen: false })}
        title={pickerConfig.title}
        value={pickerConfig.value}
        type={pickerConfig.type}
        onConfirm={handlePickerConfirm}
      />
      <SetTypePickerModal
        isOpen={setTypePickerConfig.isOpen}
        onClose={() =>
          setSetTypePickerConfig({ ...setTypePickerConfig, isOpen: false })
        }
        currentType={setTypePickerConfig.currentType}
        onSelect={handleSetTypeConfirm}
      />

      {/* EXERCISE LIBRARY MODAL */}
      {isExerciseSelectorOpen && (
        <div className="fixed inset-0 z-[70] bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm z-20">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                คลังท่าออกกำลังกาย
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExerciseSelectorOpen(false)}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6 text-slate-500" />
              </Button>
            </div>
            <ExerciseLibrary
              onSelect={(ex: any) => {
                handleSelectExercise(ex);
                setIsExerciseSelectorOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
