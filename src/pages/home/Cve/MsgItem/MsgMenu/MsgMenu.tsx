import { message, Modal, Popover, Input } from "antd";
import { FC, useEffect, useState } from "react";

import ts_msg from "@/assets/images/ts_msg.png";
import re_msg from "@/assets/images/re_msg.png";
import rev_msg from "@/assets/images/rev_msg.png";
import mc_msg from "@/assets/images/mc_msg.png";
import sh_msg from "@/assets/images/sh_msg.png";
import del_msg from "@/assets/images/del_msg.png";
import cp_msg from "@/assets/images/cp_msg.png";
import download_msg from "@/assets/images/download_msg.png";
import add_msg from "@/assets/images/add_msg.png";
import { downloadFileUtil, events, im } from "../../../../../utils";
import CopyToClipboard from "react-copy-to-clipboard";
import { FORWARDANDMERMSG, MUTILMSG, REPLAYMSG, REVOKEMSG, DELETEMESSAGE } from "../../../../../constants/events";
import { useTranslation } from "react-i18next";
import { MessageItem, MessageType, GroupMemberItem } from "../../../../../utils/open_im_sdk/types";

import { isFileDownloaded } from "../../../../../utils/im";
//添加于2022年3月27日 18:34:22
import { MinIOAddress, FileStorage } from "../../../../../config/index"
import { managementRevokeMessage } from '../../../../../api/groupManagement'
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { CheckOutlined, SearchOutlined } from "@ant-design/icons";
import { Loading } from "../../../../../components/Loading";
import { AudioOutlined } from "@ant-design/icons";
//添加结束

const canCpTypes = [MessageType.TEXTMESSAGE, MessageType.ATTEXTMESSAGE];
const canDownloadTypes = [MessageType.PICTUREMESSAGE, MessageType.VIDEOMESSAGE, MessageType.FILEMESSAGE];
const canAddTypes = [MessageType.PICTUREMESSAGE, MessageType.FACEMESSAGE];

type MsgMenuProps = {
  visible: boolean;
  msg: MessageItem;
  isSelf: boolean;
  visibleChange: (v: boolean) => void;
  isAdministrators: boolean
};

