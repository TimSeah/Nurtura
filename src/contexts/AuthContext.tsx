import React, { createContext, useState, useEffect,ReactNode } from 'react';

type AuthContextType = {
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: async () => {}
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<{ username: string }|null>(null);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser({ username: data.username });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  // optional: on mount try to fetch /api/auth/me
  /*
 useEffect(() => {
  (async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data: { email: string } = await res.json();
      setUser({ email: data.email });
    }
  })();
}, []);*/

  return (
    <AuthContext.Provider value={{user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}