// export enum MessageType {
//   TEXTMESSAGE = 101,
//   PICTUREMESSAGE = 102,
//   VOICEMESSAGE = 103,
//   VIDEOMESSAGE = 104,
//   FILEMESSAGE = 105,
//   ATTEXTMESSAGE = 106,
//   MERGERMESSAGE = 107,
//   CARDMESSAGE = 108,
//   LOCATIONMESSAGE = 109,
//   CUSTOMMESSAGE = 110,
//   REVOKEMESSAGE = 111,
//   HASREADRECEIPTMESSAGE = 112,
//   TYPINGMESSAGE = 113,
//   QUOTEMESSAGE = 114,
//   FACEMESSAGE = 115,
// }

import { MessageType } from "../utils/open_im_sdk/types";

export const TipsType = [
  MessageType.REVOKEMESSAGE,
  MessageType.FRIENDAPPLICATIONAPPROVED,
  MessageType.FRIENDAPPLICATIONREJECTED,
  MessageType.FRIENDAPPLICATIONADDED,
  MessageType.FRIENDADDED,
  MessageType.FRIENDDELETED,
  MessageType.FRIENDREMARKSET,
  MessageType.BLACKADDED,
  MessageType.BLACKDELETED,
  MessageType.SELFINFOUPDATED,
  MessageType.GROUPCREATED,
  MessageType.GROUPINFOUPDATED,
  MessageType.JOINGROUPAPPLICATIONADDED,
  MessageType.MEMBERQUIT,
  MessageType.GROUPAPPLICATIONACCEPTED,
  MessageType.GROUPAPPLICATIONREJECTED,
  MessageType.GROUPOWNERTRANSFERRED,
  MessageType.MEMBERKICKED,
  MessageType.MEMBERINVITED,
  MessageType.MEMBERENTER,
  MessageType.GROUPDISMISSED,
  MessageType.GROUPMEMBERMUTED,
  MessageType.GROUPMEMBERCANCELMUTED,
  MessageType.GROUPMUTED,
  MessageType.GROUPCANCELMUTED,
  MessageType.BURNMESSAGECHANGE
];

export enum customType {
  VideoCall = "c100",
  VoiceCall = "c101",
  Call = 901,
  MassMsg = 903,
  InsertLoading = 999,
}

export const nomalMessageTypes = [
  MessageType.TEXTMESSAGE,
  MessageType.ATTEXTMESSAGE,
  MessageType.CARDMESSAGE,
  MessageType.MERGERMESSAGE,
  MessageType.LOCATIONMESSAGE,
  MessageType.CUSTOMMESSAGE,
  MessageType.REVOKEMESSAGE,
  MessageType.HASREADRECEIPTMESSAGE,
  MessageType.TYPINGMESSAGE,
  MessageType.QUOTEMESSAGE,
];

export const notOssMessageTypes = [MessageType.PICTUREMESSAGE, MessageType.VIDEOMESSAGE, MessageType.VOICEMESSAGE, MessageType.FILEMESSAGE];
