import { DeleteOutlined, LeftOutlined } from "@ant-design/icons";
import { Drawer, message, Modal } from "antd";
import { FC, memo, useEffect, useState } from "react";
import { diffMemo, events, im, isSingleCve } from "../../../../utils";
import SingleDrawer from "./SingleDrawer";
import GroupDrawer from "./GroupDrawer/GroupDrawer";
import EditDrawer from "./GroupDrawer/EditDrawer";
import MemberDrawer from "./GroupDrawer/MemberDrawer";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import GroupManage from "./GroupDrawer/GroupManage";
import { GroupNotice } from "./GroupDrawer/GroupNotice";
import { useTranslation } from "react-i18next";
import { setCurCve } from "../../../../store/actions/cve";
import { ConversationItem, GroupItem, GroupMemberItem, GroupRole, OptType } from "../../../../utils/open_im_sdk/types";
import { SearchMessageDrawer } from "./SearchMessageDrawer";
import delCart_icon from "../../../../assets/images/del_msg.png";
import { DELETEMESSAGE } from "../../../../constants/events";

type CveRightDrawerProps = {
  curCve: ConversationItem;
  visible: boolean;
  curTool?: number;
  onClose: () => void;
};

export type DrawerType = "set" | "edit_group_info" | "member_list" | "group_manage" | "group_notice_list" | "search_message";

const CveRightDrawer: FC<CveRightDrawerProps> = ({ curCve, visible, curTool, onClose }) => {
  const [type, setType] = useState<DrawerType>("set");
  const selfID = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const groupMembers = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const groupInfo = useSelector((state: RootState) => state.contacts.groupInfo, shallowEqual);
  const [adminList, setAdminList] = useState<GroupMemberItem[]>([]);
  const [role, setRole] = useState<GroupRole>(GroupRole.Nomal);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    switch (curTool) {
      case 0:
        setType("group_notice_list");
        break;
      case 1:
        setType("search_message");
        break;
      default:
        setType("set");
        break;
    }
  }, [curTool]);

  useEffect(() => {
    if (groupInfo) {
      getPermission(groupInfo);
    }
  }, [groupInfo]);

  const getPermission = (info: GroupItem) => {
    let adminIds: string[] = [];
    let tmpList = groupMembers.filter((m) => {
      if (m.roleLevel === 2) {
        adminIds.push(m.userID);
        return m;
      }
    });
    setAdminList(tmpList);
    if (selfID === info.ownerUserID) {
      setRole(GroupRole.Owner);
    } else if (adminIds.includes(selfID!)) {
      setRole(GroupRole.Admin);
    } else {
      setRole(GroupRole.Nomal);
    }
  };

  const changeType = (tp: DrawerType) => {
    setType(tp);
  };

  const updatePin = () => {
    const options = {
      conversationID: curCve.conversationID,
      isPinned: !curCve.isPinned,
    };
    im.pinConversation(options)
      .then((res) => {
        message.success(!curCve.isPinned ? t("PinSuc") : t("CancelPinSuc"));
        curCve.isPinned = !curCve.isPinned;
      })
      .catch((err) => {});
  };

  const updateOpt = (v: boolean, isMute?: boolean) => {
    let flag = 0;
    if (v) {
      flag = isMute ? OptType.Mute : OptType.WithoutNotify;
    } else {
      flag = OptType.Nomal;
    }
    const options = {
      conversationIDList: [curCve.conversationID],
      opt: flag,
    };
    im.setConversationRecvMessageOpt(options)
  };

  const delLocalRecord = () => {
    if (curCve.conversationType === 1) {
      im.clearC2CHistoryMessage(curCve.userID)
        .then((res) => {
          events.emit(DELETEMESSAGE, curCve.userID, true);
        })
        .catch((err) => message.error(t("DeleteMessageFailed")));
    } else {
      im.clearGroupHistoryMessage(curCve.groupID)
        .then((res) => {
          events.emit(DELETEMESSAGE, curCve.groupID, true);
        })
        .catch((err) => message.error(t("DeleteMessageFailed")));
    }
  };

  // const delRemoteRecord = () => {
  //   im.deleteConversationFromLocalAndSvr(curCve.conversationID)
  //     .then((res) => {
  //       events.emit(DELETEMESSAGE, curCve.conversationID, true);
  //     })
  //     .catch((err) => message.error(t("DeleteMessageFailed")));
  // };

  const switchContent = () => {
    switch (type) {
      case "set":
        return isSingleCve(curCve) ? (
          <SingleDrawer curCve={curCve} updatePin={updatePin} updateOpt={updateOpt} />
        ) : (
          <GroupDrawer groupInfo={groupInfo} curCve={curCve} role={role!} groupMembers={groupMembers!} updatePin={updatePin} changeType={changeType} updateOpt={updateOpt} />
        );
      case "edit_group_info":
        return <EditDrawer />;
      case "member_list":
        return <MemberDrawer groupMembers={groupMembers!} role={role!} />;
      case "group_manage":
        return <GroupManage gid={curCve.groupID} groupMembers={groupMembers} adminList={adminList} />;
      case "group_notice_list":
        return <GroupNotice />;
      case "search_message":
        return <SearchMessageDrawer curCve={curCve} />;
      default:
        break;
    }
  };

  const backTitle = (tp: DrawerType, title: string) => (
    <div>
      <LeftOutlined onClick={() => setType(tp)} />
      <span style={{ marginLeft: "12px" }}>{title}</span>
    </div>
  );

  const delMsgConfirm = () => {
    Modal.confirm({
      title: t("DeleteMessage"),
      content: t("DeleteAllMessageConfirm"),
      cancelText: t("Cancel"),
      okText: t("Delete"),
      okButtonProps: {
        danger: true,
        type: "primary",
      },
      closable: false,
      className: "warning_modal",
      onOk: () => delLocalRecord(),
    });
  }

  const switchTitle = () => {
    switch (type) {
      case "set":
        return <div>{t("Setting")}</div>;
      case "edit_group_info":
        return backTitle("set", t("EditGroupInfo"));
      case "member_list":
        return backTitle("set", t("GroupMembers"));
      case "group_manage":
        return backTitle("set", t("GroupManagement"));
      case "group_notice_list":
        return <div>{t("GroupAnnouncement")}</div>;
      case "search_message":
        return (
          <div className="search_del">
            {t("ChatsRecord")}
            <DeleteOutlined onClick={delMsgConfirm} />
          </div>
        );
      default:
        break;
    }
  };

  const closeableList = ["set", "search_message", "group_notice_list"];

  return (
    <>
      <Drawer
        className="right_set_drawer"
        width={360}
        // mask={false}
        maskClosable
        title={switchTitle()}
        placement="right"
        onClose={() => {
          setType("set");
          onClose();
        }}
        closable={closeableList.includes(type)}
        visible={visible}
        getContainer={document.getElementById("chat_main")!}
      >
        {switchContent()}
      </Drawer>
    </>
  );
};

const deepKey = ["conversationID", "showName", "faceURL", "recvMsgOpt", "isPinned", "isPrivateChat"];
export default memo(CveRightDrawer, (p, n) => {
  const shallowFlag = p.curTool === n.curTool;
  const deepFlag = diffMemo(p.curCve, n.curCve, deepKey);
  return shallowFlag && deepFlag;
});