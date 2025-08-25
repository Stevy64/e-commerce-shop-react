/**
 * Hook d'authentification pour l'API Django
 * 
 * Ce hook remplace useAuth.tsx et utilise l'API Django au lieu de Supabase.
 * Il maintient la même interface pour assurer la compatibilité.
 */

import { useState, useEffect, createContext, useContext } from "react";
import { apiService, User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const checkAuthStatus = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          setSession({ user: currentUser });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Token invalide, nettoyer le localStorage
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      const authData = await apiService.login(username, password);
      setUser(authData.user);
      setSession({ user: authData.user });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    setLoading(true);
    try {
      await apiService.register(userData);
      // Après l'inscription, connecter automatiquement l'utilisateur
      await signIn(userData.username, userData.password);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      apiService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

