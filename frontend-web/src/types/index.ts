export type UserRole = 'student' | 'administrator' | 'root'

export type GenderOption =
  | 'Masculino'
  | 'Femenino'
  | 'Prefiero no decirlo'
  | 'Otro'

export type InstitutionRelationship = 'Inscrito' | 'Estudiante'

export type VocationalArea = string

export interface ApiEnvelope<T> {
  data: T
  endpoint: string
  mocked: boolean
  message?: string
  requestedAt: string
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface AcademicProgram {
  id: string
  code: string
  name: string
  areaId: string
  areaName: string
  active: boolean
  url?: string | null
}

export interface AcademicProgramGroup {
  id: string
  label: string
  programs: AcademicProgram[]
}

export interface DepartmentCatalogItem {
  id: string
  code: string
  name: string
  municipalities: MunicipalityCatalogItem[]
}

export interface MunicipalityCatalogItem {
  id: string
  code: string
  name: string
  type: string
}

export interface LoginPayload {
  identifier: string
  password: string
  rememberMe: boolean
}

export interface RecoverPasswordPayload {
  email: string
  document?: string
}

export interface ResetPasswordPayload {
  token: string
  nuevaContrasena: string
}

export interface UpdateUserProfilePayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  departmentId: string
  municipalityId: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  username: string
  document: string
  birthDate: string
  email: string
  phone: string
  departmentId: string
  municipalityId: string
  gender: GenderOption
  genderOther?: string
  institutionLinked: boolean
  institutionRelationship?: InstitutionRelationship
  academicProgramId?: string
  semester?: string
  personalDataConsentAccepted: boolean
  privacyPolicyAccepted: boolean
  termsAccepted: boolean
  personalDataConsentVersion: string
  privacyPolicyVersion: string
  termsVersion: string
  password: string
}

export interface UserProfile {
  id: string
  role: UserRole
  fullName: string
  firstName: string
  lastName: string
  username?: string
  document: string
  birthDate?: string
  age: number
  email: string
  phone: string
  departmentId: string
  departmentName: string
  municipalityId: string
  municipalityName: string
  gender: GenderOption
  genderOther?: string
  institutionLinked: boolean
  institutionRelationship?: InstitutionRelationship
  academicProgramId?: string
  academicProgramName?: string
  semester?: string
  personalDataConsentAccepted: boolean
  personalDataConsentAcceptedAt?: string
  personalDataConsentVersion?: string
  privacyPolicyAccepted: boolean
  privacyPolicyAcceptedAt?: string
  privacyPolicyVersion?: string
  termsAccepted: boolean
  termsAcceptedAt?: string
  termsVersion?: string
  createdAt: string
}

export interface RegisteredUserRecord extends UserProfile {
  normalizedEmail: string
  normalizedUsername?: string
  passwordMock: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: UserProfile
}

export interface ServiceEndpoint {
  name: string
  method: 'GET' | 'POST'
  path: string
  description: string
}

export interface AnswerOption {
  value: number
  label: string
  description: string
}

export interface TestQuestion {
  id: string
  preguntaId: number
  codigoPregunta: string
  prompt: string
  dimension: string
  area: VocationalArea
  options: AnswerOption[]
}

export interface TestAttempt {
  id: string
  startedAt: string
  expiresAt: string
  status: 'draft' | 'submitted'
  progress: number
  versionLabel?: string
  attemptLabel?: string
  audienceLabel?: string
  questions: TestQuestion[]
  answers: Record<string, number>
}

export interface TestSubmissionPayload {
  attemptId: string
  submittedAt: string
  answers: Record<string, number>
  questions: TestQuestion[]
}

export interface CareerRecommendation {
  id: string
  name: string
  affinity: number
  area: VocationalArea
  summary: string
  rationale: string[]
  url?: string
  pathLogo?: string
}

export interface ChartDatum {
  label: string
  value: number
}

export interface AreaProfile {
  idArea: number
  nombreArea: string
  valorAfinidad: number
  perfil?: string
  descripcionArea?: string
  imagenUrl?: string
  imagenPachoUrl?: string
}

export interface AreaAffinityProfile {
  id: string
  name: VocationalArea
  affinity: number
  description: string
  profile: string
}

