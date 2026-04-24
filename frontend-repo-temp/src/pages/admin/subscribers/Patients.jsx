// FILE: src/pages/admin/subscribers/Patients.jsx
import SubscribersList from "../../shared/SubscribersList";
export default function AdminSubscribedPatients() {
  return <SubscribersList title="Subscribed Patients" role="ADMIN" filterRole="PATIENT" />;
}