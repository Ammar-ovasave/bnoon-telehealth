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
import { useTranslations } from "next-intl";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";

function NavHeader() {
  const { data: currentUserData, isLoading } = useCurrentUser();
  const t = useTranslations("NavHeader");

  return (
    <header className="bg-white border-b border-b-neutral-200 px-4 py-4 flex items-center gap-4">
      <Link href={"/"}>
        <h2 className="text-primary font-bold">{t("bnoon")}</h2>
      </Link>
      <ul className="flex-1">
        {!isLoading && currentUserData?.mrn && (
          <li>
            <Link className="text-sm" href={"/manage-appointments"}>
              {t("myAppointments")}
            </Link>
          </li>
        )}
      </ul>
      <BranchName />
      {!isLoading && currentUserData?.mrn ? (
        <LogoutButton />
      ) : (
        <Link href={"/login"} className="cursor-pointer">
          <Button variant={"link"}>{t("login")}</Button>
        </Link>
      )}
    </header>
  );
}

const BranchName: FC = () => {
  const { data } = useCurrentBranch();
  const t = useTranslations("HomePage");

  if (!data?.branch?.id) return null;

  const branchName = t(`clinics.${data.branch.id}.name`);

  return <Badge className="hidden sm:block">{branchName}</Badge>;
};

const LogoutButton: FC = () => {
  const [loading, setLoading] = useState(false);
  const { mutate: mutateCurrentUser } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("NavHeader");
  const { mutate: mutatePatient } = useFertiSmartPatient();

  const handleClick = useCallback(async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    mutateCurrentUser(undefined);
    mutatePatient(undefined);
    router.replace("/");
  }, [mutateCurrentUser, mutatePatient, router]);

  return (
    <Button onClick={handleClick} variant={"link"} disabled={loading}>
      {loading ? <Spinner /> : t("logout")}
    </Button>
  );
};

export default NavHeader;
