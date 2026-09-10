# FYSIKO

Aplicación web de gestión (agenda, pacientes, doctores, consultorios, reportes,
usuarios y notificaciones), clonada de la base de Dental Family ERP.

## Stack

- React 18 + Vite + TypeScript
- React Router, Zustand
- Supabase (Postgres + Auth + Realtime)

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`.

## Backend

Este proyecto reutiliza el backend multi-tenant existente (Supabase). FYSIKO
opera como un tenant propio, aislado por `tenant_id` mediante RLS — los datos
no se mezclan con los de otros negocios que usan la misma base.

## Usuario admin de prueba

- Usuario: `admin`
- Rol: Administrador
- Contraseña: ver credenciales entregadas por separado.
