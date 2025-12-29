# Testing Guide

## Current State

**No automated tests exist in this codebase.** This document outlines recommended testing strategies for future implementation.

## Test Structure (Recommended)

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── appointment-services.test.ts
│   │   ├── signJwt.test.ts
│   │   └── templates.test.ts
│   ├── hooks/
│   │   └── useCurrentUser.test.ts
│   └── lib/
│       └── utils.test.ts
├── integration/
│   ├── api/
│   │   ├── appointments.test.ts
│   │   ├── verify-otp.test.ts
│   │   └── agora-token.test.ts
│   └── firestore/
│       └── appointments.test.ts
└── e2e/
    ├── booking-flow.spec.ts
    ├── login-flow.spec.ts
    └── video-call.spec.ts
```

## Running Tests

```bash
# Install test dependencies (to be added)
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test  # For E2E

# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## Writing Tests

### Unit Tests

**Service Functions:**
```typescript
// __tests__/unit/services/signJwt.test.ts
import { signJwt } from '@/services/signJwt';
import jwt from 'jsonwebtoken';

describe('signJwt', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should create valid JWT with patient data', () => {
    const payload = {
      mrn: '12345',
      firstName: 'John',
      middleName: '',
      lastName: 'Doe',
      contactNumber: '+966501234567',
      emailAddress: 'john@example.com',
      branchId: 1,
    };

    const token = signJwt(payload);
    const decoded = jwt.verify(token, 'test-secret');

    expect(decoded).toMatchObject(payload);
  });

  it('should expire after default duration', () => {
    const payload = { mrn: '12345', /* ... */ };
    const token = signJwt(payload);
    const decoded = jwt.decode(token) as { exp: number; iat: number };

    const expectedExpiry = 60 * 60 * 24 * 365; // 1 year
    expect(decoded.exp - decoded.iat).toBe(expectedExpiry);
  });
});
```

**Template Loading:**
```typescript
// __tests__/unit/services/templates.test.ts
import { getConfirmAppointmentEmail } from '@/services/templates';

describe('getConfirmAppointmentEmail', () => {
  it('should replace all placeholders', async () => {
    const params = {
      appointmentDate: '01-01-2025',
      appointmentTime: '10:00 AM',
      doctorName: 'Dr. Test',
      location: 'Virtual Visit',
      serviceName: 'Consultation',
      patientName: 'John Doe',
      patientEmail: 'john@test.com',
      patientGender: 'male',
      appointmentLink: 'https://test.com/join',
      clinicName: 'Bnoon Test',
      isVirtual: true,
    };

    const html = await getConfirmAppointmentEmail(params);

    expect(html).toContain('01-01-2025');
    expect(html).toContain('Dr. Test');
    expect(html).toContain('John Doe');
    expect(html).not.toContain('{{');  // No unreplaced placeholders
  });

  it('should load Arabic template when locale is ar', async () => {
    const params = { /* ... */ locale: 'ar' };
    const html = await getConfirmAppointmentEmail(params);

    // Check for RTL direction or Arabic content markers
    expect(html).toContain('dir="rtl"');
  });
});
```

### Integration Tests

**API Route Testing:**
```typescript
// __tests__/integration/api/verify-otp.test.ts
import { POST } from '@/app/api/verify-otp/route';
import { cookies } from 'next/headers';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('POST /api/verify-otp', () => {
  it('should return verified: true for correct OTP', async () => {
    const mockCookies = {
      get: jest.fn((name) => {
        if (name === 'otpCode') return { value: '1234' };
        if (name === 'branchAPIURL') return { value: 'https://test.api' };
      }),
      set: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookies);

    const request = new Request('http://localhost/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        code: '1234',
        mrn: 'TEST123',
        purpose: 'login',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.verified).toBe(true);
  });

  it('should return error for incorrect OTP', async () => {
    const mockCookies = {
      get: jest.fn((name) => {
        if (name === 'otpCode') return { value: '1234' };
      }),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookies);

    const request = new Request('http://localhost/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        code: '9999',  // Wrong code
        mrn: 'TEST123',
        purpose: 'login',
      }),
    });

    const response = await POST(request);
    expect(response.ok).toBe(false);
  });
});
```

**Firestore Integration:**
```typescript
// __tests__/integration/firestore/appointments.test.ts
import { createNewAppointmentDB, getAppointmentsForReminder } from '@/firestore/appointments';

describe('Firestore Appointments', () => {
  // Use Firebase emulator for testing
  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  });

  it('should create and retrieve appointment', async () => {
    const appointment = {
      id: 'test-123',
      patientMrn: 'MRN001',
      startTime: '2025-01-01T10:00:00Z',
      endTime: '2025-01-01T10:20:00Z',
      statusName: 'Approved/Confirmed',
      // ... other fields
    };

    await createNewAppointmentDB(appointment);

    const results = await getAppointmentsForReminder({
      startTimeFrom: '2025-01-01T00:00:00Z',
      startTimeTo: '2025-01-01T23:59:59Z',
    });

    expect(results).toContainEqual(expect.objectContaining({ id: 'test-123' }));
  });
});
```

