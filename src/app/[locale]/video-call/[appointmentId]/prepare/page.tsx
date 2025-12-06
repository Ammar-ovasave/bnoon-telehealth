"use client";
import { useParams, useSearchParams } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Mic, MicOff, VideoOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format, subMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import useFertiSmartAppointment from "@/hooks/useFertiSmartAppointment";

const PrepareForVideoCallPage: FC = () => {
  const { appointmentId } = useParams();
  const { data: appointmentData, isLoading: isLoadingAppointment } = useFertiSmartAppointment({ id: appointmentId?.toString() });
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const didInitMediaStream = useRef(false);
  const [joinAppointmentLoading, setJoinAppointmentLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [enableMic, setEnableMic] = useState(true);
  const [enableCamera, setEnableCamera] = useState(true);
  const searchParams = useSearchParams();
  const authToken = searchParams.get("authToken");

  const enableJoinCallButton = useMemo<boolean>(() => {
    if (isLoadingAppointment) return false;
    if (loadingPermissions) return false;
    if (joinAppointmentLoading) return false;
    if (!appointmentData?.time?.start) return false;
    // return isCallTime;
    return true;
  }, [appointmentData?.time?.start, isLoadingAppointment, joinAppointmentLoading, loadingPermissions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!authToken) return;
    document.cookie = `auth-token=${authToken}; path=/; max-age=7776000`;
  }, [authToken]);

  const videoCallInitialSearchParams = useMemo(() => {
    const value = new URLSearchParams();
    value.set("initialEnableMic", enableMic.toString());
    value.set("initialEnableCamera", enableCamera.toString());
    return value;
  }, [enableMic, enableCamera]);

  const callAvailableTime = useMemo(() => {
    if (!appointmentData?.time?.start) return null;
    const callTime = new Date(appointmentData?.time?.start);
    return format(subMinutes(callTime, 5), "dd/MM HH:mm");
  }, [appointmentData?.time?.start]);

  const requestPermissions = useCallback(async () => {
    try {
      if (didInitMediaStream.current) return;
      if (stream) return;
      didInitMediaStream.current = true;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const enabledCamera = mediaStream.getVideoTracks().length > 0;
      const enabledMic = mediaStream.getAudioTracks().length > 0;
      setStream(mediaStream);
      setEnableCamera(enabledCamera);
      setEnableMic(enabledMic);
      setPermissions({
        camera: enabledCamera,
        microphone: enabledMic,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Could not access camera or microphone");
    } finally {
      setLoadingPermissions(false);
    }
  }, [stream]);

  const toggleMicrophone = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setEnableMic(audioTrack.enabled);
      }
    }
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setEnableCamera(videoTrack.enabled);
      }
    }
  }, [stream]);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setPermissions({
          camera: false,
          microphone: false,
        });
      }
    };
  }, [stream]);

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 pt-[90px]">
      <div className="relative mx-auto mb-4 h-[268px] w-full max-w-[400px] rounded-md bg-gray-600">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="mx-auto mb-4 h-[268px] w-full max-w-full rounded-md object-cover"
        />
        <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-4">
          <button
            onClick={permissions.microphone ? toggleMicrophone : requestPermissions}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors",
              permissions.microphone ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90"
            )}
          >
            {permissions.microphone && enableMic ? <Mic className="size-6" /> : <MicOff className="size-6" />}
          </button>
          <button
            onClick={permissions.camera ? toggleCamera : requestPermissions}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors",
              permissions.camera ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90"
            )}
          >
            {permissions.camera && enableCamera ? <Camera className="size-6" /> : <VideoOff className="size-6" />}
          </button>
        </div>
        {(loadingPermissions || isLoadingAppointment) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        )}
      </div>
      <h1 className={cn("w-full text-center text-2xl font-semibold")}>{`Teleconsultation`}</h1>
      <div className="mx-auto mt-4 mb-4">
        <Link
          href={enableJoinCallButton ? `/video-call/${appointmentData?.id}/join?${videoCallInitialSearchParams.toString()}` : "#"}
          onClick={(e) => {
            if (!enableJoinCallButton) {
              e.preventDefault();
            } else {
              setJoinAppointmentLoading(true);
            }
          }}
          title={appointmentData?.time?.start ? `You will be able to join the call on ${callAvailableTime}` : undefined}
        >
          <Button
            disabled={!enableJoinCallButton || isLoadingAppointment || loadingPermissions || joinAppointmentLoading}
            className="min-w-[140px]"
          >
            {isLoadingAppointment || loadingPermissions || joinAppointmentLoading ? (
              <>
                <Spinner className="size-4" />
                Loading...
              </>
            ) : (
              "Join Appointment"
            )}
          </Button>
        </Link>
      </div>
      {!loadingPermissions && !permissions.microphone && (
        <p className="text-center font-semibold text-destructive">Please allow microphone access</p>
      )}
    </div>
  );
};

export default PrepareForVideoCallPage;
