import { AlertsCenter } from "@/modules/alerts/components/alerts-center";
import { alertsMock } from "@/modules/alerts/mock";

export default function AlertsPage() {
  return <AlertsCenter alerts={alertsMock} />;
}
