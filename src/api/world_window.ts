import { request } from "../utils";
const WWBaseURL = "http://111.62.143.78:5888";

export const getBusinessToken = (username: string, password: string) =>
  request.post("/auth/login", "", {
    baseURL: WWBaseURL,
    params: {
      username,
      password,
    },
  });

export const getAccessToken = () =>
  request.get("/auth/appAuth/getAccess_token", {
    baseURL: WWBaseURL,
    params: {
      appId: "lngK0Ovk",
      appSecret: "570dcfd4350629e8ea615522579204f0caabb66a",
    },
  });

export const getOpenCode = () =>
  request.post("/auth/header/appInfo/openApp", "", {
    baseURL: WWBaseURL,
    headers: {
      token: localStorage.getItem("BusinessToken"),
    },
    params: {
      id: "8a98bc517f8732d1017f907a365d002f",
    },
  });

export const getDeptList = (deptId: string = "") =>
  request.get("/auth/openApi/getDeptList", {
    baseURL: WWBaseURL,
    params: {
      accessToken: localStorage.getItem("AccessToken"),
      deptId,
    },
  });

export const getDeptUserList = (deptId: string) =>
  request.get("/auth/openApi/getDeptUserList", {
    baseURL: WWBaseURL,
    params: {
      accessToken: localStorage.getItem("AccessToken"),
      deptId,
    },
  });

export const getUserInfo = (userId: string) =>
  request.get("/auth/openApi/getUserInfo", {
    baseURL: WWBaseURL,
    params: {
      accessToken: localStorage.getItem("AccessToken"),
      userId,
    },
  });
