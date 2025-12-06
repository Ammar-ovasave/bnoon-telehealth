import { redirect } from "next/navigation";
import { getCurrentUser } from "../../api/current-user/_services";
import ManageAppointmentPageContent from "./ManageAppointmentPageContent";

export default async function ManageAppointmentsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.mrn) {
    return redirect("/");
  }

  return <ManageAppointmentPageContent />;
}
