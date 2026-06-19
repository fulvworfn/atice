# Mi Proyecto — Catálogo de productos artesanales

Refactorización completa del sitio original (un único `index.html` con
React vía Babel Standalone + JSONBin) a una aplicación moderna en
**Vite + React 18 + TypeScript + Supabase**.

## Qué cambió y por qué

| Antes | Ahora | Por qué |
|---|---|---|
| API key de JSONBin y contraseña `"geo2024"` hardcodeadas en el HTML | Autenticación real con Supabase Auth (email + contraseña) | Cualquiera que abriera "ver código fuente" podía borrar todo el catálogo. Ahora la contraseña vive hasheada en la base de datos y nunca se expone. |
| Cualquiera con la API key podía editar/borrar productos vía la API de JSONBin | Row Level Security (RLS) en PostgreSQL: solo el `owner_id` autenticado puede escribir | La seguridad se aplica en el servidor de base de datos, no se puede saltar manipulando el cliente. |
| Todo en un solo HTML de +1900 líneas | Proyecto Vite con componentes, hooks y módulos separados | Mantenible, testeable, permite trabajo en equipo. |
| React + Babel Standalone cargados por CDN en cada visita | React compilado y *tree-shaken* por Vite | Carga más rápida, sin warnings de "development build" en producción. |
| `URL.createObjectURL` nunca se revocaba (memory leak) | Se revocan apenas la imagen final de Cloudinary está lista o el usuario la quita | Evita que el navegador acumule memoria en sesiones largas subiendo fotos. |
| Canvas de estrellas siempre animando, incluso en pestaña oculta | Se pausa con `visibilitychange`, respeta `prefers-reduced-motion`, limita el DPR | Menos uso de batería/CPU. |

---

## 1. Requisitos previos

- Node.js 18 o superior
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- Una cuenta gratuita en [cloudinary.com](https://cloudinary.com) (ya la tenías)

## 2. Crear el proyecto de Supabase

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Elige un nombre, una contraseña para la base de datos (guárdala) y una región cercana a tus usuarios.
3. Espera ~2 minutos a que se cree el proyecto.
4. Ve a **SQL Editor** → **New query**, pega el contenido completo de
   [`supabase/schema.sql`](./supabase/schema.sql) y presiona **Run**.
   Esto crea las tablas `products` y `reviews`, los índices, y todas las
   políticas de Row Level Security.
5. (Opcional, solo si migras imágenes a Supabase Storage en el futuro)
   Repite el paso anterior con [`supabase/storage-policies.sql`](./supabase/storage-policies.sql).

### Crear el usuario administrador

1. Ve a **Authentication → Users → Add user → Create new user**.
2. Ingresa tu email y una contraseña fuerte (puedes marcar "Auto Confirm User" para no tener que verificar el email).
3. Copia el **UUID** del usuario que se generó — lo necesitarás para la migración de datos.

### Obtener las claves del proyecto

Ve a **Project Settings → API** y copia:
- **Project URL** → será tu `VITE_SUPABASE_URL`
- **anon public key** → será tu `VITE_SUPABASE_ANON_KEY`

Estas dos NO son secretas: están pensadas para usarse en el navegador.
La seguridad real la dan las políticas RLS que ya ejecutaste.

## 3. Configurar Cloudinary

1. En tu dashboard de Cloudinary, ve a **Settings → Upload → Upload presets → Add upload preset**.
2. Ponle un nombre, modo **Unsigned**, y opcionalmente restringe:
   - Carpeta de destino (`folder`)
   - Tamaño máximo de archivo
   - Formatos permitidos (jpg, png, webp, mp4...)
3. Copia el **Cloud name** (visible en el dashboard principal) y el **nombre del preset**.

## 4. Instalar el proyecto

```bash
npm install
cp .env.example .env
```

Edita `.env` y completa:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset
```

```bash
npm run dev
```

Abre `http://localhost:5173`. El sitio debería verse igual que el original,
pero ahora con login real: haz clic en el candado del navbar e ingresa el
email/contraseña que creaste en el paso 2.

## 5. Migrar tus productos desde JSONBin (opcional, una sola vez)

Si ya tenías productos guardados en JSONBin y quieres traerlos:

1. Agrega temporalmente a tu `.env` (sin el prefijo `VITE_`, para que nunca
   se incluyan en el build del frontend):

   ```env
   JSONBIN_API_KEY=tu-api-key-de-jsonbin
   JSONBIN_BIN_ID=tu-bin-id
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key   # Project Settings → API → service_role
   ```

2. Ejecuta, usando el UUID del usuario admin que copiaste antes:

   ```bash
   node scripts/migrate-from-jsonbin.mjs TU_USER_UUID_AQUI
   ```

3. Verifica en Supabase → **Table editor → products** que todo llegó bien.
4. Borra esas tres variables de tu `.env` — ya no se necesitan, y la
   `service_role` key es muy sensible (tiene acceso total, sin RLS).

## 6. Compilar para producción

```bash
npm run build
npm run preview   # para probar el build localmente
```

La carpeta `dist/` queda lista para subir a Vercel, Netlify, Cloudflare
Pages o cualquier hosting de archivos estáticos. Recuerda configurar las
mismas variables de entorno (`VITE_SUPABASE_URL`, etc.) en el panel de tu
proveedor de hosting.

## Estructura del proyecto

```
src/
├── components/      Componentes de UI reutilizables
├── pages/            Productos, SobreMi, Contacto
├── hooks/             useAuth, useProducts
├── lib/               supabaseClient, auth, products, uploadMedia, utils, starField
├── types/             Tipos de dominio + tipos generados del esquema de Supabase
├── App.tsx
├── main.tsx
└── index.css
supabase/
├── schema.sql              Tablas + RLS (ejecutar primero)
└── storage-policies.sql    Solo si migras imágenes a Supabase Storage
scripts/
└── migrate-from-jsonbin.mjs
```

## Notas de seguridad importantes

- **Nunca** pongas la `service_role key` de Supabase en una variable que
  empiece con `VITE_` — Vite empaqueta esas variables directamente en el
  JavaScript que se descarga al navegador.
- El archivo `.env` está en `.gitignore`. No lo subas a tu repositorio.
- Las reseñas son públicas para escribir (igual que el sitio original no
  pedía login para comentar), pero solo el admin autenticado puede
  borrarlas — esto está garantizado por la política RLS en
  `supabase/schema.sql`, no por el frontend.
- Si en algún momento sospechas que tu contraseña de admin fue
  comprometida, cámbiala desde **Authentication → Users** en el dashboard
  de Supabase; no requiere ningún cambio de código.

## Próximos pasos sugeridos (Fase 4 / PWA)

- Agregar un `manifest.json` y *service worker* (por ejemplo con
  `vite-plugin-pwa`) para convertir el sitio en PWA instalable.
- Añadir `react-helmet-async` o metatags dinámicos por producto para
  mejorar el SEO al compartir enlaces directos.
- Considerar paginación o *infinite scroll* en `Productos.tsx` si el
  catálogo crece mucho.
