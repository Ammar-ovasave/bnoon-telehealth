import { useEffect, useState } from "react";

export default function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsClient(true);
  }, []);

  return { isClient };
}
