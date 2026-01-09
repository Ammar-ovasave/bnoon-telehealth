"use client";
import VerifyPhoneNumberForm from "@/components/VerifyPhoneNumberForm";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import useCurrentUser from "@/hooks/useCurrentUser";
import { BnoonAuthResponse } from "@/services/client";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { mutate: mutateCurrentUser } = useCurrentUser();

  const handleVerifyOtp = async (authResponse: BnoonAuthResponse) => {
    // Revalidate SWR cache to fetch user data with new auth cookie
    // This updates the navbar with user name and enables appointments fetch
    await mutateCurrentUser();

    // Navigate to manage appointments
    router.replace(`/manage-appointments`);
  };

  const handleBack = () => {
    // Navigate back to home page
    router.push(`/${locale}`);
  };

  return <VerifyPhoneNumberForm onVerifyPhoneSuccess={handleVerifyOtp} onBack={handleBack} />;
}
