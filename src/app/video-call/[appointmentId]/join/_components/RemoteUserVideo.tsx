import { IAgoraRTCRemoteUser, RemoteUser } from "agora-rtc-react";
import { FC } from "react";

interface RemoteUserVideoProps {
  agoraUser: IAgoraRTCRemoteUser;
}

const RemoteUserVideo: FC<RemoteUserVideoProps> = ({ agoraUser }) => {
  return (
    <div key={agoraUser.uid} className="h-full w-full overflow-hidden rounded-lg">
      <RemoteUser className="agora-remote-user rounded-lg" user={agoraUser} />
    </div>
  );
};

export default RemoteUserVideo;
