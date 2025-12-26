# tienda-api

API multi-tenant (Organizaciones) para tu app **tienda-app**, pensada para soportar múltiples clientes/usuarios y planes **free/pro**.

## Requisitos

- Node.js 16+ (recomendado 18+)

## Arranque recomendado (PostgreSQL)

Usa tu PostgreSQL local y crea las tablas dentro de un **schema** dedicado (`tienda_api`) para no chocar con tablas existentes de otras apps.

1. Copia variables:
   - Copia `.env.example` a `.env`.
   - Verifica estos valores (según tu caso):
     - `DB_DIALECT=postgres`
     - `DB_HOST=127.0.0.1`
     - `DB_PORT=5432`
     - `DB_NAME=tienda-app`
     - `DB_USER=postgres`
     - `DB_PASSWORD=123456`
     - `DB_SCHEMA=tienda_api`
2. Instala y ejecuta:
   - `npm install`
   - `npm run dev`
3. Prueba:
   - `GET http://localhost:3002/health`

## Arranque rápido (SQLite - opcional)

1. Copia variables:
   - Copia `.env.example` a `.env` y deja `DB_DIALECT=sqlite`.
2. Instala y ejecuta:
   - `npm install`
   - `npm run dev`
3. Prueba:
   - `GET http://localhost:3002/health`

## Auth (demo)

- `POST /api/auth/register` crea una organización (plan `free`) y un usuario `owner`.
- `POST /api/auth/login` retorna `token`.

## Productos (multi-tenant)

Los productos quedan asociados a `organizationId`. El token incluye `orgId` y todas las consultas se filtran por esa organización.

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id` (soft delete)

## Nota sobre tablas existentes

Si ya tienes tablas en `public` (por ejemplo por otros proyectos), este API usa `DB_SCHEMA=tienda_api` para **aislar** sus tablas.

> Nota: en `development` el server hace `sequelize.sync({ alter: true })` dentro del schema configurado.
