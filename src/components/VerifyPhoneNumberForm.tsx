"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight, Phone, Shield, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { countryCodes } from "@/constants";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import { toast } from "sonner";
import { createPatient, getPatientsByPhoneNumber, sendOTP, verifyOTP } from "@/services/client";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Spinner } from "./ui/spinner";
import useTimer from "@/hooks/useTimer";
import { differenceInSeconds } from "date-fns";

const OTP_LENGTH = 4;

export default function VerifyPhoneNumberForm({ onVerifyPhoneSuccess }: VerifyPhoneNumberFormProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+966");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    router.back();
  };

  const { data: branchesData, isLoading: loadingBranches } = useFertiSmartBranches();

  const selectedBranch = branchesData?.[0];

  const { data: currentUserData, isLoading: loadingCurrentUser, mutate: mutateCurrentUser } = useCurrentUser();

  const fullPhoneNumber = useMemo(() => {
    return `${selectedCountryCode}${phoneNumber.startsWith("0") ? phoneNumber.slice(1) : phoneNumber}`;
  }, [phoneNumber, selectedCountryCode]);

  const handleSendOtp = async () => {
    if (!selectedBranch) {
      return toast.error("Branch not found");
    }
    if (!phoneNumber || phoneNumber.length < 7) {
      alert("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    const existingPatients = await getPatientsByPhoneNumber({ phoneNumber: fullPhoneNumber });
    const createPatientResponse = currentUserData?.mrn
      ? { mrn: currentUserData.mrn }
      : (existingPatients?.length ?? 0) > 0
      ? existingPatients?.[0]
      : await createPatient({
          branchId: selectedBranch.id ?? 0,
          patient: { contactNumber: fullPhoneNumber, firstName: "-", lastName: "-" },
        });
    const mrnToUse = currentUserData?.mrn
      ? currentUserData.mrn
      : (existingPatients?.length ?? 0) > 0
      ? existingPatients?.[0].mrn
      : createPatientResponse?.mrn;
    if (!mrnToUse) {
      setIsLoading(false);
      return toast.error("Faild to create a patient");
    }
    const purpose = "verify phone number";
    const sendOTPResponse = await sendOTP({
      mrn: mrnToUse,
      channel: "sms",
      maxAttempts: 5,
      purpose: purpose,
      ttlMinutes: 10 * 60,
    });
    if (!sendOTPResponse?.length) {
      setIsLoading(false);
      return toast.error("Faild to send OTP");
    }
    // console.log("sendOTPResponse", sendOTPResponse);
    // sessionStorage.setItem("otp", sendOTPResponse.code);
    localStorage.setItem("otpSentAt", new Date().toISOString());
    sessionStorage.setItem("mrn", mrnToUse);
    sessionStorage.setItem("purpose", purpose);
    setIsLoading(false);
    setShowOtpInput(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== OTP_LENGTH) {
      alert(`Please enter a valid ${OTP_LENGTH}-digit OTP code`);
      return;
    }
    setIsLoading(true);
    const response = await verifyOTP({
      code: otp,
      mrn: sessionStorage.getItem("mrn") ?? "",
      purpose: sessionStorage.getItem("purpose") ?? "",
    });
    if (!response?.verified) {
      setIsLoading(false);
      return toast.error("Invalid OTP. Please try again.");
    }
    // const urlSearchParams = new URLSearchParams(window.location.search);
    // const selectedVisitType = urlSearchParams.get("selectedVisitType");
    mutateCurrentUser(undefined);
    setTimeout(() => {
      setIsLoading(false);
      onVerifyPhoneSuccess();
    }, 200);
    // if (selectedVisitType === "clinic") {
    //   router.push(`/in-person-appointment-info${window.location.search}`);
    // } else {
    //   router.push(`/virtual-visit-info${window.location.search}`);
    // }
  };

  const handleCountryCodeSelect = (code: string) => {
    setSelectedCountryCode(code);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const getSelectedCountry = () => {
    return countryCodes.find((country) => country.code === selectedCountryCode) || countryCodes[0];
  };

  const getFilteredCountries = () => {
    if (!searchTerm.trim()) {
      return countryCodes;
    }

    const term = searchTerm.toLowerCase();
    return countryCodes.filter(
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

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      {loadingCurrentUser || loadingBranches ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner className="size-10" />
        </div>
      ) : (
        <div className="px-4 mx-auto py-8 max-w-2xl pb-30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {showOtpInput ? "Verify Your Phone Number" : "Enter Your Phone Number"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {showOtpInput
                ? `We've sent a verification code to your phone number. Please enter the ${OTP_LENGTH}-digit code below.`
                : "We'll send you a verification code to confirm your phone number. This helps us keep your account secure."}
            </p>
          </div>
          {/* Phone Number Input */}
          {!showOtpInput && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      disabled={true}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-w-[100px]"
                    >
                      <span className="text-lg">{getSelectedCountry().flag}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedCountryCode}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-80 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {getFilteredCountries().length > 0 ? (
                            getFilteredCountries().map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountryCodeSelect(country.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                  selectedCountryCode === country.code ? "bg-blue-50 dark:bg-blue-900" : ""
                                }`}
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-gray-600 dark:text-gray-400">{country.code}</span>
                                <span className="text-gray-800 dark:text-gray-200">{country.country}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No countries found matching &quot;{searchTerm}&quot;
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
                    placeholder={selectedCountryCode === "+966" ? "5XXXXXXXX" : "Enter phone number"}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    maxLength={15}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter your phone number without the country code</p>
                {isTimerActive && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      Please wait <span className="font-mono font-semibold text-primary">{formatTime(remainingTime)}</span> before
                      requesting a new code
                    </p>
                  </div>
                )}
                <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
                  <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
                    <ArrowLeft /> Back
                  </Button>
                  <Button
                    onClick={handleSendOtp}
                    disabled={!phoneNumber || phoneNumber.length < 7 || isLoading || isTimerActive}
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"} <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          )}
          {showOtpInput && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-2">
                    <InputOTPGroup>
                      {Array(OTP_LENGTH)
                        .fill(0)
                        .map((_, i) => {
                          return <InputOTPSlot key={i} index={i} />;
                        })}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
                  <Button
                    onClick={() => {
                      setShowOtpInput(false);
                    }}
                    variant="outline"
                    size="lg"
                    className="px-6 py-3 w-full md:w-auto"
                  >
                    <ArrowLeft /> Back
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={!otp || otp.length !== OTP_LENGTH || isLoading}
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
                  >
                    {isLoading ? "Verifying..." : "Verify Phone Number"} <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VerifyPhoneNumberFormProps {
  onVerifyPhoneSuccess: () => void;
}
