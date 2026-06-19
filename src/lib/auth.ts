import { supabase } from "./supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Capa de autenticación real con Supabase Auth.
 *
 * Reemplaza al viejo esquema de:
 *   const ADMIN_PASSWORD = "geo2024";
 *   if (pw === ADMIN_PASSWORD) onLogin();
 *
 * que comparaba una contraseña hardcodeada visible en el código
 * fuente del navegador. Ahora:
 *  - La contraseña real del admin vive únicamente en la base de
 *    datos de Supabase Auth, con hash seguro (bcrypt), nunca en
 *    el frontend.
 *  - El login se valida en el servidor de Supabase.
 *  - La sesión (JWT) es lo único que se guarda en el navegador, y
 *    expira/se refresca automáticamente.
 *  - Las políticas RLS verifican auth.uid() en cada operación, así
 *    que ni siquiera con la consola abierta se puede "fingir" ser
 *    admin sin loguearse de verdad.
 */

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(traducirErrorAuth(error.message));
  if (!data.user) throw new Error("No se pudo iniciar sesión.");
  return data.user;
}

/**
 * Magic link: alternativa sin contraseña. Envía un correo con un
 * enlace de un solo uso. Útil si en el futuro prefieres no manejar
 * contraseñas en absoluto.
 */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(traducirErrorAuth(error.message));
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

function traducirErrorAuth(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
  if (message.includes("Email not confirmed")) return "Debes confirmar tu email antes de entrar.";
  return message;
}
