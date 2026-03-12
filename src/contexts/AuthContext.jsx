import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    // Prevents concurrent or back-to-back redundant syncAndFetchProfile calls.
    // Supabase can fire INITIAL_SESSION + SIGNED_IN + TOKEN_REFRESHED in quick succession.
    const isSyncingRef = useRef(false);

    // Backward compat: onboardingCompleted is true only when BOTH flags are true
    const onboardingCompleted = roleSelected && registrationCompleted;

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                localStorage.setItem('authToken', session.access_token);

                // TOKEN_REFRESHED is a silent background key rotation — no need to re-sync the
                // full user profile from the backend. Skipping it avoids an unnecessary 6s wait.
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    // Guard: if a sync is already running, don't start another.
                    if (isSyncingRef.current) return;
                    isSyncingRef.current = true;
                    setSyncing(true);
                    await syncAndFetchProfile(session);
                    setSyncing(false);
                    isSyncingRef.current = false;
                }
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                setUserRole(null);
                setRoleSelected(false);
                setRegistrationCompleted(false);
                setSyncing(false);
                isSyncingRef.current = false;
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
                // Backward-compat for users created before the two-flag schema:
                // If the DB has no record for these columns (null/undefined),
                // infer from role. This ONLY affects genuinely old records where
                // the columns literally don't exist yet.
                if (roleSel === undefined || roleSel === null) {
                    roleSel = !!(role && role !== 'viewer');
                }
                if (regComp === undefined || regComp === null) {
                    // Old users with a non-viewer role are assumed to have
                    // completed registration (they predate the flag system).
                    regComp = !!(role && role !== 'viewer');
                }
                // NOTE: if the DB explicitly returns false, we MUST respect it.
                // Never override an explicit false — that is exactly what causes
                // the registration-bypass bug.

                setRoleSelected(!!roleSel);
                setRegistrationCompleted(!!regComp);

                setUser(prev => ({
                    // Start from previous state so non-backend fields persist
                    ...prev,
                    // Backend data is always the authoritative source for profile fields.
                    // Spread all backend fields first, then explicitly override the ones
                    // that might incorrectly fall back to Google OAuth metadata.
                    ...userData,
                    // Email comes from Supabase (authoritative identity source)
                    email: session.user.email,
                    // id here is the backend UUID (userData.id), NOT the Supabase UUID.
                    // Keep backend id as primary; the Supabase UUID is in session.user.id.
                    id: userData.id || session.user.id,
                    // avatarUrl: ONLY use the backend value. If the user uploaded a photo
                    // during registration it will be here. Never fall back to Google photo.
                    avatarUrl: userData.avatarUrl || null,
                    // fullName: ONLY use the backend value (from registration form).
                    // Never fall back to Google display name.
                    fullName: userData.fullName || null,
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

    const resendVerification = async (email) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });
        if (error) throw error;
    };

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signInWithGoogle = async () => {
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
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
        resendVerification,
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
