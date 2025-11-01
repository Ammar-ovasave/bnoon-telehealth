"use client";
import { FC, useEffect } from "react";
import dynamic from "next/dynamic";
import useIsClient from "@/hooks/useIsClient";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

const AppointmentCall = dynamic(() => import("./_components/AppointmentCall"), { ssr: false });

const PageContent: FC = () => {
  const { isClient } = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    AgoraRTC.setLogLevel(1);
  }, [isClient]);

  const agoraClient = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

  if (!isClient || !agoraClient) return null;

  return (
    <AgoraRTCProvider client={agoraClient}>
      <AppointmentCall />
    </AgoraRTCProvider>
  );
};

export default PageContent;
