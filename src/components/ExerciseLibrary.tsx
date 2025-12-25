import React, { useState } from 'react';
import { Search, Plus, Filter, BookOpen, Dumbbell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useApp } from './AppContext';
import { toast } from 'sonner@2.0.3';

export default function ExerciseLibrary() {
  const { exercises, addExercise } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    modality: 'strength' as const,
    muscleGroups: [] as string[],
    movementPattern: '',
    instructions: '',
    category: ''
  });

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === 'all' || exercise.modality === modalityFilter;
    const matchesMuscleGroup = muscleGroupFilter === 'all' || 
      exercise.muscleGroups.some(group => group.toLowerCase().includes(muscleGroupFilter.toLowerCase()));
    
    return matchesSearch && matchesModality && matchesMuscleGroup;
  });

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Biceps', 'Triceps'
  ];

  const handleAddExercise = () => {
    if (!newExercise.name || !newExercise.movementPattern) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    addExercise(newExercise);
    toast.success('เพิ่มท่าใหม่เรียบร้อยแล้ว');
    setShowAddModal(false);
    setNewExercise({
      name: '',
      modality: 'strength',
      muscleGroups: [],
      movementPattern: '',
      instructions: '',
      category: ''
    });
  };

  const handleMuscleGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setNewExercise(prev => ({
        ...prev,
        muscleGroups: [...prev.muscleGroups, group]
      }));
    } else {
      setNewExercise(prev => ({
        ...prev,
        muscleGroups: prev.muscleGroups.filter(g => g !== group)
      }));
    }
  };

  const getModalityBadge = (modality: string) => {
    const modalityMap = {
      strength: { label: 'เสริมแรง', color: 'bg-red-100 text-red-800' },
      cardio: { label: 'คาร์ดิโอ', color: 'bg-green-100 text-green-800' },
      flexibility: { label: 'ยืดหยุ่น', color: 'bg-blue-100 text-blue-800' },
      mobility: { label: 'เคลื่อนไหว', color: 'bg-purple-100 text-purple-800' }
    };
    
    return modalityMap[modality as keyof typeof modalityMap] || { label: modality, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">คลังท่าออกกำลังกาย</h1>
          <p className="text-gray-600">จัดการและค้นหาท่าออกกำลังกาย</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มท่าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เพิ่มท่าออกกำลังกายใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลของท่าออกกำลังกายใหม่
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exerciseName">ชื่อท่า *</Label>
                <Input
                  id="exerciseName"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="เช่น Barbell Squat"
                />
              </div>

              <div>
                <Label htmlFor="modality">ประเภท</Label>
                <Select 
                  value={newExercise.modality} 
                  onValueChange={(value: any) => setNewExercise(prev => ({ ...prev, modality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">เสริมแรง</SelectItem>
                    <SelectItem value="cardio">คาร์ดิโอ</SelectItem>
                    <SelectItem value="flexibility">ยืดหยุ่น</SelectItem>
                    <SelectItem value="mobility">เคลื่อนไหว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>กล้ามเนื้อที่ใช้ (เลือกได้สูงสุด 3 กลุ่ม)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {muscleGroups.map(group => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox
                        id={group}
                        checked={newExercise.muscleGroups.includes(group)}
                        onCheckedChange={(checked) => handleMuscleGroupChange(group, checked as boolean)}
                        disabled={!newExercise.muscleGroups.includes(group) && newExercise.muscleGroups.length >= 3}
                      />
                      <Label htmlFor={group} className="text-sm">{group}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="movementPattern">รูปแบบการเคลื่อนไหว *</Label>
                <Input
                  id="movementPattern"
                  value={newExercise.movementPattern}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, movementPattern: e.target.value }))}
                  placeholder="เช่น Squat, Push, Pull, Hinge"
                />
              </div>

              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Input
                  id="category"
                  value={newExercise.category}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="เช่น Compound, Isolation"
                />
              </div>

              <div>
                <Label htmlFor="instructions">คำแนะนำการทำท่า</Label>
                <Textarea
                  id="instructions"
                  value={newExercise.instructions}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="อธิบายวิธีการทำท่าและข้อควรระวัง"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddExercise}>
                  บันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ท่าทั้งหมด</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{exercises.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสริมแรง</CardTitle>
            <Dumbbell className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {exercises.filter(e => e.modality === 'strength').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-chart-3/20 bg-gradient-to-br from-chart-3/10 to-chart-3/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาร์ดิโอ</CardTitle>
            <div className="w-4 h-4 bg-chart-3 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {exercises.filter(e => e.modality === 'cardio').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-chart-4/20 bg-gradient-to-br from-chart-4/10 to-chart-4/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยืดหยุ่น</CardTitle>
            <div className="w-4 h-4 bg-chart-4 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">
              {exercises.filter(e => e.modality === 'flexibility').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาชื่อท่า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                <SelectItem value="strength">เสริมแรง</SelectItem>
                <SelectItem value="cardio">คาร์ดิโอ</SelectItem>
                <SelectItem value="flexibility">ยืดหยุ่น</SelectItem>
                <SelectItem value="mobility">เคลื่อนไหว</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="กล้ามเนื้อ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">กล้ามเนื้อทั้งหมด</SelectItem>
                {muscleGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ไม่พบท่าออกกำลังกาย</p>
          </div>
        ) : (
          filteredExercises.map(exercise => {
            const modalityBadge = getModalityBadge(exercise.modality);
            
            return (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge className={modalityBadge.color}>
                      {modalityBadge.label}
                    </Badge>
                  </div>
                  <CardDescription>{exercise.movementPattern}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">กล้ามเนื้อที่ใช้:</p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.map(group => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {exercise.instructions && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">คำแนะนำ:</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {exercise.instructions}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        ใช้ในโปรแกรม
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        เพิ่มในเซสชัน
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}