import { Spinner } from "@/components/ui/spinner";
import { FC } from "react";

const LoadingPage: FC = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner className="size-8" />
    </div>
  );
};

export default LoadingPage;
