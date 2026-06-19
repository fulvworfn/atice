import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSession, onAuthStateChange, signInWithPassword, signOut } from "../lib/auth";

interface UseAuthResult {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook que expone el estado de autenticación actual.
 * `isAdmin` es simplemente "hay un usuario logueado" — en este
 * proyecto solo existe un rol (el dueño de la tienda), así que
 * cualquier login válido es el admin. Si en el futuro quisieras
 * múltiples roles, este es el lugar para chequear una tabla
 * `profiles` con un campo `role`.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((session) => {
        if (mounted) setUser(session?.user ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = onAuthStateChange((session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedUser = await signInWithPassword(email, password);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return { user, isAdmin: Boolean(user), loading, login, logout };
}
