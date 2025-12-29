# Architecture Documentation

## System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Patient Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend (Next.js 15)"
        Pages[App Router Pages]
        Components[React Components]
        Hooks[SWR Hooks]
    end

    subgraph "API Layer (Next.js API Routes)"
        AuthAPI["/api/verify-otp<br>/api/send-otp"]
        AppointmentAPI["/api/appointments"]
        PatientAPI["/api/patients"]
        AgoraAPI["/api/agora/token"]
        ProxyAPI["/api/ferti-smart/*"]
        CronAPI["/api/cron/api-key"]
    end

    subgraph "External Services"
        FertiSmart[FertiSmart API<br>Clinic EHR/PMS]
        Agora[Agora RTC<br>Video Platform]
        Firebase[Firebase Firestore<br>Appointment Storage]
        SMTP[Outlook SMTP<br>Email Service]
        SMS[ConnectSaudi<br>SMS Service]
    end

    Browser --> Pages
    Mobile --> Pages
    Pages --> Hooks
    Hooks --> ProxyAPI
    Pages --> Components

    AuthAPI --> SMS
    AuthAPI --> Firebase
    AppointmentAPI --> FertiSmart
    AppointmentAPI --> Firebase
    AppointmentAPI --> SMTP
    AppointmentAPI --> SMS
    PatientAPI --> FertiSmart
    AgoraAPI --> FertiSmart
    ProxyAPI --> FertiSmart
    CronAPI --> FertiSmart
    CronAPI --> Firebase
```

## Component Breakdown

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Shell                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    NavHeader                               │  │
│  │  [Logo] [Language Toggle] [User Menu]                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Page Content                            │  │
│  │                                                            │  │
│  │  Route-specific components rendered here                   │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Toast Container                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key React Components

| Component | Purpose | Location |
|:----------|:--------|:---------|
| `ClinicCard` | Displays clinic branch info with selection | `components/ClinicCard.tsx` |
| `DoctorCard` | Shows doctor profile with availability badge | `components/DoctorCard.tsx` |
| `ServiceCard` | Service type selection card | `components/ServiceCard.tsx` |
| `VisitTypeCard` | Clinic vs Virtual visit picker | `components/VisitTypeCard.tsx` |
| `AvailabilityPicker` | Radio-style option selector | `components/AvailabilityPicker.tsx` |
| `VerifyPhoneNumberForm` | Phone + OTP verification | `components/VerifyPhoneNumberForm.tsx` |
| `ClinicBranchSelect` | Branch switcher dropdown | `components/ClinicBranchSelect.tsx` |
| `AppointmentCall` | Video call interface | `video-call/join/_components/AppointmentCall.tsx` |

### API Route Organization

```
/api
├── appointments/
│   ├── route.ts           # POST: Create appointment
│   └── [appointmentId]/
│       └── route.ts       # PATCH: Update appointment
├── patients/
│   ├── route.ts           # POST: Create patient
│   └── [patientId]/
│       └── route.ts       # PATCH: Update patient
├── agora/
│   └── token/
│       └── route.ts       # GET: Generate Agora token
├── ferti-smart/
│   └── [...api]/
│       └── route.ts       # Proxy: GET/POST/PATCH to FertiSmart
├── send-otp/
│   └── route.ts           # POST: Send OTP via SMS
├── verify-otp/
│   └── route.ts           # POST: Verify OTP code
├── current-user/
│   └── route.ts           # GET: Get current user from JWT
├── current-branch/
│   └── route.ts           # GET: Get current branch from cookie
├── switch-branch/
│   └── route.ts           # POST: Change active branch
├── cron/
│   └── api-key/
│       └── route.ts       # GET: Rotate FertiSmart API keys
└── logout/
    └── route.ts           # POST: Clear auth cookie
