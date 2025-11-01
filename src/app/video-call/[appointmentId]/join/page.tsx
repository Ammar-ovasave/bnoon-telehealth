"use client";
import dynamic from "next/dynamic";
import { FC } from "react";

const PageContent = dynamic(() => import("./PageContent"), { ssr: false });

const JoinCallPage: FC = () => {
  return <PageContent />;
};

export default JoinCallPage;
