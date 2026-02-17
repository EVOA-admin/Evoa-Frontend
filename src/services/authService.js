import { supabase } from '../config/supabase';
import { setAuthToken, setUserData, clearAuthData } from './apiClient';

export const USER_ROLES = {
  VIEWER: 'VIEWER',
  STARTUP: 'STARTUP',
  INVESTOR: 'INVESTOR',
  INCUBATOR: 'INCUBATOR',
  ADMIN: 'ADMIN',
};

export const VALID_ROLES = Object.values(USER_ROLES);

/**
 * Sign up a new user with email and password
 */
export const signup = async ({ email, password, fullName }) => {
  if (!email || !password || !fullName) {
    throw {
      error: true,
      status: 400,
      message: 'Missing required fields: email, password, and fullName are required',
      data: null,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // Disable email confirmation - allow immediate login
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    throw {
      error: true,
      status: error.status || 400,
      message: error.message,
      data: null,
    };
  }

  // Store session
  if (data.session) {
    setAuthToken(data.session.access_token);
    setUserData(data.user);
  }

  return {
    error: false,
    data: {
      user: data.user,
      session: data.session
    }
  };
};

/**
 * Login with email and password
 */
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw {
      error: true,
      status: error.status || 401,
      message: error.message,
      data: null,
    };
  }

  // Store session
  setAuthToken(data.session.access_token);
  setUserData(data.user);

  return {
    error: false,
    data: {
      user: data.user,
      session: data.session
    }
  };
};

/**
 * Google OAuth authentication
 */
export const googleAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw {
      error: true,
      status: error.status || 400,
      message: error.message,
      data: null,
    };
  }

  return { error: false, data };
};

/**
 * Send password reset email
 */
export const forgotPassword = async ({ email }) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw {
      error: true,
      status: error.status || 400,
      message: error.message,
      data: null,
    };
  }

  return {
    error: false,
    data: {
      message: 'Password reset email sent successfully'
    }
  };
};

/**
 * Update password (for reset password flow)
 */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw {
      error: true,
      status: error.status || 400,
      message: error.message,
      data: null,
    };
  }

  return {
    error: false,
    data: {
      message: 'Password updated successfully'
    }
  };
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw {
      error: true,
      status: error.status || 400,
      message: error.message,
      data: null,
    };
  }

  return { error: false, data: data.session };
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw {
      error: true,
      status: error.status || 401,
      message: error.message,
      data: null,
    };
  }

  return { error: false, data: data.user };
};

/**
 * Logout current user
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  clearAuthData();

  if (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export default {
  signup,
  login,
  googleAuth,
  forgotPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  logout,
  isAuthenticated,
};
