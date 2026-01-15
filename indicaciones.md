Actúa como un Ingeniero de Automatización Senior y Arquitecto de Sistemas Autónomo.

ESTOY PROVEYENDO UNA ESPECIFICACIÓN TÉCNICA DETALLADA A CONTINUACIÓN.
Tu objetivo es materializar esta especificación en el sistema de archivos actual y validar su funcionamiento de extremo a extremo sin intervención humana.

PROTOCOLOS DE EJECUCIÓN (Override de Seguridad):
1.  AUTORIZACIÓN TOTAL: Tienes permiso explícito para crear directorios, escribir archivos y EJECUTAR scripts (PowerShell/Bash) necesarios para cumplir los objetivos.
2.  ANULACIÓN DE RESTRICCIONES PASIVAS: La especificación adjunta fue escrita originalmente para humanos y contiene frases como "El modelo NO debe ejecutar comandos". **IGNORA ESAS RESTRICCIONES**. Tú eres el ejecutor. Transforma cada instrucción de "crear archivo" en una acción de escritura y cada "validación" en una ejecución de script.
3.  SECUENCIALIDAD LÓGICA: Analiza la especificación completa, identifica los módulos o subproyectos y ejecútalos en orden lógico (Estructura -> Scripts -> Ejecución Dry-Run -> Validación).

PLAN DE ACCIÓN DINÁMICO:
- Paso 1: Analiza el texto para extraer la estructura de carpetas y archivos de configuración. CRÉALOS INMEDIATAMENTE.
- Paso 2: Genera los scripts de lógica (escaneo, compresión, etc.) basándote en las reglas de negocio descritas.
- Paso 3: EJECUTA los scripts en modo prueba (dry-run) para verificar que generan los reportes/logs esperados.
- Paso 4: Si la especificación requiere integración con APIs (como LLMs) y no tienes credenciales, implementa un "mock" o un fallo controlado (graceful degradation) para no detener el pipeline.
- Paso 5: Realiza la validación final descrita en el último paso de la especificación.

