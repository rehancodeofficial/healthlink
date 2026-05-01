// FILE: src/pages/superadmin/subscribers/Patients.jsx
import SubscribersList from "../../shared/SubscribersList";
export default function SuperSubscribedPatients() {
  return <SubscribersList title="Subscribed Patients" role="SUPERADMIN" filterRole="PATIENT" />;
}