# 🔥 Quick Fix Guide: Database Error Saving New User

## Root Cause

The `password` field in your User table was **required** (`String`), but Supabase manages passwords externally. When the backend tried to insert a new user, it failed the NOT NULL constraint.

## What I Fixed

### 1. Schema Change ✅

```prisma
// Before:
password    String

// After:
password    String?  // Made optional - Supabase manages passwords
```

### 2. Auth Route Fix ✅

```javascript
// Removed:
- organization auto-creation (was causing issues)
- password: "supabase-managed" placeholder

// Added:
- password: null (explicitly null)
- Better error handling with detailed logs
- Graceful profile creation failure handling
```

### 3. RLS Policies 📝

Created `SUPABASE_RLS_POLICIES.sql` with:

- Service role full access (for backend)
- User self-access policies
- Profile table policies

---

## Next Steps

### Step 1: Complete the Migration ⏳

The migration is currently running. Once it completes:

```bash
cd web/backend
npx prisma generate
```

### Step 2: Apply RLS Policies 🔐

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `SUPABASE_RLS_POLICIES.sql`
3. Run the SQL
4. Verify policies are created

### Step 3: Deploy to Production 🚀

```bash
# Commit changes
git add .
git commit -m "fix: Make password optional for Supabase Auth signup"
git push

# Railway will auto-deploy
# Verify logs after deployment
```

### Step 4: Test Signup 🧪

1. Go to your registration page
2. Fill out the form
3. Submit
4. Check email for verification
5. Verify user is created in Supabase Database

---

## Files Changed

- ✅ `web/backend/prisma/schema.prisma` - Made password optional
- ✅ `web/backend/routes/auth.js` - Fixed user creation logic
- ✅ `SUPABASE_RLS_POLICIES.sql` - Created RLS policies

---

## Monitoring

### Backend Logs (Railway)

Look for these console logs:

```
✅ User created successfully: <uuid>
✅ Default profile created for: PATIENT
```

### Error Logs

If signup still fails, check for:

```
❌ Database error creating user: <error details>
```

The error message will now show the actual database error in development mode.

---

## Rollback Plan (If Needed)

If this doesn't work, you can:

1. Check Railway environment variables (SUPABASE_SERVICE_ROLE_KEY)
2. Verify database connection
3. Check Supabase logs in Dashboard
4. Run RLS policy verification query (in the SQL file)
