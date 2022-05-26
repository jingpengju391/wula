import { AudioOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Layout, Modal, Select, Tooltip } from "antd";
import { FC, memo, useEffect, useRef, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { DetailType, MediaType, OnLineResType } from "../../../@types/open_im";
import { getOnline } from "../../../api/admin";
import MyAvatar from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { diffMemo, events, im, isSingleCve } from "../../../utils";

import members from "@/assets/images/members.png";
import { setMember2Status } from "../../../store/actions/contacts";
import { useTranslation } from "react-i18next";
import { ConversationItem, GroupItem, RtcInvite, SessionType } from "../../../utils/open_im_sdk/types";
import { useUpdateEffect } from "ahooks";
import { APPLICATIONTYPEUPDATE, GETRTCINVITEIDS, OPENGROUPMODAL, SIGNALINGINVITE } from "../../../constants/events";
import { isNotify } from "../../../utils/im";
import group_icon from "@/assets/images/group_icon.png";

const { Header } = Layout;

type HeaderProps = {
  isShowBt?: boolean;
  type: "chat" | "contact";
  title?: string | any;
  curCve?: ConversationItem;
  typing?: boolean;
  ginfo?: GroupItem;
};

const HomeHeader: FC<HeaderProps> = ({ isShowBt, type, title, curCve, typing, ginfo }) => {
  const { t } = useTranslation();
  const [onlineStatus, setOnlineStatus] = useState<string>(t("Offline"));
  const [onlineNo, setOnlineNo] = useState(0);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const groupMemberLoading = useSelector((state: RootState) => state.contacts.groupMemberLoading, shallowEqual);
  const selfInfo = useSelector((state: RootState) => state.user.selfInfo, shallowEqual);
  const dispatch = useDispatch();
  const lastCve = useRef<ConversationItem | undefined>(undefined);

  useEffect(() => {
    if (
      (curCve?.conversationID == lastCve.current?.conversationID && curCve?.faceURL === lastCve.current?.faceURL && curCve?.showName === lastCve.current?.showName) ||
      groupMemberLoading
    )
      return;
    lastCve.current = curCve;
    // if (type === "chat") {
    //   if (isSingleCve(curCve!)) {
    //     getOnline([curCve!.userID]).then((res) => {
    //       const statusItem = res.data[0];
    //       if (statusItem.userID === curCve?.userID) {
    //         switchOnline(statusItem.status, statusItem.detailPlatformStatus);
    //       }
    //     });
    //   } else if (!isSingleCve(curCve!) && !groupMemberLoading && groupMemberList.length > 0) {
    //     getGroupOnline();
    //   }
    // }
  }, [type, curCve, groupMemberList, groupMemberLoading, lastCve]);

  const switchOnline = (oType: string, details?: DetailType[]) => {
    switch (oType) {
      case "offline":
        setOnlineStatus(t("Offline"));
        break;
      case "online":
        let str = "";
        details?.map((detail) => {
          if (detail.status === "online") {
            str += `${detail.platform}/`;
          }
        });
        setOnlineStatus(`${str.slice(0, -1)} ${t("Online")}`);
        break;
      default:
        break;
    }
  };

  const getGroupOnline = () => {
    const tmplist = [...groupMemberList];
    const total = Math.ceil(tmplist.length / 200);
    let promiseArr: Array<Promise<OnLineResType>> = [];
    for (let i = 0; i < total; i++) {
      promiseArr.push(getOnline(tmplist.splice(0, 200).map((m) => m.userID)));
    }

    Promise.all(promiseArr).then((res) => {
      let count = 0;
      let obj = {};
      res.map((pres) => {
        pres?.data?.map((item) => {
          obj = { ...obj, [item.userID]: item };
          if (item.status === "online") {
            count += 1;
          }
        });
      });

      dispatch(setMember2Status(obj));
      setOnlineNo(count);
    });
  };

  const voiceCall = async () => {
    events.emit(SIGNALINGINVITE, await getCallConfig("audio"));
  };

  const videoCall = async () => {
    events.emit(SIGNALINGINVITE, await getCallConfig("video"));
  };

  const getIDList = () => {
    return new Promise<string[]>((resolve, reject) => {
      if (curCve?.conversationType === SessionType.Single) {
        resolve([curCve!.userID]);
      } else {
        events.emit(OPENGROUPMODAL, "rtc_invite", groupMemberList, curCve?.groupID);
        events.once(GETRTCINVITEIDS, (list: string[]) => {
          resolve(list);
        });
      }
    });
  };

  const getCallConfig = async (mediaType: MediaType) => {
    return {
      inviterUserID: selfInfo.userID,
      inviteeUserIDList: await getIDList(),
      groupID: curCve?.groupID,
      roomID: "",
      timeout: 30,
      mediaType,
      sessionType: curCve?.conversationType,
      platformID: window.electron ? window.electron.platform : 5,
    };
  };

  const SingleCveInfo = () => (
    <>
      <span style={{ backgroundColor: "#0ecc63" }} className="icon" />
      <span className="online">{curCve?.userID}</span>
    </>
  );

  const GroupCveInfo = () => (
    <>
      <div className="num">
        <img src={members} alt="" />
        <span>{ginfo?.memberCount}</span>
      </div>
      <div className="num">
        {/* <span className="icon" /> */}
        {/* <span className="online">{`${onlineNo} ${t("OnlineEx")}`}</span> */}
      </div>
    </>
  );

  const NotificationHeader = () => (
    <div className="chat_header_box chat_header_cons">
      <div style={{ width: "100%" }}>{curCve?.showName}</div>
    </div>
  );

  const ChatHeader = () =>
    isNotify(curCve!.conversationType) ? (
      <NotificationHeader />
    ) : (
      <div className="chat_header_box">
        <div className="chat_header_box_left">
          <MyAvatar size={42} src={!curCve?.faceURL && curCve?.groupID ? group_icon : curCve?.faceURL} />
          <div className="cur_status">
            <div className="cur_status_nick">{curCve?.showName}</div>
            <div className="cur_status_update">
              {isSingleCve(curCve!) ? <SingleCveInfo /> : <GroupCveInfo />}
              {typing ? <span className="typing">{t("InInput")}</span> : null}
            </div>
          </div>
        </div>
        <div className="chat_header_box_right">
          <Tooltip placement="right" title={t("VoiceCall")}>
            <AudioOutlined onClick={voiceCall} />
          </Tooltip>
          <Tooltip placement="right" title={t("VideoCall")}>
            <PlayCircleOutlined onClick={videoCall} />
          </Tooltip>
        </div>
      </div>
    );

  const ConsHeader = () => {
    const [origin, setOrigin] = useState("recv");

    useUpdateEffect(() => {
      events.emit(APPLICATIONTYPEUPDATE, origin);
    }, [origin]);

    let recvLable,
      sentLable = "";
    const selectAble = title === t("NewFriend") || title === t("NewGroups");
    if (title === t("NewFriend")) {
      recvLable = t("NewFriend");
      sentLable = t("MyRequest");
    } else {
      recvLable = t("GroupApplication");
      sentLable = t("MyApplication");
    }

    const onSelect = (value: string) => {
      setOrigin(value);
    };

    const quit = () => {
      Modal.confirm({
        title: t("ExitTheEnterprise"),
        closable: false,
        maskClosable: true,
        centered: true,
        className: "warning_modal",
        onOk: () => {},
      });
    };

    const ContentTitle = () => (
      <div className="organizational_title">
        <div className="left">
          <span className="organizational_title_logo"></span>
          <span>市政府</span>
        </div>
        {/* <span className="quit" onClick={() => quit()}></span> */}
      </div>
    );

    return (
      <div className="chat_header_box chat_header_cons">
        <div style={{ width: "100%" }}>{title === null ? <ContentTitle /> : title}</div>
        {selectAble && (
          <Select onSelect={onSelect} defaultValue="recv" style={{ width: 120 }} allowClear>
            <Select.Option value="recv">{recvLable}</Select.Option>
            <Select.Option value="sent">{sentLable}</Select.Option>
          </Select>
        )}
      </div>
    );
  };
  return (
    <>
      <Header className="chat_header" style={{ borderBottom: isShowBt ? "1px solid #dedfe0" : "none" }}>
        {type === "chat" ? <ChatHeader /> : <ConsHeader />}
      </Header>
    </>
  );
};

HomeHeader.defaultProps = {
  isShowBt: true,
};

const shallowKey = ["isShowBt", "title", "type", "typing"];
const deepKey = ["conversationID", "showName", "faceURL"];
export default memo(HomeHeader, (p, n) => {
  const shallowFlag = diffMemo(p, n, shallowKey);
  const deepFlag = p.curCve ? diffMemo(p.curCve, n.curCve, deepKey) : true;
  return shallowFlag && deepFlag && p.ginfo?.memberCount === n.ginfo?.memberCount;
});
