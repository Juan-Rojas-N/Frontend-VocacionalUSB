import type {
  AcademicProgramGroup,
  AnswerOption,
  GenderOption,
  InstitutionRelationship,
  SelectOption,
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
} as const

export const LEGAL_LINKS = {
  legalPersonhood:
    'https://www.usbbog.edu.co/documentos/universidad/institucional-corporativo/resolucion-1326-25-marzo-1975-personeria-juridica.pdf',
  privacyPolicy: 'https://www.usbbog.edu.co/politicas-de-uso-y-privacidad/',
  // Temporalmente se usa la URL de privacidad porque el requerimiento funcional
  // contradice el mockup que apuntaba a una URL independiente de términos.
  terms: 'https://www.usbbog.edu.co/politicas-de-uso-y-privacidad/',
} as const

export const LEGAL_DOCUMENT_VERSIONS = {
  personalDataConsent: '2026-01',
  privacyPolicy: '2026-01',
  terms: '2026-01',
} as const

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialCharacter: true,
} as const

export const USERNAME_MAX_LENGTH = 50
export const GENDER_OTHER_MAX_LENGTH = 100

export const GENDER_OPTIONS: Array<SelectOption<GenderOption>> = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
  { value: 'Otro', label: 'Otro' },
]

export const INSTITUTION_LINK_OPTIONS: Array<SelectOption<'Si' | 'No'>> = [
  { value: 'Si', label: 'Sí' },
  { value: 'No', label: 'No' },
]

export const INSTITUTION_RELATIONSHIP_OPTIONS: Array<SelectOption<InstitutionRelationship>> = [
  { value: 'Inscrito', label: 'Inscrito' },
  { value: 'Estudiante', label: 'Estudiante' },
]

export const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, index) => String(index + 1))

