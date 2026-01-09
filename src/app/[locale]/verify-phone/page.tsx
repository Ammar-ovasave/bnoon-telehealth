"use client";
import VerifyPhoneNumberForm from "@/components/VerifyPhoneNumberForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { FEATURE_FLAGS } from "@/constants";
import useCurrentUser from "@/hooks/useCurrentUser";
import { BnoonAuthResponse } from "@/services/client";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { mutate: mutateCurrentUser } = useCurrentUser();

  const handleVerifyOtp = async (_authResponse: BnoonAuthResponse) => {
    // Revalidate SWR cache to fetch user data with new auth cookie
    // This updates the navbar with user name
    await mutateCurrentUser();

    const selectedVisitType = searchParams.get("selectedVisitType");
    // If virtual appointments are disabled, always go to in-person
    if (selectedVisitType === "clinic" || !FEATURE_FLAGS.VIRTUAL_APPOINTMENTS_ENABLED) {
      router.push(`/${locale}/in-person-appointment-info?${searchParams.toString()}`);
    } else {
      router.push(`/${locale}/virtual-visit-info?${searchParams.toString()}`);
    }
  };

  const handleBack = () => {
    // Navigate back to select-date-and-time with preserved params
    router.push(`/${locale}/select-date-and-time?${searchParams.toString()}`);
  };

  return <VerifyPhoneNumberForm onVerifyPhoneSuccess={handleVerifyOtp} onBack={handleBack} />;
}
