# USB Vocacional Frontend

Frontend web de `USB Vocacional` construido con `Vite + React + TypeScript`.

El proyecto usa `pnpm` como package manager oficial.

Se creó en una carpeta separada `frontend-web/` porque el proyecto existente en `ProyectoVocacional/` es un backend `Spring Boot + Kotlin`. Mantener React dentro de `src/main/kotlin/.../Frontend` no es adecuado para un frontend profesional por estas razones:

- React requiere un ciclo de build y dependencias propias de Node/Vite.
- El frontend debe poder desplegarse, versionarse y probarse de forma independiente.
- Mezclar código UI con el árbol Kotlin dificulta escalabilidad, CI/CD y separación de responsabilidades.

## Cómo instalar

```bash
cd frontend-web
pnpm install
```

## Cómo ejecutar

```bash
pnpm dev
```

Para compilación de producción:

```bash
pnpm build
```

Para lint:

```bash
pnpm lint
```

## Arquitectura frontend

```text
src/
  components/
    charts/
    common/
    dashboard/
    test/
  constants/
  hooks/
  layouts/
  mocks/
  pages/
    admin/
    auth/
    landing/
    results/
    test/
  routes/
  services/
  stores/
  styles/
  types/
  utils/
```

### Capas principales

- `pages`: pantallas navegables del sistema.
- `components`: piezas reutilizables.
- `layouts`: estructura pública y administrativa.
- `routes`: definición de rutas y guardas.
- `services`: clientes preparados para backend futuro.
- `types`: contratos TypeScript del dominio.
- `mocks`: data simulada del proyecto.
- `stores`: estado global con Zustand para auth y prueba.
- `hooks`: lógica reutilizable como cronómetro.
- `utils`: formateadores y helpers de storage.

## Alcance implementado

- Landing page con propósito, alcance de la prueba, tiempo estimado y aviso 18+.
- Login mock con confirmación de mayoría de edad.
- Registro completo con validación, género abierto y datos académicos condicionales.
- Recuperación de contraseña mock.
- Instrucciones de prueba vocacional.
- Sesión de prueba con preguntas mock, progreso, cronómetro, navegación y abandono con confirmación.
- Revisión antes de finalizar.
- Pantalla de resultados con 3 carreras recomendadas, afinidad, explicación cualitativa y gráficos.
- Panel administrativo con métricas, distribución geográfica, resultados agregados e exportaciones mock.

## Endpoints esperados del backend

Estos endpoints ya están representados en los servicios del frontend:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/recover-password`
- `GET /api/test/questions`
- `POST /api/test/attempts`
- `POST /api/test/submit`
- `GET /api/results/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/results`
- `GET /api/admin/reports/export`

## Qué está mockeado

- Autenticación.
- Persistencia de usuarios.
- Banco de preguntas.
- Inicio y envío de intento de prueba.
- Resultados vocacionales.
- Dashboard administrativo.
- Exportación PDF, CSV y Excel.

Los mocks viven en `src/mocks/data.ts` y usan `localStorage` cuando aplica.

## Tipos modelados

El frontend incluye contratos TypeScript para:

- Usuario
- Rol
- Pregunta
- Intento de prueba
- Resultado
- Carrera recomendada
- Área vocacional
- Dashboard administrativo
- Exportaciones y envelopes de API

## Integración futura con Spring Boot

Siguientes pasos para conectar el backend real:

1. Reemplazar los resolvers mock de `src/services/*.ts` por llamadas HTTP reales.
2. Centralizar `VITE_API_BASE_URL` en variables de entorno.
3. Sustituir `localStorage` por respuestas del backend para auth y usuarios.
4. Conectar el cálculo real de resultados al flujo `submit -> results`.
5. Reemplazar exportaciones mock por archivos servidos por el backend.

## Notas de diseño

- Se respetó la identidad base institucional con `#EF7D00` y `#1D1D1B`.
- La UI es responsive y usa componentes reutilizables.
- La referencia visual principal se tomó de los requerimientos locales del proyecto.

## Limitación actual sobre Figma

La sesión tenía acceso al conector de Figma, pero no fue posible localizar el archivo `USB Vocacional` automáticamente porque en el repo/documentos no venía URL ni `fileKey`, y el MCP disponible no expone búsqueda por nombre de archivo. El frontend quedó listo para ajustar fidelidad visual exacta en cuanto se comparta ese enlace específico.
