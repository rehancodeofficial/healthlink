// FILE: src/pages/superadmin/subscribers/Doctors.jsx
import SubscribersList from "../../shared/SubscribersList";
export default function SuperSubscribedDoctors() {
  return <SubscribersList title="Subscribed Doctors" role="SUPERADMIN" filterRole="DOCTOR" />;
}