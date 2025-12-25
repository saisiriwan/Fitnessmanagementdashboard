import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api"; // ใช้ Axios instance ที่เราสร้าง

interface User {
  id: string;
  username: string; // Added
  name: string;
  email: string;
  phone_number?: string;
  picture?: string;
  role?: string; // Added role
  settings?: any; // User settings
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  login: () => Promise<void>; // Alias for signIn
  logout: () => Promise<void>; // Alias for signOut
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // เพิ่ม state loading เพื่อไม่ให้แสดงหน้าเว็บก่อนเช็คเสร็จ
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      // ใช้ api.get แทน fetch (ไม่ต้องใส่ baseURL และ credentials เอง)
      const response = await api.get("/auth/me");

      // Map ข้อมูลจาก Backend (avatar_url) -> Frontend (picture)
      const userData = response.data;
      setUser({
        ...userData,
        picture: userData.avatar_url,
        username: userData.username,
        phone_number: userData.phone_number,
        settings: userData.settings, // Map settings
      });

      setIsAuthenticated(true);
    } catch (error) {
      // ถ้าเช็คไม่ผ่าน (401) หรือ error อื่นๆ
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false); // โหลดเสร็จแล้ว
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const signIn = async () => {
    // Logic การ Login จริงๆ อยู่ที่หน้า SignIn.tsx
    // ฟังก์ชันนี้อาจจะใช้เพื่อ re-fetch user หลังจาก login สำเร็จก็ได้
    // หรือปล่อยว่างไว้ถ้าไม่ได้ใช้
    console.log("Sign in logic handled in SignIn component");
  };

  const signOut = async () => {
    try {
      // ใช้ api.post แทน fetch
      // await api.post('/auth/logout');
      // ✅ แก้ไข: ระบุ URL เต็มๆ เพื่อความชัวร์ (หรือใช้ axios ตัวอื่นที่ไม่ติด baseURL)
      await api.post("http://localhost:8080/auth/logout");
    } catch (error) {
      console.error("Failed to logout on backend", error);
    } finally {
      // ล้างสถานะใน Frontend ไม่ว่าจะเกิด error หรือไม่
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("trainer-app-user"); // ล้างของเก่า (เผื่อมี)

      // บังคับ refresh หรือ redirect ไปหน้า login
      window.location.href = "/signin";
    }
  };

  // ฟังก์ชันสำหรับอัปเดตข้อมูล User ใน State (เพื่อให้ UI เปลี่ยนทันที)
  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  // ถ้ากำลังเช็คสถานะ Login อยู่ ให้แสดง Loading หรือหน้าว่างๆ ไปก่อน
  // เพื่อป้องกันไม่ให้ PublicRoute/ProtectedRoute ทำงานผิดพลาดวูบหนึ่ง
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signOut,
        login: signIn,
        logout: signOut,
        updateUser,
        loading,
        checkAuth: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
