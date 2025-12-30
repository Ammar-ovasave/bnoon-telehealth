# Pending Questions for External Teams

## FertiSmart Team

### 1. How to identify completed appointments?

**Date:** 2024-12-30

**Context:**
We need to hide Reschedule and Cancel buttons for completed appointments. Currently using this logic:

```typescript
const isAppointmentCompleted = appointment.status?.name?.toLocaleLowerCase().includes("completed");
```

**Questions:**
1. What is the exact status name for completed appointments in FertiSmart?
   - Is it `"Completed"`, `"Visit Completed"`, `"Appointment Completed"`, or something else?
2. Are there multiple statuses that indicate a completed appointment?
3. Should we use exact match (`=== "Completed"`) or partial match (`.includes("completed")`)?
4. Can you provide a list of all possible appointment status names from the FertiSmart API?

**Current Implementation:**
- File: `src/app/[locale]/manage-appointments/_components/AppointmentCard.tsx`
- Uses `.includes("completed")` for flexibility but may need adjustment

**API Endpoint:**
- `GET /api/ferti-smart/appointment-statuses` - returns list of statuses

---

## Future Improvements

### 1. Unified User Account System (Branch-Independent Login)

**Date:** 2024-12-30

**Problem:**
Currently, login requires selecting a branch first because:
1. OTP sending requires MRN (patient ID from FertiSmart)
2. MRN is branch-specific (same person has different MRNs per branch)
3. To get/create MRN, we need to know which FertiSmart API to call

This creates a confusing UX: `Select Branch → Enter Phone → OTP → Verify → JWT`

**Proposed Solution:**
Store user data in Firestore independently from FertiSmart, using phone number as the unique identifier.

**Firestore Schema:**
```typescript
// Collection: users/{phoneNumber}
{
  phoneNumber: "+966501234567",
  firstName: "Ahmed",
  lastName: "Ali",
  email: "ahmed@example.com",
  defaultBranchId: "riyadh-granada",
  branchMRNs: {  // Map phone to MRN per branch
    "riyadh-granada": "MRN-12345",
    "jeddah": "MRN-67890"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**New Login Flow:**
1. User enters phone number (no branch selection needed)
2. Look up user in Firestore by phone
3. If exists: send OTP via SMS (no FertiSmart needed)
4. If not exists: create user in Firestore, then send OTP
5. Verify OTP → generate JWT → auto-set default branch cookie

**Benefits:**
- Simpler UX: `Enter Phone → OTP → Verify → JWT → Auto-set branch`
- User preferences persist across branches
- No need for "default branch" feature (branch is set from user profile)
- Can implement "remember me" and user profiles

**Implementation Steps:**
1. Create Firestore `users` collection with phone as document ID
2. Update `send-otp` route to not require FertiSmart (just send SMS)
3. Update `verify-otp` route to create/update user in Firestore
4. Update login page to not require branch selection
5. After login, set branch cookie from user's defaultBranchId
6. Sync MRNs to Firestore when user interacts with a branch

**Related Files:**
- `src/app/api/send-otp/route.ts`
- `src/app/api/verify-otp/route.ts`
- `src/components/VerifyPhoneNumberForm.tsx`
- `src/firestore/userPreferences.ts` (expand to full user collection)

---

*Add new questions below this line*
