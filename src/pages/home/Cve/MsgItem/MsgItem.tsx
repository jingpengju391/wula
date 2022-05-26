import { LoadingOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Spin, Checkbox, Popover } from "antd";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import MyAvatar from "../../../../components/MyAvatar";
import { events, im, isSingleCve } from "../../../../utils";

import { ATSTATEUPDATE, DELETEMESSAGE, MUTILMSGCHANGE } from "../../../../constants/events";
import { useInViewport, useLongPress, useUnmount, useUpdateEffect } from "ahooks";
import SwitchMsgType from "./SwitchMsgType/SwitchMsgType";
import MsgMenu from "./MsgMenu/MsgMenu";
import { useTranslation } from "react-i18next";
import { ConversationItem, GroupMemberItem, MessageItem, MessageType, PictureElem } from "../../../../utils/open_im_sdk/types";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { DetailType } from "../../../../@types/open_im";
import useTimer from "../../../../utils/hooks/useTimer";
import { isNotify, isShowProgress } from "../../../../utils/im";

type MsgItemProps = {
  msg: MessageItem;
  selfID: string;
  flag?: string;
  imgClick: (el: PictureElem) => void;
  audio: React.RefObject<HTMLAudioElement>;
  curCve: ConversationItem;
  mutilSelect?: boolean;
};

const canSelectTypes = [
  MessageType.TEXTMESSAGE,
  MessageType.ATTEXTMESSAGE,
  MessageType.PICTUREMESSAGE,
  MessageType.VIDEOMESSAGE,
  MessageType.VOICEMESSAGE,
  MessageType.CARDMESSAGE,
  MessageType.FILEMESSAGE,
  MessageType.LOCATIONMESSAGE,
];

