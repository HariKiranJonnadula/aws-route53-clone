'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('route53_token');
      const savedUser = localStorage.getItem('route53_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('route53_token');
          localStorage.removeItem('route53_user');
        }
      } else if (!token && pathname !== '/login') {
        // Auto-seed demo session for seamless preview if needed or redirect
        // To provide seamless testing, let's allow either redirect or demo login
      }
      setLoading(false);
    };

    initAuth();
  }, [pathname]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('route53_token', res.access_token);
    localStorage.setItem('route53_user', JSON.stringify(res.user));
    setUser(res.user);
    router.push('/hosted-zones');
  };

  const logout = () => {
    localStorage.removeItem('route53_token');
    localStorage.removeItem('route53_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
