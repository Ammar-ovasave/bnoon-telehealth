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

  const handleVerifyOtp = async (authResponse: BnoonAuthResponse, phone?: string) => {
    // Debug logging
    console.log("--- verify-phone handleVerifyOtp ---");
    console.log("authResponse:", authResponse);
    console.log("authResponse.isNew:", authResponse.isNew);
    console.log("authResponse.user:", authResponse.user);
    console.log("authResponse.sessionId:", authResponse.sessionId);
    console.log("phone:", phone);

    // Build URL params for navigation
    const params = new URLSearchParams(searchParams.toString());

    // NEW GUEST: No user data, only sessionId
    // The user will complete registration when they submit the patient info form
    if (authResponse.isNew && !authResponse.user && authResponse.sessionId) {
      console.log("--- Setting guestFlow=true (new guest detected) ---");
      // Mark as guest flow - patient info form will call complete-registration
      params.set("guestFlow", "true");
      // Pass the phone number for display in review page
      if (phone) {
        params.set("guestPhone", phone);
      }
    } else if (authResponse.user) {
      console.log("--- Returning user detected, setting user data directly ---");
      // RETURNING USER: Has user data from verify-otp response
      // Set user data directly in AuthProvider (no need for extra /api/auth/me call)
      // This updates the navbar with user name immediately
      mutateCurrentUser({
        userId: authResponse.user.id,
        phone: authResponse.user.phone,
        firstName: authResponse.user.firstName || "",
        middleName: authResponse.user.middleName || "",
        lastName: authResponse.user.lastName || "",
        emailAddress: authResponse.user.emailAddress || "",
        sex: authResponse.user.sex,
      });
    } else {
      console.log("--- Unknown flow: not new guest, not returning user ---");
    }

    const selectedVisitType = searchParams.get("selectedVisitType");
    // If virtual appointments are disabled, always go to in-person
    if (selectedVisitType === "clinic" || !FEATURE_FLAGS.VIRTUAL_APPOINTMENTS_ENABLED) {
      router.push(`/${locale}/in-person-appointment-info?${params.toString()}`);
    } else {
      router.push(`/${locale}/virtual-visit-info?${params.toString()}`);
    }
  };

  const handleBack = () => {
    // Navigate back to select-date-and-time with preserved params
    router.push(`/${locale}/select-date-and-time?${searchParams.toString()}`);
  };

  return <VerifyPhoneNumberForm onVerifyPhoneSuccess={handleVerifyOtp} onBack={handleBack} />;
}
