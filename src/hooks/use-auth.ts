import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { usersService } from "@/lib/supabase-service";
import type { User } from "@supabase/supabase-js";

// Database user (from public.users table)
export interface AppUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);

  // Load the current user
  const loadUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        setSupabaseUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setSupabaseUser(session.user);
      
      // Fetch the public user record
      const appUser = await usersService.getCurrentUser();
      
      if (appUser) {
        setUser({
          id: appUser.id,
          name: appUser.name || session.user.email?.split("@")[0] || null,
          email: appUser.email || session.user.email || null,
          role: appUser.role || "student",
          avatar_url: appUser.avatar_url || null,
          phone: appUser.phone || null,
        });
        setIsAuthenticated(true);
      } else {
        // User exists in auth but not in public.users yet
        // This happens right after signup before the trigger creates the record
        setUser({
          id: session.user.id,
          name: session.user.email?.split("@")[0] || null,
          email: session.user.email || null,
          role: "student",
          avatar_url: null,
          phone: null,
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error loading user:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          loadUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      },
    );

    return () => subscription?.unsubscribe();
  }, [loadUser]);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    await loadUser();
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSupabaseUser(null);
    setIsAuthenticated(false);
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    supabaseUser,
    signIn,
    verifyOtp,
    signOut,
    refreshUser: loadUser,
  };
}
