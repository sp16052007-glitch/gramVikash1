import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppNotification } from '../types';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  clientIp: string;
  boundIpInfo: { isBound: boolean; boundRole: string | null; boundUserName: string | null } | null;
  notifications: AppNotification[];
  unreadNotifsCount: number;
  login: (credential: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  markNotificationsAsRead: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  checkIpStatus: () => Promise<{ isBound: boolean; boundRole: string | null; boundUserName: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [clientIp, setClientIp] = useState<string>('49.36.128.45');
  const [boundIpInfo, setBoundIpInfo] = useState<{ isBound: boolean; boundRole: string | null; boundUserName: string | null } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const checkIpStatus = async () => {
    try {
      const res = await fetch('/api/auth/check-ip');
      const data = await res.json();
      const info = {
        isBound: data.isBound || false,
        boundRole: data.boundRole || null,
        boundUserName: data.boundUserName || null,
      };
      setBoundIpInfo(info);
      if (data.clientIp) setClientIp(data.clientIp);
      return info;
    } catch {
      return { isBound: false, boundRole: null, boundUserName: null };
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user || null);
      if (data.allUsers) {
        setAllUsers(data.allUsers);
      }
      if (data.clientIp) {
        setClientIp(data.clientIp);
      }
      await checkIpStatus();
    } catch (err) {
      console.error('Failed to fetch user session:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = async (credential: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, email: credential, phone: credential }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.allUsers) setAllUsers(data.allUsers);
        fetchNotifications();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.allUsers) setAllUsers(data.allUsers);
        await checkIpStatus();
        fetchNotifications();
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err?.message || 'Network error occurred during registration' };
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.allUsers) setAllUsers(data.allUsers);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.allUsers) setAllUsers(data.allUsers);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Switch user error:', err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        clientIp,
        boundIpInfo,
        notifications,
        unreadNotifsCount,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        markNotificationsAsRead,
        refreshUserData: fetchCurrentUser,
        checkIpStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
