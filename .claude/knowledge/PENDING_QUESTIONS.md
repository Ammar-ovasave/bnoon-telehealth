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

*Add new questions below this line*
