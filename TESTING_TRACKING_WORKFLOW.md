# Testing Guide: Two-Step Tracking Validation Workflow

This guide explains how to test the complete two-step tracking validation system implemented for ReExpressTrack.

## System Overview

The tracking system separates client tracking number declaration from admin-controlled 17Track synchronization:

1. **Client Declaration Phase**: Client adds tracking number during package announcement (informational only)
2. **Admin Activation Phase**: Admin validates and enables 17Track synchronization
3. **Client Tracking Phase**: Client can view tracking updates only for admin-approved packages

## Prerequisites

Before testing, ensure:

1. ✅ Database migration has been applied (see `backend/migrations/README.md`)
2. ✅ Backend server is running (`npm run dev` in backend directory)
3. ✅ Frontend server is running (`npm run dev` in frontend directory)
4. ✅ You have both a client account and an admin account
5. ✅ 17Track API credentials are configured in backend `.env`

## Testing Workflow

### Phase 1: Client Adds Tracking Number

**As a Client User:**

1. Log in to the client dashboard
2. Navigate to "Mes colis" (Packages)
3. Click "Annoncer un colis" (Announce a package)
4. Fill in the package details:
   - Description: "Test Package for Tracking"
   - Weight: 2.5 kg
   - Dimensions: 30x20x15 cm
   - **Tracking Number**: Enter a valid tracking number (e.g., "1Z999AA10123456784" for UPS)
5. Submit the form

**Expected Results:**
- ✅ Package is created successfully
- ✅ Tracking number is saved in the database
- ✅ Package appears in "Mes colis" list
- ✅ `tracking_17track_enabled` field is `false` in database

**Database Verification:**
```sql
SELECT id, tracking_number, tracking_17track_enabled
FROM packages
WHERE tracking_number = '1Z999AA10123456784';
```

Expected output:
```
| id                                   | tracking_number      | tracking_17track_enabled |
|--------------------------------------|---------------------|--------------------------|
| <package-uuid>                       | 1Z999AA10123456784  | false                    |
```

### Phase 2: Client Cannot See Tracking Yet

**As a Client User:**

1. Navigate to "Suivi de colis" 🚚 (Tracking) page
2. Check the package list

**Expected Results:**
- ✅ The newly created package **DOES NOT** appear in the tracking list
- ✅ Message shown: "Aucun colis à suivre actuellement"
- ✅ Info message explains: "Les numéros de suivi doivent être validés par un administrateur"

**Why?** The `tracking_17track_enabled` flag is still `false`, so the package is filtered out.

### Phase 3: Admin Validates and Enables Tracking

**As an Admin User:**

1. Log in to the admin dashboard
2. Navigate to "Admin" → "Packages"
3. Find the package created by the client
4. Click on the package to view details
5. In the "Gestion du suivi" (Tracking Management) section, you should see:
   - ✅ Tracking number displayed
   - ✅ Status: "⏳ Non activé - Le client ne peut pas encore suivre"
   - ✅ "Activer" button visible
6. Click the **"Activer"** button

**Expected Results:**
- ✅ Success message: "17Track sync enabled and registered"
- ✅ Status changes to: "✅ Activé - Le client peut suivre ce colis"
- ✅ "Activer" button disappears
- ✅ Package is registered with 17Track API
- ✅ `tracking_17track_enabled` field is `true` in database

**Database Verification:**
```sql
SELECT id, tracking_number, tracking_17track_enabled, carrier, carrier_name
FROM packages
WHERE tracking_number = '1Z999AA10123456784';
```

Expected output:
```
| id                                   | tracking_number      | tracking_17track_enabled | carrier | carrier_name |
|--------------------------------------|---------------------|--------------------------|---------|--------------|
| <package-uuid>                       | 1Z999AA10123456784  | true                     | 1       | UPS          |
```

**Audit Log Verification:**
```sql
SELECT action, resource_type, metadata
FROM audit_logs
WHERE resource_id = '<package-uuid>'
ORDER BY created_at DESC
LIMIT 5;
```

Expected to see:
- `TRACKING_17TRACK_ENABLED` action with metadata containing tracking number

### Phase 4: Client Can Now See Tracking

**As a Client User:**

1. Navigate to "Suivi de colis" 🚚 (Tracking) page
2. The package should now appear in the list

**Expected Results:**
- ✅ Package appears with tracking number
- ✅ Carrier name displayed (e.g., "UPS")
- ✅ Package status shown
- ✅ "Actualiser le suivi" (Refresh Tracking) button available
- ✅ Click the button to sync with 17Track
- ✅ Tracking events appear (if available from 17Track)

### Phase 5: Real-Time Tracking Sync

**As a Client User:**

1. On the tracking page, find your package
2. Click **"Actualiser le suivi"** button
3. Wait for the API call to complete

**Expected Results:**
- ✅ Loading indicator shows during sync
- ✅ Success message: "Suivi actualisé avec succès"
- ✅ New tracking events appear (if any)
- ✅ Events are sorted by timestamp (most recent first)
- ✅ Each event shows:
  - Event type (e.g., "In Transit", "Delivered")
  - Description
  - Location (if available)
  - Timestamp

