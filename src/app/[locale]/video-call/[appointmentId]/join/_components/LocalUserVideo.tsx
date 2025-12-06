import { ICameraVideoTrack, IMicrophoneAudioTrack, LocalUser } from "agora-rtc-react";
import { FC } from "react";
import { cn } from "@/lib/utils";

interface LocalUserVideoProps {
  enableCamera: boolean;
  enableMic: boolean;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
  localCameraTrack: ICameraVideoTrack | null;
  didRemoteUserJoin: boolean;
}

const LocalUserVideo: FC<LocalUserVideoProps> = ({
  enableCamera,
  didRemoteUserJoin,
  enableMic,
  localMicrophoneTrack,
  localCameraTrack,
}) => {
  return (
    <div
      className={cn(
        "absolute left-2 top-2 z-20 overflow-hidden rounded-xl transition-all ease-out",
        didRemoteUserJoin ? "w-[200px] aspect-video" : "w-[calc(100%-1rem)] h-[calc(100%-1rem)]"
      )}
    >
      <LocalUser
        className="agora-local-user rounded-xl"
        audioTrack={localMicrophoneTrack}
        cameraOn={enableCamera}
        micOn={enableMic}
        videoTrack={localCameraTrack}
      >
        <div className="px-2 py-1">
          <div className="text-lg font-semibold">You</div>
        </div>
      </LocalUser>
    </div>
  );
};

export default LocalUserVideo;
