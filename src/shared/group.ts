export type GroupManagement = {
    groupid: string 
    target: string
    source: string
    action: string
}

export type GroupInfo = {
    groupid: string 
    target: string
}

export type GroupMemberItemDb = {
    userid: string;
    nickname: string;
    faceurl: string;
    rolelevel: number;
    extend: number
};

export type RevokeMessage = {
    sendID: string 
    groupID: string
    revokeMsgClientID: string
}

export type GroupMemberNickName = {
    groupid: string 
    userid: string
    nickname: string
}

export type GroupMemberRemark = {
    groupid: string 
    target: string
    source: string
    remark: string
}