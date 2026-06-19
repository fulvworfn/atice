import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env (copia .env.example y complétalo)."
  );
}

/**
 * Cliente único de Supabase para toda la app.
 *
 * Nota de seguridad: la "anon key" que usamos aquí NO es un secreto
 * equivalente a la antigua X-Master-Key de JSONBin. Está diseñada
 * para vivir en el frontend; la protección real de los datos la dan
 * las políticas de Row Level Security definidas en
 * supabase/schema.sql, que se evalúan en el servidor de Postgres
 * para cada request sin importar qué tan manipulado esté el cliente.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
