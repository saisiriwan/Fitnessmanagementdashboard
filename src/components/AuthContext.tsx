import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  userType: 'trainer' | 'client';
  clientId?: string; // สำหรับลูกเทรน
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (userType?: 'trainer' | 'client', clientId?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem('trainer-app-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('trainer-app-user', JSON.stringify(updatedUser));
  };

  const signIn = async (userType: 'trainer' | 'client' = 'trainer', clientId?: string) => {
    if (userType === 'trainer') {
      // Mock Trainer sign-in
      const mockUser: User = {
        id: 'trainer-001',
        name: 'อาจารย์เจมส์',
        email: 'james.trainer@example.com',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        userType: 'trainer',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('trainer-app-user', JSON.stringify(mockUser));
    } else if (userType === 'client' && clientId) {
      // Client sign-in (username/password or Google OAuth)
      const clients = JSON.parse(localStorage.getItem('trainer-app-clients') || '[]');
      const clientData = clients.find((c: any) => c.id === clientId);
      
      if (clientData) {
        const mockUser: User = {
          id: `client-user-${clientId}`,
          name: clientData.name,
          email: clientData.email,
          picture: clientData.avatar,
          userType: 'client',
          clientId: clientId,
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('trainer-app-user', JSON.stringify(mockUser));
      }
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('trainer-app-user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}