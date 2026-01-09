import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Copy,
  Edit,
  Trash,
  Users,
  Search,
  Dumbbell,
  Clock,
  Repeat,
  Weight,
  MoreHorizontal,
  Star,
  Settings,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner@2.0.3";
import {
  useApp,
  Program,
  ProgramDay as AppProgramDay,
  ProgramExercise as AppProgramExercise,
} from "./AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProgramWithMeta extends Program {
  isTemplate?: boolean;
  assigned_client_count?: number;
  clientId?: string;
  originalTemplateId?: string;
}

export default function ProgramBuilderNew() {
  const navigate = useNavigate();
  const {
    programTemplates: contextPrograms, // ✅ ใช้ programTemplates แทน programs
    exercises: contextExercises,
    clients,
    addProgramTemplate, // ✅ ใช้ addProgramTemplate แทน addProgram
    updateProgramTemplate, // ✅ ใช้ updateProgramTemplate แทน updateProgram
  } = useApp();

  // State
  const [programs, setPrograms] = useState<ProgramWithMeta[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "template" | "custom">("all");

  // Create Program Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    isTemplate: true,
  });

  // Add Exercise Modal
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");

  // Expanded days state
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  // Load Programs
  useEffect(() => {
    const mappedData = contextPrograms.map((p) => ({
      ...p,
      assigned_client_count: p.assignedClients?.length || 0,
      isTemplate: !p.clientId,
    }));
    setPrograms(mappedData);
  }, [contextPrograms]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Filtered Programs
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "template" && program.isTemplate) ||
      (filterType === "custom" && !program.isTemplate);
    return matchesSearch && matchesFilter;
  });

  const templatePrograms = filteredPrograms.filter((p) => p.isTemplate);
  const customPrograms = filteredPrograms.filter((p) => !p.isTemplate);

  // Create Program Handler
  const handleCreateProgram = () => {
    if (!createFormData.name.trim()) {
      toast.error("กรุณากรอกชื่อโปรแกรม");
      return;
    }

    const weeks = [
      {
        weekNumber: 1,
        days: Array.from({ length: 7 }).map((_, dayIdx) => ({
          dayNumber: dayIdx + 1,
          name: `Day ${dayIdx + 1}`,
          exercises: [],
        })),
      },
    ];

    const newProgramId = addProgramTemplate({
      name: createFormData.name,
      description: createFormData.description,
      duration: 1,
      daysPerWeek: 7,
      weeks: weeks,
      assignedClients: [],
      createdAt: new Date().toISOString(),
      isTemplate: createFormData.isTemplate,
    } as any);

    toast.success(
      createFormData.isTemplate
        ? "สร้าง Template โปรแกรมเรียบร้อย"
        : "สร้างโปรแกรมเรียบร้อย"
    );
    setShowCreateModal(false);
    setCreateFormData({ name: "", description: "", isTemplate: true });
    setSelectedProgramId(newProgramId);
    setView("detail");
  };

  // Clone Program
  const handleCloneProgram = (programId: string, targetClientId?: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;

    const clonedId = addProgramTemplate({
      ...program,
      name: `${program.name} (Copy)`,
      assignedClients: targetClientId ? [targetClientId] : [],
      clientId: targetClientId,
      originalTemplateId: program.isTemplate ? program.id : program.originalTemplateId,
      createdAt: new Date().toISOString(),
    } as any);

    toast.success("คัดลอกโปรแกรมเรียบร้อย");
    setSelectedProgramId(clonedId);
    setView("detail");
  };

  // Add Exercise to Day
  const handleAddExercise = () => {
    if (!selectedProgram || selectedDayNumber === null || !selectedExerciseId) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === selectedDayNumber
          ? {
              ...day,
              exercises: [
                ...(day.exercises || []),
                {
                  exerciseId: selectedExerciseId,
                  sets: 3,
                  reps: "10",
                  weight: "0",
                  rest: 60,
                  notes: "",
                },
              ],
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("เพิ่มท่าฝึกเรียบร้อย");
    setShowAddExerciseModal(false);
    setSelectedExerciseId("");
  };

  // Update Exercise
  const handleUpdateExercise = (
    dayNumber: number,
    exerciseId: string,
    field: string,
    value: any
  ) => {
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: (day.exercises || []).map((ex) =>
                ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
  };

  // Delete Exercise
  const handleDeleteExercise = (dayNumber: number, exerciseId: string) => {
    if (!confirm("ต้องการลบท่าฝึกนี้?")) return;
    if (!selectedProgram) return;

    const updatedWeeks = selectedProgram.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: (day.exercises || []).filter((ex) => ex.exerciseId !== exerciseId),
            }
          : day
      ),
    }));

    updateProgramTemplate(selectedProgram.id, { weeks: updatedWeeks });
    toast.success("ลบท่าฝึกเรียบร้อย");
  };

  // Toggle Day Expansion
  const toggleDay = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  // Filtered Exercises for Add Modal
  const filteredExercises = contextExercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  // Render Program List
  if (view === "list") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">โปรแกรมการออกกำลังกาย</h1>
            <p className="text-sm text-muted-foreground mt-1">
              จัดการ Template และโปรแกรมที่ปรับแต่งเฉพาะบุคคล
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            สร้างโปรแกรม
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาโปรแกรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filterType} onValueChange={(v: any) => setFilterType(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="custom">ปรับแต่งแล้ว</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Template Programs */}
        {templatePrograms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              <h2 className="font-semibold">Template โปรแกรม</h2>
              <Badge variant="outline" className="ml-auto">
                {templatePrograms.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templatePrograms.map((program) => (
                <Card key={program.id} className="hover:border-accent transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                            <Star className="h-3 w-3 mr-1" />
                            Template
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{program.name}</CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {program.description || "ไม่มีคำอธิบาย"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedProgramId(program.id);
                            setView("detail");
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไขโปรแกรม
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneProgram(program.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            คัดลอกโปรแกรม
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            ลบโปรแกรม
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground mb-1">ระยะเวลา</p>
                        <p className="font-semibold">{program.duration} สัปดาห์</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground mb-1">ความถี่</p>
                        <p className="font-semibold">{program.daysPerWeek} วัน/สัปดาห์</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground mb-1">ใช้โดย</p>
                        <p className="font-semibold">{program.assigned_client_count} คน</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        setSelectedProgramId(program.id);
                        setView("detail");
                      }}
                    >
                      ดูรายละเอียด
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Custom Programs */}
        {customPrograms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">โปรแกรมที่ปรับแต่งแล้ว</h2>
              <Badge variant="outline" className="ml-auto">
                {customPrograms.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customPrograms.map((program) => {
                const client = program.clientId ? clients.find(c => c.id === program.clientId) : null;
                return (
                  <Card key={program.id} className="hover:border-primary transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">ปรับแต่งแล้ว</Badge>
                            {client && (
                              <Badge variant="secondary" className="text-xs">
                                {client.name}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">{program.name}</CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-2">
                            {program.description || "ไม่มีคำอธิบาย"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedProgramId(program.id);
                              setView("detail");
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไขโปรแกรม
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCloneProgram(program.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              คัดลอกโปรแกรม
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="h-4 w-4 mr-2" />
                              ลบโปรแกรม
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground mb-1">ระยะเวลา</p>
                          <p className="font-semibold">{program.duration} สัปดาห์</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground mb-1">ความถี่</p>
                          <p className="font-semibold">{program.daysPerWeek} วัน/สัปดาห์</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setSelectedProgramId(program.id);
                          setView("detail");
                        }}
                      >
                        ดูรายละเอียด
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">ไม่พบโปรแกรม</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                สร้างโปรแกรมใหม่
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Program Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md" aria-describedby="create-program-description">
            <DialogHeader>
              <DialogTitle>สร้างโปรแกรมใหม่</DialogTitle>
              <DialogDescription id="create-program-description">
                สร้าง Template หรือโปรแกรมปรับแต่งสำหรับลูกเทรนเฉพาะคน
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อโปรแกรม *</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="เช่น Beginner Full Body, Advanced Strength"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, description: e.target.value })
                  }
                  placeholder="อธิบายเป้าหมายและรูปแบบของโปรแกรม"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Template โปรแกรม</p>
                  <p className="text-xs text-muted-foreground">
                    ใช้เป็นแม่แบบสำหรับหลายคน
                  </p>
                </div>
                <Button
                  variant={createFormData.isTemplate ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setCreateFormData({ ...createFormData, isTemplate: !createFormData.isTemplate })
                  }
                >
                  {createFormData.isTemplate ? (
                    <>
                      <Star className="h-4 w-4 mr-1" />
                      Template
                    </>
                  ) : (
                    "ปรับแต่ง"
                  )}
                </Button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  ยกเลิก
                </Button>
                <Button onClick={handleCreateProgram} className="flex-1">
                  สร้างโปรแกรม
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Render Program Detail (View = "detail")
  if (!selectedProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ไม่พบโปรแกรม</p>
        <Button onClick={() => setView("list")} className="mt-4">
          กลับไปรายการ
        </Button>
      </div>
    );
  }

  const allDaysWithWeek: Array<{ week: number; day: AppProgramDay }> = [];
  selectedProgram.weeks.forEach((week) => {
    week.days.forEach((day) => {
      allDaysWithWeek.push({ week: week.weekNumber, day });
    });
  });

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ChevronDown className="h-5 w-5 rotate-90" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{selectedProgram.name}</h1>
              {selectedProgram.isTemplate && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Star className="h-3 w-3 mr-1" />
                  Template
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedProgram.description || "ไม่มีคำอธิบาย"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleCloneProgram(selectedProgram.id)}>
            <Copy className="h-4 w-4 mr-2" />
            คัดลอก
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            มอบหมาย
          </Button>
        </div>
      </div>

      {/* Program Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">ระยะเวลา (Duration)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{selectedProgram.duration}</p>
            <p className="text-xs text-muted-foreground">สัปดาห์</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">ความถี่ (Frequency)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{selectedProgram.daysPerWeek}</p>
            <p className="text-xs text-muted-foreground">วัน/สัปดาห์</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">จำนวนท่าทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {allDaysWithWeek.reduce((sum, day) => sum + (day.day.exercises?.length || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">ท่า</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">ใช้โดย</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{selectedProgram.assigned_client_count || 0}</p>
            <p className="text-xs text-muted-foreground">ลูกเทรน</p>
          </CardContent>
        </Card>
      </div>

      {/* Days List - Collapsible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการท่าฝึก (Pattern of Exercise)</CardTitle>
          <CardDescription className="text-xs">
            คลิกวันเพื่อดูรายละเอียด และปรับแต่ง Sets, Reps, Weight, Rest ตามความเหมาะสมของแต่ละบุคคล
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {allDaysWithWeek.map((item, dayIdx) => {
            const { week, day } = item;
            const isExpanded = expandedDays.has(day.dayNumber);
            const dayExerciseCount = day.exercises?.length || 0;

            return (
              <div key={`week-${week}-day-${day.dayNumber}-${dayIdx}`} className="border rounded-lg overflow-hidden">
                {/* Day Header - Clickable */}
                <div
                  className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => toggleDay(day.dayNumber)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">Day {day.dayNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayExerciseCount} ท่า
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDayNumber(day.dayNumber);
                      setShowAddExerciseModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มท่า
                  </Button>
                </div>

                {/* Day Exercises - Collapsible Content */}
                {isExpanded && (
                  <div className="p-3 space-y-2">
                    {!day.exercises || day.exercises.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>ยังไม่มีท่าฝึก</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSelectedDayNumber(day.dayNumber);
                            setShowAddExerciseModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          เพิ่มท่าฝึก
                        </Button>
                      </div>
                    ) : (
                      day.exercises.map((exercise, exerciseIdx) => {
                        const exerciseData = contextExercises.find(
                          (ex) => ex.id === exercise.exerciseId
                        );
                        if (!exerciseData) return null;

                        return (
                          <div
                            key={`${day.dayNumber}-${exercise.exerciseId}-${exerciseIdx}`}
                            className="border rounded-lg p-3 bg-card hover:border-accent transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{exerciseData.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exerciseData.category} • {exerciseData.muscleGroup}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() =>
                                  handleDeleteExercise(day.dayNumber, exercise.exerciseId)
                                }
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* FITT Parameters - Inline Editable */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {/* Sets */}
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />
                                  Sets
                                </Label>
                                <Input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    handleUpdateExercise(
                                      day.dayNumber,
                                      exercise.exerciseId,
                                      "sets",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Reps */}
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />
                                  Reps
                                </Label>
                                <Input
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    handleUpdateExercise(
                                      day.dayNumber,
                                      exercise.exerciseId,
                                      "reps",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-sm"
                                  placeholder="8-12"
                                />
                              </div>

                              {/* Weight (Intensity) */}
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Weight className="h-3 w-3" />
                                  Weight (kg)
                                </Label>
                                <Input
                                  value={exercise.weight}
                                  onChange={(e) =>
                                    handleUpdateExercise(
                                      day.dayNumber,
                                      exercise.exerciseId,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-sm"
                                  placeholder="0"
                                />
                              </div>

                              {/* Rest (Time) */}
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Rest (วินาที)
                                </Label>
                                <Input
                                  type="number"
                                  value={exercise.rest}
                                  onChange={(e) =>
                                    handleUpdateExercise(
                                      day.dayNumber,
                                      exercise.exerciseId,
                                      "rest",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>

                            {/* Notes - Dynamic Revision */}
                            <div className="mt-2">
                              <Label className="text-xs text-muted-foreground mb-1">
                                หมายเหตุ (สำหรับปรับแก้เฉพาะบุคคล)
                              </Label>
                              <Input
                                value={exercise.notes || ""}
                                onChange={(e) =>
                                  handleUpdateExercise(
                                    day.dayNumber,
                                    exercise.exerciseId,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="เช่น ลดน้ำหนักถ้าทำไม่ได้, เพิ่ม sets ถ้าง่ายเกินไป"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add Exercise Modal */}
      <Dialog open={showAddExerciseModal} onOpenChange={setShowAddExerciseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="add-exercise-description">
          <DialogHeader>
            <DialogTitle>เพิ่มท่าฝึกใน Day {selectedDayNumber}</DialogTitle>
            <DialogDescription id="add-exercise-description">เลือกท่าฝึกจากคลังท่า</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาท่าฝึก..."
                value={exerciseSearchTerm}
                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">ไม่พบท่าฝึก</p>
              ) : (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedExerciseId === exercise.id
                        ? "border-accent bg-accent/10"
                        : "hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.category || exercise.modality} • {Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : exercise.muscleGroups}
                        </p>
                      </div>
                      {selectedExerciseId === exercise.id && (
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          เลือกแล้ว
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setSelectedExerciseId("");
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddExercise}
                disabled={!selectedExerciseId}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มท่าฝึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}