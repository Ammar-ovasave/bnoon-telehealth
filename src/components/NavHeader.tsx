"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { Button } from "./ui/button";
import Link from "next/link";
import { FC, useCallback, useState } from "react";
import { logout } from "@/services/client";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { Badge } from "./ui/badge";

function NavHeader() {
  const { data: currentUserData, isLoading } = useCurrentUser();

  return (
    <header className="bg-white border-b border-b-neutral-200 px-4 py-4 flex items-center gap-4">
      <Link href={"/"}>
        <h2 className="text-primary font-bold">Bnoon</h2>
      </Link>
      <ul className="flex-1">
        {!isLoading && currentUserData?.mrn && (
          <li>
            <Link className="text-sm" href={"/manage-appointments"}>
              My Appointments
            </Link>
          </li>
        )}
      </ul>
      <BranchName />
      {!isLoading && currentUserData?.mrn ? (
        <LogoutButton />
      ) : (
        <Link href={"/login"} className="cursor-pointer">
          <Button variant={"link"}>Login</Button>
        </Link>
      )}
    </header>
  );
}

const BranchName: FC = () => {
  const { data } = useCurrentBranch();

  if (!data?.branch?.name) return null;

  return <Badge className="hidden sm:block">{data?.branch?.name}</Badge>;
};

const LogoutButton: FC = () => {
  const [loading, setLoading] = useState(false);
  const { mutate } = useCurrentUser();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    mutate(undefined);
    router.replace("/");
  }, [mutate, router]);

  return (
    <Button onClick={handleClick} variant={"link"} disabled={loading}>
      {loading ? <Spinner /> : `Logout`}
    </Button>
  );
};

export default NavHeader;
