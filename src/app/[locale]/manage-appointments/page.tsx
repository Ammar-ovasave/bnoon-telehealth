import { redirect } from "next/navigation";
import { getCurrentUser } from "../../api/current-user/_services";
import ManageAppointmentPageContent from "./ManageAppointmentPageContent";

export default async function ManageAppointmentsPage() {
  const currentUser = await getCurrentUser();

  // Redirect to home if user is not authenticated (Bnoon users have userId)
  if (!currentUser?.userId) {
    return redirect("/");
  }

  return <ManageAppointmentPageContent />;
}
