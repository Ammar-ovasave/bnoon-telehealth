"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight, Phone, Shield, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const countryCodes = [
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+98", country: "Iran", flag: "🇮🇷" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+218", country: "Libya", flag: "🇱🇾" },
  { code: "+249", country: "Sudan", flag: "🇸🇩" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

export default function VerifyPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+966");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  //   const searchParams = useSearchParams();
  //   const selectedVisitType = searchParams.get("selectedVisitType");
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm(""); // Clear search when closing dropdown
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

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      alert("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowOtpInput(true);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      alert("Please enter a valid 4-digit OTP code");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const selectedVisitType = urlSearchParams.get("selectedVisitType");
      setIsLoading(false);
      if (selectedVisitType === "clinic") {
        router.push(`/in-person-appointment-info${window.location.search}`);
      } else {
        router.push(`/virtual-visit-info${window.location.search}`);
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    setOtp("");
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("OTP code resent successfully!");
    }, 1000);
  };

  const handleCountryCodeSelect = (code: string) => {
    setSelectedCountryCode(code);
    setIsDropdownOpen(false);
    setSearchTerm(""); // Clear search when selecting
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

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 mx-auto py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Phone className="h-8 w-8 text-primary dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {showOtpInput ? "Verify Your Phone Number" : "Enter Your Phone Number"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {showOtpInput
              ? "We've sent a verification code to your phone number. Please enter the 6-digit code below."
              : "We'll send you a verification code to confirm your phone number. This helps us keep your account secure."}
          </p>
        </div>
        {/* Phone Number Input */}
        {!showOtpInput && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-w-[120px]"
                  >
                    <span className="text-lg">{getSelectedCountry().flag}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedCountryCode}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
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
              <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
                <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
                  <ArrowLeft /> Back
                </Button>
                <Button
                  onClick={handleSendOtp}
                  disabled={!phoneNumber || phoneNumber.length < 7 || isLoading}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
                >
                  {isLoading ? "Sending..." : "Send Verification Code"} <ArrowRight />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Input */}
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
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                >
                  {`Didn't receive the code? Resend`}
                </button>
              </div>
              <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
                <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
                  <ArrowLeft /> Back
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={!otp || otp.length !== 4 || isLoading}
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
    </div>
  );
}
