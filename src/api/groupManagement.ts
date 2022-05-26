import { request } from "../utils";
import { GroupManagement, GroupInfo, RevokeMessage, GroupMemberNickName, GroupMemberRemark } from '../shared'
import { CheckLogin } from '../config'

export const updatedGroupManagementToDb = (params: GroupManagement) => 
request.post("/api/Control/SetUserPower", params, {
    baseURL: CheckLogin,
    headers: {
        token:localStorage.getItem("IMAdminToken"),
    }
})

export const recoverUserGroupInfoFromDb = (params: GroupInfo) => 
request.post("/api/Control/GetUserGroupInfo", params, { baseURL: CheckLogin })


export const recoverUsersGroupInfoFromDb = (groupid: string) => 
request.post("/api/Control/GetGroupUsers", { groupid }, { baseURL: CheckLogin })

export const managementRevokeMessage = (params: RevokeMessage) => 
request.post("/api/control/MessageRecall", params, {
    baseURL: CheckLogin,
    headers: {
        token:localStorage.getItem("IMAdminToken"),
    }
})

export const updatedGroupManagementNickNameToDb = (params: GroupMemberNickName) => 
request.post("/api/control/SetMyselfNickName", params, { baseURL: CheckLogin })

export const updatedGroupManagementRemarkToDb = (params: GroupMemberRemark) => 
request.post("/api/control/SetGroupUserRemark", params, { baseURL: CheckLogin })

