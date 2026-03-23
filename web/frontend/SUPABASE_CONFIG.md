# ============================================

# SUPABASE AUTH MIGRATION - CONFIGURATION GUIDE

# ============================================

## 📋 Supabase Dashboard Configuration

### Step 1: Enable Email Provider

1. Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/auth/providers
2. Find **Email** provider
3. Enable the following settings:
   - ✅ **Enable Email provider** - ON
   - ✅ **Confirm email** - ON (Required for email verification)
   - ✅ **Secure email change** - ON (Recommended)
   - ✅ **Enable Email OTP** - ON (For OTP login)

### Step 2: Configure Email Templates

1. Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/auth/templates
2. Customize the following templates:

**Confirm Signup Template:**

```html
<h2>Welcome to CureVirtual!</h2>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
<p>If you didn't sign up for CureVirtual, you can safely ignore this email.</p>
```

**Magic Link Template (OTP):**

```html
<h2>Your CureVirtual Login Code</h2>
<p>Your one-time password is:</p>
<h1 style="font-size: 32px; letter-spacing: 5px; color: #10b981;">
  {{ .Token }}
</h1>
<p>This code expires in 10 minutes.</p>
```

### Step 3: Configure URL Settings

1. Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/auth/url-configuration
2. Set the following:
   - **Site URL**: `https://curevirtual-two.vercel.app`
   - **Redirect URLs**: Add these URLs (one per line):
     ```
     https://curevirtual-two.vercel.app/auth/callback
     http://localhost:5173/auth/callback
     ```

### Step 4: Get Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/settings/api
2. Copy the following:
   - **Project URL**: `https://pkvzqphjarzretiswzqf.supabase.co`
   - **anon/public key**: Copy this for frontend `.env`
   - **service_role key**: Already set in backend `.env`

---

## 🔧 Frontend Environment Variables

Update `/web/frontend/.env`:

```env
VITE_SUPABASE_URL=https://pkvzqphjarzretiswzqf.supabase.co
VITE_SUPABASE_ANON_KEY=<paste_anon_key_from_dashboard>
VITE_API_BASE_URL=https://curevirtual-2-production-ee33.up.railway.app/api
```

**For Vercel Deployment:**

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add the same variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`

---

## 🔧 Backend Environment Variables

Your backend `.env` already has:

```env
SUPABASE_URL=https://pkvzqphjarzretiswzqf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Remove these (no longer needed):**

```env
# DELETE THESE LINES:
EMAIL_PROVIDER=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=rehanhussain1514@gmail.com
EMAIL_PASS="jsdz wxyx smmo gfrz"
FROM_EMAIL=rehanhussain1514@gmail.com
```

**For Railway Deployment:**

1. Go to: https://railway.app/project/your-project/variables
2. Remove old email variables
3. Ensure these exist:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `DATABASE_URL`

---

## 🗄️ Database Migration

Run Prisma migration to remove EmailOTP table:

```bash
cd web/backend
npx prisma migrate dev --name remove_email_otp_table
npx prisma generate
```

---

## 🔐 Row Level Security (RLS) Policies

Run these SQL commands in Supabase SQL Editor:
(Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/sql/new)

```sql
-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Policy: Service role can insert users (for registration sync)
CREATE POLICY "Service role can insert users"
  ON "User"
  FOR INSERT
  WITH CHECK (true);

-- Doctor Profile RLS
ALTER TABLE "DoctorProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own profile"
  ON "DoctorProfile"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Doctors can update own profile"
  ON "DoctorProfile"
  FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Patient Profile RLS
ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own profile"
  ON "PatientProfile"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Patients can update own profile"
  ON "PatientProfile"
  FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Pharmacy Profile RLS
ALTER TABLE "PharmacyProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pharmacies can view own profile"
  ON "PharmacyProfile"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Pharmacies can update own profile"
  ON "PharmacyProfile"
  FOR UPDATE
  USING (auth.uid()::text = "userId");
```

---

## 🧪 Testing Locally

1. **Update frontend `.env`** with Supabase credentials
2. **Run Database Migration:**

   ```bash
   cd web/backend
   npx prisma migrate dev --name remove_email_otp_table
   npx prisma generate
   ```

3. **Start Backend:**

   ```bash
   cd web/backend
   npm run dev
   ```

4. **Start Frontend:**

   ```bash
   cd web/frontend
   npm run dev
   ```

5. **Test Signup Flow:**
   - Go to http://localhost:5173/register
   - Fill in form and submit
   - Check email for verification link
   - Click link → should redirect to dashboard

6. **Test Login Flow:**
   - Go to http://localhost:5173/login
   - Try password login
   - Try OTP login

---

## 🚀 Deployment

### Railway (Backend)

1. Push code to GitHub
2. Railway will auto-deploy
3. Verify environment variables are set
4. Check logs for any errors

### Vercel (Frontend)

1. Push code to GitHub
2. Vercel will auto-deploy
3. Add environment variables in Vercel dashboard
4. Redeploy if needed

---

## 📧 Custom Email Domain (Optional)

To send emails from your own domain (e.g., noreply@curevirtual.com):

1. Go to: https://supabase.com/dashboard/project/pkvzqphjarzretiswzqf/auth/email
2. Click "SMTP Settings"
3. Configure your SMTP provider (SendGrid, Mailgun, etc.)
4. Test email delivery

---

## ✅ Post-Migration Checklist

- [ ] Supabase Auth providers configured
- [ ] Email templates customized
- [ ] URL configuration set
- [ ] Frontend environment variables updated
- [ ] Backend environment variables cleaned
- [ ] Database migration completed
- [ ] RLS policies created
- [ ] Local testing passed
- [ ] Production deployment complete
- [ ] Email delivery verified

---

## 🆘 Troubleshooting

**Email not sending:**

- Check Supabase Auth logs
- Verify email provider is enabled
- Check spam folder

**Email verification link not working:**

- Verify redirect URLs are configured
- Check Site URL matches production URL

**OTP not working:**

- Verify "Enable Email OTP" is ON
- Check email template is configured
- Verify user exists in database

**Database errors:**

- Run `npx prisma generate` after migration
- Restart backend server
- Check RLS policies are not blocking inserts
