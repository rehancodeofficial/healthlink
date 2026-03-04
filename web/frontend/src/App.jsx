// FILE: src/App.jsx
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================================
   SUPERADMIN
================================ */
import api from "./Lib/api";
import "./App.css";

/* ================================
   SUPERADMIN
================================ */
const SuperadminDashboard = lazy(() => import("./pages/superadmin/SuperadminDashboard"));
const ManageAdmins = lazy(() => import("./pages/superadmin/ManageAdmins"));
const SystemReports = lazy(() => import("./pages/superadmin/SystemReports"));
const Settings = lazy(() => import("./pages/superadmin/Settings"));
const SuperSubscribersStats = lazy(() => import("./pages/superadmin/subscribers/Stats"));
const SuperSubscribedDoctors = lazy(() => import("./pages/superadmin/subscribers/Doctor"));
const SuperSubscribedPatients = lazy(() => import("./pages/superadmin/subscribers/Patients"));
const SuperadminSubscribedPharmacy = lazy(() => import("./pages/superadmin/subscribers/Pharmacy"));
const SuperadminInbox = lazy(() => import("./pages/superadmin/SuperadminInbox"));
const SuperadminSendMessage = lazy(() => import("./pages/superadmin/SuperadminSendMessage"));
const SuperadminActivityLogs = lazy(() => import("./pages/superadmin/ActivityLogs"));

/* ================================
   ADMIN
================================ */
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Inbox = lazy(() => import("./pages/admin/messages/Inbox"));
const SendMessage = lazy(() => import("./pages/admin/messages/SendMessage"));
const AdminList = lazy(() => import("./pages/admin/AdminList"));
const UsersList = lazy(() => import("./pages/admin/UsersList"));
const SubscriptionSettings = lazy(() => import("./pages/admin/SubscriptionSettings"));
const AdminSubscribersStats = lazy(() => import("./pages/admin/subscribers/Stats"));
const AdminSubscribedDoctors = lazy(() => import("./pages/admin/subscribers/Doctor"));
const AdminSubscribedPatients = lazy(() => import("./pages/admin/subscribers/Patients"));
const AdminSubscribedPharmacy = lazy(() => import("./pages/admin/subscribers/Pharmacy"));

/* ================================
   DOCTOR
================================ */
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const DoctorPrescriptions = lazy(() => import("./pages/doctor/Prescriptions"));
const DoctorInbox = lazy(() => import("./pages/doctor/messages/inbox"));
const DoctorSendMessage = lazy(() => import("./pages/doctor/messages/SendMessage"));
const DoctorSubscription = lazy(() => import("./pages/doctor/DoctorSubscription"));
const PatientList = lazy(() => import("./pages/doctor/PatientList"));
const DoctorViewProfile = lazy(() => import("./pages/doctor/ViewProfile"));
const DoctorProfile = lazy(() => import("./pages/doctor/Profile"));
const MyPatientList = lazy(() => import("./pages/doctor/MyPatientList"));
const DoctorVideoConsultation = lazy(() => import("./pages/doctor/VideoConsultation"));
const DoctorSchedule = lazy(() => import("./pages/doctor/DoctorSchedule"));

/* ================================
   PATIENT
================================ */
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const BookAppointment = lazy(() => import("./pages/patient/BookAppointment"));
const MyAppointments = lazy(() => import("./pages/patient/MyAppointments"));
const PatientPrescriptions = lazy(() => import("./pages/patient/Prescriptions"));
const PatientVideoConsultation = lazy(() => import("./pages/patient/VideoConsultation"));
const PatientInbox = lazy(() => import("./pages/patient/messages/Inbox.jsx"));
const PatientSendMessage = lazy(() => import("./pages/patient/messages/SendMessage.jsx"));
const MyTickets = lazy(() => import("./pages/patient/support/MyTickets"));
const TicketDetails = lazy(() => import("./pages/patient/support/TicketDetail"));
const PatientUpdateProfile = lazy(() => import("./pages/patient/Profile.jsx"));
const PatientViewProfile = lazy(() => import("./pages/patient/ViewProfile.jsx"));
const PatientSubscription = lazy(() => import("./pages/patient/PatientSubscription.jsx"));
const DoctorsList = lazy(() => import("./pages/patient/DoctorsList"));
const MyDoctors = lazy(() => import("./pages/patient/MyDoctors"));

