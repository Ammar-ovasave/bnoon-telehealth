import { Spinner } from "@/components/ui/spinner";
import { FC } from "react";
import Image from "next/image";

const LoadingPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white via-bnoon-light to-white">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bnoon-navy/5 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative animate-pulse">
          <Image
            src="/images/bnoon-logo-icon.svg"
            alt="Bnoon"
            width={70}
            height={70}
            className="w-16 h-16"
          />
        </div>
        
        {/* Spinner */}
        <Spinner className="w-6 h-6 text-bnoon-teal" />
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-bnoon-navy font-semibold text-lg">بنون</p>
          <p className="text-gray-400 text-sm mt-1">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