const MsgItem: FC<MsgItemProps> = (props) => {
  const { msg, selfID, curCve, mutilSelect, audio } = props;
  const [lastChange, setLastChange] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const avaRef = useRef<HTMLDivElement>(null);
  const msgItemRef = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(msgItemRef);
  const { t } = useTranslation();
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  // const groupMemberStatus = useSelector((state: RootState) => state.contacts.member2status, shallowEqual);
  const { time, setTimer, clearTimer } = useTimer(30);
  const [greadInfo, setGreadInfo] = useState<{
    groupMemberTotal: number;
    readMemberList: GroupMemberItem[];
    unReadMemberList: GroupMemberItem[];
  }>({
    groupMemberTotal: 0,
    readMemberList: [],
    unReadMemberList: [],
  });

  const readMembers = useMemo(
    () => msg.attachedInfoElem && msg.attachedInfoElem.groupHasReadInfo && msg.attachedInfoElem.groupHasReadInfo.hasReadCount,
    [msg.attachedInfoElem.groupHasReadInfo.hasReadCount]
  );

  useEffect(() => {
    let tmpGroupMemberTotal = -1;
    groupMemberList.forEach(() => {
      tmpGroupMemberTotal += 1;
    });
    const tmpReadMemberList = groupMemberList?.filter((item) => {
      if (msg.attachedInfoElem.groupHasReadInfo.hasReadUserIDList?.includes(item.userID)) {
        return item;
      }
    });

    const tmpUnReadMemberList = groupMemberList?.filter((item) => {
      if (!msg.attachedInfoElem.groupHasReadInfo.hasReadUserIDList?.includes(item.userID) && item.userID !== selfID) {
        return item;
      }
    });
    setGreadInfo({
      groupMemberTotal: tmpGroupMemberTotal === -1 ? 0 : tmpGroupMemberTotal,
      readMemberList: tmpReadMemberList,
      unReadMemberList: tmpUnReadMemberList,
    });
  }, [groupMemberList, msg.attachedInfoElem.groupHasReadInfo.hasReadCount]);

  useEffect(() => {
    if (lastChange) {
      setLastChange(false);
    }
  }, [mutilSelect]);

  useEffect(() => {
    if (inViewport && curCve.userID === msg.sendID && !msg.isRead && !isNotify(msg.sessionType)) {
      markC2CHasRead(msg.sendID, msg.clientMsgID);
    }
    if (inViewport && curCve.groupID === msg.groupID && curCve.groupID !== "" && !msg.isRead && msg.sendID !== selfID && !isNotify(msg.sessionType)) {
      markGroupC2CHasRead();
    }
  }, [inViewport]);

  useUpdateEffect(() => {
    if (msg.attachedInfoElem.isPrivateChat && msg.isRead) {
      setTimer();
    }
  }, [msg.isRead]);

  useEffect(() => {
    if (time === 0) {
      clearPrv();
    }
  }, [time]);

  useUnmount(() => {
    if (time !== 0) {
      clearPrv();
    }
    clearTimer();
  });

  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const clearPrv = () => {
    if (msg.attachedInfoElem.isPrivateChat) {
      im.deleteMessageFromLocalAndSvr(JSON.stringify(msg));
      events.emit(DELETEMESSAGE, msg.clientMsgID, false, false);
    }
  };

  const switchOnline = (oType: string, details?: DetailType[]) => {
    switch (oType) {
      case "offline":
        return t("Offline");
      case "online":
        let str = "";
        details?.map((detail) => {
          if (detail.status === "online") {
            str += `${detail.platform}/`;
          }
        });
        return `${str.slice(0, -1)} ${t("Online")}`;
      default:
        return "";
    }
  };

  const markC2CHasRead = (userID: string, msgID: string) => {
    msg.isRead = true;
    im.markC2CMessageAsRead({ userID, msgIDList: [msgID] });
  };

  const markGroupC2CHasRead = () => {
    msg.isRead = true;
    im.markGroupMessageAsRead({ groupID: curCve.groupID, msgIDList: [msg.clientMsgID] });
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const switchIcon = () => {
    if (msg.attachedInfoElem.isPrivateChat && msg.isRead) {
      return time + "s";
    }
    switch (msg.status) {
      case 1:
        return isShowProgress(msg.contentType) ? null : <Spin indicator={antIcon} />;
      case 3:
        return <ExclamationCircleFilled style={{ color: "#f34037", fontSize: "20px" }} onClick={() => console.log(888)} />;
      default:
        return null;
    }
  };

  const switchStyle = useMemo(
    () =>
      isSelf(msg.sendID)
        ? {
            marginLeft: "12px",
          }
        : {
            marginRight: "12px",
          },
    []
  );

  const mutilCheckItem = () => {
    if (mutilSelect && canSelectTypes.includes(msg.contentType)) {
      events.emit(MUTILMSGCHANGE, !lastChange, msg);
      setLastChange((v) => !v);
    }
  };

  const avatarLongPress = () => {
    if (!isSingleCve(curCve!)) {
      events.emit(ATSTATEUPDATE, msg.sendID, msg.senderNickname);
    }
  };

  useLongPress(avatarLongPress, avaRef, {
    onClick: () => window.userClick(msg.sendID),
    delay: 500,
  });

  const switchIsRead = () => {
    if (isSingleCve(curCve)) {
      return <div>{msg.isRead ? t("Readed") : t("UnRead")}</div>;
    } else {
      const num = greadInfo.groupMemberTotal - readMembers;
      return num !== 0 ? num + t("PeopleUnRead") : t("AllReaded");
    }
  };

  const UnReadContent = (
    <div className="unReadContent">
      <div className="title">
        <span>{t("MessageRecipientList")}</span>
        {/* <span onClick={offCard}></span> */}
      </div>
      <div className="content">
        <div className="left">
          <span className="tip">{readMembers}</span>
          {t("PeopleReaded")}
          <div className="list">
            {greadInfo.readMemberList.map((item, index) => {
              if (item) {
                // const curMember = groupMemberStatus[item.userID];
                return (
                  <div className="list_item" key={index}>
                    <MyAvatar src={item.faceURL} size={38} />
                    <div className="info">
                      <span>{item.nickname}</span>
                      <span>[在线状态]</span>
                      {/* <span>[{switchOnline(curMember?.status, curMember?.detailPlatformStatus)}]</span> */}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
        <div className="right">
          <span className="tip">{greadInfo.groupMemberTotal - readMembers}</span>
          {t("PeopleUnRead")}
          <div className="list">
            {greadInfo.unReadMemberList.map((item, index) => {
              if (item) {
                // const curMember = groupMemberStatus[item.userID];
                return (
                  <div className="list_item" key={index}>
                    <MyAvatar src={item.faceURL} size={38} />
                    <div className="info">
                      <span>{item.nickname}</span>
                      <span>[在线状态]</span>
                      {/* <span>[{switchOnline(curMember?.status, curMember?.detailPlatformStatus)}]</span> */}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const switchTips = () => {
    // const marginData = ` ${isSelf(msg.sendID) ? "0" : "24px"} ${isSelf(msg.sendID) ? "8px" : "0"} 0 ${isSelf(msg.sendID) ? "0" : "8px"}`;
    const marginData = `24px ${isSelf(msg.sendID) ? "8px" : "0"} 0 ${isSelf(msg.sendID) ? "0" : "8px"}`;
    return (
      <>
        {isSelf(msg.sendID) && (
          <div className="chat_bg_flag_read">
            <div className="group_UnRead">
              <Popover content={UnReadContent} trigger="click" overlayClassName="unread_card" placement="topRight">
                {switchIsRead()}
              </Popover>
            </div>
          </div>
        )}
        <div style={{ margin: marginData }} className="chat_bg_icon">
          {switchIcon()}
        </div>
      </>
    );
  };

  const MemoTipSwich = useMemo(switchTips, [greadInfo, time, msg.attachedInfoElem.groupHasReadInfo.hasReadCount, msg.attachedInfoElem.isPrivateChat, msg.isRead, msg.status]);

  const contentStyle = useMemo(() => (isNotify(curCve!.conversationType) ? { width: "90%" } : { maxWidth: "80%" }), []);

  const switchName = useMemo(() => (!isNotify(curCve!.conversationType) ? msg.senderNickname : JSON.parse(msg.notificationElem.detail).notificationName), []);

  const isAdministrators = (): boolean => {
    const findMember = groupMemberList.find(member => selfID === member.userID)
    return !!findMember && findMember.roleLevel !== 1
  };
  const selfInfo = useSelector((state: RootState) => state.user.selfInfo, shallowEqual);
  const senderNickname = useMemo(() => {
    let remark
    const member = groupMemberList.find(m => m.userID === msg.sendID)!
    try { 
      remark = JSON.parse(member.ex).remark
    } catch (err){}
    const m = groupMemberList.find(m => m.userID === selfInfo.userID)!
    return m?.roleLevel !== 1 &&  remark ? `${member?.nickname || msg.senderNickname} ${remark}` : member?.nickname || msg.senderNickname
  }, [groupMemberList, msg, selfInfo])

  return (
    <div ref={msgItemRef} onClick={mutilCheckItem} className={`chat_bg_msg ${isSelf(msg.sendID) ? "chat_bg_omsg" : ""}`}>
      {mutilSelect && (
        <div style={switchStyle} className="chat_bg_msg_check">
          <Checkbox disabled={!canSelectTypes.includes(msg.contentType)} checked={lastChange} />
        </div>
      )}

      <div className="cs">
        <div ref={avaRef}>
          <MyAvatar className="chat_bg_msg_icon" shape="square" size={42} src={msg.senderFaceUrl} />
        </div>
      </div>

      <div style={contentStyle} className="chat_bg_msg_content">
        {(!curCve || !isSingleCve(curCve) || isNotify(curCve!.conversationType)) && <span className="nick">{switchName}</span>}
        <MsgMenu key={msg.clientMsgID} visible={msg.attachedInfoElem.isPrivateChat ? false : contextMenuVisible} msg={msg} isSelf={isSelf(msg.sendID)} isAdministrators={isAdministrators()} visibleChange={(v) => setContextMenuVisible(v)}>
          <SwitchMsgType {...props} />
        </MsgMenu>
      </div>
      {MemoTipSwich}
    </div>
  );
};

export default memo(MsgItem, (p, n) => p.mutilSelect === n.mutilSelect && p.flag === n.flag && p.msg.progress === n.msg.progress);
