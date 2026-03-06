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
    const [syncing, setSyncing] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [roleSelected, setRoleSelected] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    // Backward compat: onboardingCompleted is true only when BOTH flags are true
    const onboardingCompleted = roleSelected && registrationCompleted;

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                localStorage.setItem('authToken', session.access_token);

                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    setSyncing(true);
                    await syncAndFetchProfile(session);
                    setSyncing(false);
                }
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                setUserRole(null);
                setRoleSelected(false);
                setRegistrationCompleted(false);
                setSyncing(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
                const role = userData.role || null;
                setUserRole(role);

                // --- New two-flag system ---
                // roleSelected: user explicitly picked a role (default false for brand new users)
                let roleSel = userData.roleSelected;
                // registrationCompleted: user finished the role-specific form
                let regComp = userData.registrationCompleted;

                // Backward-compat: if old DB has onboarding_completed column but not new ones,
                // infer from existing role — non-viewer users who existed before this migration
                // are treated as fully onboarded.
                if (roleSel === undefined || roleSel === null) {
                    roleSel = role && role !== 'viewer'; // existing non-viewer users are done
                }
                if (regComp === undefined || regComp === null) {
                    regComp = role && role !== 'viewer';
                }

                // Additional safety: if user has a non-viewer role and roleSelected is true,
                // they must have completed registration at some point — treat as complete.
                // This handles cases where DB has registrationCompleted=false but user is active.
                if (roleSel && role && role !== 'viewer' && !regComp) {
                    regComp = true;
                }

                setRoleSelected(!!roleSel);
                setRegistrationCompleted(!!regComp);

                setUser(prev => ({
                    ...prev,
                    ...userData,
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
                redirectTo: `${window.location.origin}/`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
    };

    const signOut = async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUserRole(null);
        setUser(null);
        setRoleSelected(false);
        setRegistrationCompleted(false);
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
     * Step 1: User picks a role on the choice-role page.
     * Sets roleSelected=true. For viewer, also sets registrationCompleted=true.
     */
    const updateUserRole = async (role) => {
        // Always use the freshest token from Supabase before the backend call.
        // This prevents stale/cached tokens causing 401 after an OAuth redirect.
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
                localStorage.setItem('authToken', sessionData.session.access_token);
            }
        } catch (_) { /* non-blocking — apiClient will still try */ }

        const response = await apiClient.post('/users/role', { role });
        if (response?.data) {
            const userData = response.data?.data || response.data;
            const newRole = userData.role || role;
            setUserRole(newRole);
            setRoleSelected(true);
            // Viewer has no form, so registration is also immediately complete
            if (newRole === 'viewer') {
                setRegistrationCompleted(true);
            }
            setUser(prev => ({ ...prev, role: newRole, roleSelected: true }));
        }
        return { success: true };
    };

    /**
     * Step 2: User completes the role-specific registration form.
     * Called by startup, investor, and incubator registration forms on success.
     */
    const completeRegistration = async () => {
        try {
            await apiClient.post('/users/complete-registration');
        } catch (err) {
            console.warn('completeRegistration API call failed (non-blocking):', err?.message);
        }
        setRegistrationCompleted(true);
        setUser(prev => ({ ...prev, registrationCompleted: true }));
    };

    const value = {
        user,
        session,
        userRole,
        loading,
        syncing,
        // New flags
        roleSelected,
        registrationCompleted,
        // Computed alias for backward compat
        onboardingCompleted,
        // Methods
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        updateUserRole,
        completeRegistration,
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
