# Project: bnoon-telehealth

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (copy from .env.example or configure)
# Required: JWT_SECRET, AGORA_APP_ID, AGORA_APP_CERTIFICATE, FIREBASE_SERVICE_ACCOUNT

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## Project Overview

### What This Project Does

Bnoon Telehealth is a patient-facing appointment booking platform for Bnoon fertility clinics in Saudi Arabia. It enables patients to:

1. **Select a clinic branch** - Choose from Riyadh (Granada), Riyadh (King Salman - coming soon), Jeddah, or Al-Ahsa
2. **Choose a fertility service** - Having a Child, General Fertility Consultation, Fertility Preservation, Gynecology & Maternity, or Andrology
3. **Select a doctor** - Browse available specialists filtered by branch and service
4. **Pick visit type** - In-clinic or virtual (video) consultation
5. **Book appointment** - Select date/time from doctor's availability
6. **Join video calls** - For virtual appointments, join via Agora-powered video calling

The platform integrates with FertiSmart (the clinic's EHR/practice management system) to sync patients, appointments, and availability data.

### Who Uses It

- **Primary Users**: Patients seeking fertility treatments or consultations
- **Target Market**: Saudi Arabia and GCC region
- **Languages**: English and Arabic (full RTL support)

### Key Business Concepts

| Term | Definition |
|:-----|:-----------|
| **Branch** | A physical clinic location (Riyadh Granada, Jeddah, Al-Ahsa) |
| **Resource** | A doctor/physician in FertiSmart system |
| **Service** | Type of consultation (e.g., "Having a Child", "Fertility Preservation") |
| **MRN** | Medical Record Number - unique patient identifier |
| **Virtual Visit** | Video consultation using Agora |
| **In-Clinic Visit** | In-person appointment at the clinic |
| **FertiSmart** | Backend EHR/PMS system that manages clinic data |
| **Time Slot** | 20-minute appointment window |

## Technical Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| Language | TypeScript | 5.x |
| Framework | Next.js | 15.5.7 |
| React | React | 19.1.2 |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI + shadcn/ui | - |
| Video Calling | Agora RTC | 2.5.0 |
| Database | Firebase Firestore | - |
| State Management | SWR | 2.3.6 |
| Internationalization | next-intl | 4.5.8 |
| Email | Nodemailer (Outlook SMTP) | 7.0.10 |
| Calendar | ical-generator | 10.0.0 |
| Date Handling | date-fns / date-fns-tz | 4.1.0 |

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── [locale]/             # Locale-prefixed routes (en, ar)
│   │   ├── page.tsx          # Home - Clinic selection
│   │   ├── interest/         # Service selection
│   │   ├── doctors/          # Doctor selection + visit type
│   │   ├── select-date-and-time/  # Date/time picker
│   │   ├── verify-phone/     # OTP verification for new patients
│   │   ├── virtual-visit-info/    # Patient info form (virtual)
│   │   ├── in-person-appointment-info/  # Patient info form (in-clinic)
│   │   ├── appointment-confirmation/    # Booking success
│   │   ├── manage-appointments/   # View/cancel appointments
│   │   ├── video-call/[appointmentId]/  # Video call pages
│   │   │   ├── prepare/      # Pre-call device check
│   │   │   └── join/         # Active video call
│   │   └── login/            # Returning patient login
│   ├── api/                  # API routes
│   │   ├── appointments/     # Create/update appointments
│   │   ├── patients/         # Patient CRUD
│   │   ├── agora/token/      # Generate Agora video tokens
│   │   ├── send-otp/         # Send SMS OTP
│   │   ├── verify-otp/       # Verify OTP
│   │   ├── ferti-smart/      # Proxy to FertiSmart API
│   │   ├── cron/api-key/     # API key rotation cron
│   │   └── ...
│   └── fonts/                # Custom fonts (Alexandria, Helvetica)
├── components/               # React components
│   ├── ui/                   # shadcn/ui base components
│   ├── ClinicCard.tsx        # Clinic branch card
│   ├── DoctorCard.tsx        # Doctor profile card
│   ├── ServiceCard.tsx       # Service option card
│   └── ...
├── firestore/                # Firebase Firestore operations
│   ├── index.ts              # Firebase initialization
│   ├── appointments.ts       # Appointment CRUD
│   └── api_keys.ts           # API key storage
├── hooks/                    # Custom React hooks (SWR-based)
│   ├── useCurrentUser.ts     # Current authenticated user
│   ├── useFertiSmartResources.ts  # Doctor/resource data
│   ├── useFertiSmartResourceAvailability.ts  # Time slots
│   └── ...
├── i18n/                     # Internationalization config
├── lib/                      # Utility functions
├── models/                   # TypeScript interfaces + static data
│   ├── DoctorModel.ts        # Doctor data (static list)
│   ├── ClinicModel.ts        # Clinic branches (static list)
│   ├── ServiceModel.ts       # Service types (static list)
│   └── FertiSmart*.ts        # API response types
├── providers/                # React context providers
├── services/                 # Business logic services
│   ├── appointment-services.ts  # Appointment operations
│   ├── axios.ts              # Configured axios instance
│   ├── templates.ts          # Email template loading
│   └── client/               # Client-side API calls
└── templates/                # HTML email templates
messages/
├── en.json                   # English translations
└── ar.json                   # Arabic translations
```

### Key Patterns

1. **Static Data for Clinics/Doctors/Services**: Core catalog data is hardcoded in TypeScript files (`models/*.ts`) rather than fetched from API. This provides fast rendering and offline-first design.

2. **Multi-Branch API Routing**: Each clinic branch has its own FertiSmart API endpoint (via ngrok). The active branch URL is stored in cookies (`branchAPIURL`) and used for all API calls.

3. **SWR for Data Fetching**: All client-side data fetching uses SWR hooks with the `/api/ferti-smart/` proxy.

4. **JWT-based Auth**: After phone OTP verification, a JWT token containing patient info is stored in an httpOnly cookie.

5. **Bilingual with RTL**: Full Arabic support with RTL layout via next-intl.

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client (SWR)  │───▶│  Next.js API     │───▶│  FertiSmart     │
│                 │◀───│  /api/ferti-smart│◀───│  (via ngrok)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Firebase        │
                       │  Firestore       │
                       └──────────────────┘
```

## Core Domains

### Clinic Management
- **Purpose:** Manage clinic branch selection and context
- **Key Entities:** `ClinicLocation`, `ClinicBranchID`
- **Key Files:** `src/models/ClinicModel.ts`, `src/hooks/useCurrentBranch.ts`
- **Cookie:** `branchAPIURL` stores the active branch's API endpoint

### Patient Identity
- **Purpose:** Handle patient registration, authentication, and profile
- **Key Entities:** `FertiSmartPatientModel`, `CurrentUserType`
- **Key Flows:**
  1. New patient: Phone verification → OTP → Create patient in FertiSmart
  2. Returning patient: Login with MRN → OTP → Authenticate
- **Auth Token:** JWT stored in `auth-token` cookie (1-year expiry)

### Appointments
- **Purpose:** Book, manage, and track appointments
- **Key Entities:** `FertiSmartAppointmentModel`, `CreateAppointmentPayload`
- **Key Flows:**
  1. Browse availability → Select slot → Submit patient info → Create appointment
  2. Notifications: Email confirmation + SMS + iCal invite
- **Storage:** Appointments mirrored to Firestore for reminders

### Video Calling
- **Purpose:** Enable virtual consultations via video
- **Integration:** Agora RTC SDK
- **Key Files:** `src/app/[locale]/video-call/`, `src/app/api/agora/token/`
- **Flow:** Patient joins channel named by appointment ID, token expires with appointment

## External Integrations

| Service | Purpose | Location | Auth |
|:--------|:--------|:---------|:-----|
| FertiSmart API | Clinic EHR/PMS | `src/services/axios.ts` | API Key (rotated) |
| Agora RTC | Video calling | `src/app/api/agora/` | App ID + Certificate |
| Firebase Firestore | Appointment storage | `src/firestore/` | Service account |
| Outlook SMTP | Email sending | `src/services/appointment-services.ts` | Username/password |
| ConnectSaudi | SMS sending | `src/services/appointment-services.ts` | Username/password |

## Development Guidelines

### Code Conventions

1. **File Naming:**
   - Components: PascalCase (`DoctorCard.tsx`)
   - Hooks: camelCase with `use` prefix (`useFertiSmartResources.ts`)
   - API routes: `route.ts` inside descriptive folders

2. **Component Structure:**
   - Use `"use client"` for interactive components
   - Server components for data fetching where possible
   - Separate `PageContent.tsx` from `page.tsx` for client components

3. **Styling:**
   - Tailwind CSS utility classes
   - RTL support via `rtl:` prefix classes
   - Dark mode support via `dark:` prefix

4. **Translations:**
   - All user-facing text in `messages/en.json` and `messages/ar.json`
   - Use `useTranslations()` hook

### Testing Requirements

Currently no test files exist. Recommended coverage:
- API routes for appointment creation
- OTP verification flow
- Video call token generation

### PR Guidelines

- Ensure both English and Arabic translations are added
- Test RTL layout for new UI components
- Verify mobile responsiveness

## Common Tasks

### Adding a New Doctor

1. Add doctor object to `src/models/DoctorModel.ts`:
```typescript
{
  id: "dr-new-doctor",
  name: "Dr. New Doctor",
  arName: "الدكتور الجديد",
  specialty: "Consultant, ...",
  photo: "/images/dr-new.jpg",
  availability: { clinic: true, virtual: true },
  languages: ["Arabic", "English"],
  branchId: "riyadh-granada",  // Must match ClinicBranchID
  services: ["having-child", "general-fertility"],  // Must match ServiceID
}
```

2. Add doctor photo to `public/images/`

### Adding a New Clinic Branch

1. Add branch to `src/models/ClinicModel.ts`:
```typescript
{
  id: "new-branch",  // ClinicBranchID
  name: "Bnoon - New Location",
  city: "City",
  address: "Address",
  doctors: "X specialists",
  imageSrc: "/images/new-branch.jpg",
  contactEmail: "info@bnoon.sa",
  contactNumber: "+9661XXXXXXXX",
  apiUrl: "https://your-ngrok-url.ngrok-free.dev",
  locationLink: "https://maps.app.goo.gl/...",
}
```

2. Add API key mapping in `src/services/axios.ts`
3. Add translations in `messages/en.json` and `messages/ar.json`

### Adding a New Service Type

1. Add to `ServiceID` type in `src/models/ServiceModel.ts`
2. Add service object to `services` array
3. Add translations
4. Update doctors' `services` arrays as needed

## Known Issues & Technical Debt

| Issue | Impact | Location | Priority |
|:------|:-------|:---------|:---------|
| Hardcoded SMTP credentials | Security risk | `appointment-services.ts:56-64` | P1 |
| Hardcoded SMS credentials | Security risk | `appointment-services.ts:176-179` | P1 |
| API keys in source code | Security risk | `axios.ts:12-16` | P1 |
| Firebase credentials in repo | Security risk | `firestore/*.json` | P1 |
| No test coverage | Quality risk | N/A | P2 |
| Static doctor/clinic data | Maintenance burden | `models/*.ts` | P3 |
| ngrok URLs for production | Reliability risk | `ClinicModel.ts` | P2 |

## Useful Commands

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# No database migrations (Firestore is schemaless)
# No test commands (tests not implemented)
```

## Environment Variables

| Variable | Purpose | Required | Default |
|:---------|:--------|:---------|:--------|
| `JWT_SECRET` | Token signing secret | Yes | - |
| `AGORA_APP_ID` | Agora application ID | Yes | - |
| `AGORA_APP_CERTIFICATE` | Agora certificate for token generation | Yes | - |
| `FIREBASE_SERVICE_ACCOUNT` | JSON string of Firebase credentials | Yes | - |
| `BASE_URL` | Base URL for FertiSmart API | No | - |
| `FERTI_SMART_API_KEY` | Default API key for FertiSmart | No | - |

## Contacts & Resources

- **Bnoon Website:** https://bnoon.sa
- **Repository:** https://github.com/Ammar-ovasave/bnoon-telehealth
- **Agora Console:** https://console.agora.io
- **Firebase Console:** https://console.firebase.google.com
