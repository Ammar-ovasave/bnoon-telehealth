# Cronjob: Appointment Status Sync

## Overview

This document describes a future cronjob to synchronize appointment statuses between Firestore and FertiSmart. The cronjob will run daily at 12:00 AM to ensure appointment statuses in Firestore are up-to-date.

## Purpose

When appointments are created, they are stored in Firestore with their initial status. However, appointment statuses can change in FertiSmart (e.g., completed, cancelled, no-show) without Firestore being updated. This cronjob ensures Firestore reflects the current status from FertiSmart.

## Implementation Requirements

### Schedule

- **Frequency:** Daily at 12:00 AM (midnight) KSA time
- **Timezone:** Asia/Riyadh (UTC+3)

### Logic

1. **Fetch all users from Firestore** (`users` collection)
2. **For each user:**
   - Get all branch mappings (each user can have appointments at multiple branches)
   - For each branch mapping:
     - Call FertiSmart API to get patient appointments
     - Update Firestore `appointments` collection with current statuses
3. **Handle errors gracefully:**
   - Log failures per user/branch
   - Continue processing other users if one fails
   - Send alert if failure rate exceeds threshold

### Firestore Updates

For each appointment, update:
- `statusId` - FertiSmart status ID
- `statusName` - FertiSmart status name (e.g., "Completed", "Cancelled")
- `syncedAt` - Timestamp of last sync

**Note:** No deletions - appointments remain in Firestore even if cancelled.

### API Endpoint

Create new endpoint: `GET /api/cron/sync-appointment-statuses`

```typescript
// Pseudocode
export async function GET(request: Request) {
  // 1. Verify cron secret header
  // 2. Get all users with branchMappings
  // 3. For each user:
  //    - For each branch:
  //      - Fetch appointments from FertiSmart
  //      - Update Firestore statuses
  // 4. Return summary
}
```

### Security

- Protect endpoint with cron secret header
- Rate limit to prevent abuse
- Timeout handling for large datasets

### Monitoring

- Log number of appointments synced
- Log number of status changes
- Alert on high failure rate (>10%)

## Data Model

### Firestore `appointments` Collection

Existing fields used:
```typescript
{
  id: string;              // Appointment ID (document ID)
  phoneNumber: string;     // Patient phone (for querying by user)
  statusId: number;        // FertiSmart status ID
  statusName: string;      // Status display name
  startTime: string;       // Appointment timestamp
  baseAPIURL: string;      // Branch API URL
  // ... other fields
}
```

New field to add:
```typescript
{
  syncedAt?: string;       // ISO timestamp of last status sync
}
```

## Estimated Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/cron/sync-appointment-statuses/route.ts` | Cron endpoint |

### Files to Modify

| File | Changes |
|------|---------|
| `src/firestore/appointments.ts` | Add batch update function |

### Timeline

- Development: 1-2 days
- Testing: 1 day
- Total: 2-3 days

## Future Considerations

1. **Incremental sync:** Only sync appointments from last 30 days to improve performance
2. **Webhook integration:** If FertiSmart supports webhooks, use them instead of polling
3. **Real-time updates:** Consider updating status when user views appointments
4. **Batch processing:** Process users in batches to avoid timeout issues

## Status

- [ ] Not started
- [ ] In progress
- [ ] Completed

**Target Implementation:** Post-launch
