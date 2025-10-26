"use client";
import VerifyPhoneNumberForm from "@/components/VerifyPhoneNumberForm";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const router = useRouter();

  const handleVerifyOtp = async () => {
    // if (!otp || otp.length !== OTP_LENGTH) {
    //   alert(`Please enter a valid ${OTP_LENGTH}-digit OTP code`);
    //   return;
    // }
    // setIsLoading(true);
    // const response = await verifyOTP({
    //   code: otp,
    //   mrn: sessionStorage.getItem("mrn") ?? "",
    //   purpose: sessionStorage.getItem("purpose") ?? "",
    // });
    // if (!response?.verified) {
    //   setIsLoading(false);
    //   return toast.error("Invalid OTP. Please try again.");
    // }
    // setIsLoading(false);
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
