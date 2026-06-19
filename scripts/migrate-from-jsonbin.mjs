// ════════════════════════════════════════════════════════════
// MIGRACIÓN: JSONBin → Supabase
// ════════════════════════════════════════════════════════════
// Este script se ejecuta UNA SOLA VEZ desde tu computadora (no
// desde el navegador) para mover los productos y reseñas que ya
// tenías guardados en JSONBin hacia las nuevas tablas de Supabase.
//
// CÓMO USARLO:
//   1. Completa en tu archivo .env (en la raíz del proyecto) estas
//      tres variables — NUNCA con el prefijo VITE_, para que no
//      terminen empaquetadas en el frontend:
//
//        JSONBIN_API_KEY=tu-api-key-de-jsonbin
//        JSONBIN_BIN_ID=tu-bin-id
//        SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
//
//      La "service role key" la encuentras en Supabase →
//      Project Settings → API → "service_role" (es secreta,
//      tiene permisos de administrador total y se usa SOLO aquí,
//      nunca en el frontend).
//
//   2. Crea primero tu usuario admin en Supabase Auth (ver
//      README.md, sección "Crear el usuario administrador") y
//      copia su UUID.
//
//   3. Ejecuta:
//        node scripts/migrate-from-jsonbin.mjs TU_USER_UUID_AQUI
//
//   4. Revisa en el dashboard de Supabase (Table editor) que los
//      productos y reseñas llegaron correctamente.
// ════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_ID = process.argv[2];

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
  fail("Faltan JSONBIN_API_KEY o JSONBIN_BIN_ID en tu .env.");
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  fail("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en tu .env.");
}
if (!OWNER_ID) {
  fail(
    "Debes pasar el UUID del usuario admin como argumento.\n   Uso: node scripts/migrate-from-jsonbin.mjs TU_USER_UUID"
  );
}

// Cliente con la service_role key: este SÍ puede ignorar RLS,
// porque corre en tu máquina, una sola vez, fuera del navegador.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchFromJsonBin() {
  console.log("→ Descargando datos desde JSONBin…");
  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
    headers: { "X-Master-Key": JSONBIN_API_KEY },
  });
  if (!res.ok) fail(`JSONBin respondió con error ${res.status}`);
  const json = await res.json();
  // Ajusta esta línea si la forma de tu bin es distinta
  // (por ejemplo, si en vez de json.record.products es solo json.record)
  return json.record?.products ?? json.record ?? [];
}

async function migrate() {
  const oldProducts = await fetchFromJsonBin();
  console.log(`→ ${oldProducts.length} productos encontrados en JSONBin.\n`);

  let okCount = 0;
  let failCount = 0;

  for (const old of oldProducts) {
    const media = Array.isArray(old.media)
      ? old.media
      : Array.isArray(old.images)
      ? old.images.map((url) => ({ url, type: "image/jpeg" }))
      : [];

    const { data: inserted, error } = await supabase
      .from("products")
      .insert({
        owner_id: OWNER_ID,
        name: old.name ?? old.nombre ?? "Producto sin nombre",
        price: old.price ? Number(old.price) : null,
        description: old.description ?? old.descripcion ?? "",
        contact: old.contact ?? "",
        contact_type: old.contactType === "phone" ? "phone" : "email",
        media,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Error migrando "${old.name}":`, error.message);
      failCount++;
      continue;
    }

    okCount++;
    console.log(`  ✓ Migrado: ${inserted.name} (id ${inserted.id})`);

    // Migrar reseñas asociadas, si existen
    const reviews = Array.isArray(old.reviews) ? old.reviews : [];
    for (const r of reviews) {
      const { error: reviewError } = await supabase.from("reviews").insert({
        product_id: inserted.id,
        author: r.author ?? r.autor ?? "Anónimo",
        rating: Number(r.rating) || 5,
        comment: r.comment ?? r.comentario ?? "",
      });
      if (reviewError) {
        console.error(`    ✗ Error migrando reseña de "${r.author}":`, reviewError.message);
      }
    }
  }

  console.log(`\n✅ Migración completa: ${okCount} productos migrados, ${failCount} con error.\n`);
}

migrate().catch((e) => fail(e.message));
