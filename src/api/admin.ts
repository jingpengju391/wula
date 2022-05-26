import { RcFile } from "antd/lib/upload";
import { OnLineResType, RegistersType } from "../@types/open_im";
import { getAdminUrl } from "../config";
import { request } from "../utils";
import { uuid } from "../utils/open_im_sdk";
import { UploadRequestOption } from "rc-upload/lib/interface";

export const getAuthToken = (uid?: string, secret?: string) =>
  request.post(
    "/auth/user_token",
    JSON.stringify({
      secret: secret ?? "tuoyun",
      platform: 8,
      userID: uid ?? "wulaimadmin",
      OperationID: uuid(uid ?? "uuid"),
    }),
    {
      baseURL: getAdminUrl(),
    }
  );

export const getOnline = (userIDList: string[], opid?: string): Promise<OnLineResType> => {
  return request.post(
    "/manager/get_users_online_status",
    JSON.stringify({
      operationID: opid ?? uuid("uuid"),
      userIDList,
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );
};

export const getRegisters = (opid?: string): Promise<RegistersType> => {
  return request.post(
    "/manager/get_all_users_uid",
    JSON.stringify({
      operationID: opid ?? uuid("uuid"),
    }),
    {
      baseURL: getAdminUrl(),
      headers: {
        token: localStorage.getItem("improfile"),
      },
    }
  );
};

export enum minioUploadType {
  file = "1",
  video = "2",
  picture = "3",
}

export const minioUpload = (uploadData: UploadRequestOption, fileType: minioUploadType, snapShot?: RcFile,onProgress?: (progress:number)=>void,opid?: string): Promise<{ data: { URL: string; newName: string } }> => {
  const data = new FormData();
  data.append("file", uploadData.file);
  data.append("fileType", fileType);
  data.append("operationID", opid ?? uuid("uuid"));
  snapShot && data.append("snapShot", snapShot);
  return request.post("/third/minio_upload", data, {
    baseURL: getAdminUrl(),
    headers: {
      "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>",
      token: localStorage.getItem("improfile"),
    },
    onUploadProgress:function(progressEvent){ 
         let complete = (progressEvent.loaded / progressEvent.total * 100 | 0)
          onProgress&&onProgress(complete)
        }
  });
};