**Database Verification:**
```sql
SELECT event_type, description, location, timestamp
FROM tracking_events
WHERE package_id = '<package-uuid>'
ORDER BY timestamp DESC;
```

## Security Testing

### Test 1: Client Cannot Enable Tracking

**Test Steps:**

1. As a client, try to call the enable-17track API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/packages/<package-id>/tracking/enable-17track \
  -H "Authorization: Bearer <client-jwt-token>"
```

**Expected Result:**
- ❌ 403 Forbidden error
- Error message: "Insufficient permissions"

### Test 2: Client Cannot See Other Users' Tracking

**Test Steps:**

1. Create packages with two different client accounts
2. Enable tracking for both (as admin)
3. Log in as Client A
4. Navigate to tracking page

**Expected Result:**
- ✅ Client A only sees their own packages
- ✅ Client B's packages are NOT visible to Client A

### Test 3: Admin Can Manage Any Package

**Test Steps:**

1. As admin, navigate to any user's package
2. Try to enable tracking

**Expected Result:**
- ✅ Admin can view all packages
- ✅ Admin can enable tracking for any package
- ✅ Tracking number is saved correctly
- ✅ 17Track API is called successfully

## Edge Cases Testing

### Test 1: Package Without Tracking Number

**Test Steps:**

1. Create a package without entering a tracking number
2. As admin, try to view the package details

**Expected Result:**
- ✅ Package is created successfully
- ✅ Tracking section shows: "Aucun numéro de suivi"
- ✅ Input field available to add tracking number later
- ✅ "Activer" button is NOT visible until tracking number is added

### Test 2: Invalid Tracking Number

**Test Steps:**

1. As client, create package with invalid tracking number (e.g., "INVALID123")
2. As admin, enable tracking

**Expected Result:**
- ✅ Tracking number is saved
- ✅ 17Track sync is enabled
- ✅ When client syncs tracking, may show "No tracking info available" (depending on 17Track API response)

### Test 3: Multiple Packages Same Client

**Test Steps:**

1. As client, create 3 packages with different tracking numbers
2. As admin, enable tracking for only 2 of them
3. As client, check tracking page

**Expected Result:**
- ✅ Only 2 packages appear in tracking list
- ✅ Third package (not enabled) is NOT shown
- ✅ Client can still see all 3 in "Mes colis" page

## API Endpoints Reference

### Client Endpoints

**Add/Update Tracking Number:**
```
POST /api/packages/:packageId/tracking
Authorization: Bearer <client-jwt>
Body: { "trackingNumber": "1Z999AA10123456784" }
```

**Sync Tracking from 17Track:**
```
POST /api/packages/:packageId/tracking/sync
Authorization: Bearer <client-jwt>
```

**List Packages with Tracking:**
```
GET /api/packages?limit=100
Authorization: Bearer <client-jwt>

Filter on client side for:
- trackingNumber !== null
- tracking17TrackEnabled === true
```

### Admin Endpoints

**Enable 17Track Sync:**
```
POST /api/packages/:packageId/tracking/enable-17track
Authorization: Bearer <admin-jwt>
```

**Get Package Details:**
```
GET /api/admin/packages/:packageId
Authorization: Bearer <admin-jwt>
```

## Troubleshooting

### Issue: Package Not Appearing in Client Tracking

**Possible Causes:**
1. Admin hasn't enabled tracking yet → Check `tracking_17track_enabled` in database
2. Package doesn't have a tracking number → Check `tracking_number` field
3. Package belongs to different user → Verify `user_id` matches

**Solution:**
- Ensure admin has clicked "Activer" button
- Verify database: `SELECT tracking_number, tracking_17track_enabled FROM packages WHERE id = '<package-id>'`

### Issue: 17Track API Not Responding

**Possible Causes:**
1. Invalid API credentials
2. Network connectivity issues
3. 17Track service is down

**Solution:**
- Check `.env` file for correct `TRACK17_API_KEY` and `TRACK17_API_URL`
- Test API directly: `curl -X POST https://api.17track.net/track/v2/gettrackinfo -H "17token: YOUR_KEY"`
- Check backend logs for error messages

### Issue: Admin Cannot Enable Tracking

**Possible Causes:**
1. Package doesn't have a tracking number
2. User doesn't have admin role

**Solution:**
- Add tracking number first (admin can update it)
- Verify user role: `SELECT role FROM users WHERE id = '<user-id>'`

## Success Criteria

All tests pass when:

- ✅ Client can add tracking numbers during package declaration
- ✅ Client CANNOT see tracking until admin enables it
- ✅ Admin can enable 17Track sync with one click
- ✅ Client can see and refresh tracking after admin approval
- ✅ Security: Clients only see their own packages
- ✅ Security: Only admins can enable 17Track sync
- ✅ Audit logs record all tracking actions
- ✅ 17Track API integration works correctly

## Next Steps

After testing is complete:

1. Monitor production logs for any tracking-related errors
2. Set up automated tests for critical workflows
3. Create user documentation for clients and admins
4. Consider implementing:
   - Automated tracking refresh (background job)
   - Email notifications for tracking updates
   - Bulk tracking activation for admins
   - Tracking history export
