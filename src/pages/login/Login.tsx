import { message } from "antd";
import login_bg from "@/assets/images/login_bg.png";
import LoginForm, { FormField, InfoField } from "./components/LoginForm";
import { useState } from "react";
import { Itype } from "../../@types/open_im";
import { useHistoryTravel, useLatest } from "ahooks";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import md5 from "md5";
import { login as loginApi, modify, register, sendSms, UsedFor, verifyCode, loginCheck, registerEx } from "../../api/login";
import { im } from "../../utils";
import { getIMUrl, IMURL } from "../../config";
import { useDispatch } from "react-redux";
import { getSelfInfo, getAdminToken, setSelfInfo } from "../../store/actions/user";
import { getCveList } from "../../store/actions/cve";
import {
  getBlackList,
  getRecvFriendApplicationList,
  getFriendList,
  getRecvGroupApplicationList,
  getGroupList,
  getUnReadCount,
  getSentFriendApplicationList,
  getSentGroupApplicationList,
  getOriginIDList,
} from "../../store/actions/contacts";
import IMConfigModal from "./components/IMConfigModal";
import TopBar from "../../components/TopBar";
import { InitConfig } from "../../utils/open_im_sdk/types";
import { getAccessToken, getBusinessToken } from "../../api/world_window";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState("");
  const [code, setCode] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { value: type, setValue: setType, back } = useHistoryTravel<Itype>("login");
  const lastType = useLatest(type);

  //修改于 2022年3月25日 22:32:36
  const finish = (values?: FormField | string | InfoField) => {
    switch (lastType.current) {
      case "login":
        if (!values) return;
        if (values === "register" || values === "modifySend") {
          toggle(values);
        } else {
          if ((values as FormField).phoneNo == undefined || (values as FormField).password == undefined) return false;
          toggle("success");
          login(values as FormField);
        }
        break;
      case "register":
      case "modifySend":
        const isModify = lastType.current === "modifySend";
        sendSms((values as FormField)?.phoneNo as string, isModify ? UsedFor.Modify : UsedFor.Register)
          .then((res: any) => {
            if (res.errCode === 0) {
              message.success(t("SendSuccessTip"));
            } else if (res.errCode === 10007 || res.errCode === 10008) {
              //短信验证码这个错误提示注释了
              //handleError(res);
            }
            setNum((values as FormField)?.phoneNo);
            toggle(isModify ? "modifycode" : "vericode");
          })
          .catch((err) => handleError(err));
        break;
      case "modifycode":
      case "vericode":
        const isRegister = lastType.current === "vericode";
        verifyCode(num, values as string, isRegister ? UsedFor.Register : UsedFor.Modify)
          .then((res: any) => {
            setCode(values as string);
            toggle(isRegister ? "setPwd" : "modify");
          })
          .catch((err) => handleError(err));
        break;
      case "setPwd":
        // register(num, code, md5((values as FormField).password as string))
        registerEx(num, ((values as FormField).password as string)).then((returnResult)=>{

          var _result = JSON.parse(JSON.stringify(returnResult));
          if (_result.errCode == 0) {
            loginApi(num, md5((values as FormField).password as string))
              .then((res) => {
                imLogin(res.data.userID, res.data.token);
                toggle("setInfo");
              })
              .catch((err) => {
                handleError(err);
              });
          } else {
            handleError(_result.errMsg);
          }
        }).catch((err) => handleError(err));
        // register(num, "666666", md5((values as FormField).password as string))
        //   .then((res: any) => {
        //     imLogin(res.data.userID, res.data.token);
        //     toggle("setInfo");
        //   })
        //   .catch((err) => handleError(err));
        break;
      case "setInfo":
        toggle("success");
        setIMInfo(values as InfoField);
        break;
      case "modify":
        // modify(num, code, md5((values as FormField).password as string))
        modify(num, "666666", md5((values as FormField).password as string))
          .then(() => {
            message.info(t("ModifyPwdSucTip"));
            toggle("login");
          })
          .catch((err) => handleError(err));

        break;
      default:
        break;
    }
  };

  const getCodeAgain = async () => {
    const isModify = type === "modifycode";
    const result: any = await sendSms(num, isModify ? UsedFor.Modify : UsedFor.Register);
    if (result.errCode === 0) {
      message.success(t("SendSuccessTip"));
    } else {
      handleError(result);
    }
  };

  const setIMInfo = (values: InfoField) => {
    values.userID = num;
    im.setSelfInfo(values)
      .then((res) => {
        dispatch(setSelfInfo(values));
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toggle("setInfo");
        message.error(t("SetInfoFailed"));
      });
  };

  const login = async (data: FormField) => {
    const { errCode, errMsg } = loginCheck(data.phoneNo, md5(data.password as string)) as any
    if(errCode) {
      message.warning(errMsg)
      return
    }
    loginApi(data.phoneNo, md5(data.password as string))
      .then((res) => {
        console.log(res,9999)
        imLogin(res.data.userID, res.data.token);
      })
      .catch((err) => {
        handleError(err);
      });
  };

  const thirdAuth = () => {
    getBusinessToken("admin", "DuDr3rMace").then((res) => {
      localStorage.setItem("BusinessToken", res.data.token);
    });
    getAccessToken().then((res) => {
      localStorage.setItem("AccessToken", res.data.accessToken);
    });
  };


  const imLogin = async (userID: string, token: string) => {
    localStorage.setItem(`improfile`, token);
    localStorage.setItem(`curimuid`, userID);
    //pc
    localStorage.setItem(`lastimuid`, userID);

    if (!localStorage.getItem("userEmoji")) {
      localStorage.setItem("userEmoji", JSON.stringify([]));
    }
    const userEmojiInfo = {
      userID,
      emoji: [],
    };
    const allUserEmoji = JSON.parse(localStorage.getItem("userEmoji")!);
    const flag = allUserEmoji.some((item: any) => item?.userID === userID);
    if (!flag) {
      localStorage.setItem("userEmoji", JSON.stringify([...allUserEmoji, userEmojiInfo]));
    }

    let url = getIMUrl();
    let platformID = 4;
    if (window.electron) {
      url = await window.electron.getLocalWsAddress();
    }
    const config: InitConfig = {
      userID,
      token,
      url,
      platformID,
    };
    im.login(config)
      .then((res) => {
        thirdAuth();
        dispatch(getSelfInfo());
        dispatch(getCveList());
        dispatch(getFriendList());
        dispatch(getRecvFriendApplicationList());
        dispatch(getSentFriendApplicationList());
        dispatch(getGroupList());
        dispatch(getRecvGroupApplicationList());
        dispatch(getSentGroupApplicationList());
        dispatch(getUnReadCount());
        dispatch(getBlackList());
        dispatch(getAdminToken());
        if (lastType.current === "success") {
          navigate("/", { replace: true });
        }
      })
      .catch((err) => handleError(err));
  };

  const switchError = (errCode: number) => {
    switch (errCode) {
      case 10002:
        return t("HasRegistered");
      case 10003:
        return t("NotRegistered");
      case 10004:
        return t("PasswordErr");
      case 10005:
        return t("GetTokenErr");
      case 10006:
        return t("RepeatSendCode");
      case 10007:
        return t("MailSendCodeErr");
      case 10008:
        return t("SmsSendCodeErr");
      case 10009:
        return t("CodeInvalidOrExpired");
      case 10010:
        return t("RegisterFailed");
      default:
        return undefined;
    }
  };

  const handleError = (error: any) => {
    if (lastType.current === "success") {
      toggle("login");
    }
    message.error(switchError(error.errCode) ?? error.errMsg ?? t("AccessFailed"));
  };

  const toggle = (mtype: Itype) => {
    setType(mtype);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="login_container">
      <TopBar />
      <div className="login_wapper">
        <div className="center_container">
          <div className="left_container">
            <div onDoubleClick={() => setIsModalVisible(true)} className="title">
              {t("LoginTitle")}
            </div>
            <span className="sub_title">{t("LoginSubTitle")}</span>
            <img src={login_bg} />
          </div>
          <LoginForm loading={loading} num={num} type={lastType.current} finish={finish} getCodeAgain={getCodeAgain} back={back} />
        </div>
        {isModalVisible && <IMConfigModal visible={isModalVisible} close={closeModal} />}
      </div>
      <div className="login_bottom"></div>
    </div>
  );
};

export default Login;
