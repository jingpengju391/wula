import { Button, Input, message, Modal, Upload } from "antd";
import { FC, useMemo } from "react";
import MyAvatar from "../../../components/MyAvatar";
import { useReactive } from "ahooks";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { events, im, switchUpload } from "../../../utils";
import { GETRTCINVITEIDS, SENDFORWARDMSG } from "../../../constants/events";
import { useTranslation } from "react-i18next";
import { Member, MessageType } from "../../../utils/open_im_sdk/types";
import { ModalType } from "../../../@types/open_im";
import StructureBox, { InviteType } from "./StructureBox";
import group_icon from "@/assets/images/group_icon.png";

import { FileStorage, MinIOAddress } from "../../../config";

export type MultipleSelectModalProps = {
  visible: boolean;
  modalType: ModalType;
  groupId?: string;
  options?: string;
  mediaType?: string;
  close: () => void;
};

type RsType = {
  groupName: string;
  groupIcon: string;
  selectedList: any[];
};

const MultipleSelectModal: FC<MultipleSelectModalProps> = ({ visible, modalType, groupId, options, mediaType, close }) => {
  const rs = useReactive<RsType>({
    groupName: "",
    groupIcon: "",
    selectedList: [],
  });
  const { t } = useTranslation();

  const uploadIcon = async (uploadData: UploadRequestOption) => {
    switchUpload(uploadData)
      .then((res:any) => {
        rs.groupIcon = filterURL(res.data);
        console.log(rs.groupIcon,'rs.groupIcon')
      })
      .catch((err) => message.error(t("UploadFailed")));
  };

   // 添加于2022年4月3日 13:35:08
   function filterURL(data: { URL: string; newName: string; }): string{
    return data.URL.indexOf(MinIOAddress) > -1 ? FileStorage + data.newName : data.URL
  }

  const modalOperation = () => {
    switch (modalType) {
      case "create":
        createGroup();
        break;
      case "invite":
        inviteToGroup();
        break;
      case "remove":
        kickFromGroup();
        break;
      case "forward":
        forwardMsg();
        break;
      case "rtc_invite":
        rtcInvite();
        break;
      default:
        break;
    }
  };

  const rtcInvite = () => {
    const tmpArr: string[] = [];
    rs.selectedList.forEach((s) => tmpArr.push(s.userID));
    events.emit(GETRTCINVITEIDS, tmpArr);
    close();
  };

  const forwardMsg = () => {
    const parseMsg = JSON.parse(options!);
    events.emit(SENDFORWARDMSG, parseMsg.contentType ? options : parseMsg, parseMsg.contentType ?? MessageType.MERGERMESSAGE, rs.selectedList);
    close();
  };

  const createGroup = () => {
    if (!rs.groupName || rs.selectedList.length == 0) {
      message.warning(t("CompleteTip"));
      return;
    }

    let memberList: Member[] = [];
    rs.selectedList.map((s) => {
      memberList.push({
        userID: s.userID,
        roleLevel: 1,
      });
    });
    const options = {
      groupBaseInfo: {
        groupType: 0,
        groupName: rs.groupName,
        introduction: "",
        notification: "",
        faceURL: rs.groupIcon,
        ex: "",
      },
      memberList,
    };

    im.createGroup(options)
      .then((res) => {
        message.success(t("GruopCreateSuc"));
        close();
      })
      .catch((err) => {
        message.error(t("GruopCreateFailed"));
        close();
      });
  };

  const inviteToGroup = () => {
    if (rs.selectedList.length === 0) {
      message.warning(t("SelectMemberTip"));
      return;
    }
    let userIDList: string[] = [];
    rs.selectedList.map((s) => userIDList.push(s.userID));
    const options = {
      groupID: groupId!,
      reason: "",
      userIDList,
    };
    im.inviteUserToGroup(options)
      .then((res) => {
        message.success(t("InviteSuc"));
        close();
      })
      .catch((err) => {
        message.error(t("InviteFailed"));
        close();
      });
  };

  const kickFromGroup = () => {
    if (rs.selectedList.length === 0) {
      message.warning(t("KickMemberTip"));
      return;
    }
    let userIDList: string[] = [];
    rs.selectedList.map((s) => userIDList.push(s.userID));
    const options = {
      groupID: groupId!,
      reason: "",
      userIDList,
    };
    im.kickGroupMember(options)
      .then((res) => {
        message.success(t("KickSuc"));
        close();
      })
      .catch((err) => {
        message.error(t("KickFailed"));
        close();
      });
  };

  const selectChange = (selectList: any[]) => {
    rs.selectedList = selectList;
  };

  const switchTitle = () => {
    switch (modalType) {
      case "create":
        return t("CreateGroup");
      case "invite":
        return t("AddMembers");
      case "remove":
        return t("RemoveMembers");
      case "forward":
        return t("ForwardedMessage");
      case "rtc_invite":
        return mediaType === "video" ? t("CallVideoTitle") : t("CallVoiceTitle");
      default:
        return "";
    }
  };

  const CreateGroupHeader = useMemo(
    () => (
      <>
        <div className="group_info_item">
          <div className="group_info_label">{t("GroupName")}</div>
          <div style={{ width: "100%" }}>
            <Input
              placeholder={t("GroupNameTip")}
              value={rs.groupName}
              onChange={(e) => {
                rs.groupName = e.target.value;
              }}
            />
          </div>
        </div>
        <div className="group_info_item">
          <div className="group_info_label">{t("GroupAvatar")}</div>
          <div>
            <MyAvatar src={rs.groupIcon === "" ? group_icon : rs.groupIcon} size={32} />
            <Upload accept="image/*" action={""} customRequest={(data) => uploadIcon(data)} showUploadList={false}>
              <span className="group_info_icon">{t("ClickUpload")}</span>
            </Upload>
          </div>
        </div>
      </>
    ),
    [rs.groupName, rs.groupIcon]
  );

  const isCreate = modalType === "create";

  const isShowGroup = modalType === "forward";

  const inGroupType = ["remove", "rtc_invite"];

  const isInvite = inGroupType.includes(modalType) ? InviteType.InGroup : modalType === "invite" ? InviteType.Group : InviteType.Nomal;

  return (
    <Modal width="60%" className="group_modal" title={switchTitle()} visible={visible} onCancel={close} footer={null} centered>
      <div>
        {isCreate && CreateGroupHeader}
        <div className="group_info_item">
          <div className="group_info_label">{t("Invite")}</div>
          <StructureBox isInvite={isInvite} showGroup={isShowGroup} showTag={true} onChanged={selectChange} />
        </div>
        {/* <SelectBox friendList={rs.friendList} memberList={!isCreate ? rs.memberList : undefined} groupList={!isCreate ? rs.groupList : undefined} onSelectedChange={selectChange} /> */}
        <div className="group_info_footer">
          <Button onClick={close}>{t("Cancel")}</Button>
          <Button onClick={modalOperation} type="primary">
            {t("Confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MultipleSelectModal;