/**=====================================
 * PHARMACY
 *======================================*/
const PharmacyDashboard = lazy(() => import("./pages/pharmacy/Dashboard"));
const PharmacyProfile = lazy(() => import("./pages/pharmacy/Profile"));
const PharmacyPrescriptions = lazy(() => import("./pages/pharmacy/Prescriptions"));
// Patient: choose pharmacy
const PatientSelectPharmacy = lazy(() => import("./pages/patient/SelectPharmacy"));
const PharmacyList = lazy(() => import("./pages/patient/pharmacy/PharmacyList"));
const MyPharmacy = lazy(() => import("./pages/patient/pharmacy/MyPharmacy"));
const PharmacySubscription = lazy(() => import("./pages/pharmacy/PharmacySubscription"));
const PharmacyViewProfile = lazy(() => import("./pages/pharmacy/ViewProfile"));
const PharmacyInbox = lazy(() => import("./pages/pharmacy/messages/Inbox"));
const PharmacySendMessage = lazy(() => import("./pages/pharmacy/messages/SendMessage"));

/* ================================
   SUPPORT
================================ */
const SupportDashboard = lazy(() => import("./pages/support/SupportDashboard"));
const SupportTickets = lazy(() => import("./pages/support/SupportTickets"));
const SupportLiveChat = lazy(() => import("./pages/support/SupportLiveChat"));
const SupportSubscribedDoctors = lazy(() => import("./pages/support/subscribers/Doctor"));
const SupportSubscribedPatients = lazy(() => import("./pages/support/subscribers/Patients"));
const SupportSubscribedPharmacy = lazy(() => import("./pages/support/subscribers/Pharmacy"));
const UserProfile = lazy(() => import("./pages/shared/UserProfile"));

/* ================================
   AUTH / HOME
================================ */
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Home = lazy(() => import("./pages/Home"));
import Chatbot from "./components/Chatbot";

/* ================================
   VIDEO (shared)
================================ */
const VideoLobby = lazy(() => import("./pages/video/VideoLobby"));
const VideoRoom = lazy(() => import("./pages/video/VideoRoom"));

/* ================================
   Tiny role guard (localStorage)
================================ */
const RequireRole = ({ role, children }) => {
  const currentRole = localStorage.getItem("role") || localStorage.getItem("userRole") || "";
  if (!role || currentRole === role) return children;
  return <Navigate to="/" replace />;
};

