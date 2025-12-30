import { Spinner } from "@/components/ui/spinner";
import { FC } from "react";
import Image from "next/image";

const LoadingPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative animate-pulse">
          <Image
            src="/images/bnoon-logo-icon.svg"
            alt="Bnoon"
            width={70}
            height={70}
            className="w-16 h-16 dark:brightness-110"
          />
        </div>
        
        {/* Spinner */}
        <Spinner className="w-6 h-6 text-bnoon-teal" />
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-bnoon-navy dark:text-white font-semibold text-lg">بنون</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
