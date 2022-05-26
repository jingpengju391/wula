import { RemoteParticipant } from "livekit-client";
import { VideoRenderer, AudioRenderer, useParticipant } from "livekit-react";

const SinglePartRender = ({ part, isVideo }: { part: RemoteParticipant; isVideo: boolean }) => {
  const { cameraPublication, microphonePublication } = useParticipant(part);

  return (
    <>
      {cameraPublication?.track && <VideoRenderer objectFit="contain" width="100%" height="100%" isLocal={false} track={cameraPublication?.track} />}
      {microphonePublication?.track && <AudioRenderer track={microphonePublication?.track} isLocal={false} />}
    </>
  );
};

export default SinglePartRender;