const MsgMenu: FC<MsgMenuProps> = ({ visible, msg, isSelf, isAdministrators, visibleChange, children }) => {
  const { t } = useTranslation();
  // const canHiddenTypes = [t("Copy"), t("Translate"), t("Reply"), t("Forward")];
  const canHiddenTypes = [t("Copy"), t("Translate"), t("Reply")];

  const result = window.electron&&isFileDownloaded(msg.clientMsgID);

  const [muteItem,setMuteItem] = useState<GroupMemberItem>();
  const [muteAction, setMuteAction] = useState({
    seconds: 0,
    loading: false,
  });
  const [isMute, setIsMute] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const groupMembers = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);

  const forwardMsg = () => {
    events.emit(FORWARDANDMERMSG, "forward", JSON.stringify(msg));
  };

  useEffect(() => {
    const now = parseInt(Date.now() / 1000 + "");
    groupMembers.forEach(item => {
      setIsMute(item.muteEndTime > now);
    })
  }, [groupMembers]);

  const mutilMsg = () => {
    events.emit(MUTILMSG, true);
  };

  const replayMsg = () => {
    events.emit(REPLAYMSG, msg);
  };

  const revMsg = () => {
    isSelf ? 
    isSlefRevokeMessageFor() : 
    noSlefRevokeMessageFor()
  };

  async function noSlefRevokeMessageFor(){
    try {
      await managementRevokeMessage({
        sendID: msg.sendID,
        groupID: msg.groupID,
        revokeMsgClientID: msg.clientMsgID
      })
    } catch (error:any) {
      message.error(error.errMsg)
    }
  }

  function isSlefRevokeMessageFor(){
    im.revokeMessage(JSON.stringify(msg))
      .then((res) => {
        events.emit(REVOKEMSG, msg.clientMsgID);
        delLocalRecord()
      })
      .catch((err) => message.error(t("RevokeMessageFailed")))
  }

  const delLocalRecord = () => {
    im.deleteMessageFromLocalStorage(JSON.stringify(msg))
      .then((res) => {
        events.emit(DELETEMESSAGE, msg.clientMsgID);
      })
      .catch((err) => message.error(t("DeleteMessageFailed")));
  };

  const delRemoteRecord = () => {
    im.deleteMessageFromLocalAndSvr(JSON.stringify(msg))
      .then((res) => {
        events.emit(DELETEMESSAGE, msg.clientMsgID);
      })
      .catch((err) => message.error(t("DeleteMessageFailed")));
  };

  const downloadFile = () => {
    if (result) {
      window.electron.showInFinder(result);
      return;
    }
    let downloadUrl = "";
    switch (msg.contentType) {
      case MessageType.PICTUREMESSAGE:
        downloadUrl = msg.pictureElem.sourcePicture.url;
        //修改于2022年3月27日 18:35:08
        if (downloadUrl.indexOf(MinIOAddress) > -1) {
          downloadUrl = FileStorage + msg.pictureElem.sourcePicture.uuid;
        }
        break;
      case MessageType.VIDEOMESSAGE:
        downloadUrl = msg.videoElem.videoUrl;
        //修改于2022年3月27日 18:35:08
        if (downloadUrl.indexOf(MinIOAddress) > -1) {
          downloadUrl = FileStorage + msg.videoElem.videoUUID;
        }
        break;
      case MessageType.FILEMESSAGE:
        downloadUrl = msg.fileElem.sourceUrl;
        //修改于
        if (downloadUrl.indexOf(MinIOAddress) > -1) {
          downloadUrl = FileStorage + msg.fileElem.uuid;
        }
        break;
      default:
        break;
    }
    const idx = downloadUrl.lastIndexOf("/");
    const fileName = downloadUrl.slice(idx + 1);
    downloadFileUtil(downloadUrl, fileName, msg.clientMsgID);
  };

  const addMsg = () => {
    const userEmoji = JSON.parse(localStorage.getItem("userEmoji")!);
    const userId = JSON.parse(localStorage.getItem("lastimuid")!);
    const emojiObj = userEmoji.filter((item: any) => {
      return item.userID === String(userId);
    });
    const otherUserEmoji = userEmoji.filter((item: any) => {
      return item.userID !== String(userId);
    });
    // console.log(emojiObj)
    // console.log(msg)
    if (msg.contentType === MessageType.PICTUREMESSAGE) {
      emojiObj[0].emoji = [
        {
          url: msg.pictureElem.sourcePicture.url,
          width: msg.pictureElem.sourcePicture.width,
          height: msg.pictureElem.sourcePicture.height,
        },
        ...emojiObj[0].emoji,
      ];
    } else {
      emojiObj[0].emoji = [JSON.parse(msg.faceElem.data), ...emojiObj[0].emoji];
    }

    const allUserEmoji = [
      {
        userID: String(userId),
        emoji: emojiObj[0].emoji,
      },
      ...otherUserEmoji,
    ];
    localStorage.setItem("userEmoji", JSON.stringify(allUserEmoji));
    message.success(t("AddMsgSuccess"));
  };

  const setMute = async (mutedSeconds: number,item?:GroupMemberItem) => {
    const curItem = item??muteItem
    setMuteAction({
      seconds: mutedSeconds,
      loading: true,
    });
    const res = await im.changeGroupMemberMute({ groupID: curItem!.groupID, userID: curItem!.userID, mutedSeconds });
    if (res.errCode === 0) {
      message.info(mutedSeconds === 0 ? "取消禁言成功！" : "设置禁言成功！");
    }
    setMuteAction({
      seconds: mutedSeconds,
      loading: false,
    });
    setShowMuteModal(false);
  };

  const muteIconClick = () => {
    const member = groupMembers.find(m => m.userID === msg.sendID)
    if (isMute) {
      setMute(0,member);
    } else {
      setMuteItem(member)
      setShowMuteModal(true);
    }
  };
  const closeMuteModal = () => {
    setShowMuteModal(false);
  }
  const muteSelect = [
    {
      title: "10分钟",
      seconds: 600,
    },
    {
      title: "1小时",
      seconds: 3600,
    },
    {
      title: "12小时",
      seconds: 43200,
    },
    {
      title: "1天",
      seconds: 86400,
    },
    {
      title: "永久禁言",
      seconds: 86400000000000,
    },
  ];
  const SelectModal = () => (
    <Modal width={320} className="mute_modal" centered title={t("SetMute")} footer={null} visible={showMuteModal} onCancel={closeMuteModal}>
      {muteSelect.map((select) => (
        <div onClick={() => setMute(select.seconds)} key={select.seconds} className="mute_selet">
          <span>{select.title}</span>
          {muteAction.seconds === select.seconds && <CheckOutlined />}
        </div>
      ))}
      <div className="mute_input">
        <div>自定义</div>
        {/* @ts-ignore */}
        <Input type={"number"} onPressEnter={(e) => setMute(Number(e.target.value))} placeholder="秒" />
      </div>
      {muteAction.loading && (
        <div className="mute_loading_mask">
          <Loading />
        </div>
      )}
    </Modal>
  );

  const menus = [
    // {
    //   title: t("Translate"),
    //   icon: ts_msg,
    //   method: () => {},
    //   hidden: false,
    // },
    {
      title: t("AddMsg"),
      icon: add_msg,
      method: addMsg,
      hidden: false,
    },
    {
      title: t("Forward"),
      icon: sh_msg,
      method: forwardMsg,
      hidden: false,
    },
    {
      title: t("Copy"),
      icon: cp_msg,
      method: () => {},
      hidden: false,
    },
    {
      title: t("Multiple"),
      icon: mc_msg,
      method: mutilMsg,
      hidden: false,
    },
    {
      title: t("Reply"),
      icon: re_msg,
      method: replayMsg,
      hidden: false,
    },
    {
      title: t("Revoke"),
      icon: rev_msg,
      method: revMsg,
      hidden: false,
    },
    {
      title: t("SetMute"),
      icon: '',
      method: muteIconClick,
      hidden: false,
    },
    {
      title: t("Delete"),
      icon: del_msg,
      method: delRemoteRecord,
      hidden: false,
    },
    {
      title: result ? t("Check") : t("Download"),
      icon: download_msg,
      method: downloadFile,
      hidden: false,
    },
  ];

  const switchMenu = (menu: typeof menus[0]) => {
    if (!canCpTypes.includes(msg.contentType) && canHiddenTypes.includes(menu.title)) {
      menu.hidden = true;
    }

    if (menu.title === t("Download") && !canDownloadTypes.includes(msg.contentType)) {
      menu.hidden = true;
    }

    if (!isAdministrators && !isSelf && menu.title === t("Revoke")) {
      menu.hidden = true;
    }

    if (menu.title === t("AddMsg") && !canAddTypes.includes(msg.contentType)) {
      menu.hidden = true;
    }
    return menu.hidden ? null : menu.title === t("Copy") ? (
      <CopyToClipboard key={menu.title} onCopy={() => message.success("复制成功！")} text={msg.contentType === MessageType.ATTEXTMESSAGE ? msg.atElem.text : msg.content}>
        <div onClick={menu.method} className="msg_menu_iem">
          {menu.title === t("SetMute") ? <AudioOutlined /> : <img src={menu.icon} />}
          <span>{menu.title}</span>
        </div>
      </CopyToClipboard>
    ) : (
      <div key={menu.title} onClick={menu.method} className="msg_menu_iem">
        {menu.title === t("SetMute") ? <AudioOutlined /> : <img src={menu.icon} style={{width: '12px',height: '12px'}} alt= '' />}
        <span>{menu.title}</span>
      </div>
    );
  };

  const PopContent = () => {
    return <div onClick={() => visibleChange(false)}>{menus.map((m) => switchMenu(m))}</div>;
  };

  return (
    <>
      <Popover onVisibleChange={(v) => visibleChange(v)} overlayClassName="msg_item_menu" content={PopContent} title={null} trigger="contextMenu" visible={visible}>
        <div>{children}</div>
      </Popover>
      <SelectModal/>
    </>
  );
};

export default MsgMenu;
