import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

const normalizeRole = (r) => {
  if (!r) return null;
  const str = String(r).toUpperCase().trim();
  return str.startsWith('ROLE_') ? str.substring(5) : str;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => normalizeRole(localStorage.getItem('role')));
  const [memberId, setMemberId] = useState(() => localStorage.getItem('memberId') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('member');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password, loginRole) => {
    const data = await apiFetch('/api/members/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: loginRole }),
    });

    const normRole = normalizeRole(data.role);

    setToken(data.token);
    setRole(normRole);
    setMemberId(data.memberId);
    setUser({ ...data, role: normRole });

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', normRole);
    localStorage.setItem('memberId', data.memberId);
    localStorage.setItem('member', JSON.stringify({ ...data, role: normRole }));

    return data;
  };

  const register = async (registerData) => {
    return await apiFetch('/api/members/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  };

  const refreshUser = async () => {
    try {
      const data = await apiFetch('/api/members/me');
      if (data) {
        setUser((prev) => ({ ...prev, ...data }));
        localStorage.setItem('member', JSON.stringify({ ...user, ...data }));
      }
    } catch (e) {
      console.warn('Failed to refresh user details:', e);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setMemberId(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('memberId');
    localStorage.removeItem('member');
    // Clear any extra auth keys
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, role, memberId, user, setUser, login, register, refreshUser, logout }}>
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
