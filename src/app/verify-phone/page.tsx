"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight, Phone, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const selectedVisitType = searchParams.get("selectedVisitType");
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
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
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP code");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
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
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">+966</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="5XXXXXXXX"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter your Saudi phone number without the country code
              </p>
              <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
                <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
                  <ArrowLeft /> Back
                </Button>
                <Button
                  onClick={handleSendOtp}
                  disabled={!phoneNumber || phoneNumber.length < 9 || isLoading}
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
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
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
                  disabled={!otp || otp.length !== 6 || isLoading}
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
