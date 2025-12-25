import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { User, Bell, LogOut, Camera, Mail, Smartphone } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [settings, setSettings] = useState({
    // Profile
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    avatar: user?.picture || "",

    // Preferences
    language: "th",
    timezone: "Asia/Bangkok",
    weightUnit: "kg",

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    clientUpdates: true,

    // Calendar
    googleCalendar: false,
    defaultSessionDuration: 60,
  });

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name || prev.name,
        username: user.username || prev.username,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        avatar: user.picture || prev.avatar,
      }));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      await api.put(`/users/${user.id}`, {
        name: settings.name,
        email: settings.email,
        username: settings.username,
        phone_number: settings.phone,
      });

      updateUser({
        name: settings.name,
        email: settings.email,
        username: settings.username,
        phone_number: settings.phone,
      });
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Failed to save settings", err);
      toast.error("บันทึกการตั้งค่าไม่สำเร็จ");
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const toastId = toast.loading("กำลังอัปโหลดรูปโปรไฟล์...");

      const response = await api.post("/users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatarUrl = response.data.url;
      setSettings((prev) => ({ ...prev, avatar: newAvatarUrl }));
      updateUser({ picture: newAvatarUrl });

      toast.dismiss(toastId);
      toast.success("อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("อัปโหลดรูปไม่สำเร็จ");
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof signOut === "function") {
        await signOut();
      }
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("ออกจากระบบไม่สำเร็จ โปรดลองอีกครั้ง");
    }
  };

  const menuItems = [
    { icon: User, label: "โปรไฟล์", id: "profile" },
    { icon: Bell, label: "การแจ้งเตือน", id: "notifications" },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลส่วนตัวและการตั้งค่าระบบของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-col space-y-1 sticky top-24">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === item.id && "font-medium"
                )}
                onClick={() => scrollToSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Profile Section */}
          <section id="profile" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>โปรไฟล์</CardTitle>
                <CardDescription>
                  ข้อมูลส่วนตัวที่จะแสดงให้ลูกค้าเห็น
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary transition-colors">
                      <AvatarImage src={settings.avatar} alt={settings.name} />
                      <AvatarFallback className="text-2xl">
                        {settings.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" onClick={handleAvatarClick}>
                        เปลี่ยนรูปโปรไฟล์
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      รองรับไฟล์ JPG, PNG สูงสุด 2MB
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">ชื่อผู้ใช้ (Username)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        value={settings.username}
                        onChange={(e) =>
                          handleSettingChange("username", e.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) =>
                          handleSettingChange("name", e.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) =>
                          handleSettingChange("email", e.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) =>
                          handleSettingChange("phone", e.target.value)
                        }
                        placeholder="081-234-5678"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notifications Section */}
          <section id="notifications" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือน</CardTitle>
                <CardDescription>
                  เลือกช่องทางและเรื่องที่คุณต้องการรับการแจ้งเตือน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">การแจ้งเตือนทางอีเมล</Label>
                    <p className="text-sm text-muted-foreground">
                      รับข่าวสารและสรุปรายสัปดาห์ทางอีเมล
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(c) =>
                      handleSettingChange("emailNotifications", c)
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      แจ้งเตือนทันทีบนหน้าจอเมื่อมีกิจกรรมสำคัญ
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(c) =>
                      handleSettingChange("pushNotifications", c)
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">เตือนก่อนเริ่มเซสชัน</Label>
                    <p className="text-sm text-muted-foreground">
                      แจ้งเตือนล่วงหน้า 30 นาทีก่อนถึงเวลานัดหมาย
                    </p>
                  </div>
                  <Switch
                    checked={settings.sessionReminders}
                    onCheckedChange={(c) =>
                      handleSettingChange("sessionReminders", c)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Summary Cards Section */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} className="min-w-[120px]">
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
