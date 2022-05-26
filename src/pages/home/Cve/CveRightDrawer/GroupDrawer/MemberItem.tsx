import { AudioMutedOutlined, AudioOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal, message, Tooltip, Skeleton, Descriptions, Typography  } from "antd";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MemberMapType } from "../../../../../@types/open_im";
import LayLoad from "../../../../../components/LayLoad";
import { Loading } from "../../../../../components/Loading";
import MyAvatar from "../../../../../components/MyAvatar";
import { im,events } from "../../../../../utils";
import { FriendItem, GroupMemberItem, GroupRole } from "../../../../../utils/open_im_sdk/types";
import { updatedGroupManagementRemarkToDb } from "../../../../../api/groupManagement";
import {  useDispatch,useSelector,shallowEqual } from "react-redux";
import { getFriendList,setGroupMemberList } from "../../../../../store/actions/contacts";
import { RootState } from "../../../../../store";
import { TOASSIGNCVE, UPDATEFRIENDCARD } from "../../../../../constants/events";
type MemberItemProps = {
  item: GroupMemberItem;
  member2Status: MemberMapType;
  role: GroupRole;
  idx: number;
  muteIconClick:(item:GroupMemberItem,isMute:boolean)=> void;
};

const MemberItem: FC<MemberItemProps> = ({ idx, item, member2Status, role, muteIconClick }) => {
  const memberItemRef = useRef<HTMLDivElement>(null);
  const [isMute, setIsMute] = useState(false);
  
  const { t } = useTranslation();
  const { Paragraph } = Typography;
  const dispatch = useDispatch();
  const groupMembers = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);

  useEffect(() => {
    const now = parseInt(Date.now() / 1000 + "");
    setIsMute(item.muteEndTime > now);
  }, [item]);

  const ParseStatus = useMemo(() => {
    let str = t("Offline");
    const tItem = member2Status[item.userID];
    if (tItem) {
      if (tItem.status === "online") {
        str = "";
        tItem.detailPlatformStatus?.map((pla) => {
          if (pla.status === "online") {
            str += `${pla.platform}/`;
          }
        });
        str = str.slice(0, -1) + t("Online");
      }
    }
    return `[${str}]`;
  },[member2Status])

  const warning = () => {
    Modal.confirm({
      title: t("RemoveMembers"),
      content: t("RemoveTip1") + item.nickname + " " + t("RemoveTip2"),
      cancelText: t("Cancel"),
      okText: t("Remove"),
      okButtonProps: {
        danger: true,
        type: "primary",
      },
      closable: false,
      className: "warning_modal",
      onOk: () => removeMember(),
    });
  };

  const removeMember = () => {
    const options = {
      groupID: item.groupID,
      reason: "kick",
      userIDList: [item.userID],
    };
    im.kickGroupMember(options)
      .then((res) => {
        message.success(t("KickSuc"));
      })
      .catch((err) => message.error(t("KickFailed")));
  };

  let remark = "";
  const updatedGroupManagementRemark = async () => {
    try {
      await updatedGroupManagementRemarkToDb({
        groupid: item!.groupID,
        target: item!.userID,
        source: item!.operatorUserID,
        remark
      })
      dispatch(setGroupMemberList(groupMembers.map(m => {
        return {
          ...m,
          ex: m.userID === item!.userID ? JSON.stringify({remark:remark}) : m.ex
        }
      })))
    } catch (err:any) {
      message.error(err.errMsg)
    }
  }
  const infoEditConfig = {
    onEnd: updatedGroupManagementRemark,
    onChange: (r:string) => (remark = r),
    onCancel: () => { remark = '' },
    autoSize: { maxRows: 2 },
    maxLength: 15,
  };

  const ActionIcons = () => (
    <div className="edit-box">
      <Descriptions.Item label={t("Note")}>
        <Typography.Text editable={infoEditConfig}>
          {item.nickname || item.ex ? JSON.parse(item.ex)?.remark : ''}
        </Typography.Text>
      </Descriptions.Item>
      <Tooltip placement="left" title={t("SetMute")}>
        {isMute ? <AudioMutedOutlined onClick={()=>muteIconClick(item,isMute)} /> : <AudioOutlined onClick={()=>muteIconClick(item,isMute)} />}
      </Tooltip>
      <Tooltip placement="left" title={t("RemoveMembers")}>
        <DeleteOutlined style={{ marginLeft: "12px" }} onClick={warning} />
      </Tooltip>
    </div>
  );

  const GetActions = useMemo(() => {
    if (role === GroupRole.Owner) {
      if (item.roleLevel !== GroupRole.Owner) {
        return <ActionIcons />;
      }
    } else if (role === GroupRole.Admin) {
      if (item.roleLevel !== GroupRole.Owner && item.roleLevel !== GroupRole.Admin) {
        return <ActionIcons />;
      }
    }
    return null;
  }, [role, item, isMute]);

  

  const SwitchTip = useMemo(() => {
    switch (item.roleLevel) {
      case 2:
        return <div className="owner_tip">{t("GroupOwner")}</div>;
      case 3:
        return <div className="admin_tip">{t("GroupAdministrators")}</div>;
      default:
        return null;
    }
  },[item.roleLevel])

  return (
    <div ref={memberItemRef} className="group_members_list_item">
      <div style={{ display: "flex" }}>
        <LayLoad forceLoad={idx < 20} targetRef={memberItemRef} skeletonCmp={<Skeleton.Avatar active={true} size={36} shape="square" />}>
          <MyAvatar size={36} src={item.faceURL} />
        </LayLoad>
        <div className="member_info">
          <div className="title">
            <div>{item.nickname}</div>
            {SwitchTip}
          </div>
          <div className="member_status">{ParseStatus}</div>
        </div>
      </div>
      {GetActions}
    </div>
  );
};

export default MemberItem;
