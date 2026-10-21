# ChuberLite

ChuberLite es una plataforma web para conectar clientes con proveedores de servicios locales (carpintería, fontanería, eventos, etc.). Permite descubrir profesionales cercanos, revisar su reputación y contactarlos de forma directa.

## Características
- Buscador y filtros por categoría y ubicación.
- Listados de proveedores con calificaciones, precio y disponibilidad.
- Marcar favoritos/likes y seguimiento de preferencias.
- Flujo de autenticación y registro de proveedores.
- Contacto mediante modal de chat y derivación a login cuando es necesario.
- UI responsive con modo claro/oscuro y componentes accesibles.

## Tecnologías principales
- Next.js 15 (App Router) con React 19 y TypeScript.
- Tailwind CSS, shadcn/ui y Radix UI para el sistema de componentes.
- **Supabase**: base de datos Postgres con permisos por fila (RLS), autenticación por correo, chat y notificaciones en tiempo real, y almacenamiento de fotos. No necesita servidor propio.
- Se publica en Vercel.

## Qué hace
- Directorio de proveedores con búsqueda, categorías, ciudad y "cerca de mí".
- Ficha pública por proveedor con reseñas, WhatsApp y chat.
- Favoritos, bandeja de mensajes y notificaciones en vivo.
- Proveedores: 30 días gratis; luego plan mensual pagado por Yape/Plin y aprobado por el admin.
- Panel `/admin`: métricas, aprobación de pagos y roles de usuarios.

## Puesta en marcha
```bash
npm install
# .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
npm run dev
```
El esquema completo de la base está en `supabase/schema.sql`.

Para nombrar al primer administrador, regístrate y luego en el SQL Editor de Supabase:
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_CORREO');
```

## Scripts disponibles
- `npm run dev`: entorno de desarrollo con Turbopack.
- `npm run build`: build de producción.
- `npm run start`: sirve el build generado.
- `npm run typecheck`: revisa los tipos.
