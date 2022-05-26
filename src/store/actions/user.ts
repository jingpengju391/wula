import { Dispatch } from "redux";
import { getAuthToken } from "../../api/admin";
import { im, watermark } from "../../utils";
import { FullUserItem, PartialUserItem } from "../../utils/open_im_sdk/types";
import { SET_SELF_INFO, SET_SELF_INIT_LOADING, SET_ADMIN_TOKEN, UserActionTypes } from "../types/user";
import { getOriginIDList } from "./contacts";

export const setSelfInfo = (value: PartialUserItem): UserActionTypes => {
  return {
    type: SET_SELF_INFO,
    payload: value as FullUserItem,
  };
};

export const setAdminToken = (value: string): UserActionTypes => {
  return {
    type: SET_ADMIN_TOKEN,
    payload: value,
  };
};

export const setSelfInitLoading = (value: boolean): UserActionTypes => {
  return {
    type: SET_SELF_INIT_LOADING,
    payload: value,
  };
};

export const getSelfInfo = () => {
  return (dispatch: Dispatch) => {
    dispatch(setSelfInitLoading(true));
    im.getSelfUserInfo().then((res) => {
      const selfInfo: PartialUserItem = JSON.parse(res.data);
      // watermark({content:`${selfInfo.nickname}  ${selfInfo.userID}`})
      dispatch(setSelfInfo(selfInfo));
      dispatch(setSelfInitLoading(false));
    });
  };
};

export const getAdminToken = (uid?: string, secret?: string) => {
  return (dispatch: Dispatch) => {
    const localToken = localStorage.getItem("IMAdminToken");
    if (localToken) {
      dispatch(setAdminToken(localToken));
      dispatch(getOriginIDList() as any);
    } else {
      getAuthToken(uid, secret).then((res) => {
        localStorage.setItem("IMAdminToken", res.data.token);
        dispatch(setAdminToken(res.data.token));
        dispatch(getOriginIDList() as any);
      });
    }
  };
};
