# Business Context

## Problem Statement

Bnoon fertility clinics needed a digital patient booking system that:

1. **Enables online appointment booking** - Patients can self-schedule without calling the clinic
2. **Supports multiple clinic branches** - Unified experience across Riyadh, Jeddah, and Al-Ahsa locations
3. **Provides virtual consultations** - Post-COVID demand for telemedicine options
4. **Serves Arabic-speaking patients** - Native Arabic experience with RTL support
5. **Integrates with existing EHR** - Syncs with FertiSmart practice management system

## User Personas

### Primary: Prospective Patient
- **Demographics**: Adults (primarily women 25-45) seeking fertility treatments
- **Goals**: Book appointment with minimal friction, choose convenient time, select preferred doctor
- **Pain Points**: Long phone wait times, limited clinic hours for booking, language barriers
- **Technical Comfort**: Moderate - comfortable with web/mobile apps

### Secondary: Existing Patient
- **Context**: Already has MRN in FertiSmart system
- **Goals**: Manage existing appointments, book follow-ups, join virtual consultations
- **Expectations**: Recognize their profile, show appointment history

### Tertiary: Male Partner
- **Context**: Seeking andrology services or accompanying partner
- **Goals**: Book male-specific consultations (andrology)
- **Notes**: System supports male patients via specific service category

## Core Workflows

### 1. New Patient Booking (Happy Path)

```
1. Land on homepage
2. Select nearest clinic branch (Riyadh, Jeddah, Al-Ahsa)
3. Browse fertility services (Having a Child, Preservation, etc.)
4. Select desired service
5. View available doctors for that service at selected branch
6. Choose between clinic visit or virtual visit
7. Select a doctor
8. Pick available date and time slot
9. Enter phone number (new patient flow)
10. Receive and enter OTP
11. Fill patient information form
12. Confirm appointment
13. Receive email + SMS confirmation with iCal invite
```

### 2. Returning Patient Booking

```
1. Land on homepage
2. Click "Login" / "Manage Appointments"
3. Select clinic branch
4. Enter phone number
5. Select existing patient profile (by MRN)
6. Receive and enter OTP
7. View existing appointments OR book new one
8. Follow booking flow (steps 3-12 from new patient)
```

### 3. Virtual Consultation

```
1. Receive email/SMS reminder before appointment
2. Click appointment link
3. Land on /video-call/{appointmentId}/prepare
4. Grant camera/microphone permissions
5. Click "Join Call"
6. Wait for doctor to join
7. Complete consultation
8. End call
9. Redirect to appointment management
```

### 4. Appointment Cancellation

```
1. Open /manage-appointments
2. Find appointment card
3. Click "Cancel Appointment"
4. Confirm cancellation
5. Receive cancellation confirmation email
6. Appointment marked as cancelled in FertiSmart
```

### 5. Appointment Rescheduling

```
1. Open /manage-appointments
2. Find appointment card
3. Click "Reschedule"
4. Select new date and time
5. Confirm change
6. Receive updated email with new iCal invite
```

## Business Rules

### Appointment Scheduling

| Rule | Implementation |
|:-----|:---------------|
| Appointment duration | Fixed at 20 minutes (`VISIT_DURATION_IN_MINUTES`) |
| Booking window | 1 day ahead to 6 months in future |
| Time zone | All times in KSA timezone (Asia/Riyadh) |
| Double-booking | Prevented by FertiSmart availability check |

### Patient Identity

| Rule | Implementation |
|:-----|:---------------|
| Unique identifier | Phone number + MRN |
| New patient creation | Auto-created in FertiSmart if phone not found |
| ID validation (Saudi) | National ID must start with "1", be 10 digits |
| ID validation (Expat) | Iqama must start with "2", be 10 digits |
| Gender options | Male or Female only |

### Doctor Assignment

| Rule | Implementation |
|:-----|:---------------|
| Service matching | Doctors only shown for their assigned services |
| Branch filtering | Doctors only shown for their assigned branch |
| Virtual availability | Some doctors only offer clinic visits (e.g., Dr. Abdulaziz) |

### Notifications

| Event | Email | SMS | Calendar |
|:------|:------|:----|:---------|
| Appointment confirmed | Yes | Yes | iCal attached |
| Appointment rescheduled | Yes | Yes | Updated iCal |
| Appointment cancelled | Yes | No | Cancelled event |
| Reminder (1 day before) | Planned | Planned | - |

### OTP Authentication

| Rule | Implementation |
|:-----|:---------------|
| OTP length | 4 digits |
| OTP expiry | 5 minutes |
| Delivery method | SMS via ConnectSaudi |
| Retry limit | Not enforced (potential issue) |

## Glossary

| Term | Arabic | Definition |
|:-----|:-------|:-----------|
| Bnoon | بنون | Brand name (Arabic for "sons/children") |
| FertiSmart | - | Backend EHR/practice management system |
| MRN | - | Medical Record Number, unique patient ID |
| Iqama | إقامة | Saudi residence permit number (for non-Saudis) |
| Virtual Visit | زيارة افتراضية | Video consultation |
| In-Clinic Visit | زيارة في العيادة | In-person appointment |
| Resource | - | FertiSmart term for doctor/healthcare provider |
| Branch | فرع | Clinic location |
| Andrology | أمراض الذكورة | Male fertility/urology specialty |
| IVF | أطفال الأنابيب | In-vitro fertilization |

## Service Categories

### 1. Having a Child (الحمل وإنجاب الأطفال)
Primary infertility treatments, IVF, family planning

### 2. General Fertility Consultation (استشارة الخصوبة العامة)
Initial assessments, fertility testing, general consultation

### 3. Fertility Preservation (حفظ الخصوبة)
Egg freezing, sperm banking, fertility preservation before treatment

### 4. Gynecology and Maternity Services (أمراض النساء وخدمات الأمومة)
Prenatal care, postnatal care, general gynecology

### 5. Andrology and Male Problems (أمراض الذكورة ومشاكل الرجال)
Male infertility, urological issues, hormonal treatment

## Clinic Branches

| Branch | City | Status | Doctors |
|:-------|:-----|:-------|:--------|
| Riyadh Granada | Riyadh | Active | 6 |
| Riyadh King Salman | Riyadh | Coming Soon | 0 |
| Jeddah | Jeddah | Active | 6 |
| Al-Ahsa | Al-Ahsa | Active | 4 |

## Revenue Model

- **Consultation Fees**: Patients pay for appointments (handled outside this system)
- **No Online Payment**: Payment collected at clinic or via separate billing
- **Virtual vs In-Clinic**: Same booking flow, pricing may differ (handled by clinic)

## Compliance Considerations

- **HIPAA-like Requirements**: Saudi Arabia has healthcare data regulations
- **Data Residency**: Patient data in Firebase (US-hosted) - may need review
- **SMS Consent**: Implied consent via phone number submission
- **Video Call Recording**: Not implemented (Agora supports it if needed)
