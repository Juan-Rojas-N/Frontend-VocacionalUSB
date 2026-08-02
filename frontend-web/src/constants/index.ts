import type {
  AnswerOption,
  GenderOption,
  ServiceEndpoint,
  UserRole,
} from '../types'

export const APP_ROUTES = {
  home: '/',
  login: '/iniciar-sesion',
  register: '/registro',
  recoverPassword: '/recuperar-contrasena',
  profile: '/perfil',
  testIntro: '/prueba-vocacional',
  testSession: '/prueba-vocacional/sesion',
  testReview: '/prueba-vocacional/revision',
  results: '/resultados',
  admin: '/administracion',
} as const

export const LEGAL_COPY = {
  adultNotice:
    'La prueba está dirigida exclusivamente a personas mayores de edad. Se solicita confirmación explícita antes de continuar.',
  dataPolicy:
    'Tus datos serán usados únicamente con fines de orientación vocacional, seguimiento académico y mejora del servicio.',
}

export const GENDER_OPTIONS: GenderOption[] = [
  'Masculino',
  'Femenino',
  'Prefiero no decirlo',
  'Otro',
]

export const DEPARTMENT_OPTIONS = [
  'Antioquia',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Caldas',
  'Cundinamarca',
  'Santander',
  'Valle del Cauca',
]

export const CITY_OPTIONS = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena',
  'Manizales',
  'Soacha',
]

export const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, index) =>
  String(index + 1),
)

export const TEST_SCALE: AnswerOption[] = [
  { value: 1, label: 'Rara vez', description: 'Casi nunca se parece a mí.' },
  { value: 2, label: 'A veces', description: 'Solo ocurre en algunas ocasiones.' },
  { value: 3, label: 'A menudo', description: 'Se parece a mí con frecuencia.' },
  { value: 4, label: 'Siempre', description: 'Describe muy bien mi comportamiento.' },
]

export const EXPECTED_BACKEND_ENDPOINTS: ServiceEndpoint[] = [
  {
    name: 'authService.login',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Inicio de sesión con validación de mayoría de edad.',
  },
  {
    name: 'authService.register',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Registro de estudiantes y aceptación de datos.',
  },
  {
    name: 'authService.recoverPassword',
    method: 'POST',
    path: '/api/auth/recover-password',
    description: 'Recuperación de credenciales.',
  },
  {
    name: 'testService.getQuestions',
    method: 'GET',
    path: '/api/test/questions',
    description: 'Consulta del banco de preguntas.',
  },
  {
    name: 'testService.startAttempt',
    method: 'POST',
    path: '/api/test/attempts',
    description: 'Inicio de intento y temporizador.',
  },
  {
    name: 'testService.submitAttempt',
    method: 'POST',
    path: '/api/test/submit',
    description: 'Envío final de la prueba.',
  },
  {
    name: 'resultsService.getMyResults',
    method: 'GET',
    path: '/api/results/me',
    description: 'Resultados del usuario autenticado.',
  },
  {
    name: 'adminService.getDashboard',
    method: 'GET',
    path: '/api/admin/dashboard',
    description: 'Indicadores agregados para panel administrativo.',
  },
  {
    name: 'adminService.getResults',
    method: 'GET',
    path: '/api/admin/results',
    description: 'Resultados individuales y agregados.',
  },
  {
    name: 'adminService.exportReport',
    method: 'GET',
    path: '/api/admin/reports/export',
    description: 'Exportación mock de PDF, CSV y Excel.',
  },
]

export const MOCK_CREDENTIALS: Array<{
  role: UserRole
  email: string
  password: string
}> = [
  { role: 'student', email: 'laura.gomez@correo.com', password: 'Vocacion123' },
  { role: 'admin', email: 'admin@usb.edu.co', password: 'Admin123' },
]
