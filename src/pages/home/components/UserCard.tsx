import { LeftOutlined } from "@ant-design/icons";
import { Descriptions, Button, Input, Modal, Typography, Form, message, Upload } from "antd";
import { FC, useState, useRef, useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { events, im, switchUpload } from "../../../utils";
import self_card from "@/assets/images/self_card.png";
import del_card from "@/assets/images/del_card.png";
import MyAvatar from "../../../components/MyAvatar";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { getFriendList, setGroupMemberList } from "../../../store/actions/contacts";
import { TOASSIGNCVE, UPDATEFRIENDCARD } from "../../../constants/events";
import { useTranslation } from "react-i18next";
import { PublicUserItem, FriendItem, PartialUserItem, FullUserItem, SessionType } from "../../../utils/open_im_sdk/types";

//添加于2022年3月26日 15:10:13
import { FileStorage } from "../../../config/index";
import { updatedGroupManagementRemarkToDb } from "../../../api/groupManagement";
import { defaultUploadConfig } from "../config";

const { Paragraph } = Typography;

type UserCardProps = {
  draggableCardVisible: boolean;
  info: PublicUserItem | FriendItem | FullUserItem;
  close: () => void;
  type?: string;
};

const UserCard: FC<UserCardProps> = ({ draggableCardVisible, info, close, type }) => {
  const [draggDisable, setDraggDisable] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  // const [drft, setDrft] = useState("");
  const [step, setStep] = useState<"info" | "send">("info");
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draRef = useRef<any>(null);
  const selectValue = (state: RootState) => state.contacts.friendList;
  const friendList = useSelector(selectValue, shallowEqual);
  const selfID = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  //添加于 2022年4月16日 18:29:19
  const groupMembers = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);

  let selfInfo: PartialUserItem = {
    userID: selfID,
  };
  let drft = "";

  useEffect(() => {
    if ((info as FriendItem).remark !== undefined) {
      setIsFriend(true);
      setStep("info");
      return;
    }

    if (!type) {
      const idx = friendList.findIndex((f) => f.userID == info.userID);

      if (idx > -1) {
        setIsFriend(true);
        setStep("info");
      } else {
        setIsFriend(false);
        drft = "";
      }
    }
  }, [friendList, draggableCardVisible]);

  const onStart = (event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draRef!.current!.getBoundingClientRect();
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y),
    });
  };

  const sendApplication = ({ reqMsg }: { reqMsg: string }) => {
    const param = {
      toUserID: info.userID!,
      reqMsg,
    };
    im.addFriend(param)
      .then((res) => {
        console.log(res);
        message.success(t("SendFriendSuc"));
        close();
      })
      .catch((err) => {
        message.error(t("SendFriendFailed"));
      });
  };

  const clickBtn = (isSendMsg = false) => {
    if (isSendMsg) {
      events.emit(TOASSIGNCVE, info.userID, SessionType.Single);
      close();
    } else {
      setStep("send");
    }
  };

  const updateSelfInfo = () => {
    im.setSelfInfo(selfInfo)
      .then((res) => {
        message.success(t("ModifySuc"));
      })
      .catch((err) => message.error(t("ModifyFailed")));
  };

  const updateComment = () => {
    im.setFriendRemark({ toUserID: info.userID!, remark: drft })
      .then((res) => {
        dispatch(getFriendList());
        (info as FriendItem).remark = drft;
        events.emit(UPDATEFRIENDCARD, info);
        updatedGroupManagementRemark()
      })
      .catch((err) => message.error(t("ModifyFailed")));
  };

  const uploadIcon = async (uploadData: UploadRequestOption) => {
    switchUpload(uploadData)
      .then((res) => {
        selfInfo = { userID: selfID };
        //添加于 2022年3月26日 17:06:13
        res.data.URL = FileStorage + (res.data as any).newName;
        selfInfo.faceURL = res.data.URL;
        updateSelfInfo();
      })
      .catch((err) => message.error(t("UploadFailed")));
  };

  const goBack = () => {
    setStep("info");
    form.resetFields();
  };

  const myClose = () => {
    close();
    drft = "";
    setStep("info");
    form.resetFields();
  };

  const genderEnd = () => {
    console.log(drft);

    if (drft === t("Man")) {
      selfInfo.gender = 1;
      updateSelfInfo();
    } else if (drft === t("Woman")) {
      selfInfo.gender = 2;
      updateSelfInfo();
    } else {
      message.warning(t("FormatTip"));
    }
  };

  // 添加于 2022年4月16日 18:29:00
  const updatedGroupManagementRemark = async () => {
    try {
      const member = groupMembers.find(m => m.userID === info.userID)!
      await updatedGroupManagementRemarkToDb({
        groupid: member.groupID,
        target: member.userID,
        source: member.operatorUserID,
        remark: drft
      })
      dispatch(setGroupMemberList(groupMembers.map(m => {
        return {
          ...m,
          ex: m.userID === member!.userID ? JSON.stringify({ remark: drft }) : m.ex
        }
      })))
      message.success(t("ModifySuc"));
    } catch (err: any) {
      message.error(err.errMsg)
    }
  }

  const infoEditConfig = {
    onEnd: updateComment,
    onChange: (s: string) => (drft = s),
    onCancel: () => (drft = ""),
    autoSize: { maxRows: 2 },
    maxLength: 15,
  };

  const delContact = () => {
    im.deleteFriend(info.userID!)
      .then((res) => {
        message.success(t("UnfriendingSuc"));
        close();
      })
      .catch((err) => message.error(t("UnfriendingFailed")));
  };

  const InfoTitle = () => (
    <>
      <div className="left_info">
        <div className="left_info_title">{info.nickname}</div>
        <div className="left_info_icon">
          <img width={18} src={self_card} alt="" />
          {isFriend && <img onClick={delContact} style={{ marginLeft: "8px" }} width={18} src={del_card} />}
        </div>
      </div>
      <Upload accept="image/*" openFileDialogOnClick={type ? true : false} action="" customRequest={(data) => uploadIcon(data)} showUploadList={false}>
        <MyAvatar src={info.faceURL} size={42} />
      </Upload>
    </>
  );

  const SendTitle = () => (
    <>
      <div className="send_msg_title">
        <LeftOutlined className="cancel_drag" onClick={goBack} style={{ fontSize: "12px", marginRight: "12px" }} />
        <div className="send_msg_title_text">{t("FriendVerification")}</div>
      </div>
    </>
  );

  const SelfBody = () => (
    <>
      <Descriptions column={1} title={t("SelfInfo")}>
        <Descriptions.Item label={t("Nickname")}>
          <Typography.Text
            editable={{
              maxLength: 15,
              onChange: (v) => (drft = v),
              onEnd: () => {
                selfInfo = { userID: selfID };
                selfInfo.nickname = drft;
                updateSelfInfo();
              },
              onCancel: () => (drft = ""),
            }}
            copyable
          >
            {info.nickname}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t("Sex")}>
          <Paragraph
            editable={{
              maxLength: 1,
              onChange: (v) => (drft = v),
              onEnd: genderEnd,
              onCancel: () => (drft = ""),
            }}
          >
            {info.gender === 1 ? t("Man") : t("Woman")}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="ID">
          <Typography.Text copyable>{info.userID!}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t("PhoneNumber")}>
          <Typography.Text
            copyable
            editable={{
              maxLength: 11,
              onChange: (v) => (drft = v),
              onEnd: () => {
                selfInfo = { userID: selfID };
                selfInfo.phoneNumber = drft;
                updateSelfInfo();
              },
              onCancel: () => (drft = ""),
            }}
          >
            {(info as FullUserItem).phoneNumber}
          </Typography.Text>
        </Descriptions.Item>
      </Descriptions>
    </>
  );

  const InfoBody = () => (
    <>
      <Descriptions column={1} title={t("UserInfo")}>
        <Descriptions.Item label={t("Nickname")}>
          <Typography.Text copyable>{info.nickname}</Typography.Text>
        </Descriptions.Item>
        {isFriend && (
          <Descriptions.Item label={t("Note")}>
            <Typography.Text copyable editable={infoEditConfig}>
              {(info as FriendItem).remark}
            </Typography.Text>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t("Sex")}>{info.gender === 1 ? t("Man") : t("Woman")}</Descriptions.Item>
        {/* <Descriptions.Item label={t("Brithday")}>{info.}</Descriptions.Item> */}
        <Descriptions.Item label="ID">
          <Typography.Text copyable>{info.userID!}</Typography.Text>
        </Descriptions.Item>
        {/* <Descriptions.Item label="手机号">{info.mobile}</Descriptions.Item> */}
      </Descriptions>
      <div style={{ display: "flex" }}>
        {!isFriend && (
          <Button onClick={() => clickBtn()} style={{ marginRight: "12px" }} className="add_con_btn" type="primary">
            {t("AddFriend")}
          </Button>
        )}
        <Button onClick={() => clickBtn(true)} className="add_con_btn" type="primary">
          {t("SendMessage")}
        </Button>
      </div>
    </>
  );

  const SendBody = () => (
    <>
      <div className="send_card_info">
        <div className="send_card_info_row1">
          <div>{info.nickname}</div>
          <MyAvatar src={info.faceURL} size={42} />
        </div>
        <Form form={form} name="basic" onFinish={sendApplication} autoComplete="off">
          <Form.Item name="reqMsg">
            <Input placeholder={t("VerficationTip")} />
          </Form.Item>
        </Form>
      </div>
      <Button onClick={() => form.submit()} className="add_con_btn" type="primary">
        {t("Send")}
      </Button>
    </>
  );

  const switchBody = () => {
    if (type) return <SelfBody />;
    switch (step) {
      case "info":
        return <InfoBody />;
      case "send":
        return <SendBody />;
      default:
        return null;
    }
  };

  const ignoreClasses = `.cancel_drag, .cancel_input, .ant-upload,.left_info_icon,.ant-modal-body,.ant-upload`;

  return (
    <Modal
      // key="UserCard"
      className={step !== "send" ? "draggable_card" : "draggable_card_next"}
      closable={false}
      footer={null}
      mask={false}
      width={280}
      destroyOnClose={true}
      centered
      onCancel={myClose}
      title={
        <div
          className="draggable_card_title"
        // onMouseOver={() => {
        //   if (draggDisable) {
        //     setDraggDisable(false);
        //   }
        // }}
        // onMouseOut={() => {
        //   setDraggDisable(true);
        // }}
        >
          {step === "info" ? <InfoTitle /> : <SendTitle />}
        </div>
      }
      visible={draggableCardVisible}
      modalRender={(modal) => (
        <Draggable
          allowAnyClick={true}
          disabled={draggDisable}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
          cancel={ignoreClasses}
          enableUserSelectHack={false}
        >
          <div ref={draRef}>{modal}</div>
        </Draggable>
      )}
    >
      {switchBody()}
    </Modal>
  );
};

export default UserCard;
