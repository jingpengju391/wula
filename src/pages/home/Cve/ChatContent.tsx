import { FC, memo, useEffect, useRef, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../../store";
import { diffMemo, events, im, isSingleCve, sec2Time, getPicInfo, getVideoInfo, switchUpload, useKeyPress } from "../../../utils";
import ScrollView from "../../../components/ScrollView";
import { MUTILMSG, SHOWPLAYERMODAL } from "../../../constants/events";
import MsgItem from "./MsgItem/MsgItem";
import { useTranslation } from "react-i18next";
import { ConversationItem, MessageItem, MessageType, PictureElem, SessionType } from "../../../utils/open_im_sdk/types";
import { TipsType } from "../../../constants/messageContentType";
import { isNotify } from "../../../utils/im";
import PlayVideoModal from "./components/PlayVideoModal";
import { RcFile, UploadRequestOption } from "rc-upload/lib/interface";
type ChatContentProps = {
  msgList: MessageItem[];
  imgClick: (el: PictureElem) => void;
  loadMore: (uid?: string, gid?: string, sMsg?: any, cveID?: string) => void;
  hasMore: boolean;
  curCve?: ConversationItem;
  loading: boolean;
  merID?: string;
  flag?: string;
  sendMsg?:  (nMsg: string, type: MessageType, file?:UploadRequestOption) => void;
};

const ParseTip = ({ msg, curCve, isSelf }: { msg: MessageItem; isSelf: (id: string) => boolean; curCve: ConversationItem }): JSX.Element => {
  const { t } = useTranslation();
  if (msg.contentType === MessageType.REVOKEMESSAGE) {
    return (
      <>
        <b onClick={() => window.userClick(msg.sendID)}>{isSelf(msg.sendID) ? t("You") : isSingleCve(curCve!) ? curCve?.showName : msg.senderNickname}</b>
        {t("RevokeMessage")}
      </>
    );
  }
  switch (msg.contentType) {
    case MessageType.FRIENDADDED:
      return t("AlreadyFriend");
    case MessageType.GROUPCREATED:
      const groupCreatedDetail = JSON.parse(msg.notificationElem.detail);
      const groupCreatedUser = groupCreatedDetail.opUser;
      return (
        <>
          <b onClick={() => window.userClick(groupCreatedUser.userID)}>{isSelf(groupCreatedUser.userID) ? t("You") : groupCreatedUser.nickname}</b>
          {t("GroupCreated")}
        </>
      );
    case MessageType.GROUPINFOUPDATED:
      const groupUpdateDetail = JSON.parse(msg.notificationElem.detail);
      const groupUpdateUser = groupUpdateDetail.opUser;
      return (
        <>
          <b onClick={() => window.userClick(groupUpdateUser.userID)}>{isSelf(groupUpdateUser.userID) ? t("You") : groupUpdateUser.nickname}</b>
          {t("ModifiedGroup")}
        </>
      );
    case MessageType.GROUPOWNERTRANSFERRED:
      const transferDetails = JSON.parse(msg.notificationElem.detail);
      const transferOpUser = transferDetails.opUser;
      const newOwner = transferDetails.newGroupOwner;
      return (
        <>
          <b onClick={() => window.userClick(transferOpUser.userID)}>{isSelf(transferOpUser.userID) ? t("You") : transferOpUser.nickname}</b>
          {t("TransferTo")}
          <b onClick={() => window.userClick(newOwner.userID)}>{isSelf(newOwner.userID) ? t("You") : newOwner.nickname}</b>
        </>
      );
    case MessageType.MEMBERQUIT:
      const quitDetails = JSON.parse(msg.notificationElem.detail);
      const quitUser = quitDetails.quitUser;
      return (
        <>
          <b onClick={() => window.userClick(quitUser.userID)}>{isSelf(quitUser.userID) ? t("You") : quitUser.nickname}</b>
          {t("QuitedGroup")}
        </>
      );
    case MessageType.MEMBERINVITED:
      const inviteDetails = JSON.parse(msg.notificationElem.detail);
      const inviteOpUser = inviteDetails.opUser;
      const invitedUserList = inviteDetails.invitedUserList ?? [];
      let inviteUsers: any[] = [];
      invitedUserList.forEach((user: any, idx: number) =>
        inviteUsers.push(
          <b onClick={() => window.userClick(user.userID)} key={user.userID}>
            {(isSelf(user.userID) ? t("You") : user.nickname) + (idx === invitedUserList.length - 1 ? " " : "、")}
          </b>
        )
      );
      return (
        <>
          <b onClick={() => window.userClick(inviteOpUser.userID)}>{isSelf(inviteOpUser.userID) ? t("You") : inviteOpUser.nickname}</b>
          {t("Invited")}
          {inviteUsers.map((user) => user)}
          {t("IntoGroup")}
        </>
      );
    case MessageType.MEMBERKICKED:
      const kickDetails = JSON.parse(msg.notificationElem.detail);
      const kickOpUser = kickDetails.opUser;
      const kickdUserList = kickDetails.kickedUserList ?? [];
      let kickUsers: any[] = [];
      kickdUserList.forEach((user: any, idx: number) =>
        kickUsers.push(
          <b onClick={() => window.userClick(user.userID)} key={user.userID}>
            {(isSelf(user.userID) ? t("You") : user.nickname) + (idx === kickdUserList.length - 1 ? " " : "、")}
          </b>
        )
      );
      return (
        <>
          <b onClick={() => window.userClick(kickOpUser.userID)}>{isSelf(kickOpUser.userID) ? t("You") : kickOpUser.nickname}</b>
          {t("Kicked")}
          {kickUsers.map((user) => user)}
          {t("OutGroup")}
        </>
      );
    case MessageType.MEMBERENTER:
      const enterDetails = JSON.parse(msg.notificationElem.detail);
      const enterUser = enterDetails.entrantUser;
      return (
        <>
          <b onClick={() => window.userClick(enterUser.userID)}>{isSelf(enterUser.userID) ? t("You") : enterUser.nickname}</b>
          {t("JoinedGroup")}
        </>
      );
    case MessageType.GROUPDISMISSED:
      const dismissDetails = JSON.parse(msg.notificationElem.detail);
      const dismissUser = dismissDetails.opUser;
      return (
        <>
          <b onClick={() => window.userClick(dismissUser.userID)}>{isSelf(dismissUser.userID) ? t("You") : dismissUser.nickname}</b>
          {t("DismissedGroup")}
        </>
      );
    case MessageType.GROUPMUTED:
      const GROUPMUTEDDetails = JSON.parse(msg.notificationElem.detail);
      const groupMuteOpUser = GROUPMUTEDDetails.opUser;
      return `${isSelf(groupMuteOpUser.userID) ? t("You") : groupMuteOpUser.nickname}${t("MuteGroup")}` as unknown as JSX.Element;
    case MessageType.GROUPCANCELMUTED:
      const GROUPCANCELMUTEDDetails = JSON.parse(msg.notificationElem.detail);
      const groupCancelMuteOpUser = GROUPCANCELMUTEDDetails.opUser;
      return `${isSelf(groupCancelMuteOpUser.userID) ? t("You") : groupCancelMuteOpUser.nickname}${t("CancelMuteGroup")}` as unknown as JSX.Element;
    case MessageType.GROUPMEMBERMUTED:
      const gmMutedDetails = JSON.parse(msg.notificationElem.detail);
      const gmMuteOpUser = isSelf(gmMutedDetails.opUser.userID) ? t("You") : gmMutedDetails.opUser.nickname;
      const mutedUser = isSelf(gmMutedDetails.mutedUser.userID) ? t("You") : gmMutedDetails.mutedUser.nickname;
      const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
      return t("MuteMemberGroup", { opUser: gmMuteOpUser, muteUser: mutedUser, muteTime });
    case MessageType.GROUPMEMBERCANCELMUTED:
      const gmcMutedDetails = JSON.parse(msg.notificationElem.detail);
      const gmcMuteOpUser = isSelf(gmcMutedDetails.opUser.userID) ? t("You") : gmcMutedDetails.opUser.nickname;
      const cmuteUser = isSelf(gmcMutedDetails.mutedUser.userID) ? t("You") : gmcMutedDetails.mutedUser.nickname;
      return t("CancelMuteMemberGroup", { cmuteUser, opUser: gmcMuteOpUser });
    case MessageType.BURNMESSAGECHANGE:
      const burnDetails = JSON.parse(msg.notificationElem.detail);
      return burnDetails.isPrivate ? t("BurnOn") : t("BurnOff");
    default:
      return msg.notificationElem.defaultTips as unknown as JSX.Element;
  }
};

const MemoParse = memo(ParseTip, () => true);

const ChatContent: FC<ChatContentProps> = ({ merID, msgList, imgClick, loadMore, hasMore, curCve, loading, flag, sendMsg }) => {
  const [mutilSelect, setMutilSelect] = useState(false);
  const [showPlayer, setShowPlayer] = useState({
    state: false,
    url: "",
  });
  const selectValue = (state: RootState) => state.user.selfInfo;
  const selfID = useSelector(selectValue, shallowEqual).userID!;
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useTranslation();

// y

const [dragging, setDragging] = useState<any>(false);
const [message, setMessage] = useState<any>({ show: false, text: null, type: null });
const drop = useRef<any>();
const drag = useRef<any>();
// useKeyPress(["ctrl"], async () => {
//   const paths = window.electron.getReadImage()
//   // @ts-ignore
//   paths.forEach((path) => {
//     // const dd = escape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
//     sendCosMsg({
//       path:path,
//       size: 11334,
//       type:'',
//     })
//   })
// });


useEffect(() => {
    // useRef 的 drop.current 取代了 ref 的 this.drop
    drop.current.addEventListener('dragover', handleDragOver);
    drop.current.addEventListener('drop', handleDrop);
    drop.current.addEventListener('dragenter', handleDragEnter);
    drop.current.addEventListener('dragleave', handleDragLeave);
    return () => {
        drop.current.removeEventListener('dragover', handleDragOver);
        drop.current.removeEventListener('drop', handleDrop);
        drop.current.removeEventListener('dragenter', handleDragEnter);
        drop.current.removeEventListener('dragleave', handleDragLeave);
    }
})

const imgMsg = async (file: any, uploadData: UploadRequestOption) => {
  const { width, height } = await getPicInfo(file);
  const sourcePicture = {
    uuid: file.uid,
    type: file.type,
    size: file.size,
    width,
    height,
    url: '',
  };

  const snapshotPicture = {
    uuid: file.uid,
    type: file.type,
    size: file.size,
    width: 200,
    height: 200,
    url: '',
  };
  const imgInfo = {
    sourcePicture,
    snapshotPicture,
    bigPicture: sourcePicture,
  };
  const { data } = await im.createImageMessage(imgInfo);
  const message = JSON.parse(data)
  message.pictureElem.sourcePath = `file://${file.path}`
  sendMsg && sendMsg(JSON.stringify(message), MessageType.PICTUREMESSAGE, uploadData);
};

const videoMsg = async (file: any, uploadData: UploadRequestOption) => {
  //修改于2022年3月27日 19:36:58
  const snp = "http://down.wulaim.com/video.png?imageView2/1/w/200/h/200/rq/80";
  const duration = await getVideoInfo(file);
  const videoInfo = {
    videoPath: `file://${file.path}`,
    duration: parseInt(duration+""),
    videoType: file.type,
    snapshotPath: snp,
    videoUUID: file.uid,
    videoUrl: '',
    videoSize: file.size,
    snapshotUUID: file.uid,
    snapshotSize: 117882,
    snapshotUrl: snp,
    snapshotWidth: 1024,
    snapshotHeight: 1024,
  };
  const { data } = await im.createVideoMessage(videoInfo);
  sendMsg && sendMsg(data, MessageType.VIDEOMESSAGE, uploadData);
};


const fileMsg = async (file: any, uploadData: UploadRequestOption) => {
  const fileInfo = {
    filePath: '',
    fileName: file.name,
    uuid: file.uid,
    sourceUrl: '',
    fileSize: file.size
  }
  const { data } = await im.createFileMessage(fileInfo)
  sendMsg && sendMsg(data, MessageType.FILEMESSAGE, uploadData);
}

const sendCosMsg = async (file: any) => {
  let type = 'file'
  const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
  const videoList = ['mp4', 'rmvb', 'avi', 'flv', 'm2v', 'mkv', 'wmv', 'mp3', 'wav'];
  const suffixArr = file.name.split('.')[1]
  if(imgList.includes(suffixArr)){
    type = 'image'
  }

  if(videoList.includes(suffixArr)){
    type = 'video'
  }
  if (!window.electron) return;
    // @ts-ignore
    const res: string[] = [file.path]
    let msgStr = "";
    if (res) {
      const nameIdx = res[0].lastIndexOf(window.electron.isWin ? "\\" : "/") + 1;
      switch (type) {
        case "image":
          const imageData = await im.createImageMessageFromFullPath(res[0]);
          msgStr = imageData.data;
          break;
        case "video":
          const suffixIdx = res[0].lastIndexOf(".") + 1;
          const dataUrl = window.electron.file2url(res[0]);
          const info = await getVideoInfo(dataUrl);
          const catchPath = window.electron.getCachePath();
          const snpPath = catchPath + res[0].slice(nameIdx - 1, suffixIdx) + "png";
          await window.electron.save2path(snpPath, info.snapshotUrl);

          const videoData = await im.createVideoMessageFromFullPath({
            videoFullPath: res[0],
            videoType: res[0].slice(suffixIdx),
            duration: info.duration,
            snapshotFullPath: snpPath,
          });
          msgStr = videoData.data;
          break;
        case "file":
          const fileData = await im.createFileMessageFromFullPath({ fileFullPath: res[0], fileName: res[0].slice(nameIdx) });
          msgStr = fileData.data;
          break;
        default:
          break;
      }
      sendMsg && sendMsg(msgStr, MessageType.FILEMESSAGE);
    }
};
const handleDragOver = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
};

const count = 10
const formats = ['jpg', 'png', 'gif']

const handleDrop = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false)
    const files = [...e.dataTransfer.files];

    if (count && count < files.length) {
        showMessage(`抱歉，每次最多只能上传${count} 文件。`, 'error', 2000);
        return;
    }
    files.forEach((file) => {
      sendCosMsg(file)
    })

    // if (formats && files.some((file) => !formats.some((format:any) => file.name.toLowerCase().endsWith(format.toLowerCase())))) {
    //     showMessage(`只允许上传 ${formats.join(', ')}格式的文件`, 'error', 2000);
    //     return;
    // }
};

