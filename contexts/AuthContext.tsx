import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthApiError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { nome: string; cidade: string; tipo: 'cliente' | 'freelancer' }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && status !== 406) {
        console.error('Erro ao carregar perfil:', error.message);
        throw error;
      }

      setProfile(data || null);
    } catch (error) {
      console.error('Exceção ao carregar perfil:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        loadProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          setTimeout(() => {
            loadProfile(currentUser.id);
          }, 0);
        } else {
          setProfile(null);
          if (_event === 'SIGNED_OUT') {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = async (
    email: string, 
    password: string, 
    userData: { nome: string; cidade: string; tipo: 'cliente' | 'freelancer' }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: userData.nome,
          cidade: userData.cidade,
          tipo: userData.tipo,
        },
      },
    });

    if (error) {
      if (error instanceof AuthApiError) {
        if (error.message.includes('User already registered')) {
          throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
        }
        if (error.status === 422 || error.message.includes('password should be at least 6 characters')) {
          throw new Error('Verifique os dados. O e-mail deve ser válido e a senha precisa ter no mínimo 6 caracteres.');
        }
      }
      // Para qualquer outro erro, lançamos a mensagem genérica que pode indicar um problema no trigger.
      console.error("Erro no Supabase SignUp:", error);
      throw new Error('Ocorreu um erro ao criar sua conta. Verifique os dados e tente novamente.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error instanceof AuthApiError) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('E-mail ou senha inválidos.');
        }
        if (error.message === 'Email not confirmed') {
          throw new Error('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.');
        }
      }
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    setProfile(prevProfile => prevProfile ? { ...prevProfile, ...updates } : null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
