import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabase';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Gagal memuat profil user:', error.message);
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    async function initSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        console.error('Gagal mengambil session:', error.message);
        setLoading(false);
        return;
      }

      const currentSession = data.session ?? null;
      setSession(currentSession);

      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id);
      }

      if (active) setLoading(false);
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);

      if (nextSession?.user?.id) {
        fetchProfile(nextSession.user.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (name, email, password) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });

  const signOut = () => supabase.auth.signOut();

  const user = session?.user ?? null;
  const role = profile?.role ?? 'user';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isAdmin: role === 'admin',
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile: () => fetchProfile(user?.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

