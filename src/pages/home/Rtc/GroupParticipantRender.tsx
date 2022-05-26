import { Participant } from "livekit-client";
import { AudioRenderer, useParticipant, VideoRenderer } from "livekit-react";
import rtc_voice_on from "@/assets/images/rtc_voice_on.png";
import rtc_voice_off from "@/assets/images/rtc_voice_off.png";
import { useEffect, useState } from "react";
import { GroupItem, GroupMemberItem, PublicUserItem } from "../../../utils/open_im_sdk/types";
import MyAvatar from "../../../components/MyAvatar";

export interface ParticipantProps {
  participant: Participant;
  isVideo?: boolean;
}

type MetaType = {
  groupInfo: GroupItem | null;
  groupMemberInfo: GroupMemberItem | null;
  userInfo: PublicUserItem | null;
};

type PartInfo = {
  userID: string | undefined;
  faceURL: string | undefined;
  nickname: string | undefined;
  roleLevel: number | undefined;
};

export const GroupParticipantRender = ({ participant, isVideo = true }: ParticipantProps) => {
  const [meta, setMeta] = useState<PartInfo>();
  const { cameraPublication, microphonePublication, isLocal, metadata, connectionQuality, isSpeaking } = useParticipant(participant);

  useEffect(() => {
    if (metadata) {
      const data: MetaType = JSON.parse(metadata);
      setMeta({
        userID: data.userInfo?.userID,
        faceURL: data.userInfo?.faceURL,
        nickname: data.groupMemberInfo?.nickname ?? data.userInfo?.nickname,
        roleLevel: data.groupMemberInfo?.roleLevel,
      });
    }
  }, [metadata]);

  const isAudioMuted = !participant.isMicrophoneEnabled;
  const isVideoMuted = !participant.isCameraEnabled;

  const VideoCpm = cameraPublication?.track && (
    <>
      {isVideoMuted ? (
        <MyAvatar style={{ width: "100%", height: "100%" }} src={meta?.faceURL} />
      ) : (
        <VideoRenderer objectFit="contain" width="100%" height="100%" isLocal={isLocal} track={cameraPublication.track} />
      )}
      <div className="remote_info">
        <div>{meta?.nickname}</div>
        <img src={isAudioMuted ? rtc_voice_off : rtc_voice_on} />
      </div>
    </>
  );

  const AudioCpm = (
    <>
      <MyAvatar style={{ width: "100%", height: "100%" }} src={meta?.faceURL} />
      <div className="nickname">{meta?.nickname}</div>
      <img className="icon" src={isAudioMuted ? rtc_voice_off : rtc_voice_on} />
    </>
  );

  return (
    <div className={`par_con ${isSpeaking ? "speaking" : ""}`}>
      {isVideo ? VideoCpm : AudioCpm}
      {microphonePublication?.track && <AudioRenderer track={microphonePublication?.track} isLocal={false} />}
    </div>
  );
};
