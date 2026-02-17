import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to restore metadata from session
    const restoreMetadata = (session) => {
        if (session?.user) {
            // Try to get from user_metadata first, fallback to localStorage
            const userRole = session.user.user_metadata?.role ||
                localStorage.getItem('userRole');
            const isProfileComplete = session.user.user_metadata?.profile_complete !== undefined
                ? session.user.user_metadata.profile_complete
                : localStorage.getItem('profileComplete') === 'true';

            setRole(userRole);
            setProfileComplete(isProfileComplete);

            // Sync to localStorage for persistence
            if (userRole) {
                localStorage.setItem('userRole', userRole);
            }
            localStorage.setItem('profileComplete', String(isProfileComplete));
        }
    };

    // Helper function to clear metadata
    const clearMetadata = () => {
        setRole(null);
        setProfileComplete(false);
        localStorage.removeItem('userRole');
        localStorage.removeItem('profileComplete');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Session restoration error:', error);
                setError(error.message);
            }

            setSession(session);
            setUser(session?.user ?? null);

            // Restore metadata
            restoreMetadata(session);

            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Restore/update metadata
                restoreMetadata(session);
            }

            if (event === 'SIGNED_OUT') {
                clearMetadata();
            }

            setLoading(false);
        });

        // Sync auth state across tabs
        const handleStorageChange = (e) => {
            // Detect when Supabase session changes in another tab
            if (e.key && e.key.startsWith('sb-') && e.key.includes('-auth-token')) {
                // Session changed in another tab - refresh
                supabase.auth.getSession().then(({ data: { session } }) => {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session) {
                        restoreMetadata(session);
                    } else {
                        // Logged out in another tab
                        clearMetadata();
                    }
                });
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Logout function
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            clearMetadata();
            return { error: null };
        } catch (error) {
            console.error('Logout error:', error);
            return { error };
        }
    };

    // Update user metadata
    const updateUserMetadata = async (metadata) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: metadata
            });

            if (error) throw error;

            if (data.user) {
                // Update local state
                if (metadata.role) {
                    setRole(metadata.role);
                    localStorage.setItem('userRole', metadata.role);
                }
                if (metadata.profile_complete !== undefined) {
                    setProfileComplete(metadata.profile_complete);
                    localStorage.setItem('profileComplete', String(metadata.profile_complete));
                }
            }

            return { data, error: null };
        } catch (error) {
            console.error('Update metadata error:', error);
            return { data: null, error };
        }
    };

    const value = {
        user,
        session,
        loading,
        isAuthenticated: !!session,
        role,
        profileComplete,
        error,
        logout,
        updateUserMetadata,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
