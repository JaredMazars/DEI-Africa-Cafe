import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  role: 'mentor' | 'mentee' | 'both' | string;
  location?: string;
  experience?: string;
  availability?: string;
  bio?: string;
  can_mentor?: boolean;
  can_be_mentored?: boolean;
  // what this user offers (their own expertise)
  expertise?: string[];
  // what kind of mentor expertise they are looking for
  desired_expertise?: string[];
  interests?: string[];
  goals?: string[];
  languages?: string[];
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decode a JWT payload without verifying signature (client-side only use)
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || typeof decoded.exp !== 'number') return true;
  return decoded.exp * 1000 < Date.now();
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    if (token && !isTokenExpired(token) && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    } else {
      // Clean up expired/invalid session
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    const { token, user } = data.data;

    const resolvedRole = user.profile?.role || 'mentee';
    const userToStore: CurrentUser = {
      id: user.id,
      email: user.email,
      role: resolvedRole,
      profile: user.profile ? {
        name:             user.profile.name,
        role:             resolvedRole,
        location:         user.profile.location,
        experience:       user.profile.experience,
        availability:     user.profile.availability,
        bio:              user.profile.bio,
        can_mentor:       user.profile.can_mentor,
        can_be_mentored:  user.profile.can_be_mentored,
        expertise:        user.profile.expertise        || [],
        desired_expertise: user.profile.desired_expertise || [],
        interests:        user.profile.interests        || [],
        goals:            user.profile.goals            || [],
        languages:        user.profile.languages        || [],
      } : undefined,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userToStore));

    setCurrentUser(userToStore);
    setIsAuthenticated(true);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged: CurrentUser = { ...prev, profile: { ...(prev.profile as UserProfile), ...profile } };
      localStorage.setItem('currentUser', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, updateUserProfile }}>
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
