import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AdminUser } from '../types';
import { useToast } from '../components/Toast';

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email || "",
          name: currentUser.displayName || currentUser.email || "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || userCredential.user.email || '',
        });
        showToast({
          type: 'success',
          title: 'Welcome!',
          message: 'You have successfully logged in.',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        type: 'error',
        title: 'Login Error',
        message: 'Invalid email or password. Please try again.',
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      showToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        type: 'error',
        title: 'Logout Error',
        message: 'An error occurred while logging out.',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};