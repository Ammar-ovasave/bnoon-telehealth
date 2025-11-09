import { FC } from "react";
import { Spinner } from "./ui/spinner";

const LoadingOverlay: FC<LoadingOverlayProps> = ({ children, visible }) => {
  return (
    <>
      {children}
      {visible && (
        <div className="fixed z-[999] inset-0 flex justify-center items-center w-full h-full bg-black/80">
          <Spinner className="size-12 text-white" />
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
