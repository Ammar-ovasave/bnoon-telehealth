"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight, Shield, ChevronDown, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { availableCountryCodes } from "@/constants";
import { toast } from "sonner";
import { sendBnoonOTP, verifyBnoonOTP, getSessionStatus, BnoonAuthResponse } from "@/services/client";
import { Spinner } from "./ui/spinner";
import useTimer from "@/hooks/useTimer";
import { differenceInSeconds } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/providers/AuthProvider";

const OTP_LENGTH = 4;

export default function VerifyPhoneNumberForm({ onVerifyPhoneSuccess, onBack }: VerifyPhoneNumberFormProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+966");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("VerifyPhonePage");
  const locale = useLocale() as "ar" | "en";

  // Get global auth state (validated once at app level)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Check session status on mount to skip forms if phone is already verified
  // Only runs after global auth check is complete and user is NOT authenticated
  useEffect(() => {
    // Wait for global auth check to complete
    if (isAuthLoading) {
      return;
    }

    // User already authenticated - skip session check, just show form
    if (isAuthenticated) {
      setIsCheckingSession(false);
      return;
    }

    // Not authenticated - check guest session status
    const checkSession = async () => {
      try {
        const status = await getSessionStatus();

        if (status?.isPhoneVerified && status.phone && status.auth) {
          // Phone already verified in session - proceed directly with auth data
          const authResponse: BnoonAuthResponse = {
            success: true,
            isNew: status.auth.isNew,
            isProfileComplete: status.auth.isProfileComplete,
            sessionId: status.auth.sessionId,
            user: status.auth.user,
          };
          onVerifyPhoneSuccess(authResponse, status.phone);
          return;
        }

        if (status?.hasSession && status.phone && !status.isPhoneVerified) {
          // Session exists with phone but not verified - show OTP form
          // Extract country code and phone number
          const phoneMatch = status.phone.match(/^(\+\d+)(.+)$/);
          if (phoneMatch) {
            setSelectedCountryCode(phoneMatch[1]);
            setPhoneNumber(phoneMatch[2]);
          }
          setShowOtpInput(true);
        }
      } catch (error) {
        console.error("Error checking session status:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [isAuthLoading, isAuthenticated, onVerifyPhoneSuccess]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(`/${locale}`);
    }
  };

  const fullPhoneNumber = useMemo(() => {
    return `${selectedCountryCode}${phoneNumber.startsWith("0") ? phoneNumber.slice(1) : phoneNumber}`;
  }, [phoneNumber, selectedCountryCode]);

  /**
   * Send OTP using the new Bnoon auth flow
   * No branch selection or MRN required
   *
   * Handles alreadyVerified case: if phone was already verified in session,
   * auto-call verify-otp to proceed (OTP code not required for verified phones).
   */
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      alert(t("errors.invalidPhoneNumber"));
      return;
    }
    setIsLoading(true);

    const response = await sendBnoonOTP(fullPhoneNumber);

    if (!response?.success) {
      setIsLoading(false);
      return toast.error(t("errors.failedToSendOTP"));
    }

    // Handle alreadyVerified case - phone was verified in this session
    // Call verify-otp without code to proceed directly
    if (response.alreadyVerified) {
      const verifyResponse = await verifyBnoonOTP(fullPhoneNumber, "", locale);
      if (verifyResponse?.success) {
        setIsLoading(false);
        onVerifyPhoneSuccess(verifyResponse, fullPhoneNumber);
        return;
      }
    }

    localStorage.setItem("otpSentAt", new Date().toISOString());
    sessionStorage.setItem("bnoon_phone", fullPhoneNumber);
    setIsLoading(false);
    setShowOtpInput(true);
  };

  /**
   * Verify OTP using the new Bnoon auth flow
   * Creates or retrieves Bnoon user, issues JWT
   */
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== OTP_LENGTH) {
      alert(t("errors.invalidOTPCode", { otpLength: OTP_LENGTH }));
      return;
    }
    setIsLoading(true);

    const storedPhone = sessionStorage.getItem("bnoon_phone") ?? fullPhoneNumber;
    const response = await verifyBnoonOTP(storedPhone, otp, locale);

    if (!response?.success) {
      setIsLoading(false);
      return toast.error(t("errors.invalidOTP"));
    }

    // Keep the phone in sessionStorage for guest flow (cleared after complete-registration)
    // Pass the phone to the callback for URL param propagation
    const verifiedPhone = storedPhone;

    setTimeout(() => {
      setIsLoading(false);
      // Pass the phone to the callback so it can be used in guest flow
      onVerifyPhoneSuccess(response, verifiedPhone);
    }, 200);
  };

  const handleCountryCodeSelect = (code: string) => {
    setSelectedCountryCode(code);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const getSelectedCountry = () => {
    return availableCountryCodes.find((country) => country.code === selectedCountryCode) || availableCountryCodes[0];
  };

  const getFilteredCountries = () => {
    if (!searchTerm.trim()) {
      return availableCountryCodes;
    }

    const term = searchTerm.toLowerCase();
    return availableCountryCodes.filter(
      (country) =>
        country.country.toLowerCase().includes(term) ||
        country.code.includes(term) ||
        country.country.toLowerCase().includes(term.replace(/\s+/g, ""))
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const lastSentOTPAt = typeof window !== "undefined" ? localStorage.getItem("otpSentAt") : null;

  const secondsSinceLastSend = lastSentOTPAt ? differenceInSeconds(new Date(), new Date(lastSentOTPAt)) : Infinity;
  const totalTimer = 60 * 2;
  const initialTime = Math.max(0, totalTimer - secondsSinceLastSend);

  const { remainingTime } = useTimer({ timeInSeconds: initialTime });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimerActive = remainingTime > 0 && lastSentOTPAt !== null;

  // Show loading while checking auth or session status
  if (isAuthLoading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 flex justify-center items-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 mx-auto py-8 md:py-12 max-w-xl pb-24">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#004e77] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004e77]/20">
                {showOtpInput ? (
                  <Shield className="h-10 w-10 text-white" />
                ) : (
                  <Phone className="h-10 w-10 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-bnoon-gray dark:text-white mb-3">
              {showOtpInput ? t("title.verifyPhone") : t("title.enterPhone")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              {showOtpInput ? t("description.verifyPhone", { otpLength: OTP_LENGTH }) : t("description.enterPhone")}
            </p>
          </div>

          {/* Phone Number Input */}
          {!showOtpInput && (
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <label htmlFor="phone" className="block text-sm font-semibold text-bnoon-navy dark:text-white mb-3">
                  {t("labels.phoneNumber")}
                </label>
                <div className="flex gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-bnoon-light dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 hover:border-bnoon-teal/50 transition-colors min-w-[110px] focus:outline-none focus:border-bnoon-teal"
                    >
                      <span className="text-lg">{getSelectedCountry().flag}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{selectedCountryCode}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full ltr:left-0 rtl:right-0 mt-2 w-72 max-h-64 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder={t("placeholders.searchCountries")}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-bnoon-teal transition-colors"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {getFilteredCountries().length > 0 ? (
                            getFilteredCountries().map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountryCodeSelect(country.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10 transition-colors ${
                                  selectedCountryCode === country.code ? "bg-bnoon-teal/10 text-bnoon-teal" : ""
                                }`}
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">{country.code}</span>
                                <span className="text-gray-800 dark:text-gray-200">{country.country}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {t("messages.noCountriesFound", { searchTerm })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder={
                      selectedCountryCode === "+966" ? t("placeholders.phoneNumberKSA") : t("placeholders.phoneNumber")
                    }
                    className="flex-1 px-4 ltr:text-left rtl:text-right py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors text-lg"
                    maxLength={15}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{t("labels.enterPhoneWithoutCode")}</p>
                
                {isTimerActive && (
                  <div className="mt-6 p-4 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 border border-bnoon-teal/20 dark:border-bnoon-teal/30 rounded-xl">
                    <p className="text-sm text-bnoon-navy dark:text-white text-center font-medium">
                      {t("messages.waitBeforeRequest", { time: formatTime(remainingTime) })}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
                  <Button onClick={handleBack} variant="outline" size="lg" className="w-full sm:w-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                    <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
                  </Button>
                  <Button
                    onClick={handleSendOtp}
                    disabled={!phoneNumber || phoneNumber.length < 7 || isLoading || isTimerActive}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        {t("buttons.sending")}
                      </>
                    ) : (
                      <>
                        {t("buttons.sendVerificationCode")}
                        <ArrowRight className="rtl:scale-x-[-1]" />
                      </>
                    )}
                  </Button>
            </div>
              </div>
            </div>
          )}

          {/* OTP Input */}
          {showOtpInput && (
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-14 h-14 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-7 w-7 text-bnoon-teal" />
                  </div>
                </div>
                <label className="block text-sm font-semibold text-bnoon-navy dark:text-white mb-6 text-center">
                  {t("labels.enterVerificationCode")}
                </label>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-3">
                    <InputOTPGroup className="gap-3">
                      {Array(OTP_LENGTH)
                        .fill(0)
                        .map((_, i) => {
                          return (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="w-14 h-14 text-xl font-bold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-bnoon-teal transition-colors"
                            />
                          );
                        })}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
                  <Button
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={!otp || otp.length !== OTP_LENGTH || isLoading}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        {t("buttons.verifying")}
                      </>
                    ) : (
                      <>
                        {t("buttons.verifyPhoneNumber")}
                        <ArrowRight className="rtl:scale-x-[-1]" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

interface VerifyPhoneNumberFormProps {
  /**
   * Called after successful OTP verification
   * @param authResponse - Contains isNew, isProfileComplete, and user data
   * @param phone - The phone number that was verified (for guest flow)
   */
  onVerifyPhoneSuccess: (authResponse: BnoonAuthResponse, phone?: string) => void;
  /**
   * Called when user clicks back button
   * If not provided, navigates to home page
   */
  onBack?: () => void;
}