```

## Data Flow

### Appointment Booking Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant A as API Routes
    participant FS as FertiSmart
    participant FB as Firestore
    participant E as Email/SMS

    P->>F: Select clinic branch
    F->>F: Store branchAPIURL cookie

    P->>F: Select service
    P->>F: Select doctor
    F->>A: GET /api/ferti-smart/resources
    A->>FS: GET /resources
    FS-->>A: Resource list
    A-->>F: Doctors available

    P->>F: Select visit type (clinic/virtual)
    P->>F: Select date
    F->>A: GET /api/ferti-smart/resources/{id}/availability
    A->>FS: GET /resources/{id}/availability
    FS-->>A: Time slots
    A-->>F: Available slots

    P->>F: Select time slot
    P->>F: Enter patient info
    F->>A: POST /api/appointments
    A->>FS: GET /patients/{mrn}

    alt New Patient
        A->>FS: POST /patients
        FS-->>A: Created patient
    end

    A->>FS: POST /appointments
    FS-->>A: Created appointment
    A->>FB: Store appointment copy
    A->>E: Send confirmation email + SMS
    A-->>F: Appointment ID
    F->>P: Show confirmation page
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant A as API Routes
    participant FS as FertiSmart
    participant SMS as SMS Service

    P->>F: Enter phone number
    F->>A: GET /api/ferti-smart/patients?contactNumber=X
    A->>FS: GET /patients?contactNumber=X
    FS-->>A: Patient list
    A-->>F: Patient MRNs

    alt Existing Patient
        P->>F: Select patient profile
    else New Patient
        P->>F: Fill new patient form
    end

    P->>F: Request OTP
    F->>A: POST /api/send-otp
    A->>A: Generate 4-digit code
    A->>SMS: Send OTP via SMS
    A->>A: Store OTP in httpOnly cookie
    A-->>F: OTP length (4)

    P->>F: Enter OTP
    F->>A: POST /api/verify-otp
    A->>A: Compare with stored OTP

    alt Valid OTP
        A->>FS: GET /patients/{mrn}
        A->>A: Sign JWT with patient data
        A->>A: Set auth-token cookie
        A-->>F: Success
        F->>P: Proceed to booking
    else Invalid OTP
        A-->>F: Error
        F->>P: Show error, retry
    end
```

### Video Call Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant D as Doctor
    participant F as Frontend
    participant A as API
    participant AG as Agora

    P->>F: Open /video-call/{id}/prepare
    F->>A: GET /api/current-user
    A-->>F: User info (MRN)
    F->>P: Show device permissions check

    P->>F: Grant camera/mic permissions
    F->>A: GET /api/agora/token?appointmentId={id}&userId={mrn}
    A->>A: Validate appointment time
    A->>A: Generate Agora token
    A-->>F: {token, appId}

    P->>F: Click "Join Call"
    F->>AG: Join channel (appointmentId)
    AG-->>F: Connected

    D->>AG: Join same channel
    AG->>F: Remote user joined
    F->>P: Show doctor's video

    Note over P,D: Video consultation in progress

    P->>F: End call
    F->>AG: Leave channel
    F->>P: Redirect to manage-appointments
```

## Scaling Considerations

### Current Limitations

1. **Static Data Model**: Doctors, clinics, and services are hardcoded. Adding/modifying requires code deployment.

2. **ngrok Tunnels**: FertiSmart APIs are accessed via ngrok URLs, which:
   - May have rate limits
   - URLs can change
   - Single point of failure per branch

3. **Single Server**: No horizontal scaling strategy. Stateless design allows for it, but no infrastructure in place.

4. **Cookie-based Branch Selection**: Branch context stored in cookie limits cross-branch operations.

### Scaling Recommendations

1. **Move Static Data to Database**: Store doctors, clinics, services in Firestore with admin UI for management.

2. **Dedicated API Gateway**: Replace ngrok with proper API gateway (Azure API Management, Kong, etc.)

3. **Implement Caching**:
   - Cache doctor availability with short TTL
   - Cache clinic/doctor metadata with longer TTL
   - Use SWR's built-in caching more aggressively

4. **Message Queue for Notifications**: Move email/SMS sending to background queue (Bull, SQS) to avoid blocking appointment creation.

5. **CDN for Static Assets**: Images are in `/public`, should be served via CDN in production.

## Security Architecture

### Authentication

- **Method**: Phone OTP + JWT
- **Token Storage**: `auth-token` httpOnly cookie (1-year expiry)
- **Token Payload**: MRN, name, phone, email, branchId
- **No Refresh Token**: Users re-authenticate if token expires

### Authorization

- **Patient-only Access**: All endpoints validate JWT
- **No Role-based Access**: Single patient role
- **Branch Isolation**: Patients can only access their registered branch's data

### API Security

- **FertiSmart**: Rotating API keys stored in Firestore
- **Agora**: Tokens scoped to specific appointment channel
- **CORS**: Next.js default (same-origin)

### Data Protection

- **HTTPS Only**: Enforced via Vercel deployment
- **No PII Logging**: Avoid logging patient data
- **Firestore Rules**: Should restrict to authenticated users (verify configuration)
