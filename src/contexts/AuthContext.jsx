import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

// ─── localStorage cache key for onboarding state ─────────────────────────────
// Keyed by Supabase user ID so different users on the same browser are isolated.
const CACHE_KEY_PREFIX = 'evoa_onboarding_';
function getCachedOnboarding(supabaseUid) {
    try {
        const raw = localStorage.getItem(CACHE_KEY_PREFIX + supabaseUid);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
function setCachedOnboarding(supabaseUid, { userRole, roleSelected, registrationCompleted }) {
    try {
        localStorage.setItem(
            CACHE_KEY_PREFIX + supabaseUid,
            JSON.stringify({ userRole, roleSelected, registrationCompleted })
        );
    } catch { /* non-fatal */ }
}
function clearCachedOnboarding(supabaseUid) {
    try {
        if (supabaseUid) localStorage.removeItem(CACHE_KEY_PREFIX + supabaseUid);
    } catch { /* non-fatal */ }
}

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
    const isSyncingRef = useRef(false);
    // Track current supabase UID so we can key the cache correctly.
    const currentSupabaseUidRef = useRef(null);

    // Backward compat: onboardingCompleted is true only when BOTH flags are true
    const onboardingCompleted = roleSelected && registrationCompleted;

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                localStorage.setItem('authToken', session.access_token);
                currentSupabaseUidRef.current = session.user.id;

                // Seed from localStorage cache IMMEDIATELY so navigation works on refresh
                // before the slow backend sync completes.
                const cached = getCachedOnboarding(session.user.id);
                if (cached) {
                    setUserRole(cached.userRole);
                    setRoleSelected(cached.roleSelected);
                    setRegistrationCompleted(cached.registrationCompleted);
                    // We can safely end the blocking loading state now —
                    // the user will be routed correctly from cache while sync runs in background.
                    setLoading(false);
                }

                // TOKEN_REFRESHED is a silent background key rotation — no need to re-sync.
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    if (isSyncingRef.current) return;
                    isSyncingRef.current = true;
                    setSyncing(true);
                    await syncAndFetchProfile(session);
                    setSyncing(false);
                    isSyncingRef.current = false;
                }
            } else {
                // User signed out — clear everything
                const uid = currentSupabaseUidRef.current;
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                currentSupabaseUidRef.current = null;
                setUserRole(null);
                setRoleSelected(false);
                setRegistrationCompleted(false);
                setSyncing(false);
                isSyncingRef.current = false;
                setLoading(false);
                // We intentionally do NOT clear the cache on sign-out here;
                // clearCachedOnboarding is called explicitly in signOut() below.
                // This prevents accidental cache wipe on TOKEN_REFRESHED events.
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

                // Determine roleSelected and registrationCompleted from backend response.
                // Fix: use !!role for ANY user who has a role (including viewer).
                // The old code used `role !== 'viewer'` which always set viewers to false.
                let roleSel = userData.roleSelected;
                let regComp = userData.registrationCompleted;

                // Backward-compat: if DB columns are null/undefined (old users before migration),
                // infer from the presence of a role. ANY user with a role has selected it.
                if (roleSel === undefined || roleSel === null) {
                    roleSel = !!role; // ← FIXED: was !!(role && role !== 'viewer')
                }
                if (regComp === undefined || regComp === null) {
                    // Non-viewer users with a role are assumed to have completed registration
                    // (they predate the flag system). Viewers are immediately complete.
                    regComp = !!role; // ← FIXED: was !!(role && role !== 'viewer')
                }
                // NOTE: explicit false from the DB is always honoured — never override it.

                setRoleSelected(!!roleSel);
                setRegistrationCompleted(!!regComp);

                // Write authoritative values to the localStorage cache so future
                // refreshes and network failures never lose this state.
                if (session.user.id) {
                    setCachedOnboarding(session.user.id, {
                        userRole: role,
                        roleSelected: !!roleSel,
                        registrationCompleted: !!regComp,
                    });
                }

                setUser(prev => ({
                    ...prev,
                    ...userData,
                    email: session.user.email,
                    id: userData.id || session.user.id,
                    avatarUrl: userData.avatarUrl || null,
                    fullName: userData.fullName || null,
                }));
            }
        } catch (err) {
            if (err.message === 'sync_timeout') {
                console.warn('Backend sync timed out — using cached onboarding state if available');
                // On timeout, the localStorage cache (seeded above) already holds the last known
                // good state — so the user won't be redirected to choice-role.
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
        const uid = currentSupabaseUidRef.current;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        clearCachedOnboarding(uid);
        currentSupabaseUidRef.current = null;
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
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
                localStorage.setItem('authToken', sessionData.session.access_token);
            }
        } catch (_) { /* non-blocking */ }

        const response = await apiClient.post('/users/role', { role });
        if (response?.data) {
            const userData = response.data?.data || response.data;
            const newRole = userData.role || role;
            const isViewer = newRole === 'viewer';
            setUserRole(newRole);
            setRoleSelected(true);
            if (isViewer) {
                setRegistrationCompleted(true);
            }
            setUser(prev => ({ ...prev, role: newRole, roleSelected: true }));

            // Update cache so refresh works immediately after role selection
            const uid = currentSupabaseUidRef.current;
            if (uid) {
                setCachedOnboarding(uid, {
                    userRole: newRole,
                    roleSelected: true,
                    registrationCompleted: isViewer,
                });
            }
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

        // Update cache so refresh after completing registration goes to dashboard
        const uid = currentSupabaseUidRef.current;
        if (uid) {
            setCachedOnboarding(uid, {
                userRole,
                roleSelected: true,
                registrationCompleted: true,
            });
        }
    };

    const value = {
        user,
        session,
        userRole,
        loading,
        syncing,
        roleSelected,
        registrationCompleted,
        onboardingCompleted,
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
