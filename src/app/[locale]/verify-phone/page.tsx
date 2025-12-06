"use client";
import VerifyPhoneNumberForm from "@/components/VerifyPhoneNumberForm";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const router = useRouter();

  const handleVerifyOtp = async () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const selectedVisitType = urlSearchParams.get("selectedVisitType");
    if (selectedVisitType === "clinic") {
      router.push(`/in-person-appointment-info${window.location.search}`);
    } else {
      router.push(`/virtual-visit-info${window.location.search}`);
    }
  };

  return <VerifyPhoneNumberForm onVerifyPhoneSuccess={handleVerifyOtp} />;
}
