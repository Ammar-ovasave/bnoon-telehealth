/**
 * Clears all user-specific data from browser storage.
 * Call this on logout to ensure no user data remains for security/privacy.
 */
export function clearAllUserData(): void {
  // Clear sessionStorage - user-specific data
  const sessionKeys = [
    "uploadSessionId", // Temp file upload session
    "idDocumentUrl", // Uploaded ID document URL
    "idDocumentFileName", // ID document filename
    "paymentMerchantReference", // APS payment reference
    "bnoon_phone", // Phone number during OTP flow
  ];
  sessionKeys.forEach((key) => sessionStorage.removeItem(key));

  // Clear localStorage - user-specific data only
  const localKeys = [
    "otpSentAt", // OTP resend throttling timestamp
  ];
  localKeys.forEach((key) => localStorage.removeItem(key));
}
