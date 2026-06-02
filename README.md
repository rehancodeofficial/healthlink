# CureVirtual 2.0

A full-stack telemedicine web application with video calling, appointment booking, and real-time notifications.

📌 **Table of Contents**

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

CureVirtual is a comprehensive telemedicine platform designed to connect patients with healthcare professionals through a secure and intuitive interface. It streamlines healthcare delivery by providing tools for virtual consultations, digital prescriptions, and efficient patient management.

## Tech Stack

- **Frontend (Web):** React 19, Vite, Tailwind CSS, Recharts
- **Mobile:** Expo (React Native), Expo Router
- **Backend:** Node.js, Express, Socket.io
- **Database & ORM:** Supabase (PostgreSQL), Prisma
- **AI:** Google Generative AI (Gemini API)
- **Services:** Stripe (Payments), ZegoCloud (Video), SendGrid/Nodemailer (Email)

## Features

- **Virtual Consultations:** High-definition video and audio calling.
- **Smart Booking:** Real-time appointment scheduling with timezone support.
- **Unified Messaging:** Secure chat between patients, doctors, and admins.
- **EHR Management:** Digital storage for medical history and prescriptions.
- **Role-Based Access:** Dedicated dashboards for Patients, Doctors, and Admins.
- **Automated Alerts:** Real-time WebSocket and email notifications.

## Architecture

CureVirtual follows a modular monorepo architecture:

- **Client Tier:** React-based Web App and Expo-based Mobile App.
- **Logic Tier:** Express.js REST API with Socket.io for real-time events.
- **Data Tier:** PostgreSQL hosted on Supabase, managed via Prisma ORM for type-safety.
- **Service Tier:** Third-party integrations for Video (Zego), AI (Gemini), and Payments (Stripe).

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Supabase Project & URL

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd curevirtual-2
   ```

2. **Backend Setup:**

   ```bash
   cd web/backend
   npm install
   cp .env.example .env
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup:**

   ```bash
   cd web/frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Mobile Setup:**

   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## Environment Variables

Key variables required in `.env` files:

- `DATABASE_URL`: Connection string for PostgreSQL/Supabase.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: Supabase credentials.
- `ZEGO_APP_ID` / `ZEGO_SERVER_SECRET`: For video consultations.
- `STRIPE_SECRET_KEY`: For payment processing.
- `GEMINI_API_KEY`: For AI-driven features.

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration.
- `POST /api/auth/login` - User login.

### Appointments

- `GET /api/patient/appointments` - Fetch patient appointments.
- `POST /api/patient/appointments` - Book a new appointment.

### Profiles

- `GET /api/doctor/profile` - Get doctor profile details.
- `PUT /api/patient/profile` - Update patient profile.

### Messaging

- `GET /api/messages/inbox` - Retrieve user inbox.
- `POST /api/messages/send` - Send a message or Send Message to All.

## Deployment

- **Frontend:** Vercel / Netlify
- **Backend:** Railway / Heroku / DigitalOcean
- **Database:** Supabase Managed Database

## Screenshots

### 🏠 Landing Page

|                 Hero Section                  |                   Our Capabilities                    |
| :-------------------------------------------: | :---------------------------------------------------: |
| ![Landing Hero](screenshots/landing_hero.png) | ![Landing Features](screenshots/landing_features.png) |

|                  The Ecosystem                  |
| :---------------------------------------------: |
| ![Landing About](screenshots/landing_about.png) |

### 🔑 Authentication

|                Login Page                 |                    Registration Page                    |
| :---------------------------------------: | :-----------------------------------------------------: |
| ![Login Page](screenshots/login_page.png) | ![Registration Page](screenshots/registration_page.png) |

|                     Registration Success                      |
| :-----------------------------------------------------------: |
| ![Registration Success](screenshots/registration_success.png) |

### 📊 Dashboards

|                    Patient Dashboard                    |                   Doctor Dashboard                    |
| :-----------------------------------------------------: | :---------------------------------------------------: |
| ![Patient Dashboard](screenshots/patient_dashboard.png) | ![Doctor Dashboard](screenshots/doctor_dashboard.png) |

|                   Admin Dashboard                   |
| :-------------------------------------------------: |
| ![Admin Dashboard](screenshots/admin_dashboard.png) |

## Future Improvements

- [ ] Integration with wearable health devices (Apple Health/Google Fit).
- [ ] AI-powered diagnostic suggestions based on patient symptoms.
- [ ] Multi-language support (i18n).
- [ ] Advanced analytics for hospital administrators.

## Contributing

Contributions are welcome! Please fork the repository and use a feature branch.

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/rehan/curevirtual](https://github.com/rehan/curevirtual)

---

_Developed with ❤️ for the future of healthcare._
