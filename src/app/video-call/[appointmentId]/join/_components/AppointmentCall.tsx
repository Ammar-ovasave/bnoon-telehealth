"use client";
import { useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { useParams, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import useIsClient from "@/hooks/useIsClient";
import useAgoraToken from "@/hooks/useAgoraToken";
import useCurrentUser from "@/hooks/useCurrentUser";
import LocalUserVideo from "./LocalUserVideo";
import RemoteUserVideo from "./RemoteUserVideo";
import EndCallButton from "./EndCallButton";
import MicButton from "./MicButton";
import CameraButton from "./CameraButton";

const AppointmentCall: FC = () => {
  const searchParams = useSearchParams();
  const { appointmentId } = useParams();
  const initialEnableMic = searchParams.get("initialEnableMic") === "true";
  const initialEnableCamera = searchParams.get("initialEnableCamera") === "true";
  const { isClient } = useIsClient();
  const [enableMic, setEnableMic] = useState(initialEnableMic);
  const [enableCamera, setEnableCamera] = useState(initialEnableCamera);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isClient && enableMic);
  const { data: user } = useCurrentUser();
  const client = useRTCClient();

  useEffect(() => {
    if (!user) return;
    if (localMicrophoneTrack) {
      try {
        localMicrophoneTrack.setEnabled(enableMic);
        localMicrophoneTrack.play = () => Promise.resolve();
      } catch (error) {
        console.error("Error enabling microphone:", error);
      }
    }
  }, [localMicrophoneTrack, enableMic, user]);

  const { localCameraTrack } = useLocalCameraTrack(isClient && enableCamera);
  const { token, appId } = useAgoraToken({
    userId: user?.mrn ?? new Date().toISOString(),
    appointmentId: appointmentId?.toString(),
  });

  const uid = user?.mrn;

  useJoin({ appid: appId ?? "", channel: appointmentId as string, token: token ?? "", uid }, !!token && !!appId && !!uid);

  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  useEffect(() => {
    if (!user) return;
    if (!client || !appointmentId) return;
    const handleException = (event: { code?: string; msg?: string; uid?: string | number }) => {
      console.error("Agora exception:", event);
    };
    const handleConnectionStateChange = (curState: string, prevState: string, reason?: string) => {
      console.log(`Connection state changed: ${prevState} -> ${curState}`, reason);
    };
    const handleError = (error: Error) => {
      console.error("Agora error:", error);
    };
    client.on("exception", handleException);
    client.on("connection-state-change", handleConnectionStateChange);
    client.on("error", handleError);
    return () => {
      client.off("exception", handleException);
      client.off("connection-state-change", handleConnectionStateChange);
      client.off("error", handleError);
    };
  }, [client, appointmentId, user]);

  return (
    <div className="relative h-[calc(100vh-70px)] w-full bg-primary p-2">
      <LocalUserVideo
        didRemoteUserJoin={!!remoteUsers.length}
        enableCamera={enableCamera}
        enableMic={enableMic}
        localMicrophoneTrack={localMicrophoneTrack}
        localCameraTrack={localCameraTrack}
      />
      {remoteUsers.map((user) => {
        return <RemoteUserVideo key={user.uid} agoraUser={user} />;
      })}
      <div className="absolute bottom-8 left-4 right-4 z-30 flex justify-center gap-8">
        <EndCallButton />
        <div className="flex gap-4">
          <MicButton enabled={enableMic} onClick={() => setEnableMic(!enableMic)} />
          <CameraButton enabled={enableCamera} onClick={() => setEnableCamera(!enableCamera)} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCall;