export const ACADEMIC_PROGRAM_GROUPS: AcademicProgramGroup[] = [
  {
    id: 'social-behavior',
    label: 'Ciencias Sociales y del Comportamiento',
    programs: [
      {
        id: 'psychology',
        code: 'PSYCHOLOGY',
        name: 'Psicología',
        areaId: 'social-behavior',
        areaName: 'Ciencias Sociales y del Comportamiento',
        active: true,
      },
      {
        id: 'political-science',
        code: 'POLITICAL_SCIENCE',
        name: 'Ciencia Política',
        areaId: 'social-behavior',
        areaName: 'Ciencias Sociales y del Comportamiento',
        active: true,
      },
      {
        id: 'international-relations',
        code: 'INTERNATIONAL_RELATIONS',
        name: 'Relaciones Internacionales',
        areaId: 'social-behavior',
        areaName: 'Ciencias Sociales y del Comportamiento',
        active: true,
      },
    ],
  },
  {
    id: 'education-pedagogy',
    label: 'Educación y Pedagogía',
    programs: [
      {
        id: 'early-childhood-education',
        code: 'EARLY_CHILDHOOD_EDUCATION',
        name: 'Licenciatura en Educación Infantil',
        areaId: 'education-pedagogy',
        areaName: 'Educación y Pedagogía',
        active: true,
      },
      {
        id: 'early-childhood-care-technician',
        code: 'EARLY_CHILDHOOD_CARE_TECHNICIAN',
        name: 'Técnico Profesional en Cuidado y Desarrollo de la Primera Infancia',
        areaId: 'education-pedagogy',
        areaName: 'Educación y Pedagogía',
        active: true,
      },
    ],
  },
  {
    id: 'humanities-religious-studies',
    label: 'Humanidades y Estudios Religiosos',
    programs: [
      {
        id: 'philosophy-education',
        code: 'PHILOSOPHY_EDUCATION',
        name: 'Licenciatura en Filosofía',
        areaId: 'humanities-religious-studies',
        areaName: 'Humanidades y Estudios Religiosos',
        active: true,
      },
      {
        id: 'theology-education',
        code: 'THEOLOGY_EDUCATION',
        name: 'Licenciatura en Teología',
        areaId: 'humanities-religious-studies',
        areaName: 'Humanidades y Estudios Religiosos',
        active: true,
      },
    ],
  },
  {
    id: 'languages-communication',
    label: 'Lenguas y Comunicación',
    programs: [
      {
        id: 'english-language',
        code: 'ENGLISH_LANGUAGE',
        name: 'Profesional en Lengua Inglesa',
        areaId: 'languages-communication',
        areaName: 'Lenguas y Comunicación',
        active: true,
      },
    ],
  },
  {
    id: 'engineering-it',
    label: 'Ingeniería y Tecnologías de la Información',
    programs: [
      {
        id: 'systems-engineering',
        code: 'SYSTEMS_ENGINEERING',
        name: 'Ingeniería de Sistemas',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'electronic-engineering',
        code: 'ELECTRONIC_ENGINEERING',
        name: 'Ingeniería Electrónica',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'aeronautical-engineering',
        code: 'AERONAUTICAL_ENGINEERING',
        name: 'Ingeniería Aeronáutica',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'mechatronics-engineering',
        code: 'MECHATRONICS_ENGINEERING',
        name: 'Ingeniería Mecatrónica',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'multimedia-engineering',
        code: 'MULTIMEDIA_ENGINEERING',
        name: 'Ingeniería Multimedia',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'industrial-automation-technology',
        code: 'INDUSTRIAL_AUTOMATION_TECHNOLOGY',
        name: 'Tecnología en Automatización Industrial',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
      {
        id: 'software-development-technology',
        code: 'SOFTWARE_DEVELOPMENT_TECHNOLOGY',
        name: 'Tecnología en Desarrollo de Software',
        areaId: 'engineering-it',
        areaName: 'Ingeniería y Tecnologías de la Información',
        active: true,
      },
    ],
  },
  {
    id: 'audiovisual-sound',
    label: 'Producción Audiovisual y Sonido',
    programs: [
      {
        id: 'audio-production-technology',
        code: 'AUDIO_PRODUCTION_TECHNOLOGY',
        name: 'Tecnología en Producción de Audio para Medios Audiovisuales',
        areaId: 'audiovisual-sound',
        areaName: 'Producción Audiovisual y Sonido',
        active: true,
      },
      {
        id: 'sound-engineering',
        code: 'SOUND_ENGINEERING',
        name: 'Ingeniería de Sonido',
        areaId: 'audiovisual-sound',
        areaName: 'Producción Audiovisual y Sonido',
        active: true,
      },
    ],
  },
  {
    id: 'business-economics',
    label: 'Administración, Economía y Negocios',
    programs: [
      {
        id: 'business-administration',
        code: 'BUSINESS_ADMINISTRATION',
        name: 'Administración de Empresas',
        areaId: 'business-economics',
        areaName: 'Administración, Economía y Negocios',
        active: true,
      },
      {
        id: 'public-accounting',
        code: 'PUBLIC_ACCOUNTING',
        name: 'Contaduría Pública',
        areaId: 'business-economics',
        areaName: 'Administración, Economía y Negocios',
        active: true,
      },
      {
        id: 'international-accounting-finance-technology',
        code: 'INTERNATIONAL_ACCOUNTING_FINANCE_TECHNOLOGY',
        name: 'Tecnología en Contabilidad y Finanzas Internacionales',
        areaId: 'business-economics',
        areaName: 'Administración, Economía y Negocios',
        active: true,
      },
    ],
  },
  {
    id: 'law',
    label: 'Derecho y Ciencias Jurídicas',
    programs: [
      {
        id: 'law',
        code: 'LAW',
        name: 'Derecho',
        areaId: 'law',
        areaName: 'Derecho y Ciencias Jurídicas',
        active: true,
      },
    ],
  },
]

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
    description: 'Inicio de sesión con correo o nombre de usuario.',
  },
  {
    name: 'authService.register',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Registro de usuarios con datos académicos, ubicación y consentimientos.',
  },
  {
    name: 'authService.recoverPassword',
    method: 'POST',
    path: '/api/auth/recover-password',
    description: 'Recuperación de credenciales.',
  },
  {
    name: 'catalogService.getDepartments',
    method: 'GET',
    path: '/api/catalogs/departments',
    description: 'Catálogo de departamentos.',
  },
  {
    name: 'catalogService.getMunicipalities',
    method: 'GET',
    path: '/api/catalogs/departments/{departmentId}/municipalities',
    description: 'Catálogo de municipios por departamento.',
  },
  {
    name: 'catalogService.getAcademicPrograms',
    method: 'GET',
    path: '/api/catalogs/academic-programs',
    description: 'Catálogo de programas académicos.',
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
  { role: 'administrator', email: 'admin@usb.edu.co', password: 'Admin123' },
  { role: 'root', email: 'root@usb.edu.co', password: 'Root123' },
]
