"use client";

import { FC } from "react";
import { Spinner } from "./ui/spinner";
import { useTranslations } from "next-intl";

const LoadingOverlay: FC<LoadingOverlayProps> = ({ children, visible }) => {
  const t = useTranslations("HomePage");

  return (
    <>
      {children}
      {visible && (
        <div className="fixed z-[999] inset-0 flex flex-col justify-center items-center w-full h-full bg-black/80 backdrop-blur-sm">
          <Spinner className="w-10 h-10 text-white mb-4" />
          <p className="text-white/80 text-sm font-medium">{t("loading")}</p>
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
