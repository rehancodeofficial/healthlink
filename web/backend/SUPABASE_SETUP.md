# Supabase Project Setup Guide

To ensure your local CureVirtual project connects successfully to Supabase, follow these steps in your Supabase dashboard:

## 1. Environment Variables

Ensure your `web/backend/.env` and `web/frontend/.env` files have the correct keys:

### Backend (.env)

```env
SUPABASE_URL="your-project-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Frontend (.env)

```env
VITE_SUPABASE_URL="your-project-url"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## 2. Authentication Settings

1. Go to **Authentication** > **Providers** > **Email**.
   - **Enable Email Provider**: Ensure this is toggled ON.
   - **Confirm Email**: If you are in development, you might want to disable "Confirm Email" to allow immediate login after registration without checking a real mailbox.
2. **Anonymous Sign-ins**: Go to **Authentication > Settings**. Ensure "Allow anonymous sign-ins" is **Disabled** (which is correct), but if you see errors about it, it usually means the standard Email provider is NOT enabled or properly configured.
3. **Site URL**: Set this to `http://localhost:5173`.
4. **Redirect URLs**: Add `http://localhost:5173/**`.

## 3. Database Schema

Run the SQL provided in `web/backend/supabase_schema.sql` in the **SQL Editor** of your Supabase dashboard.

Alternatively, if you want to manually create the core tables used for authentication and profile syncing:

- **User**: Primary table for all roles (Patient, Doctor, Pharmacy).
- **Organization**: Created automatically during registration syncing.
- **SupportAgent/SupportTicket**: Used for the patient help desk.

> [!IMPORTANT]
> Since the project uses Prisma with a local MySQL database, your Supabase instance primarily handles **User Authentication**. The backend then syncs this user to your local database.

### What to add in Supabase:

1. **Tables**: You don't actually need to create all medical tables in Supabase if you are using the local MySQL for data. However, if you want Supabase to hold the data, run the `supabase_schema.sql` script.
2. **Auth Hooks**: If you want custom logic during signup, check the **Authentication > Hooks** section.
3. **Storage**: Create a bucket called `avatars` or `medical-records` if you plan to use Supabase Storage for file uploads (referenced in some frontend components).

## 4. API Keys

- Use the **anon** key for the frontend.
- Use the **service_role** key for the backend (this allows the backend to sync users without Row Level Security restrictions).
