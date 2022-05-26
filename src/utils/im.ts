// import { OpenIMSDK } from 'open-im-sdk'
import { t } from "i18next";
import { customType } from "../constants/messageContentType";
import { sec2Time } from "./common";
import { OpenIMSDK } from "./open_im_sdk";
import { ConversationItem, MessageItem, MessageType, SessionType } from "./open_im_sdk/types";

export const im = new OpenIMSDK();

//utils
export const isSingleCve = (cve: ConversationItem) => {
  return cve.userID !== "" && cve.groupID === "";
};

const switchCustomMsg = (cMsg: any, isSelfMsg: boolean) => {
  switch (cMsg.customType) {
    case customType.MassMsg:
      return "[通知消息]";
    default:
      return "";
  }
};

export const parseMessageType = (pmsg: MessageItem, curUid?: string): string => {
  const isSelf = (id: string) => id === curUid;

  switch (pmsg.contentType) {
    case MessageType.TEXTMESSAGE:
      return pmsg.content;
    case MessageType.ATTEXTMESSAGE:
      return pmsg.atElem.text;
    case MessageType.PICTUREMESSAGE:
      return t("PictureMessage");
    case MessageType.VIDEOMESSAGE:
      return t("VideoMessage");
    case MessageType.VOICEMESSAGE:
      return t("VoiceMessage");
    case MessageType.LOCATIONMESSAGE:
      return t("LocationMessage");
    case MessageType.CARDMESSAGE:
      return t("CardMessage");
    case MessageType.MERGERMESSAGE:
      return t("MergeMessage");
    case MessageType.FILEMESSAGE:
      return t("FileMessage");
    case MessageType.REVOKEMESSAGE:
      return `${isSelf(pmsg.sendID) ? t("You") : pmsg.senderNickname}${t("RevokeMessage")}`;
    case MessageType.CUSTOMMESSAGE:
      const customEl = pmsg.customElem;
      const customData = JSON.parse(customEl.data);
      if (customData.customType === customType.MassMsg) {
        return switchCustomMsg(customData, isSelf(pmsg.sendID));
      }
      return t("CustomMessage");
    case MessageType.QUOTEMESSAGE:
      return t("QuoteMessage");
    case MessageType.FACEMESSAGE:
      return t("FaceMessage");
    case MessageType.FRIENDADDED:
      return t("AlreadyFriend");
    case MessageType.MEMBERENTER:
      const enterDetails = JSON.parse(pmsg.notificationElem.detail);
      const enterUser = enterDetails.entrantUser;
      return `${isSelf(enterUser.userID) ? t("You") : enterUser.nickname}${t("JoinedGroup")}`;
    case MessageType.GROUPCREATED:
      const groupCreatedDetail = JSON.parse(pmsg.notificationElem.detail);
      const groupCreatedUser = groupCreatedDetail.opUser;
      return `${isSelf(groupCreatedUser.userID) ? t("You") : groupCreatedUser.nickname}${t("GroupCreated")}`;
    case MessageType.MEMBERINVITED:
      const inviteDetails = JSON.parse(pmsg.notificationElem.detail);
      const inviteOpUser = inviteDetails.opUser;
      const invitedUserList = inviteDetails.invitedUserList ?? [];
      let inviteStr = "";
      invitedUserList.forEach((user: any) => (inviteStr += (isSelf(user.userID) ? t("You") : user.nickname) + " "));
      return `${isSelf(inviteOpUser.userID) ? t("You") : inviteOpUser.nickname}${t("Invited")}${inviteStr}${t("IntoGroup")}`;
    case MessageType.MEMBERKICKED:
      const kickDetails = JSON.parse(pmsg.notificationElem.detail);
      const kickOpUser = kickDetails.opUser;
      const kickdUserList = kickDetails.kickedUserList ?? [];
      let kickStr = "";
      kickdUserList.forEach((user: any) => (kickStr += (isSelf(user.userID) ? t("You") : user.nickname) + " "));
      return `${isSelf(kickOpUser.userID) ? t("You") : kickOpUser.nickname}${t("Kicked")}${kickStr}${t("OutGroup")}`;
    case MessageType.MEMBERQUIT:
      const quitDetails = JSON.parse(pmsg.notificationElem.detail);
      const quitUser = quitDetails.quitUser;
      return `${isSelf(quitUser.userID) ? t("You") : quitUser.nickname}${t("QuitedGroup")}`;
    case MessageType.GROUPINFOUPDATED:
      const groupUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
      const groupUpdateUser = groupUpdateDetail.opUser;
      return `${isSelf(groupUpdateUser.userID) ? t("You") : groupUpdateUser.nickname}${t("ModifiedGroup")}`;
    case MessageType.GROUPDISMISSED:
      const dismissDetails = JSON.parse(pmsg.notificationElem.detail);
      const dismissUser = dismissDetails.opUser;
      return `${isSelf(dismissUser.userID) ? t("You") : dismissUser.nickname}${t("DismissedGroup")}`;
    case MessageType.GROUPMUTED:
      const GROUPMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
      const groupMuteOpUser = GROUPMUTEDDetails.opUser;
      return `${isSelf(groupMuteOpUser.userID) ? t("You") : groupMuteOpUser.nickname}${t("MuteGroup")}`;
    case MessageType.GROUPCANCELMUTED:
      const GROUPCANCELMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
      const groupCancelMuteOpUser = GROUPCANCELMUTEDDetails.opUser;
      return `${isSelf(groupCancelMuteOpUser.userID) ? t("You") : groupCancelMuteOpUser.nickname}${t("CancelMuteGroup")}`;
    case MessageType.GROUPMEMBERMUTED:
      const gmMutedDetails = JSON.parse(pmsg.notificationElem.detail);
      const gmMuteOpUser = isSelf(gmMutedDetails.opUser.userID) ? t("You") : gmMutedDetails.opUser.nickname;
      const mutedUser = isSelf(gmMutedDetails.mutedUser.userID) ? t("You") : gmMutedDetails.mutedUser.nickname;
      const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
      return t("MuteMemberGroup", { opUser: gmMuteOpUser, muteUser: mutedUser, muteTime });
    case MessageType.GROUPMEMBERCANCELMUTED:
      const gmcMutedDetails = JSON.parse(pmsg.notificationElem.detail);
      const gmcMuteOpUser = isSelf(gmcMutedDetails.opUser.userID) ? t("You") : gmcMutedDetails.opUser.nickname;
      const cmuteUser = isSelf(gmcMutedDetails.mutedUser.userID) ? t("You") : gmcMutedDetails.mutedUser.nickname;
      return t("CancelMuteMemberGroup", { cmuteUser, opUser: gmcMuteOpUser });
    case MessageType.NOTIFICATION:
      const customNoti = JSON.parse(pmsg.notificationElem.detail);
      return customNoti.text;
    case MessageType.BURNMESSAGECHANGE:
      const burnDetails = JSON.parse(pmsg.notificationElem.detail);
      return burnDetails.isPrivate ? t("BurnOn") : t("BurnOff");
    default:
      return pmsg.notificationElem.defaultTips;
    // return JSON.parse(pmsg.content).defaultTips;
  }
};

