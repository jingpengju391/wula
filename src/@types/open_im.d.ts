export type Itype = "login" | "register" | "vericode" | "setPwd" | "setInfo" | "success" | "modifycode" | "modify" | "modifySend";

export type WrapFriendApplicationItem = FriendApplicationItem & { flag?: number }
export type WrapGroupApplicationItem = GroupApplicationItem & { flag?: number }

// api
export type StringMapType = {
  [name: string]: string;
};

export type String2IMGType = {
  [name: string]: File;
};

export type MemberMapType = {
  [userID: string]: ResItemType;
};

export type OnLineResType = {
  errCode: number;
  errMsg: string;
  data: ResItemType[];
};

export type RegistersType = {
  errCode: number;
  errMsg: string;
  data: string[];
};

export type ResItemType = {
  status: string;
  userID: string;
  detailPlatformStatus?: DetailType[];
};

export type DetailType = {
  platform: string;
  status: string;
};

export type LanguageType = "zh-cn" | "en";

export type MediaType = "video" | "audio"

export type ModalType = "create" | "invite" | "remove" | "forward" | "rtc_invite";

export type FaceType = "emoji" | "customEmoji";

export type CustomEmojiType = {
  url: string;
  width: string;
  height: string;
};