export interface VocationalResult {
  id: string
  generatedAt: string
  primaryArea: VocationalArea
  qualitativeSummary: string
  careers: CareerRecommendation[]
  areas: AreaAffinityProfile[]
  affinityByArea: ChartDatum[]
  areaProfiles?: AreaProfile[]
  perfil?: string
  descripcionArea?: string
  nombreReporte?: string
  url?: string
}

export interface BackendPreguntaPrueba {
  id: number
  codigo: string | null
  enunciado: string
  idPrograma: number
  nombrePrograma: string
  idArea: number
  nombreArea: string
}

export interface BackendRespuestaPrueba {
  preguntaId: number
  codigoPregunta: string
  valor: number
}

export interface BackendPrueba {
  id: number | null
  fecha: string | null
  tiempoInvertido: number | null
  versionPrueba: string | null
  satisfaccion: number | null
  activo: boolean
}

export interface BackendAfinidadArea {
  idArea: number
  nombreArea: string
  valorAfinidad: number
  perfil: string | null
  descripcionArea: string | null
  pathLogo: string | null
  pachoPath: string | null
}

export interface BackendProgramaAfinidad {
  idPrograma: number
  nombrePrograma: string
  valorAfinidad: number
  descripcionPrograma: string | null
  urlPrograma: string | null
  pathLogo: string | null
  nombreArea: string | null
}

export interface BackendResultado {
  idPrueba: number
  fecha: string | null
  idAreaPredominante: number
  nombreAreaPredominante: string
  perfil: string | null
  descripcionArea: string | null
  afinidadPorArea: BackendAfinidadArea[]
  programasRecomendados: BackendProgramaAfinidad[]
  nombreReporte: string
  url: string | null
}

export interface RoleActivity {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  enabled: boolean
}

export interface RoleActivityAssignment {
  roleId: number
  role: UserRole
  roleLabel: string
  activities: RoleActivity[]
}

export interface AdminAreaCatalogItem {
  id: string
  name: string
  description: string
  profile: string
  active: boolean
}

export interface AdminProgramCatalogItem {
  id: string
  name: string
  description: string
  areaId: string
  url?: string
  active: boolean
}

export interface AdminTestCatalogItem {
  id: string
  name: string
  version: string
  questionCount: number
  durationMinutes: number
  active: boolean
}

export interface AdminCatalogs {
  areas: AdminAreaCatalogItem[]
  programs: AdminProgramCatalogItem[]
  tests: AdminTestCatalogItem[]
}

export interface AdminReportFilters {
  userId?: string
  departmentId?: string
  programId?: string
  startDate?: string
  endDate?: string
}

export interface DashboardMetric {
  id: string
  label: string
  value: string
  change: string
  hint: string
}

export interface GeographicDistributionItem {
  region: string
  users: number
  completedTests: number
}

export interface AdminResultRecord {
  id: string
  studentName: string
  document: string
  city: string
  primaryArea: VocationalArea
  topCareer: string
  affinity: number
  completedAt: string
}

export interface AdminDashboard {
  metrics: DashboardMetric[]
  mostSelectedArea: VocationalArea
  geographicDistribution: GeographicDistributionItem[]
  affinityDistribution: ChartDatum[]
  recentResults: AdminResultRecord[]
  internos: number
  externos: number
}

export interface AdminReportProgramOption {
  id: string
  name: string
  areaName?: string
}

export interface AdminReportRow {
  userId: string
  studentName: string
  document: string
  email: string
  departmentId: string | null
  departmentName: string
  isInterno: boolean
  testId: string
  completedAt: string
  primaryArea: string
  topCareerId: number | null
  topCareer: string
  affinity: number
  satisfaction: number | null
}

export interface AdminReportDataset {
  rows: AdminReportRow[]
  programs: AdminReportProgramOption[]
  loadedAt: string
}

export interface AdminReportStats {
  totalResults: number
  totalStudents: number
  averageAffinity: number
  topArea: string
  byArea: Array<{ name: string; count: number }>
  byCareer: Array<{ name: string; count: number; avgAffinity: number }>
  byDepartment: Array<{ name: string; count: number }>
  internos: number
  externos: number
}
