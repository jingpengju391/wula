import { Tooltip, Image, Spin, Progress } from "antd";
import { useState, useRef, CSSProperties, useEffect, FC, useMemo, memo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { LngLat, Map, Marker } from "react-amap";
import MyAvatar from "../../../../../components/MyAvatar";
import { MERMSGMODAL, SHOWPLAYERMODAL } from "../../../../../constants/events";
import { faceMap } from "../../../../../constants/faceType";
import { customType } from "../../../../../constants/messageContentType";
import { RootState } from "../../../../../store";
import { formatDate, switchFileIcon, bytesToSize, events, isSingleCve, parseTime } from "../../../../../utils";

import other_voice from "@/assets/images/voice_other.png";
import my_voice from "@/assets/images/voice_my.png";
import my_video_call from "@/assets/images/custom_video_my.png";
import other_video_call from "@/assets/images/custom_video_other.png";
import voice_call from "@/assets/images/custom_voice.png";
import { useTranslation } from "react-i18next";
import {
  ConversationItem,
  FileElem,
  MergeElem,
  MessageItem,
  MessageStatus,
  MessageType,
  NotificationElem,
  PictureElem,
  SoundElem,
  VideoElem,
} from "../../../../../utils/open_im_sdk/types";
import { t } from "i18next";
import { LoadingOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { isFileDownloaded } from "../../../../../utils/im";

//修改于2022年3月27日 17:59:33
import { MinIOAddress, FileStorage } from "../../../../../config/index"
import ImgLoad from '../../../components/ImgLoad'

type SwitchMsgTypeProps = {
  msg: MessageItem;
  audio: React.RefObject<HTMLAudioElement>;
  curCve: ConversationItem;
  selfID: string;
  imgClick: (el: PictureElem) => void;
};

const fallback =
  "data:image/png;base64,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";

const SwitchMsgType: FC<SwitchMsgTypeProps> = ({ msg, audio, curCve, selfID, imgClick }) => {
  const [isSingle, setIsSingle] = useState(false);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  // 添加于
  const textRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const [sty, setSty] = useState<CSSProperties>({
    paddingRight: "40px",
  });
  const playerRef = useRef<any>(null);
  const { t } = useTranslation();

  const isEmptyCve = useMemo(() => JSON.stringify(curCve) === "{}", [curCve.conversationID]);

  useEffect(() => {
    if (!isEmptyCve) {
      setIsSingle(isSingleCve(curCve));
    } else {
      setIsSingle(false);
    }
    // 添加于
    if (textRef.current?.clientHeight! > 60) {
      setSty({
        paddingBottom: "16px",
        paddingRight: "8px",
      });
    }
  }, []);
  // 添加于2022年4月3日 13:35:08
  const parseTime = (type: 0 | 1) => {
    const arr = formatDate(msg.sendTime);
    return type ? arr[4] : arr[3] + " " + arr[4];
  };

  const timeTip = (className: string = "chat_bg_msg_content_time") => (
    <Tooltip overlayClassName="msg_time_tip" placement="bottom" title={parseTime(0)}>
      <div className={className}>{parseTime(1)}</div>
    </Tooltip>
  );

  function filterURL(videoElem: VideoElem ): string{
    return (videoElem.videoUrl.indexOf(MinIOAddress) > -1 ? videoElem.videoUrl.replace(MinIOAddress, FileStorage) : videoElem.videoUrl) || videoElem.videoPath
  }
  // 结束

  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const merClick = (el: MergeElem, sender: string) => {
    events.emit(MERMSGMODAL, el, sender);
  };

  const parseEmojiFace = (mstr: string) => {
    faceMap.map((f) => {
      const idx = mstr.indexOf(f.context);
      if (idx > -1) {
        mstr = mstr.replaceAll(f.context, `<img style="padding-right:2px" width="24px" src=${f.src} />`);
      }
    });
    return mstr;
  };

  const parseAt = (mstr: string) => {
    const pattern = /@\S+\s/g;
    const arr = mstr.match(pattern);
    arr?.map((a) => {
      const member = groupMemberList.find((gm) => gm.userID === a.slice(1, -1));
      if (member) {
        mstr = mstr.replaceAll(a, `<span onclick='userClick("${member.userID.replace(".", "-")}")' style="color:#428be5;cursor: pointer;"> @${member.nickname} </span>`);
      } else {
        mstr = mstr.replaceAll(a, `<span onclick="userClick('${a.slice(1, -1)}')" style="color:#428be5;cursor: pointer;"> ${a}</span>`);
      }
    });
    return mstr;
  };

  const parseBr = (mstr: string) => {
    const text = mstr.replaceAll("\\n", "<br>");
    return text.replaceAll("\n", "<br>");
  };

  const parseUrl = (mstr: string) => {
    const pattern = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:._\+-~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:_\+.~#?&\/\/=]*)/g;
    const arr = mstr.match(pattern);
    arr?.map((a) => {
      mstr = mstr.replaceAll(a, `<a onclick="urlClick('${a}')" href="javascript:;">${a}</a>`);
    });
    return mstr;
  };

  const parseQute = (quMsg: MessageItem) => {
    switch (quMsg.contentType) {
      case MessageType.TEXTMESSAGE:
        const parsedMsg = parseBr(parseUrl(parseAt(parseEmojiFace(quMsg.content))));
        return <div className="content" dangerouslySetInnerHTML={{ __html: parsedMsg }}></div>;
      case MessageType.ATTEXTMESSAGE:
        return parseAt(quMsg.atElem.text);
      case MessageType.PICTUREMESSAGE:
        return <Image width={60} src={quMsg.pictureElem.sourcePicture.url} />;
      default:
        return "";
    }
  };

  const playVoice = (url: string) => {
    audio.current!.src = url;
    audio.current?.play();
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    // you can handle player events here
    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  const playVideo = (url: string) => {};

  const switchNotification = (notification: NotificationElem, timestamp: number) => {
    const noti = JSON.parse(notification.detail);
    const mediaList = [];
    if (noti.mixType === 1 || noti === 4) {
      mediaList.push({ src: noti.pictureElem.snapshotPicture.url ?? noti.pictureElem.sourcePicture.url, type: "image" });
    } else if (noti.mixType === 2 || noti === 4) {
      mediaList.push({ src: noti.videoElem.snapshotUrl, type: "video" });
    }
    return (
      <div className={`chat_bg_msg_content_noti nick_magin`}>
        <div className="noti_container">
          <div className="noti_title">{noti.notificationName}</div>
          <div className="noti_content">
            <div>{noti.text}</div>
            {noti.mixType !== 0 && (
              <div>
                {mediaList.map((media) => (
                  <Image
                    key={media.src}
                    placeholder={true}
                    // width={200}
                    height={200}
                    src={media.src}
                    preview={media.type === "image"}
                    onClick={() => (media.type === "image" ? imgClick(noti.pictureElem) : playVideo(media.src))}
                    fallback={fallback}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {timeTip()}
      </div>
    );
  };

  const switchCallStatus = (status: string) => {
    switch (status) {
      case "success":
        return "通话时长";
      case "cancel":
        return "已取消";
      case "canceled":
        return "已被取消";
      case "refuse":
        return "已拒绝";
      case "refused":
        return "已被拒绝";
    }
  };

  const textMsgRender = (mstr: string) => (
    <>
      <div ref={textRef} style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
        <div dangerouslySetInnerHTML={{ __html: mstr }}></div>
      </div>
      {timeTip()}
    </>
  );

  const voiceMsgRender = (isSelfMsg: boolean) => (
    <div style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_voice ${!isSingle ? "nick_magin" : ""}`}>
      <div style={{ flexDirection: isSelfMsg ? "row-reverse" : "row" }} onClick={() => playVoice(msg.soundElem.sourceUrl)}>
        <img style={isSelfMsg ? { paddingLeft: "4px" } : { paddingRight: "4px" }} src={isSelfMsg ? my_voice : other_voice} alt="" />
        {`${msg.soundElem.duration} ''`}
      </div>
      {timeTip()}
    </div>
  );

  const switchCustomMsg = (cMsg: any) => {
    const isSelfMsg = isSelf(msg.sendID);
    if (cMsg.type) {
      return <CustomCallMsgRender isSingle={isSingle} isSelfMsg={isSelfMsg} cdata={cMsg} timestamp={msg.sendTime} />;
    }

    switch (cMsg.customType) {
      case customType.MassMsg:
        return cMsg.data.url ? (
          <VoiceMsgRender isSelfMsg={isSelfMsg} isSingle={isSingle} el={msg.soundElem} timestamp={msg.sendTime} playVoice={playVoice} />
        ) : (
          <TextMsgRender mstr={cMsg.data.text} timestamp={msg.sendTime} isSingle={isSingle} />
        );
      case customType.Call:
        return <CustomCallMsgRender isSingle={isSingle} isSelfMsg={isSelfMsg} cdata={cMsg.data} timestamp={msg.sendTime} />;
      default:
        return null;
    }
  };

  const MsgType = useMemo(() => {
    if (msg.contentType === MessageType.NOTIFICATION) {
      return switchNotification(msg.notificationElem, msg.sendTime);
    }
    const isSelfMsg = isSelf(msg.sendID);
    const progress = msg.progress;
    const downloadProgress = msg.downloadProgress;
    const status = msg.status;
    const timestamp = msg.sendTime;
    switch (msg.contentType) {
      case MessageType.TEXTMESSAGE:
        let mstr = msg.content;
        mstr = parseEmojiFace(mstr);
        mstr = parseUrl(mstr);
        mstr = parseBr(mstr);
        return <TextMsgRender mstr={mstr} timestamp={timestamp} isSingle={isSingle} />;
      case MessageType.ATTEXTMESSAGE:
        let atMsg = msg.atElem.text;
        atMsg = parseEmojiFace(atMsg);
        atMsg = parseAt(atMsg);
        atMsg = parseUrl(atMsg);
        atMsg = parseBr(atMsg);
        return <TextAtMsgRender atMsg={atMsg} timestamp={timestamp} isSingle={isSingle} />;
      case MessageType.PICTUREMESSAGE:
        //添加于2022年3月27日 18:21:11
        const sourcePath = msg.pictureElem.sourcePath
        let snapshotPic = msg.pictureElem.snapshotPicture.url;
        let sourcePic = msg.pictureElem.sourcePicture.url;
        msg.pictureElem.snapshotPicture.url = snapshotPic.replace(MinIOAddress, FileStorage)
        msg.pictureElem.sourcePicture.url = sourcePic.replace(MinIOAddress, FileStorage)
        if( snapshotPic.match(/\?/g) && snapshotPic.match(/\?/g) ){
          msg.pictureElem.snapshotPicture.url = snapshotPic.match(/\?/g)!.length > 1 ? snapshotPic.replace(/(.*)\?/, "$1&") : snapshotPic
        }
        if( sourcePic.match(/\?/g) && sourcePic.match(/\?/g) ){
          msg.pictureElem.sourcePicture.url = sourcePic.match(/\?/g)!.length > 1 ? sourcePic.replace(/(.*)\?/, "$1&") : sourcePic
        }

        //添加结束
        return (
          <PictureMsgRender
            isSingle={isSingle}
            el={msg.pictureElem}
            status={status}
            progress={progress ?? 0}
            downloadProgress={downloadProgress}
            timestamp={timestamp}
            imgClick={imgClick}
          />
        );
      case MessageType.FACEMESSAGE:
        const faceData = JSON.parse(msg.faceElem.data);
        return <FaceMsgRender url={faceData.url} timestamp={timestamp} isSingle={isSingle} />;
      case MessageType.VOICEMESSAGE:
        return <VoiceMsgRender isSelfMsg={isSelfMsg} isSingle={isSingle} el={msg.soundElem} timestamp={timestamp} playVoice={playVoice} />;
      case MessageType.FILEMESSAGE:
        const fileEl = msg.fileElem;

        return (
          <FileMsgRender
            el={fileEl}
            msgID={msg.clientMsgID}
            progress={progress ?? 0}
            downloadProgress={downloadProgress}
            status={status}
            timestamp={timestamp}
            isSingle={isSingle}
          />
        );
      case MessageType.VIDEOMESSAGE:
        return (
          <VideoMsgRender
            isSingle={isSingle}
            el={msg.videoElem}
            status={status}
            progress={progress ?? 0}
            downloadProgress={downloadProgress}
            timestamp={timestamp}
            handlePlayerReady={handlePlayerReady}
          />
        );
      case MessageType.QUOTEMESSAGE:
        const quMsg = parseQute(msg.quoteElem.quoteMessage);
        let replyMsg = msg.quoteElem.text;
        replyMsg = parseBr(parseUrl(parseEmojiFace(replyMsg)));
        return <QuteMsgRender isSingle={isSingle} timestamp={timestamp} replyName={msg.quoteElem.quoteMessage.senderNickname} replyMsg={replyMsg} quMsg={quMsg} />;
      case MessageType.MERGERMESSAGE:
        const merEl = msg.mergeElem;
        return <MergeMsgRender isSingle={isSingle} timestamp={timestamp} sender={msg.sendID} merEl={merEl} merClick={merClick} />;
      case MessageType.CARDMESSAGE:
        const ctx = JSON.parse(msg.content);
        return <CardMsgRender isSingle={isSingle} timestamp={timestamp} cardContent={ctx} />;
      case MessageType.LOCATIONMESSAGE:
        const locationEl = msg.locationElem;
        const postion = { longitude: locationEl.longitude, latitude: locationEl.latitude };
        return <MapMsgRender isSingle={isSingle} timestamp={timestamp} postion={postion} />;
      case MessageType.CUSTOMMESSAGE:
        const customEl = msg.customElem;
        const customData = JSON.parse(customEl.data);
        return switchCustomMsg(customData);
      default:
        return <div className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>{t("UnsupportedMessage")}</div>;
    }
  }, [msg.status, msg.progress, msg.downloadProgress, msg.pictureElem.sourcePicture.url, isSingle]);

  return MsgType;
};

export default SwitchMsgType;

const TimeTip = memo(({ timestamp, className = "chat_bg_msg_content_time" }: { timestamp: number; className?: string }) => (
  <Tooltip overlayClassName="msg_time_tip" placement="bottom" title={parseTime(timestamp, 0)}>
    <div className={className}>{parseTime(timestamp, 1)}</div>
  </Tooltip>
));

const TextMsgRender = memo(({ mstr, timestamp, isSingle }: { mstr: string; timestamp: number; isSingle: boolean }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [sty, setSty] = useState<CSSProperties>({
    paddingRight: "40px",
  });

  useEffect(() => {
    if (textRef.current?.clientHeight! > 60) {
      setSty({
        paddingBottom: "16px",
        paddingRight: "8px",
      });
    }
  }, []);

  return (
    <>
      <div ref={textRef} style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
        <div dangerouslySetInnerHTML={{ __html: mstr }}></div>
      </div>
      <TimeTip timestamp={timestamp} />
    </>
  );
});

const TextAtMsgRender = memo(({ atMsg, timestamp, isSingle }: { atMsg: string; timestamp: number; isSingle: boolean }) => {
  return (
    <div
      style={{
        paddingRight: "40px",
      }}
      className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}
    >
      <div style={{ display: "inline-block" }} dangerouslySetInnerHTML={{ __html: atMsg }}></div>
      <TimeTip timestamp={timestamp} />
    </div>
  );
});

const FaceMsgRender = memo(({ url, timestamp, isSingle }: { url: string; timestamp: number; isSingle: boolean }) => {
  return (
    <div className={`chat_bg_msg_content_face ${!isSingle ? "nick_magin" : ""}`}>
      <Image placeholder={true} style={{ maxWidth: 200, maxHeight: 200 }} src={url} preview={false} fallback={fallback} />
      <TimeTip className="face_msg_time" timestamp={timestamp} />
    </div>
  );
});

const VoiceMsgRender = memo(
  ({ isSelfMsg, isSingle, el, timestamp, playVoice }: { isSelfMsg: boolean; isSingle: boolean; el: SoundElem; timestamp: number; playVoice: (url: string) => void }) => (
    <div
      style={{
        paddingRight: "40px",
      }}
      className={`chat_bg_msg_content_text chat_bg_msg_content_voice ${!isSingle ? "nick_magin" : ""}`}
    >
      <div style={{ flexDirection: isSelfMsg ? "row-reverse" : "row" }} onClick={() => playVoice(el.sourceUrl)}>
        <img style={isSelfMsg ? { paddingLeft: "4px" } : { paddingRight: "4px" }} src={isSelfMsg ? my_voice : other_voice} alt="" />
        {`${el.duration} ''`}
      </div>
      <TimeTip timestamp={timestamp} />
    </div>
  )
);

const PictureMsgRender = ({
  isSingle,
  el,
  status,
  progress,
  downloadProgress,
  timestamp,
  imgClick,
}: {
  isSingle: boolean;
  el: PictureElem;
  status: MessageStatus;
  progress: number | undefined;
  downloadProgress: number | undefined;
  timestamp: number;
  imgClick: (el: PictureElem) => void;
}) => {
  return (
    <div className={`chat_bg_msg_content_pic ${!isSingle ? "nick_magin" : ""}`}>
      <Spin spinning={status === MessageStatus.Sending || (downloadProgress !== undefined && downloadProgress !== 100)} indicator={antIcon} tip={progress + "%"}>
        <Image
          placeholder={true}
          // width={200}
          height={200}
          src={el.snapshotPicture.url ?? el.sourcePicture.url}
          preview={{ visible: false }}
          onClick={() => imgClick(el)}
          fallback={status === MessageStatus.Succeed ? undefined : fallback}
        />
      </Spin>

      <TimeTip timestamp={timestamp} className="pic_msg_time" />
    </div>
  );
};

const VideoMsgRender = memo(
  ({
    isSingle,
    el,
    status,
    progress,
    downloadProgress,
    timestamp,
    handlePlayerReady,
  }: {
    isSingle: boolean;
    el: VideoElem;
    status: MessageStatus;
    progress: number | undefined;
    downloadProgress: number | undefined;
    timestamp: number;
    handlePlayerReady: (el: any) => void;
  }) => {
    const playVideo = () => {
      events.emit(SHOWPLAYERMODAL, el.videoUrl);
    };
    return (
      <div className={`chat_bg_msg_content_video ${!isSingle ? "nick_magin" : ""}`}>
        <Spin spinning={status === MessageStatus.Sending || (downloadProgress !== undefined && downloadProgress !== 100)} indicator={antIcon} tip={progress + "%"}>
          <Image
            placeholder={true}
            // width={200}
            height={200}
            src={el.snapshotUrl}
            preview={false}
            fallback={fallback}
          />
        </Spin>
        <TimeTip timestamp={timestamp} className="pic_msg_time" />
        <PlayCircleOutlined onClick={playVideo} />
      </div>
    );
  }
);

const QuteMsgRender = memo(
  ({ isSingle, timestamp, replyName, replyMsg, quMsg }: { isSingle: boolean; timestamp: number; replyName: string; replyMsg: string; quMsg: string | JSX.Element }) => {
    return (
      <div
        style={{
          paddingRight: "40px",
        }}
        className={`chat_bg_msg_content_text chat_bg_msg_content_qute ${!isSingle ? "nick_magin" : ""}`}
      >
        <div className="qute_content">
          <div>{`${t("Reply") + replyName}:`}</div>
          {quMsg}
        </div>
        <div dangerouslySetInnerHTML={{ __html: replyMsg }}></div>
        <TimeTip timestamp={timestamp} />
      </div>
    );
  }
);

const MergeMsgRender = memo(
  ({
    isSingle,
    timestamp,
    sender,
    merEl,
    merClick,
  }: {
    isSingle: boolean;
    timestamp: number;
    sender: string;
    merEl: MergeElem;
    merClick: (el: MergeElem, sender: string) => void;
  }) => {
    return (
      <div
        style={{
          paddingRight: "40px",
        }}
        onClick={() => merClick(merEl, sender)}
        className={`chat_bg_msg_content_text chat_bg_msg_content_mer ${!isSingle ? "nick_magin" : ""}`}
      >
        <div className="title">{merEl.title}</div>
        <div className="content">
          {merEl.abstractList?.map((m, idx) => (
            <div key={idx} className="item">
              {m}
            </div>
          ))}
        </div>
        <TimeTip timestamp={timestamp} />
      </div>
    );
  }
);

const CardMsgRender = memo(({ isSingle, timestamp, cardContent }: { isSingle: boolean; timestamp: number; cardContent: any }) => {
  return (
    <div
      onClick={() => window.userClick(cardContent.userID)}
      style={{
        paddingRight: "40px",
      }}
      className={`chat_bg_msg_content_text chat_bg_msg_content_card ${!isSingle ? "nick_magin" : ""}`}
    >
      <div className="title">{t("IDCard")}</div>
      <div className="desc">
        <MyAvatar src={cardContent.faceURL} size={32} />
        <div className="card_nick">{cardContent.nickname}</div>
      </div>
      <TimeTip timestamp={timestamp} />
    </div>
  );
});

const MapMsgRender = memo(({ isSingle, timestamp, postion }: { isSingle: boolean; timestamp: number; postion: LngLat }) => {
  return (
    <div className={`chat_bg_msg_content_map ${!isSingle ? "nick_magin" : ""}`}>
      <Map protocol="https" center={postion} amapkey="dcdc861728801ee3410f67f6a487d3fa">
        <Marker position={postion} />
      </Map>
      <TimeTip timestamp={timestamp} className="pic_msg_time" />
    </div>
  );
});

const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin />;

const FileMsgRender = memo(
  ({
    isSingle,
    el,
    msgID,
    status,
    progress,
    downloadProgress,
    timestamp,
  }: {
    isSingle: boolean;
    el: FileElem;
    msgID: string;
    status: MessageStatus;
    progress: number | undefined;
    downloadProgress: number | undefined;
    timestamp: number;
  }) => {
    const suffix = el.fileName.slice(el.fileName.lastIndexOf(".") + 1);

    const doubleClick = () => {
      const result = isFileDownloaded(msgID);
      if (result) {
        window.electron.openFile(result.path);
      } else {
        // TODO 提示下载
      }
    };

    return (
      <div onDoubleClick={doubleClick} className={`chat_bg_msg_content_text chat_bg_msg_content_file ${!isSingle ? "nick_magin" : ""}`}>
        <div className="file_container">
          <Spin spinning={status === MessageStatus.Sending} indicator={antIcon} tip={progress + "%"}>
            <img src={switchFileIcon(suffix)} alt="" />
          </Spin>

          <div className="file_info">
            <div>{el.fileName}</div>
            <div>{bytesToSize(el.fileSize)}</div>
          </div>
          {downloadProgress && downloadProgress !== 100 && <Progress type="circle" percent={downloadProgress} width={32} />}
        </div>
        <TimeTip timestamp={timestamp} />
      </div>
    );
  }
);

const CustomCallMsgRender = memo(({ isSingle, isSelfMsg, cdata, timestamp }: { isSingle: boolean; isSelfMsg: boolean; cdata: any; timestamp: number }) => {
  const callIcon = cdata.type === customType.VideoCall ? (isSelfMsg ? my_video_call : other_video_call) : voice_call;
  const imgStyle = isSelfMsg ? { paddingLeft: "4px" } : { paddingRight: "4px" };

  const switchCallStatus = (status: string) => {
    switch (status) {
      case "success":
        return "通话时长";
      case "cancel":
        return "已取消";
      case "canceled":
        return "已被取消";
      case "refuse":
        return "已拒绝";
      case "refused":
        return "已被拒绝";
    }
  };

  const callStr = switchCallStatus(cdata.status) + " " + cdata.duration;

  return (
    <div
      style={{
        paddingRight: "40px",
      }}
      className={`chat_bg_msg_content_text chat_bg_msg_content_voice ${!isSingle ? "nick_magin" : ""}`}
    >
      <div style={{ flexDirection: isSelfMsg ? "row-reverse" : "row" }} onClick={() => {}}>
        <img style={imgStyle} src={callIcon} alt="" />
        {callStr}
      </div>
      <TimeTip timestamp={timestamp} />
    </div>
  );
});
