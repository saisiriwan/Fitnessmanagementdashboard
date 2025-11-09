import React, { useState } from 'react';
import { Plus, Save, Users, Calendar, Dumbbell } from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Badge } from 'src/components/ui/badge';
import { useApp } from './AppContext';

export default function ProgramBuilder() {
  const { programs, clients } = useApp();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const program = selectedProgram ? programs.find(p => p.id === selectedProgram) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โปรแกรมออกกำลังกาย</h1>
          <p className="text-gray-600">สร้างและจัดการโปรแกรมการออกกำลังกาย</p>
        </div>
        
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          สร้างโปรแกรมใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>รายการโปรแกรม</CardTitle>
              <CardDescription>
                โปรแกรมที่สร้างไว้ทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {programs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">ยังไม่มีโปรแกรม</p>
                ) : (
                  programs.map(prog => (
                    <div 
                      key={prog.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProgram === prog.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedProgram(prog.id)}
                    >
                      <div className="font-medium">{prog.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {prog.duration} สัปดาห์ • {prog.daysPerWeek} วัน/สัปดาห์
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {prog.assignedClients.length} คน
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Editor */}
        <div className="lg:col-span-2">
          {isCreating ? (
            <Card>
              <CardHeader>
                <CardTitle>สร้างโปรแกรมใหม่</CardTitle>
                <CardDescription>
                  กรอกข้อมูลพื้นฐานของโปรแกรม
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">ชื่อโปรแกรม</Label>
                  <Input id="name" placeholder="เช่น โปรแกรมลดน้ำหนัก 8 สัปดาห์" />
                </div>
                
                <div>
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea 
                    id="description" 
                    placeholder="อธิบายเป้าหมายและรายละเอียดของโปรแกรม"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">จำนวนสัปดาห์</Label>
                    <Input id="duration" type="number" placeholder="8" />
                  </div>
                  <div>
                    <Label htmlFor="daysPerWeek">วันต่อสัปดาห์</Label>
                    <Input id="daysPerWeek" type="number" placeholder="3" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => setIsCreating(false)}>
                    <Save className="h-4 w-4 mr-1" />
                    บันทึก
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : program ? (
            <div className="space-y-4">
              {/* Program Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {program.name}
                    <Badge variant="outline">
                      {program.assignedClients.length} ลูกเทรน
                    </Badge>
                  </CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">ระยะเวลา</p>
                      <p className="font-medium">{program.duration} สัปดาห์</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ความถี่</p>
                      <p className="font-medium">{program.daysPerWeek} วัน/สัปดาห์</p>
                    </div>
                    <div>
                      <p className="text-gray-500">สร้างเมื่อ</p>
                      <p className="font-medium">
                        {new Date(program.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    โครงสร้างโปรแกรม
                  </CardTitle>
                  <CardDescription>
                    กำหนดท่าและเซตสำหรับแต่ละวัน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {program.weeks.slice(0, 2).map(week => (
                      <div key={week.weekNumber} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">สัปดาห์ที่ {week.weekNumber}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {week.days.map(day => (
                            <div key={day.dayNumber} className="border rounded p-3">
                              <div className="font-medium text-sm mb-2">วันที่ {day.dayNumber}: {day.name}</div>
                              <div className="space-y-1">
                                {day.exercises.map((exercise, idx) => (
                                  <div key={idx} className="text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Dumbbell className="h-3 w-3" />
                                      Exercise {idx + 1}
                                    </div>
                                    <div className="ml-4">
                                      {exercise.sets}x{exercise.reps} @ {exercise.weight}
                                    </div>
                                  </div>
                                ))}
                                <Button size="sm" variant="ghost" className="w-full mt-2">
                                  <Plus className="h-3 w-3 mr-1" />
                                  เพิ่มท่า
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มสัปดาห์
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    ลูกเทรนที่ใช้โปรแกรมนี้
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {program.assignedClients.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">ยังไม่มีลูกเทรนที่ใช้โปรแกรมนี้</p>
                    ) : (
                      program.assignedClients.map(clientId => {
                        const client = clients.find(c => c.id === clientId);
                        if (!client) return null;
                        
                        return (
                          <div key={clientId} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{client.name}</p>
                                <p className="text-xs text-gray-500">{client.goal}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{client.status}</Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-1" />
                    มอบหมายให้ลูกเทรน
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">เลือกโปรแกรมจากรายการด้านซ้าย หรือสร้างโปรแกรมใหม่</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  สร้างโปรแกรมใหม่
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}