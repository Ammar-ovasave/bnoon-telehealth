import { FC } from "react";
import { Spinner } from "./ui/spinner";
import Image from "next/image";

const LoadingOverlay: FC<LoadingOverlayProps> = ({ children, visible }) => {
  return (
    <>
      {children}
      {visible && (
        <div className="fixed z-[999] inset-0 flex flex-col justify-center items-center w-full h-full bg-bnoon-navy/90 backdrop-blur-sm">
          {/* Logo */}
          <div className="relative mb-6 animate-pulse">
            <Image
              src="/images/bnoon-logo-icon.svg"
              alt="Bnoon"
              width={70}
              height={70}
              className="w-16 h-16 brightness-0 invert"
            />
          </div>
          {/* Spinner */}
          <Spinner className="w-8 h-8 text-white mb-4" />
          {/* Text */}
          <p className="text-white/80 text-sm font-medium">جاري التحميل...</p>
        </div>
      )}
    </>
  );
};

interface LoadingOverlayProps {
  children: React.ReactNode;
  visible: boolean;
}

export default LoadingOverlay;
