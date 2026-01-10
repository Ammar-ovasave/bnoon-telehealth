/**
 * TypeScript types for bnoon-api responses
 */

// ============================================
// Auth Types
// ============================================

export interface SendOtpRequest {
  phone: string;
  purpose?: 'login' | 'verify';
}

export interface SendOtpResponse {
  success: boolean;
  length: number;
  phone: string;
  sessionId?: string;
  alreadyVerified?: boolean;
  isAuthenticated?: boolean;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  preferredLanguage?: 'ar' | 'en';
}

export interface UserResponse {
  id: string;
  phone: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  sex: 0 | 1 | null;
  dob: string | null;
  nationality: number | null;
  identityIdType: number | null;
  identityId: string | null;
  preferredLanguage: 'ar' | 'en';
  alahsaMRN: string | null;
  jeddahMRN: string | null;
  riyadhGranadaMRN: string | null;
  riyadhKingSalmanMRN: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface VerifyOtpResponse {
  success: boolean;
  isNew: boolean;
  isProfileComplete: boolean;
  token: string | null; // null for new guests (user not created yet)
  sessionId?: string; // For new guests - use in complete-registration
  user: UserResponse | null; // null for new guests
}

// ============================================
// Session Status Types
// ============================================

export interface SessionStatusAuthData {
  isNew: boolean;
  isProfileComplete: boolean;
  token: string | null;
  sessionId: string;
  user: UserResponse | null;
}

export interface SessionStatusResponse {
  hasSession: boolean;
  phone: string | null;
  isPhoneVerified: boolean;
  preferredLanguage: 'ar' | 'en' | null;
  expiresAt: string | null;
  auth?: SessionStatusAuthData;
}

// ============================================
// Complete Registration Types (for new guests)
// ============================================

export interface CompleteRegistrationRequest {
  sessionId: string;
  fullName: string;
  email?: string;
  preferredLanguage?: 'ar' | 'en';
}

export interface CompleteRegistrationResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}

// ============================================
// User Types
// ============================================

export interface GetUserResponse {
  success: boolean;
  user: UserResponse;
}

export interface UpdateUserRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailAddress?: string;
  sex?: 0 | 1;
  dob?: string;
  nationality?: number;
  identityIdType?: number;
  identityId?: string;
  preferredLanguage?: 'ar' | 'en';
}

export interface UpdateUserResponse {
  success: boolean;
  user: {
    id: string;
    phone: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    emailAddress: string | null;
    sex: 0 | 1 | null;
    dob: string | null;
    nationality: number | null;
    identityIdType: number | null;
    identityId: string | null;
    preferredLanguage: 'ar' | 'en';
  };
}

export interface NearestAppointmentResponse {
  success: boolean;
  hasUpcomingAppointment: boolean;
  nearestAppointment: {
    branchId: string;
    branchName: string;
    appointmentId: number;
    startTime: string;
    endTime: string;
    doctorName: string;
    serviceName: string | null;
    status: string;
    visitType: 'virtual' | 'in-person';
  } | null;
}

// ============================================
// FertiSmart Types
// ============================================

export type BranchId = 'riyadh-granada' | 'riyadh-king-salman' | 'jeddah' | 'al-ahsa';

export interface BranchDto {
  branchId: BranchId;
  name: string;
  location: string;
  imageUrl: string;
  available: boolean;
}

export interface GetBranchesResponse {
  success: boolean;
  branches: BranchDto[];
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  durationInMinutes: number;
  noBookingBefore: string;
  price: number;
  currency: string;
  code: string;
  active: boolean;
  displayOrder: number;
  iconUrl: string | null;
}

export interface GetServicesResponse {
  success: boolean;
  branchId: BranchId;
  services: ServiceDto[];
}

export interface DoctorDto {
  id: number;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
  displayOrder: number;
  supportsVirtual: boolean;
}

export interface GetDoctorsResponse {
  success: boolean;
  branchId: BranchId;
  serviceId: string;
  doctors: DoctorDto[];
}

export interface GetDoctorByResourceIdResponse {
  success: boolean;
  branchId: BranchId;
  resourceId: number;
  doctor: DoctorDto;
}

export interface TimeSlotDto {
  start: string;
  end: string;
}

export interface GetAvailabilityResponse {
  success: boolean;
  branchId: BranchId;
  resourceId: number;
  date: string;
  serviceDuration: number;
  slots: TimeSlotDto[];
}

// ============================================
// Appointment Types
// ============================================

export interface CreateAppointmentRequest {
  branchId: string;
  serviceId: number;
  resourceId: number;
  startTime: string;
  endTime: string;
  visitType: 'virtual' | 'in-person';
  fullName?: string;
  email?: string;
  sex?: 0 | 1;
  dob?: string;
  nationalityId?: number;
  identityIdType?: number;
  identityId?: string;
}

