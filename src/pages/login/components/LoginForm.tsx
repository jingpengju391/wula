import { Input, Button, Checkbox, Form, Select, Spin, Upload, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { useToggle } from "ahooks";
import { findEmptyValue, switchUpload } from "../../../utils/common";
import MyAvatar from "../../../components/MyAvatar";
import CodeBox from "./CodeBox";

import { useTranslation } from "react-i18next";
import { Itype } from "../../../@types/open_im";
//添加于2022年3月26日 15:10:13
import { FileStorage } from "../../../config/index";
import { defaultUploadConfig } from "../../home/config";

const { Option } = Select;

export type FormField = {
  areaCode: string;
  phoneNo: string;
  password?: string;
};

export type InfoField = {
  userID: string;
  nickname: string;
  faceURL: string;
};

type IProps = {
  finish: (values?: FormField | string | InfoField) => void;
  type: Itype | undefined;
  back: () => void;
  getCodeAgain: () => void;
  loading: boolean;
  num: string;
};

const LoginForm: FC<IProps> = (props) => {
  const { type, loading, finish, back } = props;
  const { t } = useTranslation();
  const [btmSts, { set: setBtm }] = useToggle();
  const [backSts, { set: setBack }] = useToggle();
  const [checkSts, { toggle: toggleCheck }] = useToggle(true);
  const [sInfo, setSInfo] = useState<InfoField>({
    userID: "userID",
    nickname: "",
    faceURL: `ic_avatar_0${Math.ceil(Math.random() * 6)}`,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    const btmShow = ["login","register"]
    const backShow = ["register","vericode","modifySend","modifycode"]
    setBtm(btmShow.includes(type!));
    setBack(backShow.includes(type!));
  }, [type]);

  const phoneRules = [
    {
      message: t("PhoneRule"),
      min: 6,
      max: 20,
      validateTrigger: "onFinish",
    },
  ];

  const pwdRules = [
    {
      message: t("PassWordRule"),
      min: 6,
      max: 20,
      validateTrigger: "onFinish",
    },
  ];

  const rePwdRules = [
    {
      message: t("PassWordRule"),
      min: 6,
      max: 20,
      validateTrigger: "onFinish",
    },
    (ctx: any) => ({
      validator(_: any, value: string) {
        if (!value || ctx.getFieldValue("password") === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(t("PassWordRepeat")));
      },
    }),
  ];

  const initialValues = {
    areaCode: "86",
    phoneNo: type === "login" ? localStorage.getItem("lastimuid") ?? "" : "",
  };

  const comfirmEnter = (value: any) => {
    if (checkSts) {
      finish(value);
    } else {
      message.warn(t("CheckAgreement"));
    }
  };

  const switchBtnText = () => {
    switch (type) {
      case "login":
        return t("Login");
      case "register":
        return t("Register");
      case "modifySend":
        return t("GetVerifyCode");
    }
  };

  const loginAndRegisterForm = (
    <>
      <div className="form_title">{type === "modifySend" ? t("MissPwd") : t("LoginFormTitle")}</div>
      <Form onFinish={comfirmEnter} layout="vertical" initialValues={initialValues}>
        <Form.Item className="no_mb" label={t("PhoneNumber")}>
          {/* <Input.Group compact>
            <Form.Item name="areaCode">
              <Select bordered={false}>
                <Option value={"86"}>+86</Option>
                <Option value={"89"}>+89</Option>
              </Select>
            </Form.Item>
            <Form.Item name="phoneNo" rules={phoneRules}>
              <Input bordered={false} placeholder={t("PhoneNumberTip")} />
            </Form.Item>
          </Input.Group> */}
          <Form.Item name="phoneNo" rules={phoneRules}>
            <Input bordered={false} placeholder={t("PhoneNumberTip")} />
          </Form.Item>
        </Form.Item>
        {type === "login" ? (
          <Form.Item name="password" label={t("Password")} rules={pwdRules}>
            <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PasswordTip")} allowClear />
          </Form.Item>
        ) : null}
        <Form.Item>
          <Button loading={loading} htmlType="submit" type="primary">
            {switchBtnText()}
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  const help = <span style={{ fontSize: "12px", color: "#428be5" }}>{t("PasswolrdNotice")}</span>;

  const setPwd = (
    <>
      <div className="form_title">
        {type === "setPwd" ? t("SetAccountTitle") : t("ModifyPwdTitle")}
        <div className="sub_title">{t("SetAccountSubTitle")}</div>
      </div>
      <Form
        form={form}
        onFinish={(v) => {
          finish(v);
          form.resetFields();
        }}
        layout="vertical"
      >
        <Form.Item name="password" label={t("Password")} rules={pwdRules} extra={help}>
          <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PasswordTip")} />
        </Form.Item>

        <Form.Item name="rePassword" label={t("ComfirmPassword")} rules={rePwdRules} dependencies={["password"]}>
          <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PasswordTip")} />
        </Form.Item>

        <Form.Item style={{ margin: "48px 0 0 0" }}>
          <Button loading={loading} htmlType="submit" type="primary">
            {t("NextStep")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  const cusromUpload = async (data: UploadRequestOption) => {
    switchUpload(data).then((res) => {
      //添加于2022年4月3日 11:28:13
      res.data.URL = FileStorage + (res.data as any).newName;
      // 添加结束
      setSInfo({ ...sInfo, faceURL: res.data.URL })
    });
  };
  const uploadConfig = defaultUploadConfig({name:'avatar'})
  const setInfo = (
    <>
      <div className="form_title">
        {t("LoginFormTitle")}
        <div className="sub_title">{t("SetInfoSubTitle")}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <Upload {...uploadConfig} customRequest={(data) => cusromUpload(data)}>
          <MyAvatar size={72} src={sInfo.faceURL} />
          <div
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "8px",
              display: sInfo.faceURL === "" ? "block" : "none",
            }}
          >
            {t("SetAvatar")}
          </div>
        </Upload>
      </div>
      <div className="name_input">
        <div className="name_lable">{t("SetName")}</div>
        <Input
          allowClear={true}
          bordered={false}
          placeholder={t("SetNameNotice")}
          onChange={(v) =>
            setSInfo({
              ...sInfo,
              nickname: v.target.value,
            })
          }
        />
      </div>
      <Button
        loading={loading}
        style={{ marginTop: "48px" }}
        type="primary"
        onClick={() => {
          if (findEmptyValue(sInfo)) {
            finish(sInfo);
          }
        }}
      >
        {t("RegistrationCompleted")}
      </Button>
    </>
  );

  const loadingEl = (
    <div className="loading_spin">
      <Spin size="large" />
    </div>
  );

  const backIcon = (
    <div
      style={{
        position: "absolute",
        top: "14px",
        fontSize: "12px",
        color: "#777",
        cursor: "pointer",
      }}
      onClick={back}
    >
      <LeftOutlined />
      {t("Back")}
    </div>
  );

  const bottomAccess = (
    <div>
      <Checkbox checked={checkSts} defaultChecked={checkSts} onChange={() => toggleCheck()}>
        {t("LoginNotice")}
        <span className="primary">{` ${t("UserAgreement")} `}</span>
        {t("And")}
        <span className="primary">{` ${t("PrivacyAgreement")} `}</span>
      </Checkbox>
      {type === "login" ? (
        <div className="access_bottom">
          <span onClick={() => finish("modifySend")}>{t("")}</span>
          <span onClick={() => finish("register")}>{t("RegisterNow")}</span>
        </div>
      ) : null}
    </div>
  );

  const getForm = () => {
    if(type === 'vericode') {
      finish('666666')
      return
    }
    switch (type) {
      case "login":
      case "register":
      case "modifySend":
        return loginAndRegisterForm;
      case "setPwd":
      case "modify":
        return setPwd;
      case "setInfo":
        return setInfo;
      default:
        return loadingEl;
    }
  };

  return (
    <div className="login_form">
      {backSts && backIcon}
      {getForm()}
      {btmSts && bottomAccess}
    </div>
  );
};

export default LoginForm;
