import React, { useState } from 'react';
import { User, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profile
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    clientUpdates: true,
  });

  const handleSave = () => {
    // Mock save functionality
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#002140] flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#002140]">ตั้งค่า</h1>
              <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวและการแจ้งเตือน</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-[#002140]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#002140]" />
                ตั้งค่าโปรไฟล์
              </CardTitle>
              <CardDescription>
                จัดการข้อมูลส่วนตัวและโปรไฟล์เทรนเนอร์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-[#002140] text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    เปลี่ยนรูปโปรไฟล์
                  </Button>
                  <p className="text-muted-foreground mt-1">
                    รองรับไฟล์ JPG, PNG สูงสุด 2MB
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleSettingChange('name', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      className="mt-1.5"
                      disabled
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
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-[#002140]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#FF6B35]" />
                ตั้งค่าการแจ้งเตือน
              </CardTitle>
              <CardDescription>
                เลือกประเภทการแจ้งเตือนที่คุณต้องการรับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p>การแจ้งเตือนทางอีเมล</p>
                  <p className="text-muted-foreground">รับการแจ้งเตือนสำคัญทางอีเมล</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p>การแจ้งเตือนบนเบราว์เซอร์</p>
                  <p className="text-muted-foreground">รับ Push Notifications บนเบราว์เซอร์</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p>การแจ้งเตือนนัดหมาย</p>
                  <p className="text-muted-foreground">แจ้งเตือนก่อนการฝึกเริ่ม 30 นาที</p>
                </div>
                <Switch
                  checked={settings.sessionReminders}
                  onCheckedChange={(checked) => handleSettingChange('sessionReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p>อัปเดตจากลูกเทรน</p>
                  <p className="text-muted-foreground">แจ้งเตือนเมื่อลูกเทรนมีการเปลี่ยนแปลงข้อมูล</p>
                </div>
                <Switch
                  checked={settings.clientUpdates}
                  onCheckedChange={(checked) => handleSettingChange('clientUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleSave} 
              size="lg"
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 min-w-[200px]"
            >
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}