const handleDragEnter = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    e.target !== drag.current && setDragging(true)
};

const handleDragLeave = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    e.target === drag.current && setDragging(false)
};

const showMessage = (text:any, type:any, timeout:any) => {
    setMessage({ show: true, text, type, })
    setTimeout(() =>
        setMessage({ show: false, text: null, type: null, },), timeout);
};
// y
  useEffect(() => {
    events.on(MUTILMSG, mutilHandler);
    events.on(SHOWPLAYERMODAL, showPlayerModal);
    return () => {
      events.off(MUTILMSG, mutilHandler);
      events.off(SHOWPLAYERMODAL, showPlayerModal);
    };
  }, []);

  const mutilHandler = (flag: boolean) => {
    setMutilSelect(flag);
  };

  const isSelf = (id: string) => id === selfID;

  const nextFuc = () => {
    loadMore(curCve?.userID, curCve?.groupID, msgList[msgList.length - 1], !isNotify(curCve!.conversationType) ? curCve?.conversationID : undefined);
  };

  const showPlayerModal = (url: string) => {
    setShowPlayer({ state: true, url });
  };

  const closePlay = () => {
    setShowPlayer({ state: false, url: "" });
  };

  return (
    <div className="chat_bg" ref={drop}>
      <ScrollView
        tip={isNotify(curCve!.conversationType) ? null : undefined}
        reverse={!isNotify(curCve!.conversationType)}
        holdHeight={30}
        loading={loading}
        data={msgList}
        fetchMoreData={nextFuc}
        hasMore={hasMore}
      >
        {msgList?.map((msg) => {
          if (TipsType.includes(msg.contentType)) {
            return (
              <div key={msg.clientMsgID} className="chat_bg_tips">
                <MemoParse msg={msg} isSelf={isSelf} curCve={curCve!} />
              </div>
            );
          } else {
            return <MsgItem audio={audioRef} flag={flag} key={msg.clientMsgID} mutilSelect={mutilSelect} msg={msg} imgClick={imgClick} selfID={merID ?? selfID} curCve={curCve!} />;
          }
        })}
      </ScrollView>
      <audio ref={audioRef} />
      {showPlayer.state && <PlayVideoModal url={showPlayer.url} isModalVisible={showPlayer.state} close={closePlay} />}
    </div>
  );
};

const diffKey = ["merID", "loading", "hasMore", "flag", "msgList"];
const deepKey = ["conversationID", "showName", "faceURL"];
export default memo(ChatContent, (p, n) => {
  const shallowFlag = diffMemo(p, n, diffKey);
  const deepFlag = diffMemo(p.curCve, n.curCve, deepKey);
  return shallowFlag && deepFlag;
});