/**
 * Appointment DTO for list endpoint (GET /appointments/:branchId)
 * Sourced from FertiSmart API - no local MySQL UUID
 */
export interface AppointmentDto {
  appointmentId: number; // FertiSmart appointment ID
  branchId: string;
  branchName: string;
  startTime: string;
  endTime: string;
  doctorName: string;
  serviceName: string | null;
  resourceId: number; // Doctor's FertiSmart resource ID
  status: string;
  statusName: string;
  visitType: 'virtual' | 'in-person';
}

/**
 * Appointment DTO for create response (POST /appointments)
 * Includes local MySQL UUID for confirmation page
 */
export interface CreatedAppointmentDto extends AppointmentDto {
  id: string; // Local MySQL UUID
}

export interface CreateAppointmentResponse {
  success: boolean;
  appointment: CreatedAppointmentDto;
}

export interface GetAppointmentsResponse {
  success: boolean;
  branchId: string;
  appointments: AppointmentDto[];
}

export interface RescheduleAppointmentRequest {
  startTime: string;
  endTime: string;
}

/**
 * Appointment DTO with id for reschedule/cancel responses
 * These operate on local DB records which have MySQL UUID
 */
export interface AppointmentWithIdDto extends AppointmentDto {
  id: string; // Local MySQL UUID
}

export interface RescheduleAppointmentResponse {
  success: boolean;
  appointment: AppointmentWithIdDto;
}

export interface CancelAppointmentResponse {
  success: boolean;
  appointment: AppointmentWithIdDto;
}

/**
 * Extended appointment DTO with doctor details for single appointment fetch
 * Includes id since it's fetched from local DB by UUID
 */
export interface AppointmentDetailDto extends AppointmentDto {
  id: string; // Local MySQL UUID
  resourceId: number;
  doctorPhotoUrl: string | null;
  doctorSpecialty: string | null;
}

/**
 * Response for GET /appointments/detail/:uuid
 */
export interface GetAppointmentDetailResponse {
  success: boolean;
  appointment: AppointmentDetailDto;
  statusSynced: boolean; // true if status was updated from FertiSmart
}

// ============================================
// Definition Types (Countries, ID Types)
// ============================================

export interface DefinitionItemDto {
  id: number;
  name: string;
}

export interface GetCountriesResponse {
  success: boolean;
  countries: DefinitionItemDto[];
}

export interface GetIdTypesResponse {
  success: boolean;
  idTypes: DefinitionItemDto[];
}

// ============================================
// Payment Types
// ============================================

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';

export interface PendingAppointmentData {
  branchId: string;
  branchName?: string;
  serviceId: number;
  serviceName?: string;
  resourceId: number;
  doctorName?: string;
  startTime: string;
  endTime: string;
  visitType: 'virtual' | 'in-person';
  fullName: string;
  email: string;
  phoneNumber: string;
  sex?: 0 | 1;
  dob?: string;
  nationalityId?: number;
  identityIdType?: number;
  identityId?: string;
}

export interface CreatePaymentRequest {
  merchantReference: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  appointmentData: PendingAppointmentData;
}

export interface PaymentDto {
  id: number;
  merchantReference: string;
  fortId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  appointmentId: number | null;
  appointmentData: PendingAppointmentData;
  responseCode: string | null;
  responseMessage: string | null;
  apsResponse: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentResponse {
  id: number;
  merchantReference: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  fortId?: string;
  responseCode?: string;
  responseMessage?: string;
  apsResponse?: Record<string, string>;
  appointmentId?: number;
}

export interface UpdatePaymentStatusResponse {
  id: number;
  merchantReference: string;
  status: PaymentStatus;
  appointmentId: number | null;
  updatedAt: string;
}

// ============================================
// Token Introspection Types (RFC 7662)
// ============================================

export interface IntrospectTokenRequest {
  token: string;
}

/**
 * Token introspection response
 * Based on OAuth2 Token Introspection (RFC 7662)
 */
export interface IntrospectTokenResponse {
  /**
   * Whether the token is active (valid and not expired)
   */
  active: boolean;

  /**
   * Reason for inactive token (only present when active=false)
   */
  reason?: 'expired' | 'invalid' | 'malformed';

  /**
   * User type: 'user' for patients, 'admin' for admin users
   */
  userType?: 'user' | 'admin';

  /**
   * Subject identifier (phone for users, email for admins)
   */
  sub?: string;

  /**
   * Token expiration timestamp (Unix epoch seconds)
   * null for patient tokens that never expire
   */
  exp?: number | null;

  /**
   * Token issued at timestamp (Unix epoch seconds)
   */
  iat?: number;

  // User-specific fields (when userType === 'user')
  userId?: number;
  phone?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
  sex?: 0 | 1 | null;

  // Admin-specific fields (when userType === 'admin')
  adminId?: number;
  email?: string;
  isAdmin?: boolean;
}
