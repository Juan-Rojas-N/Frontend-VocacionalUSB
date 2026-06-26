export type UserRole = 'student' | 'admin'

export type GenderOption =
  | 'Masculino'
  | 'Femenino'
  | 'Prefiero no decirlo'
  | 'Otro'

export type VocationalArea =
  | 'Ingeniería y tecnología'
  | 'Salud y bienestar'
  | 'Negocios y gestión'
  | 'Ciencias sociales'
  | 'Arte y comunicación'

export interface ApiEnvelope<T> {
  data: T
  endpoint: string
  mocked: boolean
  message?: string
  requestedAt: string
}

export interface LoginPayload {
  email: string
  password: string
  isAdultConfirmed: boolean
}

export interface RecoverPasswordPayload {
  email: string
  document?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  document: string
  age: number
  email: string
  phone: string
  department: string
  city: string
  gender: GenderOption
  genderOther?: string
  belongsToUniversity: boolean
  currentCareer?: string
  currentSemester?: string
  dataConsent: boolean
  password: string
}

export interface UserProfile {
  id: string
  role: UserRole
  fullName: string
  firstName: string
  lastName: string
  document: string
  age: number
  email: string
  phone: string
  department: string
  city: string
  gender: GenderOption
  genderOther?: string
  belongsToUniversity: boolean
  currentCareer?: string
  currentSemester?: string
  dataConsent: boolean
  createdAt: string
}

export interface RegisteredUserRecord extends UserProfile {
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
}

export interface CareerRecommendation {
  id: string
  name: string
  affinity: number
  area: VocationalArea
  summary: string
  rationale: string[]
}

export interface ChartDatum {
  label: string
  value: number
}

export interface RadarDatum {
  subject: string
  score: number
  fullMark: number
}

export interface VocationalResult {
  id: string
  generatedAt: string
  primaryArea: VocationalArea
  qualitativeSummary: string
  careers: CareerRecommendation[]
  affinityByArea: ChartDatum[]
  radarProfile: RadarDatum[]
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
}
