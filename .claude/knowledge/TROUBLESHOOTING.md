# Troubleshooting Guide

## Common Errors

### FertiSmart API Connection Failed

**Symptoms:**
- "Response.error()" responses from API routes
- Console shows: `--- get ferti smart error`
- Doctor list or availability not loading

**Cause:**
- ngrok tunnel for FertiSmart API is down or URL changed
- API key expired or invalid
- FertiSmart server is down

**Solution:**
1. Check if ngrok tunnels are running for each branch
2. Verify API URLs in `src/models/ClinicModel.ts`
3. Check `src/services/axios.ts` for API key mapping
4. Try manual curl to FertiSmart endpoint:
   ```bash
   curl -H "x-api-key: YOUR_KEY" https://your-ngrok-url.ngrok-free.dev/resources
   ```
5. If keys expired, run API key rotation:
   ```bash
   curl http://localhost:3000/api/cron/api-key
   ```

---

### OTP Not Received

**Symptoms:**
- Patient doesn't receive SMS after requesting OTP
- Console shows: `--- sendSMS error`

**Cause:**
- ConnectSaudi SMS service issue
- Phone number format incorrect
- SMS quota exceeded

**Solution:**
1. Verify phone number format (should be +966XXXXXXXXX or 05XXXXXXXX)
2. Check ConnectSaudi dashboard for delivery status
3. Verify credentials in `src/services/appointment-services.ts`:
   ```typescript
   user: "bnoontrc",
   pwd: "xxx",
   senderid: "BNOON",
   ```
4. Test with a different phone number
5. Check if SMS provider is blocking due to rate limiting

---

### OTP Verification Fails

**Symptoms:**
- "Error verifying OTP" message
- Console shows: `--- verify otp error response`

**Cause:**
- OTP expired (5-minute window)
- OTP cookie not set properly
- Typo in entered code

**Solution:**
1. Check if `otpCode` cookie exists in browser dev tools
2. Verify code within 5 minutes of request
3. Check if httpOnly cookie is being sent with request
4. Try clearing cookies and requesting new OTP

---

### Video Call Not Connecting

**Symptoms:**
- "Agora exception" in console
- Video/audio not working
- Remote user not visible

**Cause:**
- Agora token expired
- Camera/mic permissions denied
- Appointment time window passed

**Solution:**
1. Check browser permissions for camera/microphone
2. Verify appointment hasn't ended (token expires with appointment + 5 hours)
3. Check Agora console for usage/quota issues
4. Verify `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` env vars
5. Try refreshing the page to get new token
6. Check browser console for specific Agora error codes

**Common Agora Error Codes:**
| Code | Meaning | Fix |
|:-----|:--------|:----|
| `INVALID_TOKEN` | Token expired or wrong channel | Refresh page |
| `NO_DEVICE_FOUND` | Camera/mic not accessible | Check permissions |
| `CONNECTION_STATE_FAILED` | Network issue | Check internet connection |

---

### Email Not Received

**Symptoms:**
- Confirmation email not arriving
- Console shows: `--- sendEmail error`

**Cause:**
- Outlook SMTP authentication failed
- Invalid recipient email
- Email in spam folder

**Solution:**
1. Check spam/junk folder
2. Verify SMTP credentials in `src/services/appointment-services.ts`:
   ```typescript
   host: "smtp-mail.outlook.com",
   user: "noreply@bnoon.sa",
   pass: "xxx",
   ```
3. Check if email is valid format
4. Test SMTP connection separately:
   ```javascript
   const transporter = require('nodemailer').createTransport({...});
   await transporter.verify();
   ```

---

### Branch Not Switching

**Symptoms:**
- Always showing same branch data
- Wrong doctors/availability displayed

**Cause:**
- `branchAPIURL` cookie not updating
- Cookie domain mismatch

**Solution:**
1. Clear cookies and try again
2. Check cookie in browser dev tools
3. Verify branch switching API:
   ```javascript
   fetch('/api/switch-branch', {
     method: 'POST',
     body: JSON.stringify({ branchId: 'jeddah' })
   });
   ```
4. Hard refresh the page (Ctrl+Shift+R)