export default function App() {
  // 🚀 Warmup Backend on Load
  useEffect(() => {
    const wakeupBackend = async () => {
      try {
        await api.get("/health");
        console.log("Backend woken up!");
      } catch (err) {
        console.log("Backend wakeup failed (could be offline or sleeping)", err);
      }
    };
    wakeupBackend();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Video shared */}
          <Route path="/video/lobby" element={<VideoLobby />} />
          <Route path="/video/room/:roomName" element={<VideoRoom />} />

          {/* ================= SUPERADMIN ================= */}
          <Route
            path="/superadmin/dashboard"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperadminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/manage-admins"
            element={
              <RequireRole role="SUPERADMIN">
                <ManageAdmins />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/system-reports"
            element={
              <RequireRole role="SUPERADMIN">
                <SystemReports />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/settings"
            element={
              <RequireRole role="SUPERADMIN">
                <Settings />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/messages/inbox"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperadminInbox />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/messages/send"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperadminSendMessage />
              </RequireRole>
            }
          />

          {/* Subscribers */}
          <Route
            path="/superadmin/subscribers"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperSubscribersStats />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/subscribers/doctors"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperSubscribedDoctors />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/subscribers/patients"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperSubscribedPatients />
              </RequireRole>
            }
          />
          <Route
            path="/superadmin/subscribers/pharmacy"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperadminSubscribedPharmacy />
              </RequireRole>
            }
          />

          <Route
            path="/superadmin/activity-logs"
            element={
              <RequireRole role="SUPERADMIN">
                <SuperadminActivityLogs />
              </RequireRole>
            }
          />

          <Route
            path="/superadmin/profile"
            element={
              <RequireRole role="SUPERADMIN">
                <UserProfile />
              </RequireRole>
            }
          />
          {/* ================= ADMIN ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireRole role="ADMIN">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <RequireRole role="ADMIN">
                <ManageUsers />
              </RequireRole>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RequireRole role="ADMIN">
                <Reports />
              </RequireRole>
            }
          />
          <Route
            path="/admin/messages/inbox"
            element={
              <RequireRole role="ADMIN">
                <Inbox />
              </RequireRole>
            }
          />
          <Route
            path="/admin/messages/send"
            element={
              <RequireRole role="ADMIN">
                <SendMessage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/admin-list"
            element={
              <RequireRole role="SUPERADMIN">
                <AdminList />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users-list"
            element={
              <RequireRole role="ADMIN">
                <UsersList />
              </RequireRole>
            }
          />
          <Route
            path="/admin/subscription"
            element={
              <RequireRole role="ADMIN">
                <SubscriptionSettings />
              </RequireRole>
            }
          />

          {/* Admin Subscribers */}
          <Route
            path="/admin/subscribers"
            element={
              <RequireRole role="ADMIN">
                <AdminSubscribersStats />
              </RequireRole>
            }
          />
          <Route
            path="/admin/subscribers/doctors"
            element={
              <RequireRole role="ADMIN">
                <AdminSubscribedDoctors />
              </RequireRole>
            }
          />
          <Route
            path="/admin/subscribers/patients"
            element={
              <RequireRole role="ADMIN">
                <AdminSubscribedPatients />
              </RequireRole>
            }
          />
          <Route
            path="/admin/subscribers/pharmacy"
            element={
              <RequireRole role="ADMIN">
                <AdminSubscribedPharmacy />
              </RequireRole>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <RequireRole role="ADMIN">
                <UserProfile />
              </RequireRole>
            }
          />
          {/* ================= DOCTOR ================= */}
          <Route
            path="/doctor/dashboard"
            element={
              <RequireRole role="DOCTOR">
                <DoctorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <RequireRole role="DOCTOR">
                <DoctorAppointments />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <RequireRole role="DOCTOR">
                <DoctorPrescriptions />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/messages/inbox"
            element={
              <RequireRole role="DOCTOR">
                <DoctorInbox />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/messages/send"
            element={
              <RequireRole role="DOCTOR">
                <DoctorSendMessage />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/subscription"
            element={
              <RequireRole role="DOCTOR">
                <DoctorSubscription />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <RequireRole role="DOCTOR">
                <PatientList />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/view-profile"
            element={
              <RequireRole role="DOCTOR">
                <DoctorViewProfile />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <RequireRole role="DOCTOR">
                <DoctorProfile />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/my-patients"
            element={
              <RequireRole role="DOCTOR">
                <MyPatientList />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/video-consultation"
            element={
              <RequireRole role="DOCTOR">
                <DoctorVideoConsultation />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <RequireRole role="DOCTOR">
                <DoctorSchedule />
              </RequireRole>
            }
          />

          {/* ================= PATIENT ================= */}
          <Route
            path="/patient/dashboard"
            element={
              <RequireRole role="PATIENT">
                <PatientDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/patient/book-appointment"
            element={
              <RequireRole role="PATIENT">
                <BookAppointment />
              </RequireRole>
            }
          />
          <Route
            path="/patient/my-appointments"
            element={
              <RequireRole role="PATIENT">
                <MyAppointments />
              </RequireRole>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <RequireRole role="PATIENT">
                <PatientPrescriptions />
              </RequireRole>
            }
          />
          <Route
            path="/patient/video-consultation"
            element={
              <RequireRole role="PATIENT">
                <PatientVideoConsultation />
              </RequireRole>
            }
          />
          <Route
            path="/patient/messages"
            element={
              <RequireRole role="PATIENT">
                <PatientInbox />
              </RequireRole>
            }
          />
          <Route
            path="/patient/messages/send"
            element={
              <RequireRole role="PATIENT">
                <PatientSendMessage />
              </RequireRole>
            }
          />
          <Route
            path="/patient/support"
            element={
              <RequireRole role="PATIENT">
                <MyTickets />
              </RequireRole>
            }
          />
          <Route
            path="/patient/support/tickets/:id"
            element={
              <RequireRole role="PATIENT">
                <TicketDetails />
              </RequireRole>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <RequireRole role="PATIENT">
                <PatientUpdateProfile />
              </RequireRole>
            }
          />
          <Route
            path="/patient/profile/view-profile"
            element={
              <RequireRole role="PATIENT">
                <PatientViewProfile />
              </RequireRole>
            }
          />
          <Route
            path="/patient/subscription"
            element={
              <RequireRole role="PATIENT">
                <PatientSubscription />
              </RequireRole>
            }
          />
          <Route
            path="/patient/doctors/list"
            element={
              <RequireRole role="PATIENT">
                <DoctorsList />
              </RequireRole>
            }
          />
          <Route
            path="/patient/doctors/my"
            element={
              <RequireRole role="PATIENT">
                <MyDoctors />
              </RequireRole>
            }
          />

          {/*================== PHARMACY ==================*/}
          <Route
            path="/pharmacy/dashboard"
            element={
              <RequireRole role="PHARMACY">
                <PharmacyDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/pharmacy/profile"
            element={
              <RequireRole role="PHARMACY">
                <PharmacyProfile />
              </RequireRole>
            }
          />
          <Route
            path="/pharmacy/prescriptions"
            element={
              <RequireRole role="PHARMACY">
                <PharmacyPrescriptions />
              </RequireRole>
            }
          />
          <Route
            path="/pharmacy/view-profile"
            element={
              <RequireRole role="PHARMACY">
                <PharmacyViewProfile />
              </RequireRole>
            }
          />

          {/* Patient: select pharmacy */}
          <Route
            path="/patient/select-pharmacy"
            element={
              <RequireRole role="PATIENT">
                <PatientSelectPharmacy />
              </RequireRole>
            }
          />
          {/* Patient: Pharmacy List (Sidebar link) */}
          <Route
            path="/patient/pharmacy/list"
            element={
              <RequireRole role="PATIENT">
                <PharmacyList />
              </RequireRole>
            }
          />
          {/* Patient: My Pharmacy */}
          <Route
            path="/patient/my-pharmacy"
            element={
              <RequireRole role="PATIENT">
                <MyPharmacy />
              </RequireRole>
            }
          />

          <Route
            path="/pharmacy/subscription"
            element={
              <RequireRole role="PHARMACY">
                {" "}
                <PharmacySubscription />{" "}
              </RequireRole>
            }
          />
          <Route
            path="/pharmacy/messages/inbox"
            element={
              <RequireRole role="PHARMACY">
                <PharmacyInbox />
              </RequireRole>
            }
          />
          <Route
            path="/pharmacy/messages/send"
            element={
              <RequireRole role="PHARMACY">
                <PharmacySendMessage />
              </RequireRole>
            }
          />

          {/* ================= SUPPORT ================= */}
          <Route
            path="/support/dashboard"
            element={
              <RequireRole role="SUPPORT">
                <SupportDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/support/tickets"
            element={
              <RequireRole role="SUPPORT">
                <SupportTickets />
              </RequireRole>
            }
          />
          <Route
            path="/support/live-chat"
            element={
              <RequireRole role="SUPPORT">
                <SupportLiveChat />
              </RequireRole>
            }
          />
          <Route
            path="/support/tickets/:id"
            element={
              <RequireRole role="SUPPORT">
                <SupportTickets />
              </RequireRole>
            }
          />
          <Route
            path="/support/subscribers/doctors"
            element={
              <RequireRole role="SUPPORT">
                <SupportSubscribedDoctors />
              </RequireRole>
            }
          />
          <Route
            path="/support/subscribers/patients"
            element={
              <RequireRole role="SUPPORT">
                <SupportSubscribedPatients />
              </RequireRole>
            }
          />
          <Route
            path="/support/subscribers/pharmacy"
            element={
              <RequireRole role="SUPPORT">
                <SupportSubscribedPharmacy />
              </RequireRole>
            }
          />

          <Route
            path="/support/profile"
            element={
              <RequireRole role="SUPPORT">
                <UserProfile />
              </RequireRole>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Chatbot />
    </BrowserRouter>
  );
}