### E2E Tests (Playwright)

**Booking Flow:**
```typescript
// __tests__/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Appointment Booking', () => {
  test('should complete booking flow for new patient', async ({ page }) => {
    // 1. Select clinic
    await page.goto('/');
    await page.click('[data-testid="clinic-riyadh-granada"]');

    // 2. Select service
    await expect(page).toHaveURL(/.*interest/);
    await page.click('[data-testid="service-having-child"]');

    // 3. Select doctor and visit type
    await expect(page).toHaveURL(/.*doctors/);
    await page.click('[data-testid="visit-type-virtual"]');
    await page.click('[data-testid="doctor-dr-fawaz-edris"]');

    // 4. Select date and time
    await expect(page).toHaveURL(/.*select-date-and-time/);
    await page.click('[data-testid="date-2025-01-15"]');
    await page.click('[data-testid="timeslot-10:00"]');
    await page.click('button:has-text("Continue")');

    // 5. Phone verification
    await expect(page).toHaveURL(/.*verify-phone/);
    await page.fill('[data-testid="phone-input"]', '501234567');
    await page.click('button:has-text("Send OTP")');

    // Mock OTP input (in real test, intercept SMS or use test number)
    await page.fill('[data-testid="otp-input"]', '1234');
    await page.click('button:has-text("Verify")');

    // 6. Patient info
    await expect(page).toHaveURL(/.*virtual-visit-info/);
    await page.fill('[name="fullName"]', 'Test Patient');
    await page.fill('[name="email"]', 'test@example.com');
    await page.selectOption('[name="nationality"]', 'Saudi Arabia');
    await page.click('[data-testid="gender-male"]');
    await page.fill('[name="idNumber"]', '1234567890');
    await page.click('button:has-text("Confirm")');

    // 7. Confirmation
    await expect(page).toHaveURL(/.*appointment-confirmation/);
    await expect(page.locator('h1')).toContainText('Appointment Confirmed');
  });
});
```

## Mocking

### Mock FertiSmart API

```typescript
// __mocks__/services/axios.ts
export default {
  get: jest.fn((url) => {
    if (url.includes('/resources')) {
      return Promise.resolve({
        data: [
          { id: 1, linkedUserFullName: 'Dr. Test Doctor' },
        ],
      });
    }
    if (url.includes('/availability')) {
      return Promise.resolve({
        data: [
          { start: '2025-01-15T10:00:00Z', end: '2025-01-15T10:20:00Z' },
        ],
      });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: { id: 123 } })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
};
```

### Mock Firebase

```typescript
// __mocks__/firestore/index.ts
export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve({ data: () => ({}) })),
    })),
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ forEach: jest.fn() })),
      })),
    })),
  })),
};
```

### Mock Agora

```typescript
// __mocks__/agora-rtc-react.ts
export const useJoin = jest.fn();
export const usePublish = jest.fn();
export const useRemoteUsers = jest.fn(() => []);
export const useRTCClient = jest.fn(() => ({
  on: jest.fn(),
  off: jest.fn(),
}));
export const useLocalCameraTrack = jest.fn(() => ({ localCameraTrack: null }));
export const useLocalMicrophoneTrack = jest.fn(() => ({ localMicrophoneTrack: null }));
```

## Fixtures

### Test Data Patterns

```typescript
// __fixtures__/patients.ts
export const testPatient = {
  mrn: 'TEST-MRN-001',
  firstName: 'Test',
  middleName: 'Middle',
  lastName: 'Patient',
  contactNumber: '+966501234567',
  emailAddress: 'test@example.com',
  sex: 1,
  branchId: 1,
};

// __fixtures__/appointments.ts
export const testAppointment = {
  id: 'test-apt-001',
  patientMrn: 'TEST-MRN-001',
  serviceId: 1,
  serviceName: 'General Consultation',
  statusId: 1,
  statusName: 'Approved/Confirmed',
  branchId: 1,
  resourceIds: [1],
  description: 'Virtual Visit',
  startTime: '2025-01-15T10:00:00Z',
  endTime: '2025-01-15T10:20:00Z',
};
```

## Coverage Goals

| Area | Target | Priority |
|:-----|:-------|:---------|
| API Routes | 80% | High |
| Services (business logic) | 90% | High |
| Hooks | 70% | Medium |
| Components | 60% | Medium |
| E2E Critical Paths | 3-5 flows | High |

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```
