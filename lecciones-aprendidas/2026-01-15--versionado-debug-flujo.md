# Versionado inicial + Debug flow (confusión de orden + curl en PowerShell)

## Contexto
- Fecha: 2026-01-15
- Repo: `https://github.com/chris78rey/api_sign.git`
- Stack: Node/TS + Express + Prisma + Postgres + Docker Compose
- Objetivo: versionar proyecto y probar flujo end-to-end desde `/debug`

## Síntomas
- Al ejecutar comandos tipo `curl -H ... -F ...` en PowerShell se recibía error:
  - `Invoke-WebRequest : No se puede enlazar el parámetro 'Headers'...`
- En `/debug`, el usuario intentó `Send Request` y recibió:
  - `400 NO_SIGNATORIES: Request has no signatories`
- Confusión de flujo: UI mostraba “Requests Flow” y “Add Signatory” como secciones separadas y el usuario interpretó que el orden era distinto.

## Causa raíz
1) PowerShell
- En Windows PowerShell, `curl` suele ser alias de `Invoke-WebRequest`.
- `Invoke-WebRequest` NO soporta la sintaxis de curl real (`-H`, `-F` como en Linux/macOS).

2) Orden del flujo
- En el dominio, un `Signatory` depende de un `requestId` (y de `externalRequestId` generado al crear la request).
- Por diseño: primero se crea la request (subir PDF) y luego se agregan firmantes.

## Solución
1) Ejecutar stack y usar UI debug
- Levantar servicios: `docker compose up --build`
- Usar consola debug: `http://localhost:3000/debug`
- Healthcheck: `curl http://localhost:3000/health`

2) Curl correcto en Windows
- Usar `curl.exe` (no `curl`) o usar `/debug`.

3) Mejoras en debug
- Se reordenó la UI de `/debug` por pasos claros y se agregaron bloqueos por prerequisitos.
- Se añadió visibilidad del conteo de firmantes:
  - Backend: `GET /api/requests/:id` ahora incluye `request.signatoriesCount`.
  - UI: muestra “Firmantes: N” y deshabilita `Send` si `N=0`.

## Prevención / guardrails
- Documentar explícitamente en UI el orden: Auth → Create Request → Add Signatories → Send → Download.
- En Windows: preferir `/debug` o comandos usando `curl.exe`.
- Mantener el botón `Send` deshabilitado hasta cumplir prerequisitos (requestId + signatoriesCount > 0).

## Notas
- Docker en Windows puede fallar si Docker Desktop no está corriendo o si faltan permisos; revisar el error de `docker_engine` pipe y ejecutar con privilegios adecuados.
- En git, NO versionar `.env`, `storage/`, `node_modules/` ni `dist/` (controlado por `.gitignore`).
