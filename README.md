# firmas

Backend multi-tenant para flujo de firma (OmniSwitch/Fírmalo), ejecutado 100% con Docker Compose.

## Requisitos
- Docker Desktop / Docker Engine + Docker Compose

## Setup
1. Copiar variables de entorno:
   - `cp .env.example .env` (o crear `.env` manualmente)

2. Levantar servicios:
   - `docker compose up --build -d`

3. Ver logs:
   - `docker compose logs -f api`

4. Health:
   - `curl http://localhost:3000/health`

## Prisma (siempre dentro del contenedor)
- Generar client:
  - `docker compose exec api npx prisma generate`

- Migrar (dev):
  - `docker compose exec api npx prisma migrate dev --name init`

## Scripts
- Healthcheck (dentro del contenedor):
  - `docker compose exec api npm run check-health`
