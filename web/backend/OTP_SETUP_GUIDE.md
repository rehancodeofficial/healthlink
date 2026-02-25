# Email OTP Verification System - Setup Guide

## 📋 Overview

This system provides secure email verification using one-time passwords (OTP) for user registration. It supports both Gmail/SMTP and SendGrid for email delivery.

## 🎯 Features

- ✅ Secure 6-digit OTP generation using crypto module
- ✅ 5-minute expiration with countdown timer
- ✅ Rate limiting (3 requests per minute per email)
- ✅ Auto-focus and paste support in frontend
- ✅ Resend functionality
- ✅ Automatic cleanup of expired OTPs
- ✅ Support for Gmail and SendGrid
- ✅ Production-ready with error handling

## 🔧 Setup Instructions

### 1. Database Migration

The EmailOTP model has been added to Prisma schema. Run migration:

```bash
# Inside Docker container
docker exec curevirtual2-backend-1 npx prisma migrate dev --name add_email_otp

# Or stop and rebuild
docker-compose down
docker-compose up -d --build
```

### 2. Environment Variables

Configure your email provider in `.env`:

#### Option A: Gmail/SMTP (Recommended for Development)

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:

```env
EMAIL_PROVIDER=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
FROM_EMAIL=noreply@curevirtual.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Add to `.env`:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@curevirtual.com
```

### 3. Backend API Endpoints

The following endpoints are now available:

#### Send OTP

```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Success):**

```json
{
  "message": "OTP sent successfully",
  "expiresAt": "2025-12-24T05:15:00.000Z"
}
```

#### Verify OTP

```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**

```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

#### Resend OTP

```http
POST /api/otp/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Cleanup Expired OTPs

```http
DELETE /api/otp/cleanup
```

### 4. Frontend Integration

Import and use the OTPVerification component:

```jsx
import OTPVerification from './components/OTPVerification';

function RegistrationFlow() {
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleRegistration = async (userData) => {
    // Register user
    const response = await axios.post('/api/auth/register', userData);

    if (response.data.requiresVerification) {
      setUserEmail(userData.email);
      setShowOTP(true);
    }
  };

  const handleVerified = () => {
    // Redirect to login or dashboard
    navigate('/login');
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={userEmail}
        onVerified={handleVerified}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    // Your registration form
  );
}
```

## 🔒 Security Features

### Rate Limiting

- Maximum 3 OTP requests per email per minute
- Prevents spam and abuse

### Expiration

- OTPs expire after 5 minutes
- Expired OTPs cannot be used
- Automatic cleanup available

### Secure Generation

- Uses Node.js crypto module for random number generation
- 6-digit codes (100000-999999)

### Database Security

- OTPs stored with expiration timestamps
- Indexed for fast lookups
- Verification status tracked

## 🧪 Testing

### Manual Testing

1. **Start the application:**

```bash
docker-compose up -d
```

2. **Register a new user:**

```bash
curl -X POST https://curevirtual-2-production-ee33.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "PATIENT"
  }'
```

3. **Check your email for the OTP**

4. **Verify the OTP:**

```bash
curl -X POST https://curevirtual-2-production-ee33.up.railway.app/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Error Scenarios to Test

- Invalid OTP (wrong digits)
- Expired OTP (wait 5+ minutes)
- Rate limiting (send 4+ requests quickly)
- Email already registered
- Missing email or OTP in request

## 📊 Database Schema

```prisma
model EmailOTP {
  id        Int      @id @default(autoincrement())
  email     String
  otp       String
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
  @@index([expiresAt])
  @@map("EmailOTP")
}
```

## 🔄 Cron Job for Cleanup (Optional)

For production, set up a cron job to clean expired OTPs:

```bash
# Add to crontab (runs every hour)
0 * * * * curl -X DELETE https://curevirtual-2-production-ee33.up.railway.app/api/otp/cleanup
```

Or use a Node.js scheduler in your backend:

```javascript
const cron = require("node-cron");

// Run cleanup every hour
cron.schedule("0 * * * *", async () => {
  await prisma.emailOTP.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  console.log("🧹 Cleaned up expired OTPs");
});
```

## 🌐 Production Checklist

- [ ] Use SendGrid instead of Gmail
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Implement Redis for rate limiting (instead of in-memory)
- [ ] Set up monitoring for failed email sends
- [ ] Add logging for security events
- [ ] Configure email templates with your branding
- [ ] Test email delivery thoroughly
- [ ] Set up automated OTP cleanup cron job

## 🆘 Troubleshooting

### Email not sending (Gmail)

1. Check App Password is correct (16 characters)
2. Verify 2FA is enabled on Google Account
3. Check Docker container logs:

```bash
docker logs curevirtual2-backend-1
```

### Email not sending (SendGrid)

1. Verify SendGrid API key
2. Check sender email is verified in SendGrid
3. Review SendGrid activity logs

### OTP verification failing

1. Check OTP hasn't expired (5 minutes)
2. Verify email matches exactly (case-insensitive)
3. Check database for OTP record:

```bash
docker exec curevirtual2-db-1 mysql -u root -prootpassword curevirtual_db -e "SELECT * FROM EmailOTP ORDER BY createdAt DESC LIMIT 5;"
```

### Database migration issues

```bash
# Reset and reapply migrations
docker exec curevirtual2-backend-1 npx prisma migrate reset --force
docker exec curevirtual2-backend-1 npx prisma migrate dev
```

## 📝 API Error Codes

| Code | Error                 | Description                        |
| ---- | --------------------- | ---------------------------------- |
| 400  | Missing email or OTP  | Required fields not provided       |
| 400  | Invalid OTP           | OTP doesn't match or doesn't exist |
| 400  | OTP has expired       | OTP older than 5 minutes           |
| 429  | Too many requests     | Rate limit exceeded (3 per minute) |
| 500  | Failed to send email  | Email service configuration error  |
| 500  | Internal server error | Database or server issue           |

## 🎨 Customization

### Change OTP Length

Edit `lib/otpGenerator.js`:

```javascript
// For 4-digit OTP
const otp = (num % 9000) + 1000;

// For 8-digit OTP
const otp = (num % 90000000) + 10000000;
```

### Change Expiration Time

Edit `lib/otpGenerator.js`:

```javascript
function getOTPExpiration() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes
  return expiresAt;
}
```

### Customize Email Template

Edit `lib/emailService.js` to change the HTML template.

## ✅ Success!

Your OTP verification system is now ready for production use. Users will receive a verification code after registration and must verify their email before proceeding.

For questions or issues, check the troubleshooting section above.
