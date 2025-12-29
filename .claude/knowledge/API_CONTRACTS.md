# API Contracts

## Authentication

### Method: JWT Cookie
- **Cookie Name**: `auth-token`
- **Type**: httpOnly, Secure
- **Expiry**: 1 year
- **Payload**:
```typescript
{
  mrn: string;           // Medical Record Number
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  branchId: number;      // FertiSmart branch ID
}
```

### Additional Cookies
- **`branchAPIURL`**: Currently selected branch's API endpoint
- **`otpCode`**: Temporary OTP code during verification (5-minute expiry)

---

## Endpoints

### Authentication Endpoints

#### Send OTP
- **Method:** POST
- **Path:** `/api/send-otp`
- **Auth:** None (but requires valid MRN)
- **Request:**
```typescript
{
  mrn: string;
  purpose: string;  // e.g., "login", "booking"
}
```
- **Response:**
```typescript
{
  length: number;  // Always 4
}
```
- **Errors:** 500 if SMS fails or patient not found

---

#### Verify OTP
- **Method:** POST
- **Path:** `/api/verify-otp`
- **Auth:** None
- **Request:**
```typescript
{
  code: string;    // 4-digit code
  mrn: string;
  purpose: string;
}
```
- **Response:**
```typescript
{
  verified: boolean;
}
```
- **Side Effects:** Sets `auth-token` cookie on success
- **Errors:** 500 if OTP invalid or expired

---

#### Logout
- **Method:** POST
- **Path:** `/api/logout`
- **Auth:** Required (JWT)
- **Response:** Clears `auth-token` cookie

---

### Patient Endpoints

#### Get Current User
- **Method:** GET
- **Path:** `/api/current-user`
- **Auth:** Required (JWT)
- **Response:**
```typescript
{
  mrn: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  branchId: number;
}
```

---

#### Get Patients by Phone Number
- **Method:** GET
- **Path:** `/api/get-patients-by-phone-number?phoneNumber={phone}`
- **Auth:** None
- **Response:**
```typescript
[
  { mrn: string }
]
```

---

#### Create Patient
- **Method:** POST
- **Path:** `/api/patients`
- **Auth:** None
- **Request:**
```typescript
{
  patient: {
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber: string;
    sex?: 0 | 1;  // 0 = female, 1 = male
    dob?: string;
  };
  branchId: number;
}
```
- **Response:**
```typescript
{
  mrn: string;
}
```

---

#### Update Patient
- **Method:** PATCH
- **Path:** `/api/patients/{patientId}`
- **Auth:** Required (JWT, must match MRN)
- **Request:**
```typescript
{
  mrn: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  arabicName?: string;
  emailAddress?: string;
  identityId?: string;
  gender?: 0 | 1;
  nationalityId?: number;
  identityIdTypeId?: number;
}
```

---

### Appointment Endpoints

#### Create Appointment
- **Method:** POST
- **Path:** `/api/appointments`
- **Auth:** Required (JWT)
- **Request:**
```typescript
{
  patientMrn: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber: string;
  email?: string;
  serviceId: number;
  serviceName: string;
  statusId: number;
  statusName: string;
  branchId: number;
  resourceIds: number[];  // Doctor IDs
  description: string;    // "Virtual Visit" or custom
  startTime: string;      // ISO datetime
  endTime: string;        // ISO datetime
}
```
- **Response:**
```typescript
{
  id: number;
}
```
- **Side Effects:**
  - Creates appointment in FertiSmart
  - Stores copy in Firestore
  - Sends confirmation email with iCal
  - Sends confirmation SMS

---

#### Update Appointment
- **Method:** PATCH
- **Path:** `/api/appointments/{appointmentId}`
- **Auth:** Required (JWT)
- **Request:**
```typescript
{
  startTime?: string;
  endTime?: string;
  statusId?: number;
  statusName?: string;
  description?: string;
}
```

---

#### Get Patient Appointments
- **Method:** GET
- **Path:** `/api/get-patient-appointments`
- **Auth:** Required (JWT)
- **Response:**
```typescript
[
  {
    id: number;
    time: {
      start: string;
      end: string;
    };
    patientMrn: string;
    resources: Array<{
      id: number;
      linkedUserFullName: string;
    }>;
    service: {
      id: number;
      name: string;
    };
    description: string;
    branch: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;  // "Approved/Confirmed", "Cancelled", etc.
    };
  }
]
```

---

### Branch Endpoints

#### Get Current Branch
- **Method:** GET
- **Path:** `/api/current-branch`
- **Auth:** None
- **Response:**
```typescript
{
  branch: {
    id: string;
    name: string;
    city: string;
    address: string;
    doctors: string;
    imageSrc: string;
    contactNumber: string;
    contactEmail: string;
    locationLink: string;
    // apiUrl is intentionally excluded
  }
}
```

---

#### Switch Branch
- **Method:** POST
- **Path:** `/api/switch-branch`
- **Auth:** None
- **Request:**
```typescript
{
  branchId: string;  // e.g., "riyadh-granada", "jeddah"
}
```
- **Side Effects:** Sets `branchAPIURL` cookie

---

### Video Call Endpoints

#### Get Agora Token
- **Method:** GET
- **Path:** `/api/agora/token?appointmentId={id}&userId={mrn}`
- **Auth:** Required (appointment must exist)
- **Response:**
```typescript
{
  token: string;
  appId: string;
}
```
- **Notes:**
  - Token expires when appointment ends + 5 hours buffer
  - Channel name = appointment ID
  - User ID = patient MRN

---

### FertiSmart Proxy Endpoints

All FertiSmart API calls are proxied through `/api/ferti-smart/*`

#### Resources (Doctors)
- **Method:** GET
- **Path:** `/api/ferti-smart/resources`
- **Response:** Array of FertiSmart resources

#### Resource Availability
- **Method:** GET
- **Path:** `/api/ferti-smart/resources/{id}/availability?date={YYYY-MM-DD}&duration={minutes}`
- **Response:**
```typescript
[
  {
    start: string;  // ISO datetime
    end: string;    // ISO datetime
  }
]
```

#### Branches
- **Method:** GET
- **Path:** `/api/ferti-smart/branches`

#### API Services
- **Method:** GET
- **Path:** `/api/ferti-smart/api-services`

#### Appointment Statuses
- **Method:** GET
- **Path:** `/api/ferti-smart/appointment-statuses`

#### Countries (Nationalities)
- **Method:** GET
- **Path:** `/api/ferti-smart/countries`

#### ID Types
- **Method:** GET
- **Path:** `/api/ferti-smart/identity-id-types`

---

### Cron Endpoints

#### Rotate API Keys
- **Method:** GET
- **Path:** `/api/cron/api-key`
- **Auth:** None (should be protected in production)
- **Purpose:** Rotates FertiSmart API keys for all branches
- **Response:**
```typescript
{}
```

---

## Error Responses

All endpoints return `Response.error()` on failure, which results in:

- **Status:** 500 (or network error)
- **Body:** Empty

This is a simplified error handling approach. Errors are logged server-side but not returned to client with details.

---

## Rate Limiting

No rate limiting is implemented at the application level. Consider:
- Adding rate limiting for OTP endpoints (prevent brute force)
- Adding rate limiting for appointment creation
- FertiSmart API may have its own limits

---

## CORS Configuration

Default Next.js CORS (same-origin). API routes only accessible from the same domain.
