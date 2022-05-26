import { RightOutlined, SearchOutlined, UserOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { Input, Switch, Button, Typography, message, Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import MyAvatar from "../../../../../components/MyAvatar";
import { RESETCVE, OPENGROUPMODAL } from "../../../../../constants/events";
import { events, im } from "../../../../../utils";
import { ConversationItem, GroupItem, GroupMemberItem, GroupRole, GroupStatus, OptType } from "../../../../../utils/open_im_sdk/types";
import { DrawerType } from "../CveRightDrawer";
import group_icon from "@/assets/images/group_icon.png";
// 群昵称修改 start
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { updatedGroupManagementNickNameToDb } from "../../../../../api/groupManagement";
import { RootState } from "../../../../../store";
import { setGroupMemberList } from "../../../../../store/actions/contacts";
// 群昵称修改 over
const { Paragraph } = Typography;

type GroupDrawerProps = {
  curCve: ConversationItem;
  role: GroupRole;
  groupMembers: GroupMemberItem[];
  groupInfo: GroupItem;
  changeType: (tp: DrawerType) => void;
  updatePin: (e: boolean) => void;
  updateOpt: (e: boolean, isMute?: boolean) => void;
};

const GroupDrawer: FC<GroupDrawerProps> = ({ curCve, role, groupMembers, groupInfo, changeType, updatePin, updateOpt }) => {
  const { t } = useTranslation();
  const toManage = () => {
    if (role === GroupRole.Owner) {
      changeType("group_manage");
    }
  };

  const quitGroup = () => {
    im.quitGroup(curCve.groupID)
      .then((res) => {
        events.emit(RESETCVE);
        message.success(t("QuitGroupSuc"));
      })
      .catch((err) => message.error(t("QuitGroupFailed")));
  };

  const dissolveGroup = () => {
    im.dismissGroup(curCve.groupID)
      .then((res) => message.success(t("DismissGroupSuc")))
      .catch((err) => message.error(t("DismissGroupFailed")));
  };

  const dissolveWarning = () => {
    Modal.confirm({
      title: t("DissolveGroup"),
      content: t("DissolveGroupWarning"),
      onOk: dissolveGroup,
    });
  };

  const updateMuteGroup = () => {
    im.changeGroupMute({ groupID: curCve.groupID, isMute: groupInfo.status !== GroupStatus.Muted });
  };

  const inviteToGroup = () => {
    events.emit(OPENGROUPMODAL, "invite", groupMembers, curCve.groupID);
  };

  const delInGroup = () => {
    events.emit(OPENGROUPMODAL, "remove", groupMembers, curCve.groupID);
  };
  // 群昵称修改 start
  const dispatch = useDispatch();
  const selfInfo = useSelector((state: RootState) => state.user.selfInfo, shallowEqual);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const updatedGroupManagementNickName = async (nickname:string) => {
    try { 
      await updatedGroupManagementNickNameToDb({
        groupid: curCve.groupID,
        userid: selfInfo.userID,
        nickname,
      })

      const findMember = groupMemberList.find(m => m.userID === selfInfo.userID)!
      findMember.nickname = nickname
      dispatch(setGroupMemberList(groupMemberList));
      
    } catch(error:any) {
      message.error(error)
    }
  }
  
  // 群昵称修改 over

  return (
    <div className="group_drawer">
      <div className="group_drawer_item">
        <div className="group_drawer_item_left">
          <MyAvatar size={36} shape="square" src={curCve.faceURL === "" ? group_icon : curCve.faceURL} />
          <div className="group_drawer_item_info">
            <div className="group_drawer_item_title">{curCve.showName}</div>
            {role !== GroupRole.Nomal ? (
              <div onClick={() => changeType("edit_group_info")} className="group_drawer_item_sub">
                {t("UpdateGroupInfo")}
              </div>
            ) : null}
          </div>
        </div>
        <RightOutlined />
      </div>
      <div className="group_drawer_row">
        <div onClick={() => changeType("member_list")} className="group_drawer_row_title">
          <div>{t("GroupMembers")}</div>
          <div>
            <span className="num_tip">{groupMembers.length}</span>
            <RightOutlined />
          </div>
        </div>
        <div className="group_drawer_row_input">
          <Input placeholder={t("Search")} prefix={<SearchOutlined />} />
        </div>
        <div className="group_drawer_row_icon">
          {groupMembers!.length > 0
            ? groupMembers!.map((gm, idx) => {
                if (idx < (role !== GroupRole.Nomal ? 7 : 6)) {
                  return <MyAvatar key={gm.userID} size={32.8} src={gm.faceURL} />;
                }
              })
            : null}
          <PlusOutlined onClick={inviteToGroup} />
          {role !== GroupRole.Nomal && <MinusOutlined onClick={delInGroup} />}
        </div>
      </div>
      {
        role === GroupRole.Owner ? 
        <div onClick={toManage} className="group_drawer_item">
          <div>群管理</div>
          <RightOutlined />
        </div> : null
      }
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>{t("NickInGruop")}</div>
        <Paragraph
          editable={{
            tooltip: t("ClickEdit"),
            maxLength: 15,
            onChange: nickname => updatedGroupManagementNickName(nickname),
          }}
        >
          {groupMemberList.find(m => m.userID === selfInfo.userID)!.nickname}
        </Paragraph>
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>{t("Group")}ID</div>
        <Paragraph copyable ellipsis>
          {curCve.groupID}
        </Paragraph>
        {/* <div className="group_id"></div> */}
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>{t("Pin")}</div>
        <Switch checked={curCve.isPinned} size="small" onChange={updatePin} />
      </div>
      {role === GroupRole.Owner && (
        <div className="group_drawer_item group_drawer_item_nbtm">
          <div>{t("MuteAll")}</div>
          <Switch checked={groupInfo.status === GroupStatus.Muted} size="small" onChange={updateMuteGroup} />
        </div>
      )}
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>{t("NotDisturb")}</div>
        <Switch checked={curCve.recvMsgOpt === OptType.WithoutNotify} size="small" onChange={(e) => updateOpt(e)} />
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>{t("BlockThisGroup")}</div>
        <Switch checked={curCve.recvMsgOpt === OptType.Mute} size="small" onChange={(e) => updateOpt(e, true)} />
      </div>
      <div className="group_drawer_btns">
        {role !== GroupRole.Owner && (
          <Button onClick={quitGroup} danger className="group_drawer_btns_item">
            {t("QuitGroup")}
          </Button>
        )}
        {role === GroupRole.Owner ? (
          <Button onClick={dissolveWarning} type="primary" danger className="group_drawer_btns_item">
            {t("DissolveGroup")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default GroupDrawer;
