import React, { useState } from 'react';
import { User, Bell, Globe, Shield, Palette, Calendar } from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Switch } from 'src/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar';
import { Separator } from 'src/components/ui/separator';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profile
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    
    // Preferences
    language: 'th',
    timezone: 'Asia/Bangkok',
    weightUnit: 'kg',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    clientUpdates: true,
    
    // Summary Cards
    includeLogo: true,
    watermark: true,
    cardTheme: 'modern',
    
    // Calendar
    googleCalendar: false,
    defaultSessionDuration: 60
  });

  const handleSave = () => {
    // Mock save functionality
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่า</h1>
        <p className="text-gray-600">จัดการการตั้งค่าและความชอบส่วนตัว</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {[
                  { icon: User, label: 'โปรไฟล์', id: 'profile' },
                  { icon: Bell, label: 'การแจ้งเตือน', id: 'notifications' },
                  { icon: Globe, label: 'ภาษาและเขตเวลา', id: 'localization' },
                  { icon: Palette, label: 'การ์ดสรุป', id: 'cards' },
                  { icon: Calendar, label: 'ปฏิทิน', id: 'calendar' },
                  { icon: Shield, label: 'ความปลอดภัย', id: 'security' }
                ].map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                โปรไฟล์
              </CardTitle>
              <CardDescription>
                จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    เปลี่ยนรูปโปรไฟล์
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    รองรับไฟล์ JPG, PNG สูงสุด 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  placeholder="081-234-5678"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <CardDescription>
                ตั้งค่าการแจ้งเตือนที่คุณต้องการรับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">การแจ้งเตือนทางอีเมล</p>
                  <p className="text-sm text-gray-500">รับการแจ้งเตือนสำคัญทางอีเมล</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">แจ้งเตือนบนเบราว์เซอร์</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">การแจ้งเตือนนัดหมาย</p>
                  <p className="text-sm text-gray-500">แจ้งเตือนก่อนเซสชัน 30 นาที</p>
                </div>
                <Switch
                  checked={settings.sessionReminders}
                  onCheckedChange={(checked) => handleSettingChange('sessionReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">อัปเดตลูกเทรน</p>
                  <p className="text-sm text-gray-500">แจ้งเตือนเมื่อลูกเทรนมีการเปลี่ยนแปลง</p>
                </div>
                <Switch
                  checked={settings.clientUpdates}
                  onCheckedChange={(checked) => handleSettingChange('clientUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                ภาษาและหน่วย
              </CardTitle>
              <CardDescription>
                ตั้งค่าภาษา เขตเวลา และหน่วยวัด
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">ภาษา</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">เขตเวลา</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Bangkok">เวลาไทย (GMT+7)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="weightUnit">หน่วยน้ำหนัก</Label>
                <Select value={settings.weightUnit} onValueChange={(value) => handleSettingChange('weightUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">กิโลกรัม (kg)</SelectItem>
                    <SelectItem value="lb">ปอนด์ (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                การ์ดสรุปเซสชัน
              </CardTitle>
              <CardDescription>
                ปรับแต่งรูปแบบการ์ดสรุปที่ส่งให้ลูกเทรน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">แสดงโลโก้</p>
                  <p className="text-sm text-gray-500">แสดงโลโก้บนการ์ดสรุป</p>
                </div>
                <Switch
                  checked={settings.includeLogo}
                  onCheckedChange={(checked) => handleSettingChange('includeLogo', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ลายน้ำ</p>
                  <p className="text-sm text-gray-500">เพิ่มลายน้ำป้องกันการคัดลอก</p>
                </div>
                <Switch
                  checked={settings.watermark}
                  onCheckedChange={(checked) => handleSettingChange('watermark', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="cardTheme">ธีมการ์ด</Label>
                <Select value={settings.cardTheme} onValueChange={(value) => handleSettingChange('cardTheme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                การเชื่อมต่อปฏิทิน
              </CardTitle>
              <CardDescription>
                เชื่อมต่อกับปฏิทินภายนอกและตั้งค่าเริ่มต้น
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-gray-500">ซิงค์นัดหมายกับ Google Calendar</p>
                </div>
                <Switch
                  checked={settings.googleCalendar}
                  onCheckedChange={(checked) => handleSettingChange('googleCalendar', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="defaultDuration">ระยะเวลาเซสชันเริ่มต้น (นาที)</Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  value={settings.defaultSessionDuration}
                  onChange={(e) => handleSettingChange('defaultSessionDuration', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}