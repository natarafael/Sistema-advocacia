import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { sessionManager } from './SessionManager';
import { notify } from '../utils/toast';

const AuthContext = createContext(null);

const EMAIL_DOMAIN = '@example.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      sessionManager.startTracking();
    } else {
      sessionManager.stopTracking();
    }

    return () => {
      sessionManager.stopTracking();
    };
  }, [user]);

  const logActivity = async (actionType, details = {}) => {
    try {
      const { error } = await supabase.from('activity_logs').insert([
        {
          user_id: user.id,
          action_type: actionType,
          details,
          ip_address: 'localhost', // Since it's an Electron app
          user_agent: navigator.userAgent,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}${EMAIL_DOMAIN}`,
        password: password,
      });
      if (error) throw error;
      setUser(data.user);
      notify.success('Login realizado com sucesso!');
      sessionManager.startTracking();
      await logActivity('login');
    } catch (error) {
      notify.error('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logActivity('logout');
      sessionManager.stopTracking();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      notify.success('Logout realizado com sucesso!');
    } catch (error) {
      notify.error('Erro ao fazer logout');
      throw error;
    }
  };

  const signup = async (username, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${username}${EMAIL_DOMAIN}`,
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      notify.success('Usuário criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    return data;
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error('Current password is incorrect');

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      await logActivity('password_change');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // function to fetch activity logs
  const fetchActivityLogs = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateProfile,
        fetchProfile,
        changePassword,
        logActivity,
        fetchActivityLogs,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
