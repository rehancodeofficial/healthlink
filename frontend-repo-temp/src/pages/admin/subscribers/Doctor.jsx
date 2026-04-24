// FILE: src/pages/admin/subscribers/Doctors.jsx
import SubscribersList from "../../shared/SubscribersList";
export default function AdminSubscribedDoctors() {
  return <SubscribersList title="Subscribed Doctors" role="ADMIN" filterRole="DOCTOR" />;
}