export const getNotification = (cb?: () => void) => {
  if (Notification && (Notification.permission === "default" || Notification.permission === "denied")) {
    Notification.requestPermission((permission) => {
      if (permission === "granted") {
        cb && cb();
      }
    });
  } else {
    cb && cb();
  }
};

export const createNotification = (message: MessageItem, click?: (id: string, type: SessionType) => void, tag?: string) => {
  if (Notification && document.hidden) {
    const title = message.contentType === MessageType.FRIENDADDED ? t("FriendNotice") : message.senderNickname;
    const notification = new Notification(title, {
      dir: "auto",
      tag: tag ?? (message.groupID === "" ? message.sendID : message.groupID),
      renotify: true,
      icon: message.senderFaceUrl,
      body: parseMessageType(message),
      requireInteraction: true,
    });
    const id = message.sessionType === SessionType.Single ? (message.contentType === MessageType.FRIENDADDED ? message.recvID : message.sendID) : message.groupID;
    notification.onclick = () => {
      click && click(id, message.sessionType);
      notification.close();
    };
  }
};

export const cveSort = (cveList: ConversationItem[]) => {
  const arr: string[] = [];
  const filterArr = cveList.filter((c) => !arr.includes(c.conversationID) && arr.push(c.conversationID));
  filterArr.sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      const aCompare = a.draftTextTime! > a.latestMsgSendTime! ? a.draftTextTime! : a.latestMsgSendTime!;
      const bCompare = b.draftTextTime! > b.latestMsgSendTime! ? b.draftTextTime! : b.latestMsgSendTime!;
      if (aCompare > bCompare) {
        return -1;
      } else if (aCompare < bCompare) {
        return 1;
      } else {
        return 0;
      }
    } else if (a.isPinned && !b.isPinned) {
      return -1;
    } else {
      return 1;
    }
  });
  return filterArr;
};

export const isNotify = (type: SessionType) => type === SessionType.Notification;

export const isFileDownloaded = (msgid: string) => {
  const IMFileMap = JSON.parse(localStorage.getItem("IMFileMap") ?? "{}");
  const item = IMFileMap[msgid];
  return item && item.status === "completed" && window.electron.fileExists(item.path) ? item.path : "";
};

export const isShowProgress = (type: MessageType) => {
  const List = [MessageType.FILEMESSAGE,MessageType.PICTUREMESSAGE, MessageType.VIDEOMESSAGE]
  return List.includes(type);
}