---

### Arabic Text Displaying Incorrectly

**Symptoms:**
- Arabic text appears reversed or broken
- Layout not RTL

**Cause:**
- Locale not detected properly
- Missing RTL classes

**Solution:**
1. Check URL includes `/ar/` prefix
2. Verify `dir="rtl"` on html element
3. Check if component uses `rtl:` Tailwind classes
4. Clear browser cache

---

### Firebase Connection Failed

**Symptoms:**
- Appointments not saving
- API key rotation failing
- Console shows: `--- createNewAppointmentDB error`

**Cause:**
- Firebase credentials invalid
- Service account not configured

**Solution:**
1. Check `FIREBASE_SERVICE_ACCOUNT` environment variable
2. Verify it's valid JSON with proper private_key
3. Check Firebase console for project status
4. Verify Firestore is enabled in project
5. Check Firestore security rules allow writes

---

### Build Failures

**Symptoms:**
- `npm run build` fails
- TypeScript errors

**Common Causes & Fixes:**

1. **Missing environment variables**
   ```bash
   export JWT_SECRET=your_secret
   export AGORA_APP_ID=your_app_id
   ```

2. **Firebase credentials not escaped**
   ```bash
   # Ensure newlines in private_key are escaped
   FIREBASE_SERVICE_ACCOUNT='{"private_key":"-----BEGIN...\\n...\\n-----END...","...}'
   ```

3. **Type errors after update**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

---

## Debugging Tips

### Enable Verbose Logging

Add to affected service:
```typescript
console.log("--- DEBUG:", {
  url: request.url,
  cookies: await cookies(),
  payload: await request.json(),
});
```

### Test API Routes Directly

```bash
# Test FertiSmart proxy
curl http://localhost:3000/api/ferti-smart/resources

# Test with auth cookie
curl -H "Cookie: auth-token=YOUR_JWT" \
  http://localhost:3000/api/current-user

# Test branch switch
curl -X POST http://localhost:3000/api/switch-branch \
  -H "Content-Type: application/json" \
  -d '{"branchId":"jeddah"}'
```

### Check Network Tab

1. Open browser dev tools → Network tab
2. Filter by "Fetch/XHR"
3. Look for red (failed) requests
4. Check Response tab for error details

### Validate JWT Token

```javascript
// In browser console
const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

### Test Firestore Connection

```typescript
// Add to any API route temporarily
import { db } from '@/firestore';
const testDoc = await db.collection('test').doc('connection').get();
console.log('Firestore connected:', testDoc.exists);
```

---

## Logs

### Server-Side Logs (Vercel)

1. Open Vercel dashboard
2. Go to project → Deployments
3. Select deployment → Functions tab
4. View logs for specific function/route

### Client-Side Logs

Browser console shows:
- React component errors
- SWR fetch errors
- Agora SDK messages

### FertiSmart API Logs

Contact FertiSmart team for server-side logs on their API.

---

## Recovery Procedures

### Reset Patient Authentication

1. Clear browser cookies
2. Request new OTP
3. Complete verification

### Rotate All API Keys

```bash
curl https://your-domain.vercel.app/api/cron/api-key
```

### Clear Appointment Cache (Firestore)

Only if appointment data is stale:
```javascript
// Admin script - use with caution
const appointments = await db.collection('appointments').get();
appointments.forEach(async (doc) => {
  await doc.ref.delete();
});
```

### Emergency: Disable Virtual Visits

Update `src/models/DoctorModel.ts`:
```typescript
// Set all doctors to clinic-only
availability: { clinic: true, virtual: false }
```

---

## Health Checks

### Manual Health Check

```bash
# Check main page loads
curl -I https://your-domain.vercel.app/

# Check API health (create simple health endpoint)
curl https://your-domain.vercel.app/api/health

# Check FertiSmart connectivity
curl https://your-domain.vercel.app/api/ferti-smart/resources
```

### Monitoring Recommendations

1. Set up Vercel Edge Config for feature flags
2. Add error tracking (Sentry, LogRocket)
3. Monitor Agora usage dashboard
4. Set up Firebase Firestore alerts
