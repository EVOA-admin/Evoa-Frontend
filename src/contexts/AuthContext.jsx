import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        /**
         * Use ONLY onAuthStateChange as the single source of truth for session state.
         * Supabase V2 guarantees it fires INITIAL_SESSION immediately on subscribe,
         * even with no session. This avoids the double-sync race condition between
         * getSession() and onAuthStateChange firing concurrently.
         */
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // ALWAYS keep localStorage in sync on every auth event.
                // This is critical for TOKEN_REFRESHED — if we skip it,
                // localStorage holds a stale expired token → all future API calls fail with 401.
                localStorage.setItem('authToken', session.access_token);

                // Only re-sync backend profile on meaningful login events
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    await syncAndFetchProfile(session);
                }
                // TOKEN_REFRESHED: token is already updated in localStorage above — nothing else needed
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                setUserRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Sync user with backend and fetch their profile (role etc.).
     * Has a 6-second timeout so a slow/down backend never blocks the UI indefinitely.
     */
    const syncAndFetchProfile = async (session) => {
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('sync_timeout')), 6000);
        });

        try {
            const syncResponse = await Promise.race([
                apiClient.post('/users/sync', {
                    email: session.user.email,
                    id: session.user.id,
                    user_metadata: session.user.user_metadata,
                }),
                timeoutPromise,
            ]);

            if (syncResponse?.data) {
                const userData = syncResponse.data?.data || syncResponse.data;
                setUserRole(userData.role || null);
                setUser(prev => ({
                    ...prev,
                    ...userData,
                    // Always preserve Supabase identity
                    email: session.user.email,
                    id: session.user.id,
                    avatarUrl: userData.avatarUrl || session.user.user_metadata?.avatar_url || prev?.avatarUrl,
                }));
            }
        } catch (err) {
            if (err.message === 'sync_timeout') {
                console.warn('Backend sync timed out — proceeding without role');
            } else {
                console.error('Error syncing user with backend:', err);
            }
            // Never block the user — loading must always become false
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const signUp = async (email, password, metadata = {}) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
    };

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signInWithGoogle = async () => {
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/choice-role`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
    };

    const signOut = async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUserRole(null);
        setUser(null);
        return await supabase.auth.signOut();
    };

    const updateProfile = async (updates) => {
        const { data, error } = await supabase.auth.updateUser({ data: updates });
        if (error) throw error;

        try {
            const response = await apiClient.patch('/users/me', updates);
            if (response?.data) {
                const userData = response.data?.data || response.data;
                if (userData.role) setUserRole(userData.role);
                setUser(prev => ({ ...prev, ...userData }));
            }
        } catch (err) {
            console.error('Failed to update backend profile:', err);
        }

        return data;
    };

    /**
     * Persist the selected role to the backend database.
     * Called from choice-role after user selects their role.
     */
    const updateUserRole = async (role) => {
        const response = await apiClient.post('/users/role', { role });
        if (response?.data) {
            const userData = response.data?.data || response.data;
            const newRole = userData.role || role;
            setUserRole(newRole);
            setUser(prev => ({ ...prev, role: newRole }));
        }
        return { success: true };
    };

    const value = {
        user,
        session,
        userRole,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        updateUserRole,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
