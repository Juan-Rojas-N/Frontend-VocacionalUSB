# USB Vocacional — Frontend

Plataforma web de orientación vocacional de la Universidad San Buenaventura Bogotá. Construida con **React 19 + TypeScript + Vite 8**, consume una API REST en **Spring Boot 4** (`ProyectoVocacional`).

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Rutas y permisos](#rutas-y-permisos)
- [Módulos funcionales](#módulos-funcionales)
- [Servicios y conexión con el backend](#servicios-y-conexión-con-el-backend)
- [Estado global (stores)](#estado-global-stores)
- [Estilos y diseño](#estilos-y-diseño)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura de tipos](#estructura-de-tipos)

---

## Tecnologías

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | React | 19.2 |
| Lenguaje | TypeScript | 6.0 |
| Build tool | Vite | 8.0 |
| Routing | React Router DOM | 7.9 |
| Estado global | Zustand | 5.0 |
| Formularios | React Hook Form + Zod | 7.66 / 4.1 |
| Gráficos | Recharts | 3.3 |
| PDF | jsPDF + jspdf-autotable | 4.2 / 5.0 |
| Package manager | pnpm | 11.8 |

---

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 11 (instalar con `npm install -g pnpm`)
- Backend **ProyectoVocacional** corriendo en `http://localhost:8088`

---

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/Juan-Rojas-N/Frontend-VocacionalUSB.git
cd Frontend-VocacionalUSB/frontend-web

# Instalar dependencias
pnpm install

# Crear archivo de entorno (copiar el ejemplo)
cp .env.example .env
# Editar .env con la URL del backend

# Ejecutar en modo desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173/vocacional/`.

### Compilación de producción

```bash
pnpm build      # Genera dist/
pnpm preview    # Previsualiza la build de producción
```

### Lint

```bash
pnpm lint
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API backend | `http://localhost:8088/api/v1` |
| `VITE_USE_MOCKS` | Habilitar datos mock (solo desarrollo) | `false` |

---

## Arquitectura del proyecto

```text
src/
├── assets/              Imágenes y recursos estáticos
├── components/          Componentes reutilizables
│   ├── charts/          Gráficos de resultados
│   ├── common/          Logo, botones, modales, dropdown de usuario
│   ├── dashboard/       Tablas del panel administrativo
│   └── test/            Tarjeta de pregunta, sidebar, guard de salida
├── constants/           Constantes del dominio (programas, rutas, políticas)
├── data/                Catálogo de departamentos y municipios de Colombia
├── hooks/               Hooks reutilizables (countdown)
├── layouts/             Layouts de navegación (público, administrativo)
├── mocks/               Datos mock para desarrollo sin backend
├── pages/               Pantallas del sistema
│   ├── admin/           Panel administrativo (vistas de ROOT y ADMIN)
│   ├── auth/            Login, registro, recuperación de contraseña
│   ├── landing/         Página de inicio
│   ├── profile/         Perfil de usuario e historial de pruebas
│   ├── results/         Resultados vocacionales
│   └── test/            Prueba vocacional (intro, sesión, revisión)
├── routes/              Definición de rutas y RouteGuard
├── services/            Clientes HTTP y lógica de negocio
├── stores/              Estado global con Zustand
├── styles/              Estilos CSS globales
├── types/               Definiciones TypeScript
└── utils/               Helpers de formateo, catálogos, reportes y roles
```

### Descripción de capas

| Capa | Responsabilidad |
|---|---|
| `pages/` | Pantallas navegables, una por ruta |
| `components/` | Piezas UI reutilizables entre páginas |
| `layouts/` | Estructura de header/footer para rutas públicas y paneles |
| `routes/` | Definición de rutas con `createBrowserRouter` y guards por rol |
| `services/` | Capa de comunicación HTTP con el backend (fetch API) |
| `stores/` | Estado global reactivo (autenticación, sesión de prueba) |
| `types/` | Contratos TypeScript para el dominio y la API |
| `utils/` | Funciones puras: formateo, validación, catálogos, exportación |
| `constants/` | Valores estáticos: políticas de contraseña, opciones de género, programas |
| `hooks/` | Lógica reutilizable extraída como hooks personalizados |

---

## Rutas y permisos

| Ruta | Descripción | Roles permitidos |
|---|---|---|
| `/vocacional/` | Landing page | Público |
| `/vocacional/iniciar-sesion` | Inicio de sesión | Público |
| `/vocacional/registro` | Registro de usuario | Público |
| `/vocacional/recuperar-contrasena` | Solicitud de recuperación | Público |
| `/vocacional/restablecer-contrasena` | Restablecer contraseña (token) | Público |
| `/vocacional/perfil` | Perfil de usuario | Estudiante, Administrador, ROOT |
| `/vocacional/historial` | Historial de pruebas rendidas | Estudiante, Administrador, ROOT |
| `/vocacional/prueba-vocacional` | Instrucciones de la prueba | Estudiante, Administrador, ROOT |
| `/vocacional/prueba-vocacional/sesion` | Sesión de preguntas | Estudiante, Administrador, ROOT |
| `/vocacional/prueba-vocacional/revision` | Revisión antes de enviar | Estudiante, Administrador, ROOT |
| `/vocacional/resultados` | Resultados vocacionales | Estudiante, Administrador, ROOT |
| `/vocacional/resultados/:testId` | Resultado de prueba específica | Estudiante, Administrador, ROOT |
| `/vocacional/administracion` | Panel administrativo | Administrador, ROOT |

### Roles del sistema

| Rol | Descripción | Accesos |
|---|---|---|
| `student` | Estudiante regular | Prueba vocacional, perfil, resultados, historial |
| `administrator` | Administrador | Todo lo del estudiante + dashboard, reportes, catálogos |
| `root` | Superusuario | Todo lo del administrador + gestión de roles, permisos, usuarios y logs del sistema |

---

## Módulos funcionales

### 1. Autenticación y registro
- Inicio de sesión con JWT (token Bearer).
- Registro con validación de mayoría de edad, datos personales, académicos y consentimientos.
- Recuperación y restablecimiento de contraseña por correo electrónico.
- Recordar sesión mediante `localStorage` (Zustand persist).

### 2. Prueba vocacional
- Instrucciones y confirmación antes de iniciar.
- 35 preguntas con escala Likert (Rara vez / A veces / A menudo / Siempre).
- Cronómetro de 35 minutos con advertencia a los 5 minutos restantes.
- Navegación libre entre preguntas con sidebar de progreso.
- Guard automático de respuestas en el store.
- Validación de completitud antes de enviar.
- **Calificación de satisfacción (1-5 estrellas)** en el modal de confirmación antes de enviar la prueba (opcional).
- Envío al backend con cálculo de tiempo invertido y valor de satisfacción.

### 3. Resultados vocacionales
- Área predominante con porcentaje de afinidad.
- Top 3 programas recomendados con explicación cualitativa.
- Gráficos de radar y barras (Recharts).
- Generación de PDF del resultado (jsPDF).
- Historial de pruebas rendidas con estadísticas resumidas.

### 4. Perfil de usuario
- Visualización de datos de cuenta (correo, documento, teléfono, municipio, departamento).
- Edición de perfil con validación por Zod.
- **Cambio de contraseña** con política de seguridad (mínimo 8 caracteres, mayúscula y número) desde el perfil.
- **Eliminación de cuenta** con doble confirmación (zona de peligro integrada en el perfil; oculto para ROOT).
- **Historial de pruebas** con estadísticas resumidas (total de pruebas, última fecha, área predominante).

### 5. Panel administrativo

#### Administrador
- **Resumen general**: métricas de usuarios, pruebas y distribución geográfica.
- **Resultados**: listado de resultados con filtros.
- **Reportes**: generación de reportes por filtros con exportación CSV.
- **Configuración**: CRUD de áreas, programas y pruebas con modo borrador y guardado por lotes.
- **Subida de imagen pacho**: carga de imagen por área dentro del formulario de edición, con vista previa.

#### ROOT (adicional)
- **Roles - Actividades**: asignación de permisos por rol (tabla de roles vs endpoints).
- **Usuarios - Modificar rol**: cambio de rol de usuarios, restablecimiento de contraseña (usa número de documento).
- **Logs del sistema**: visualización de actividad auditada del sistema integrada como pestaña en el dashboard.

---

## Servicios y conexión con el backend

| Servicio | Archivo | Funciones principales |
|---|---|---|
| API Client | `apiClient.ts` | Cliente HTTP genérico con manejo de token, errores y envelope de respuesta |
| Auth | `authService.ts` | `login`, `register`, `recoverPassword`, `resetPassword` |
| Token | `tokenStore.ts` | `setAccessToken`, `getAccessToken`, `clearAccessToken` |
| Usuario | `userService.ts` | `getProfile`, `updateProfile`, `deleteAccount`, `changePassword` |
| Catálogos | `catalogService.ts` | `loadDepartments`, `loadMunicipalities`, `loadProgramCatalog` |
| Prueba | `testService.ts` | `getQuestions`, `startAttempt`, `submitAttempt` |
| Resultados | `resultsService.ts` | `getMyResults`, `getResultByTest`, `getMyTestHistory` |
| Admin | `adminService.ts` | Dashboard, usuarios, roles, catálogos, logs, pacho upload |
| PDF | `pdfService.ts` | Generación client-side de PDFs de resultados y reportes |

### Endpoints del backend consumidos

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/usuarios/me
PUT    /api/v1/usuarios/me/perfil
POST   /api/v1/usuarios/me/cambiar-contrasena
DELETE /api/v1/usuarios/me
GET    /api/v1/departamentos
GET    /api/v1/departamentos/{id}/municipios
GET    /api/v1/catalogos/programas
GET    /api/v1/preguntas/para-prueba
POST   /api/v1/pruebas
GET    /api/v1/pruebas/mis-pruebas
GET    /api/v1/pruebas/{id}/resultado
GET    /api/v1/dashboard
GET    /api/v1/usuarios
PATCH  /api/v1/usuarios/{id}/rol
POST   /api/v1/usuarios/{id}/restablecer-contrasena
GET    /api/v1/roles
GET    /api/v1/roles/{id}/actividades
PUT    /api/v1/roles/{id}/actividades
GET    /api/v1/areas
POST   /api/v1/areas
PUT    /api/v1/areas/{id}
DELETE /api/v1/areas/{id}
PATCH  /api/v1/areas/{id}/reactivar
POST   /api/v1/areas/{id}/imagen-pacho
GET    /api/v1/programas
POST   /api/v1/programas
PUT    /api/v1/programas/{id}
DELETE /api/v1/programas/{id}
PATCH  /api/v1/programas/{id}/reactivar
GET    /api/v1/logs
```

---

## Estado global (stores)

### `authStore` (Zustand + persist)
- **Clave**: `usb-vocacional-auth`
- **Estado**: `sessionUser` (perfil del usuario), `accessToken` (JWT)
- **Acciones**: `signIn`, `register`, `updateSessionUser`, `signOut`

### `testSessionStore` (Zustand + persist)
- **Clave**: `usb-vocacional-test`
- **Estado**: `attemptId`, `startedAt`, `expiresAt`, `questions`, `answers`, `currentIndex`, `satisfaccion`
- **Acciones**: `initialize`, `answerQuestion`, `setCurrentIndex`, `acknowledgeIntro`, `setSatisfaccion`, `clear`

---

## Estilos y diseño

- **CSS global** en `src/styles/index.css` (~6000 líneas).
- **Fuentes**: Montserrat (texto) y Poppins (títulos).
- **Paleta institucional USB**:

| Variable | Color | Uso |
|---|---|---|
| `--usb-orange` | `#EF7D00` | Color primario, botones, acentos |
| `--usb-blue` | `#181E7B` | Color secundario, headers |
| `--usb-black` | `#1D1D1B` | Texto principal |
| `--usb-cream` | `#FFF8F1` | Fondos claros |
| `--usb-sand` | `#F6EFE7` | Fondos alternos |
| `--usb-success` | `#147A50` | Estados de éxito |
| `--usb-danger` | `#9F2D20` | Estados de error, zona de peligro |

- Diseño **responsive** con breakpoints en 720px y 900px.
- Componentes con convención BEM: `prefijo__elemento--modificador`.
- Botones principales con estilo pill (`border-radius: 999px`).

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Compilación de producción (`tsc -b && vite build`) |
| `pnpm preview` | Previsualización de la build de producción |
| `pnpm lint` | Verificación de código con ESLint |

---

## Estructura de tipos

El directorio `src/types/index.ts` define los contratos TypeScript principales:

| Tipo | Descripción |
|---|---|
| `UserProfile` | Perfil completo del usuario (31 campos) |
| `UserRole` | `'student' \| 'administrator' \| 'root'` |
| `TestQuestion` | Pregunta con opciones de respuesta |
| `TestAttempt` | Intento de prueba con metadatos |
| `TestSubmissionPayload` | Payload de envío con `answers`, `questions`, `tiempoInvertido` y `satisfaccion` (1-5 o null) |
| `VocationalResult` | Resultado vocacional con áreas y programas |
| `CareerRecommendation` | Programa recomendado con afinidad y justificación |
| `AdminDashboard` | Datos del panel administrativo |
| `AdminCatalogs` | Catálogos de áreas, programas y pruebas |
| `RoleActivity` | Asignación de permisos por rol |
| `ApiEnvelope<T>` | Envelope estándar de respuestas API |
| `ApiError` | Error estructurado con código y campos |

---

## Licencia

Proyecto académico — Universidad San Buenaventura Bogotá, 2026.
