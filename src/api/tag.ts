import { getAdminUrl } from "../config";
import { request } from "../utils";
import { uuid } from "../utils/open_im_sdk";

let platform = window.electron ? window.electron.platform : 5;

export const createTag = (tagName: string, userIDList: string[], uid?: string) =>
  request.post(
    "/office/create_tag",
    JSON.stringify({
      tagName,
      userIDList,
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );

export const deleteTag = (tagID: string, uid?: string) =>
  request.post(
    "/office/delete_tag",
    JSON.stringify({
      tagID,
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );

export const updateTag = (tagID: string, increaseUserIDList: string[], reduceUserIDList: string[], newName: string, uid?: string) =>
  request.post(
    "/office/set_tag",
    JSON.stringify({
      tagID,
      increaseUserIDList,
      reduceUserIDList,
      newName,
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );

export const massMessage = (tagList: string[], userList: string[], groupList: string[], content: string, uid?: string) =>
  request.post(
    "/office/send_msg_to_tag",
    JSON.stringify({
      tagList,
      userList,
      groupList,
      senderPlatformID: platform,
      content,
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );

export const massList = (pageNumber: number, showNumber: number, uid?: string) =>
  request.post(
    "/office/get_send_tag_log",
    JSON.stringify({
      pageNumber,
      showNumber,
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );

export const getAllTags = (uid?: string) =>
  request.post(
    "/office/get_user_tags",
    JSON.stringify({
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );
