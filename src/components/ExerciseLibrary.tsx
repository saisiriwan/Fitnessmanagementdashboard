import React, { useState } from 'react';
import { Search, Plus, Filter, BookOpen, Dumbbell, Activity, Target, Trash2, Eye, MoreVertical, Edit, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';
import ExerciseForm from './ExerciseForm';

export default function ExerciseLibrary() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [exerciseToEdit, setExerciseToEdit] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Mobile filter sheet
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === 'all' || exercise.modality === modalityFilter;
    const matchesMuscleGroup = muscleGroupFilter === 'all' || 
      exercise.muscleGroups.some(group => group.toLowerCase().includes(muscleGroupFilter.toLowerCase()));
    const matchesType = typeFilter === 'all' || (typeFilter === 'default' ? exercise.isDefault : !exercise.isDefault);
    
    return matchesSearch && matchesModality && matchesMuscleGroup && matchesType;
  });

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Biceps', 'Triceps'
  ];

  const getModalityConfig = (modality: string) => {
    const normalizedModality = modality.toLowerCase();
    
    const modalityMap = {
      strength: { 
        label: 'เสริมแรง', 
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: Dumbbell
      },
      cardio: { 
        label: 'คาร์ดิโอ', 
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: Activity
      },
      flexibility: { 
        label: 'ยืดหยุ่น', 
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        icon: Target
      },
      mobility: { 
        label: 'เคลื่อนไหว', 
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        icon: Activity
      }
    };
    
    if (normalizedModality.includes('cardio') || normalizedModality.includes('คาร์ดิโอ')) {
      return modalityMap.cardio;
    }
    if (normalizedModality.includes('strength') || normalizedModality.includes('เสริมแรง') || normalizedModality.includes('ความแข็งแรง')) {
      return modalityMap.strength;
    }
    if (normalizedModality.includes('flexibility') || normalizedModality.includes('ยืด')) {
      return modalityMap.flexibility;
    }
    if (normalizedModality.includes('mobility') || normalizedModality.includes('เคลื่อนไหว')) {
      return modalityMap.mobility;
    }
    
    return modalityMap[normalizedModality as keyof typeof modalityMap] || { 
      label: modality, 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: Dumbbell
    };
  };

  // Active filters count
  const activeFiltersCount = [
    modalityFilter !== 'all',
    muscleGroupFilter !== 'all',
    typeFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#002140] flex items-center justify-center">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#002140]">คลังท่าออกกำลังกาย</h1>
              <p className="text-xs md:text-sm text-muted-foreground">จัดการและค้นหาท่าออกกำลังกายทั้งหมด</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <Card className="border-[#002140]/10 shadow-sm">
          <CardContent className="p-4 md:p-6">
            {/* Mobile Search + Filter Button */}
            <div className="md:hidden space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ค้นหาชื่อท่า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  ตัวกรอง
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-accent text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <Button 
                  className="h-11 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Search + Filters */}
            <div className="hidden md:flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="ค้นหาชื่อท่า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#002140] focus:ring-[#002140]"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <Select value={modalityFilter} onValueChange={setModalityFilter}>
                  <SelectTrigger className="w-[160px] h-12 border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="ประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกประเภท</SelectItem>
                    <SelectItem value="strength">เสริมแรง</SelectItem>
                    <SelectItem value="cardio">คาร์ดิโอ</SelectItem>
                    <SelectItem value="flexibility">ยืดหยุ่น</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger className="w-[160px] h-12 border-gray-200">
                    <SelectValue placeholder="กล้ามเนื้อ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกกลุ่มกล้าม</SelectItem>
                    {muscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] h-12 border-gray-200">
                    <SelectValue placeholder="ประเภทท่า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="default">ท่าของระบบ</SelectItem>
                    <SelectItem value="custom">ท่าของฉัน</SelectItem>
                  </SelectContent>
                </Select>

                {/* Add Exercise Button */}
                <Button 
                  size="lg" 
                  className="h-12 bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">เพิ่มท่าใหม่</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Filter Sheet */}
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>ตัวกรอง</SheetTitle>
              <SheetDescription>เลือกเกณฑ์การกรองท่าออกกำลังกาย</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6 overflow-y-auto h-[calc(100%-8rem)] pb-6">
              {/* Modality Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">ประเภทการฝึก</label>
                <Select value={modalityFilter} onValueChange={setModalityFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="ประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกประเภท</SelectItem>
                    <SelectItem value="strength">เสริมแรง</SelectItem>
                    <SelectItem value="cardio">คาร์ดิโอ</SelectItem>
                    <SelectItem value="flexibility">ยืดหยุ่น</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Muscle Group Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">กลุ่มกล้ามเนื้อ</label>
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="กล้ามเนื้อ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกกลุ่มกล้าม</SelectItem>
                    {muscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">ประเภทท่า</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="ประเภทท่า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="default">ท่าของระบบ</SelectItem>
                    <SelectItem value="custom">ท่าของฉัน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setModalityFilter('all');
                  setMuscleGroupFilter('all');
                  setTypeFilter('all');
                }}
              >
                รีเซ็ต
              </Button>
              <Button
                className="flex-1 bg-[#002140] hover:bg-[#002140]/90"
                onClick={() => setShowMobileFilters(false)}
              >
                แสดงผล ({filteredExercises.length})
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Stats Indicators */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#002140] rounded-full"></div>
            <span className="text-xs md:text-sm text-muted-foreground">ทั้งหมด:</span>
            <span className="text-xs md:text-sm font-semibold text-[#002140]">{exercises.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-xs md:text-sm text-muted-foreground">เสริมแรง:</span>
            <span className="text-xs md:text-sm font-semibold text-blue-600">{exercises.filter(e => e.modality === 'strength').length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-xs md:text-sm text-muted-foreground">คาร์ดิโอ:</span>
            <span className="text-xs md:text-sm font-semibold text-green-600">{exercises.filter(e => e.modality === 'cardio').length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-xs md:text-sm text-muted-foreground">ยืดหยุ่น:</span>
            <span className="text-xs md:text-sm font-semibold text-purple-600">{exercises.filter(e => e.modality === 'flexibility').length}</span>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredExercises.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="text-center py-12 md:py-16">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">ไม่พบท่าออกกำลังกาย</p>
                  <p className="text-xs md:text-sm text-muted-foreground">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredExercises.map(exercise => {
              const config = getModalityConfig(exercise.modality);
              const Icon = config.icon;
              
              return (
                <Card 
                  key={exercise.id} 
                  className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${config.borderColor} hover:-translate-y-1`}
                >
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-start justify-between gap-2 md:gap-3 mb-2">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 md:h-5 md:w-5 ${config.textColor}`} />
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <Badge className={`${config.bgColor} ${config.textColor} border-0 text-xs`}>
                          {config.label}
                        </Badge>
                        {exercise.isDefault ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                            ระบบ
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                            กำหนดเอง
                          </Badge>
                        )}
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setExerciseToEdit(exercise);
                                setShowEditModal(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setExerciseToDelete(exercise.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              disabled={exercise.isDefault}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {exercise.isDefault ? 'ลบไม่ได้ (ระบบ)' : 'ลบ'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardTitle className="text-base md:text-lg leading-tight mb-1">
                      {exercise.name}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm line-clamp-2">
                      {exercise.movementPattern}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 md:space-y-4">
                    {/* Muscle Groups */}
                    {exercise.muscleGroups.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">กล้ามเนื้อที่ใช้</p>
                        <div className="flex flex-wrap gap-1 md:gap-1.5">
                          {exercise.muscleGroups.slice(0, 3).map(group => (
                            <Badge 
                              key={group} 
                              variant="outline" 
                              className="text-xs px-1.5 md:px-2 py-0.5 border-gray-200 text-gray-600"
                            >
                              {group}
                            </Badge>
                          ))}
                          {exercise.muscleGroups.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1.5 md:px-2 py-0.5">
                              +{exercise.muscleGroups.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Instructions Preview */}
                    {exercise.instructions && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">คำแนะนำ</p>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {exercise.instructions}
                        </p>
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-3 md:mt-4 h-9 md:h-10 text-xs md:text-sm"
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                      ดูรายละเอียดเต็ม
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setShowAddModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent aria-describedby="delete-exercise-alert-description" className="max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบท่าออกกำลังกาย</AlertDialogTitle>
            <AlertDialogDescription id="delete-exercise-alert-description">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{exercises.find(e => e.id === exerciseToDelete)?.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (exerciseToDelete) {
                  deleteExercise(exerciseToDelete);
                  toast.success('ลบท่าออกกำลังกายเรียบร้อยแล้ว');
                  setExerciseToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Exercise Form */}
      <ExerciseForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(formData: any) => {
          addExercise(formData);
          toast.success('เพิ่มท่าใหม่เรียบร้อยแล้ว');
        }}
      />

      {/* Edit Exercise Form */}
      <ExerciseForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setExerciseToEdit(null);
        }}
        initialData={exerciseToEdit}
        onSave={(formData: any) => {
          if (exerciseToEdit) {
            updateExercise(exerciseToEdit.id, formData);
            toast.success('แก้ไขท่าเรียบร้อยแล้ว');
          }
        }}
      />
    </div>
  );
}