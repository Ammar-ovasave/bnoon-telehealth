import useSWR from "swr";

interface AgoraTokenResponse {
  token: string;
  appId: string;
}

export default function useAgoraToken({ appointmentId, userId }: { appointmentId?: string; userId: string }) {
  const { data, error, isLoading } = useSWR<AgoraTokenResponse>(
    appointmentId ? `/api/agora/token?appointmentId=${appointmentId}&userId=${userId}` : null
  );

  return {
    token: data?.token,
    appId: data?.appId,
    error,
    isLoading,
  };
}