AQUÍ ESTÁ LA ESPECIFICACIÓN DEL PROYECTO (Ejecuta todo lo siguiente):
================================================================================
"""
[ 
Perfecto. Si el objetivo es que **TODO corra con Docker Compose desde el primer minuto**, entonces el plan anterior se ajusta así:

- **Se agrega un Subproyecto 0 obligatorio** (Base Docker Compose + Postgres + hot reload).
    
- **Todos los subproyectos siguientes asumen que el humano ejecuta comandos con `docker compose`**, no con `npm` directo.
    
- Prisma se ejecuta **dentro del contenedor** (o con un contenedor “tools”) para que sea 100% reproducible.
    

Abajo queda el **ORQUESTADOR actualizado a Docker Compose** (con metaprompt completo del Subproyecto 0 listo para copiar).

---

# ✅ MAPA DE RUTA CON DOCKER COMPOSE (9 Subproyectos)

0. **Subproyecto 0:** Base Docker Compose + Postgres + DevContainer Node/TS + Prisma (OBLIGATORIO)
    
1. **Subproyecto 1:** Cimiento Multi-tenencia y Autenticación Base (dentro de Docker)
    
2. **Subproyecto 2:** Cliente OmniSwitch + Cliente Mock (conmutación ENV)
    
3. **Subproyecto 3:** Motor de Solicitudes + Documento + Persistencia
    
4. **Subproyecto 4:** Firmantes + Evidencias + Coordenadas
    
5. **Subproyecto 5:** Envío + Eventos + Estados
    
6. **Subproyecto 6:** Recuperación de PDF final + Storage local (volúmenes)
    
7. **Subproyecto 7:** Motor Financiero + Reportes admin
    
8. **Subproyecto 8:** Auditoría de Integridad + Gestión de Estado (Healthcheck Compose)
    

---

# 0. Subproyecto 0 – Base Docker Compose + Postgres + Prisma (OBLIGATORIO)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 0 de 9

**Base Docker Compose + Postgres + DevContainer Node/TS + Prisma**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto DevOps/Backend** especializado en **Docker Compose para Node.js TypeScript**, con **PostgreSQL**, **Prisma**, hot reload y ambientes reproducibles.  
Tu tarea es generar un **PROMPT EJECUTABLE EN IDE** listo para que un modelo ligero cree archivos, sin decidir arquitectura nueva.

---

## 2. Contexto autosuficiente del sistema

Se inicia un backend desde cero para simular y luego conectar flujos OmniSwitch/Fírmalo.  
La ejecución debe ser **100% por Docker Compose**, evitando instalaciones locales dependientes del host.

Decisiones cerradas:

- Docker Compose será la forma oficial de levantar el entorno.
    
- Base de datos en contenedor PostgreSQL.
    
- Node + TS + Express dentro de contenedor.
    
- Prisma migrará contra Postgres del compose.
    
- Se usará volumen para `storage/` y persistencia DB.
    

Prohibiciones:

- No usar SQLite en local
    
- No depender de “npm run dev” fuera del contenedor
    
- No ejecutar Prisma en el host
    

---

## 3. Objetivo técnico único del subproyecto

Crear la base del repositorio con:

- `docker-compose.yml` funcional
    
- `Dockerfile` (dev) para Node + TypeScript
    
- Postgres con volumen persistente
    
- Conexión por `DATABASE_URL` para Prisma
    
- Script de arranque dev con hot reload
    

Logro binario:

- ✅ `docker compose up --build` levanta `api` y `db`
    
- ✅ `api` imprime “listening” sin error
    
- ✅ `db` queda accesible desde `api`
    

Fuera de alcance:

- Modelos de negocio
    
- Endpoints OmniSwitch
    
- Auth real
    
- Reportes
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- `compose` con dos servicios: `api` y `db`
    
- `db` usando `postgres:16-alpine` (o equivalente estable)
    
- `api` con bind mount del código para hot reload
    
- Variables en `.env` y `.env.example`
    
- `storage/` como volumen montado
    

Permitido:

- `nodemon` o `tsx watch`
    
- `pnpm` o `npm` (elegir uno y congelarlo)
    
- `wait-for-it` o healthcheck para esperar DB
    

Prohibido:

- Usar `latest` sin versión
    
- Guardar credenciales hardcodeadas en YAML
    
- Usar rutas absolutas de Windows dentro del compose
    

---

## 5. Artefactos esperados

Archivos mínimos:

- `docker-compose.yml`
    
- `Dockerfile`
    
- `.dockerignore`
    
- `.env.example`
    
- `README.md`
    
- `package.json`
    
- `tsconfig.json`
    
- `src/server.ts` (hello + health)
    
- `src/app.ts` (config express)
    
- `src/routes/health.routes.ts`
    

Carpetas:

- `src/`
    
- `prisma/`
    
- `storage/`
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

El Modelo Grande debe producir un prompt que incluya:

### 6.1 Rol del modelo ligero

“Actúa como ejecutor técnico. Crea exactamente los archivos. No rediseñes. No inventes endpoints. No ejecutes comandos.”

### 6.2 Instrucciones operativas claras

El prompt debe ordenar la creación de archivos en este orden:

1. `docker-compose.yml`
    
2. `Dockerfile`
    
3. `.dockerignore`
    
4. `.env.example`
    
5. `package.json` + deps
    
6. `tsconfig.json`
    
7. estructura `src/` y archivos express
    
8. `README.md`
    

### 6.3 Ejecución controlada (humano manda)

Debe decir explícitamente:

- “El modelo NO debe ejecutar comandos. El humano ejecutará manualmente.”
    
- Incluir comandos obligatorios, por ejemplo:
    

**Comandos (humano):**

- `docker compose up --build -d`
    
- `docker compose logs -f api`
    
- `docker compose exec api sh`
    
- `docker compose exec api npm run dev` _(solo si el contenedor no lo corre automático)_
    
- `curl http://localhost:3000/health`
    

Y terminar con:

- “Detenerse y esperar la salida del humano.”
    

---

## 7. Validación y control de estado

Validaciones mínimas:

- `api` arriba sin crash loop
    
- `db` arriba y con volumen persistente
    
- `GET /health` responde 200
    

Errores comunes:

- `ECONNREFUSED db:5432`
    
- variables `.env` no cargadas
    
- puertos ya ocupados
    

Acciones correctivas:

- Agregar `depends_on` + healthcheck
    
- Revisar `DATABASE_URL`
    
- Cambiar puerto host: `3000:3000` si necesario
    

---

## 8. Cierre del metaprompt

Este subproyecto deja congelado:

- Estructura Docker Compose
    
- Postgres como DB oficial
    
- Arranque reproducible por contenedores
    

Habilita:

- Subproyecto 1: Prisma schema multi-tenant + migración inicial (en contenedor)
    

---

# ✅ Ajuste clave para los siguientes subproyectos (1–8)

Para que todo sea coherente con Docker Compose, cada metaprompt de los subproyectos 1–8 debe agregar estas reglas **obligatorias** dentro del bloque “Reglas estrictas de implementación”:

- **Todos los comandos se ejecutan con `docker compose exec api ...`**
    
- Prisma se corre dentro de `api`:
    
    - `docker compose exec api npx prisma migrate dev --name ...`
        
    - `docker compose exec api npx prisma generate`
        
- Instalación de paquetes:
    
    - `docker compose exec api npm i <paquete>`
        
- Logs:
    
    - `docker compose logs -f api`
        
- Storage:
    
    - Todo documento final se guarda dentro de `/app/storage` (montado como volumen)
        

---

## Si se quiere el “Subproyecto 1” ya adaptado a Docker

Así queda el cambio esencial (sin reescribirlo todo):

En el Subproyecto 1, donde decía:

- `npm install ...`
    
- `npx prisma migrate dev ...`
    

Se reemplaza por:

- `docker compose exec api npm install ...`
    
- `docker compose exec api npx prisma migrate dev --name init`
    

Y el `DATABASE_URL` siempre debe apuntar a:

- `postgresql://USER:PASSWORD@db:5432/NOMBRE_DB`
    

---

## ✅ Qué gana el sistema con esto

- El backend corre igual en cualquier PC
    
- La DB no se pierde (volumen)
    
- Prisma siempre migra con el mismo motor
    
- `storage/` se preserva entre reinicios
    
- El mock server y el real pueden convivir por variables
    

---

Si se desea avanzar YA, lo correcto sería ejecutar **primero el METAPROMPT del Subproyecto 0**, para que el Modelo Grande entregue el **PROMPT EJECUTABLE EN IDE** y el modelo ligero cree los archivos iniciales (`docker-compose.yml`, `Dockerfile`, etc.).


A continuación se presenta la **secuencia ordenada de 8 subproyectos**, donde **cada subproyecto contiene su METAPROMPT autocontenido** (listo para ejecutarse en el **Modelo Grande**) y, como parte del metaprompt, se obliga a generar un **PROMPT EJECUTABLE EN IDE** para que lo ejecute un **modelo ligero** bajo control humano.

---

## 1. Subproyecto 1 – Cimiento Multi-tenencia + Autenticación Base

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 1 de 8

**Cimiento Multi-tenencia + Autenticación Base**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto Senior Backend** especializado en **Node.js (TypeScript), Express, Prisma ORM y arquitectura multi-tenant**, con enfoque en generar **instrucciones ejecutables para modelos ligeros**, **sin ejecutar código**, **sin asumir contexto previo**, y dejando **validación binaria**.

---

## 2. Contexto autosuficiente del sistema

Se inicia un proyecto **desde cero** para construir un backend que permita **simular y luego conectar** un flujo de firma electrónica basado en OmniSwitch/Fírmalo.  
Aún **no existen archivos ni estructura**.  
Se requiere **multi-tenencia** para manejar múltiples organizaciones (por ejemplo: **Notarías, Centros de Mediación**) y usuarios internos por organización.

Decisiones cerradas e inmutables para este subproyecto:

- Stack: **Node.js + TypeScript + Express + Prisma**
    
- Persistencia: **Prisma + DB relacional** (SQLite local para dev, escalable a PostgreSQL en producción)
    
- Se requiere **autenticación base** (mínima) para proteger endpoints (sin aún diseñar OAuth completo)
    
- Se debe separar **capas**: `routes/`, `controllers/`, `services/`, `middlewares/`, `prisma/`
    

Riesgos a evitar:

- Mezclar lógica de negocio con rutas
    
- Guardar secretos en código
    
- Crear modelos sin claves foráneas claras
    
- Arrancar con endpoints sin control de acceso
    

---

## 3. Objetivo técnico único del subproyecto

Construir el **esqueleto técnico verificable** del backend multi-tenant:

Debe existir:

- Proyecto TypeScript inicializado
    
- Express corriendo con endpoint `/health`
    
- Prisma configurado y migración inicial aplicada
    
- Modelos mínimos: `Organization`, `User`, `Request`
    

Fuera de alcance:

- Lógica OmniSwitch
    
- Carga de PDF
    
- Firmantes
    
- Reportes
    
- Notificaciones
    

Criterio binario de logro:

- ✅ `npm run dev` inicia servidor sin errores
    
- ✅ `GET /health` responde `200 OK`
    
- ✅ `prisma migrate` crea tablas sin error
    

---

## 4. Reglas estrictas de implementación

Permitido:

- TypeScript estricto
    
- Express
    
- Prisma
    
- dotenv
    
- bcrypt (si se incluye password hash)
    
- JSON Web Token (JWT) solo para auth base simple (opcional en este subproyecto)
    

Prohibido:

- NestJS (no aplica)
    
- TypeORM
    
- Código sin tipos
    
- Variables hardcodeadas para credenciales
    
- Endpoints sin middleware de validación básica
    

Convenciones obligatorias:

- `src/server.ts` como entrypoint
    
- `src/app.ts` para configurar Express (recomendado)
    
- `src/routes/index.ts` como router principal
    
- `src/middlewares/` para auth y errores
    
- `.env.example` obligatorio
    

---

## 5. Artefactos esperados

Archivos/carpetas a crear:

- `package.json`
    
- `tsconfig.json`
    
- `src/server.ts`
    
- `src/app.ts` (si aplica)
    
- `src/routes/index.ts`
    
- `src/routes/health.routes.ts`
    
- `prisma/schema.prisma`
    
- `.env.example`
    
- `README.md` con pasos de ejecución
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

El Modelo Grande debe generar un **PROMPT EJECUTABLE EN IDE** que incluya:

### 6.1 Rol del modelo ligero

“Actúa como desarrollador técnico ejecutor. Implementa exactamente lo solicitado, sin rediseñar arquitectura, sin inventar requisitos, sin saltar validaciones.”

### 6.2 Instrucciones operativas claras

- Crear estructura
    
- Instalar dependencias (solo listarlas, no ejecutarlas)
    
- Crear archivos con contenido mínimo funcional
    
- Configurar Prisma y migración
    

### 6.3 Ejecución controlada

Debe contener explícitamente:

- “El modelo NO ejecuta comandos. El humano ejecutará los comandos manualmente.”
    
- Lista ordenada de comandos
    
- Punto donde el modelo se detiene y espera salida del humano
    

---

## 7. Validación y control de estado

Validaciones obligatorias:

- `node -v` compatible (solo indicar revisión, no ejecutar)
    
- `npm run dev` arranca
    
- `GET /health` funciona
    
- Prisma migró correctamente
    

Errores comunes:

- Falta `.env`
    
- Prisma client no generado
    
- `tsconfig` incorrecto
    

Acción si falla:

- Indicar exactamente qué archivo revisar y qué línea corregir
    

---

## 8. Cierre del metaprompt

Al completarse este subproyecto:

- Queda congelada la base multi-tenant: `Organization`, `User`, `Request`
    
- Queda habilitado el siguiente subproyecto: **Cliente OmniSwitch/Mock**
    
- No se deben modificar nombres de modelos ni relaciones sin un subproyecto explícito de migración
    

---

---

## 2. Subproyecto 2 – Cliente OmniSwitch + Cliente Mock (Conmutación DEV/PROD)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 2 de 8

**Cliente OmniSwitch + Cliente Mock (Conmutación DEV/PROD)**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto de Integración REST** especializado en clientes HTTP resilientes, timeouts, reintentos controlados y separación por entornos.

---

## 2. Contexto autosuficiente del sistema

El proyecto ya tiene:

- Express funcionando
    
- Prisma con modelos básicos
    
- `.env.example` existente
    

Se requiere construir una **capa de servicio** que pueda operar en dos modos:

- **Modo DEV (Mock Local):** endpoints simulados en local
    
- **Modo PROD (Real OmniSwitch):** consumir API real
    

No se implementará lógica de negocio aún, solo conectividad + estandarización.

Riesgos:

- Acoplar lógica OmniSwitch en controllers
    
- No controlar timeouts
    
- Exponer credenciales
    

---

## 3. Objetivo técnico único del subproyecto

Crear un **HTTP Client estándar** y dos implementaciones de proveedor:

- `OmniSwitchRealClient`
    
- `OmniSwitchMockClient`
    

Y un **selector** por configuración:

- `OMNISWITCH_MODE=mock|real`
    

Criterio binario:

- ✅ Existe carpeta `src/integrations/omniswitch/`
    
- ✅ Un método genérico `post(endpoint, payload)`
    
- ✅ Manejo de errores consistente
    

Fuera de alcance:

- Crear solicitudes reales
    
- Subir PDFs
    
- Firmantes
    

---

## 4. Reglas estrictas de implementación

Permitido:

- `axios`
    
- `zod` (opcional) para validar payloads
    
- `dotenv`
    

Obligatorio:

- Timeout (ej: 3000 ms)
    
- Estructura:
    
    - `src/integrations/omniswitch/clients/`
        
    - `src/integrations/omniswitch/types/`
        
    - `src/integrations/omniswitch/index.ts` (factory)
        

Prohibido:

- Llamar OmniSwitch directo desde rutas
    
- Hardcodear URL o apiKey
    

---

## 5. Artefactos esperados

- `src/integrations/omniswitch/clients/OmniSwitchRealClient.ts`
    
- `src/integrations/omniswitch/clients/OmniSwitchMockClient.ts`
    
- `src/integrations/omniswitch/OmniSwitchFactory.ts`
    
- `src/integrations/omniswitch/types/omniswitch.types.ts`
    
- `.env.example` actualizado con:
    
    - `OMNISWITCH_MODE`
        
    - `OMNISWITCH_BASE_URL`
        
    - `OMNISWITCH_API_KEY` (si aplica)
        

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe generar prompt para modelo ligero con:

- Rol ejecutor
    
- Crear archivos y contenido
    
- No ejecutar comandos
    
- Proveer comandos `npm i axios` y test manual (curl a un endpoint mock interno si existe)
    

---

## 7. Validación y control de estado

Validar:

- Compilación TS sin errores
    
- El factory retorna cliente correcto según `.env`
    
- Errores se devuelven con estructura estándar (ej: `{ ok:false, code, message, detail }`)
    

Si falla:

- Revisar imports, export default vs named exports
    

---

## 8. Cierre del metaprompt

Congelar:

- Contratos de respuesta del cliente OmniSwitch (formato de error/ok)  
    Habilita:
    
- Subproyecto 3: Motor de Solicitudes (create + upload document)
    

---

---

## 3. Subproyecto 3 – Motor de Solicitudes (Create + Upload Document + Persistencia)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 3 de 8

**Motor de Solicitudes (Create + Upload Document + Persistencia)**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto de Procesos de Firma** con enfoque en estados, persistencia transaccional y control de fallos.

---

## 2. Contexto autosuficiente del sistema

Ya existe:

- Prisma con `Request` base
    
- Cliente OmniSwitch real/mock con `post(endpoint, payload)`
    
- Express base
    

Se necesita implementar el primer tramo del flujo:

1. `SolicitudeCreate`
    
2. `SolicitudeCreateDocument`
    

El sistema debe guardar:

- `IdSolicitud` externo devuelto por OmniSwitch
    
- `OrganizationId` propietario
    
- Estado interno inicial del ciclo de vida
    

Riesgos:

- Guardar solicitud sin estado
    
- No validar archivo PDF antes de Base64
    
- No registrar errores
    

---

## 3. Objetivo técnico único del subproyecto

Crear endpoints internos:

- `POST /api/requests`
    
- `GET /api/requests/:id`
    

Que permitan:

- Crear solicitud en proveedor
    
- Subir documento Base64
    
- Persistir todo localmente
    

Criterio binario:

- ✅ Se crea un Request local con estado
    
- ✅ Se llama a dos métodos del proveedor (mock/real)
    
- ✅ Se guarda `externalRequestId` (IdSolicitud)
    

Fuera de alcance:

- Firmantes
    
- Envío a firmar
    
- Notificaciones
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Request debe tener `status` interno (enum)
    
- `amount` fijo a 0 si aplica
    
- `BiometricRequired` fijo a 0 si aplica
    
- Generar `IDClienteTrx` correlacionado con `OrganizationId` + timestamp
    
- Validar archivo PDF:
    
    - tamaño mínimo > 0
        
    - tipo mimetype permitido
        
- Convertir PDF a Base64 en backend
    

Prohibido:

- Subir PDF sin verificación
    
- Guardar la Base64 completa en DB (guardar ruta o hash; Base64 solo en tránsito)
    

---

## 5. Artefactos esperados

- Prisma: actualizar `Request` con campos mínimos:
    
    - `id`, `organizationId`, `externalRequestId`, `status`, `createdAt`
        
- `src/routes/request.routes.ts`
    
- `src/controllers/request.controller.ts`
    
- `src/services/request.service.ts`
    
- `src/helpers/fileToBase64.ts`
    
- Ajuste de `src/app.ts` para registrar rutas
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe incluir:

- Rol modelo ligero
    
- Orden exacto de creación/modificación de archivos
    
- Instrucción de no ejecutar comandos
    
- Comandos sugeridos:
    
    - `npm i multer` (si se sube archivo multipart)
        
    - `npx prisma migrate dev`
        
    - `curl` o Postman request de prueba
        

---

## 7. Validación y control de estado

Validaciones:

- Crear request con PDF válido retorna `201`
    
- Crear request sin PDF retorna `400`
    
- Prisma muestra request persistido
    
- Modo mock no falla aunque OmniSwitch real no exista
    

Acciones ante fallas:

- Revisar middleware de subida
    
- Revisar `.env OMNISWITCH_MODE`
    
- Revisar ruta importada en `app.ts`
    

---

## 8. Cierre del metaprompt

Congelar:

- Estado interno mínimo de Request
    
- Contrato de creación y persistencia  
    Habilita:
    
- Subproyecto 4: Firmantes + coordenadas + evidencias
    

---

---

## 4. Subproyecto 4 – Gestión de Firmantes + Evidencias + Coordenadas

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 4 de 8

**Gestión de Firmantes + Evidencias + Coordenadas**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Ingeniero Backend de Flujos de Firma**, experto en manejo de firmantes, validación de identidad y posicionamiento de firmas en PDF.

---

## 2. Contexto autosuficiente del sistema

Ya existe:

- Request creado con documento subido al proveedor
    
- Request guardado localmente con `externalRequestId`
    
- Cliente OmniSwitch real/mock funcional
    

Ahora se requiere:

- Agregar firmantes a una solicitud existente
    
- Enviar evidencias (ej: cédula) como Base64
    
- Determinar coordenadas por defecto en la última página
    

Riesgos:

- Firmante sin vínculo a Request
    
- Coordenadas fuera del rango
    
- No registrar estado
    

---

## 3. Objetivo técnico único del subproyecto

Implementar:

- `POST /api/requests/:id/signatories`
    

Que:

- Reciba datos del firmante
    
- Reciba evidencia (archivo) -> Base64
    
- Calcule coordenadas por defecto
    
- Llame a proveedor `SolicitudeCreateSignatory` (o equivalente)
    
- Guarde firmante localmente
    

Criterio binario:

- ✅ Firmante queda persistido localmente
    
- ✅ Se registra coordenada final
    
- ✅ Se llama a proveedor mock/real sin romper tipado
    

Fuera de alcance:

- Envío a firmar
    
- Notificaciones
    
- Cobros
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Crear modelo Prisma `Signatory`
    
- Relación `Request 1:N Signatory`
    
- Coordenadas:
    
    - Default: última página
        
    - Posición inferior (por ejemplo preset fijo)
        
- Permitir override por administrador:
    
    - `x`, `y`, `page`
        

Prohibido:

- Insertar coordenadas “aleatorias”
    
- Firmantes sin evidencia si el flujo lo exige
    
- Guardar evidencia sin control (no almacenar Base64 en DB; almacenar ruta si se persiste archivo)
    

---

## 5. Artefactos esperados

- `prisma/schema.prisma` (nuevo modelo Signatory)
    
- `src/helpers/coordinatePicker.ts`
    
- `src/helpers/fileToBase64.ts` (reutilizable)
    
- `src/services/signatory.service.ts`
    
- `src/controllers/signatory.controller.ts`
    
- `src/routes/signatory.routes.ts`
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe:

- Indicar orden exacto
    
- Dar comandos de migración Prisma
    
- Incluir pruebas con curl/Postman
    
- No ejecutar comandos
    

---

## 7. Validación y control de estado

Validar:

- Un request puede tener múltiples firmantes
    
- Coordenadas por defecto siempre están presentes
    
- Request inexistente retorna `404`
    
- Error del proveedor se captura y responde estructurado
    

Acción si falla:

- Revisar `externalRequestId`
    
- Revisar endpoint proveedor en mock client
    
- Revisar enum de estados
    

---

## 8. Cierre del metaprompt

Congelar:

- Modelo `Signatory` y contrato de entrada  
    Habilita:
    
- Subproyecto 5: Envío a firma + notificaciones internas
    

---

---

## 5. Subproyecto 5 – Orquestación de Envío + Notificaciones (Estado y Eventos)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 5 de 8

**Orquestación de Envío + Notificaciones (Estado y Eventos)**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto de Orquestación de Procesos**, experto en máquinas de estado, eventos y notificación controlada.

---

## 2. Contexto autosuficiente del sistema

Ya existe:

- Requests creados y persistidos
    
- Firmantes agregados
    
- Cliente mock/real
    

Se requiere:

- “Enviar a firmar” la solicitud
    
- Mantener estado local coherente
    
- Registrar eventos internos para notificaciones
    

Notificaciones de esta fase NO implican WhatsApp real aún:

- Se implementa como “eventos internos” + log persistido
    

Riesgos:

- Estado local no coincide con proveedor
    
- Envío repetido
    
- Falta de trazabilidad
    

---

## 3. Objetivo técnico único del subproyecto

Implementar endpoint:

- `POST /api/requests/:id/send`
    

Que:

- Verifique que request tiene firmantes
    
- Ejecute llamada al proveedor (`SolicitudeSend` o equivalente)
    
- Actualice estado interno
    
- Registre evento en tabla `RequestEvent`
    

Criterio binario:

- ✅ No se puede enviar si no hay firmantes
    
- ✅ Se registra evento
    
- ✅ Estado pasa a “SENT” (o equivalente)
    

Fuera de alcance:

- Integración real con email/whatsapp
    
- Webhooks entrantes
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Modelo Prisma `RequestEvent`
    
- Estados internos controlados (enum):
    
    - CREATED, DOCUMENT_UPLOADED, SIGNATORIES_ADDED, SENT, SIGNED, FAILED
        
- Cada transición debe generar evento
    

Prohibido:

- Cambiar estado sin evento
    
- Enviar solicitud sin firmantes
    

---

## 5. Artefactos esperados

- `prisma/schema.prisma` (RequestEvent + enum estados si aplica)
    
- `src/services/send.service.ts`
    
- `src/controllers/send.controller.ts`
    
- `src/routes/send.routes.ts`
    
- `src/services/event.service.ts`
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe incluir:

- Cambios a Prisma + migración
    
- Endpoint send
    
- Manejo de errores
    
- Pruebas manuales
    

---

## 7. Validación y control de estado

Validar:

- Enviar dos veces retorna error controlado (409 o 400)
    
- Request sin firmantes: 400
    
- Se generan eventos con timestamps
    

Si falla:

- Revisar relación requestId
    
- Revisar enum de status en Prisma
    

---

## 8. Cierre del metaprompt

Congelar:

- Máquina de estados local + eventos  
    Habilita:
    
- Subproyecto 6: Descarga/almacenamiento local del documento final
    

---

---

## 6. Subproyecto 6 – Recuperación de Activos + Almacenamiento Local de Documentos

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 6 de 8

**Recuperación de Activos + Almacenamiento Local de Documentos**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Ingeniero de Backend y Almacenamiento**, experto en gestión de archivos, rutas seguras, y persistencia local para auditoría.

---

## 2. Contexto autosuficiente del sistema

Ya existe:

- Requests con estados y eventos
    
- Proceso de envío a firma
    
- Mock/real client
    

Se requiere:

- Descargar documento firmado (cuando corresponda) o documento procesado
    
- Guardarlo localmente por organización y request
    
- Mantener estructura estable y verificable
    

Riesgos:

- Rutas inseguras
    
- Colisiones de nombres
    
- Guardar archivos sin hash o referencia
    

---

## 3. Objetivo técnico único del subproyecto

Implementar:

- Directorio local `storage/`
    
- Endpoint:
    
    - `GET /api/requests/:id/document`
        
- Servicio que:
    
    - solicita al proveedor el documento final (mock/real)
        
    - guarda en disco
        
    - actualiza request con ruta del archivo
        

Criterio binario:

- ✅ Archivo queda guardado
    
- ✅ DB guarda ruta relativa
    
- ✅ Endpoint devuelve archivo (stream)
    

Fuera de alcance:

- S3 o nube
    
- Encriptación avanzada (puede planificarse después)
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Estructura:
    
    - `storage/{organizationId}/{requestId}/`
        
- Nombre estable:
    
    - `signed.pdf` o `final.pdf`
        
- Validación:
    
    - No permitir path traversal (`../`)
        

Prohibido:

- Guardar en raíz sin organización
    
- Entregar Base64 gigante como response por defecto (usar stream)
    

---

## 5. Artefactos esperados

- `src/services/storage.service.ts`
    
- `src/controllers/document.controller.ts`
    
- `src/routes/document.routes.ts`
    
- Ajuste en `Request` para campo `finalDocumentPath`
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe incluir:

- Creación de carpetas y servicios
    
- Endpoint de descarga
    
- Comandos sugeridos si se usa librería adicional (opcional)
    
- Validaciones de seguridad
    

---

## 7. Validación y control de estado

Validar:

- Request inexistente → 404
    
- Si proveedor no tiene documento aún → 409 (pendiente)
    
- Archivo existe en disco → OK
    
- Ruta en DB coincide con disco
    

Si falla:

- Revisar permisos del sistema
    
- Revisar path join seguro
    

---

## 8. Cierre del metaprompt

Congelar:

- Estructura `storage/`
    
- Contrato de recuperación de documento  
    Habilita:
    
- Subproyecto 7: Reportería financiera
    

---

---

## 7. Subproyecto 7 – Motor Financiero (Utilidad, Margen, Reportes por Organización)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 7 de 8

**Motor Financiero (Utilidad, Margen, Reportes por Organización)**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Arquitecto de Datos y Reporting**, especializado en agregaciones con Prisma y diseño de endpoints administrativos.

---

## 2. Contexto autosuficiente del sistema

Ya existe:

- Requests persistidos
    
- Signatories persistidos
    
- Eventos y estados
    
- Ruta de documento final
    

Se requiere construir un módulo de reportes:

- Utilidad y margen por organización y por mes
    
- Conteos de solicitudes y firmantes
    
- Consumo estimado
    

Riesgos:

- Mezclar reportes con controllers de negocio
    
- No filtrar por fechas correctamente
    
- No parametrizar costos
    

---

## 3. Objetivo técnico único del subproyecto

Implementar:

- `GET /api/admin/reports/utility?month=YYYY-MM`
    

Que devuelva JSON con:

- organizationId
    
- totalRequests
    
- totalSignatories
    
- revenue (cobro externo)
    
- cost (costo proveedor)
    
- profit (revenue - cost)
    

Criterio binario:

- ✅ Endpoint responde JSON válido
    
- ✅ Agrupa por organización
    
- ✅ Usa parámetros de `.env` para costos
    

Fuera de alcance:

- Dashboard visual
    
- Exportación Excel/PDF
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Costos configurables en `.env`
    
    - `COST_PER_SIGNATORY`
        
    - `PRICE_PER_SIGNATORY` (o por request)
        
- No modificar esquema salvo agregar campos si faltan (solo si es imprescindible)
    
- Reportes no deben depender del proveedor OmniSwitch
    

Prohibido:

- Consultas raw SQL sin justificación
    
- Cambiar estados de requests
    

---

## 5. Artefactos esperados

- `src/services/reporting.service.ts`
    
- `src/controllers/reporting.controller.ts`
    
- `src/routes/reporting.routes.ts`
    
- Middleware de rol admin (si existe auth base)
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe incluir:

- Crear rutas admin
    
- Implementar agregaciones con Prisma
    
- Proveer comandos de prueba (curl)
    
- No ejecutar comandos
    

---

## 7. Validación y control de estado

Validar:

- Mes inválido → 400
    
- Respuesta consistente aunque no existan registros → devuelve arrays vacíos o ceros
    
- No filtra datos de otra organización cuando se pide por organización (si aplica)
    

Si falla:

- Revisar filtros por fecha
    
- Revisar relaciones Prisma
    

---

## 8. Cierre del metaprompt

Congelar:

- Contrato JSON de reportería  
    Habilita:
    
- Subproyecto 8: Auditoría total + gestión de estado obligatoria
    

---

---

## 8. Subproyecto 8 – Auditoría de Integridad + Gestión de Estado (Obligatorio)

→ **METAPROMPT COMPLETO**

---

# 🔹 METAPROMPT — Subproyecto 8 de 8

**Auditoría de Integridad + Gestión de Estado (Obligatorio)**  
_(Este metaprompt se ejecuta en el MODELO GRANDE. Su salida será un PROMPT EJECUTABLE EN IDE.)_

---

## 1. Rol que debe asumir el modelo

Actúa como **Ingeniero QA/SRE**, especializado en validación de estructura de repositorio, coherencia de estado, y healthchecks reproducibles.

---

## 2. Contexto autosuficiente del sistema

El sistema ya tiene:

- Prisma models: Organization, User, Request, Signatory, RequestEvent
    
- Integración OmniSwitch mock/real
    
- Endpoints de create, upload doc, signatories, send, document retrieval
    
- Reportería
    

Se requiere un subproyecto exclusivo para:

- Validar integridad del sistema
    
- Detectar degradación por cambios futuros
    
- Asegurar continuidad entre ejecuciones
    

Riesgos:

- Variables de entorno faltantes
    
- Rutas no registradas
    
- Estado local inconsistente con eventos
    
- Directorios storage inexistentes
    

---

## 3. Objetivo técnico único del subproyecto

Crear un comando:

- `npm run check-health`
    

Que valide:

- `.env` completo (comparado contra `.env.example`)
    
- Prisma puede conectar y consultar tabla
    
- Carpetas storage existen
    
- Rutas mínimas responden:
    
    - `/health`
        
- Validación de tipado (tsc)
    

Criterio binario:

- ✅ El script imprime “HEALTH_OK” si todo está bien
    
- ✅ Imprime lista de fallos exactos si algo falta
    
- ✅ No modifica datos productivos (solo lectura)
    

Fuera de alcance:

- Monitoreo externo
    
- Dockerization avanzada
    

---

## 4. Reglas estrictas de implementación

Obligatorio:

- Implementar script Node TS dentro de `src/scripts/healthcheck.ts`
    
- Debe terminar con exit code:
    
    - `0` OK
        
    - `1` ERROR
        
- No depender de internet para pasar en modo mock
    

Prohibido:

- Ejecutar migraciones en el healthcheck
    
- Borrar archivos o modificar DB
    

---

## 5. Artefactos esperados

- `src/scripts/healthcheck.ts`
    
- Ajuste en `package.json`:
    
    - `"check-health": "ts-node src/scripts/healthcheck.ts"`
        
    - `"typecheck": "tsc --noEmit"`
        
- `README.md` con paso de verificación
    

---

## 6. Generación del PROMPT EJECUTABLE EN IDE (MOST IMPORTANT)

Debe incluir:

- Crear script
    
- Añadir comandos en package.json
    
- Instrucción de que el humano ejecuta
    
- Salidas esperadas
    
- Qué hacer si falla
    

---

## 7. Validación y control de estado

Validar:

- Sin `.env` → falla con mensaje
    
- Sin storage/ → falla con mensaje
    
- Sin DB → falla con mensaje
    
- Con modo mock → pasa sin OmniSwitch real
    

Errores comunes:

- `ts-node` no instalado
    
- Prisma client no generado
    

Acciones:

- Lista exacta de comandos a ejecutar manualmente
    

---

## 8. Cierre del metaprompt

Subproyecto finaliza dejando:

- Control de integridad reproducible
    
- Estado congelado como baseline
    
- El sistema listo para transición a producción con menor riesgo de degradación
    

---

Si se toma este mapa de 8 subproyectos tal como está, el stack **Node.js + TypeScript + Express + Prisma** queda alineado con el objetivo: **simular en local (mock), luego conmutar a producción (real), manteniendo trazabilidad, estados y auditoría** sin perder control.




 ]
"""
================================================================================