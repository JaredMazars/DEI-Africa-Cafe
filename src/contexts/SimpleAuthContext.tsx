import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const VALID_EMAIL = 'jaredmoodley1212@gmail.com';
const VALID_PASSWORD = 'password123';

// Expert role credentials
const EXPERT_EMAIL = 'expert@oneafrica.com';
const EXPERT_PASSWORD = 'expert123';

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check expert credentials
    if (email === EXPERT_EMAIL && password === EXPERT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        email: EXPERT_EMAIL,
        role: 'expert',
        profile: { name: 'Expert User', role: 'expert' }
      }));
      return;
    }
    
    // Check admin credentials
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        email: VALID_EMAIL,
        role: 'admin',
        profile: { name: 'Admin User', role: 'admin' }
      }));
      return;
    }
    
    // Check verified registered users
    const verifiedUser = localStorage.getItem('verifiedUser');
    if (verifiedUser) {
      const userData = JSON.parse(verifiedUser);
      if (email === userData.email && password === userData.password) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return;
      }
    }
    
    throw new Error('Invalid email or password. Please verify your email first if you just registered.');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
