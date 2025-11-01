"use client";
import VerifyPhoneNumberForm from "@/components/VerifyPhoneNumberForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleVerifyOtp = async () => {
    router.replace(`/manage-appointments`);
  };

  return <VerifyPhoneNumberForm onVerifyPhoneSuccess={handleVerifyOtp} />;
}
