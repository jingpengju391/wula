import { Button, Image, Layout, message, Modal } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import CveList from "./CveList/CveList";
import CveFooter from "./CveFooter/CveFooter";
import CveRightBar from "./CveRightBar";
import HomeSider from "../components/HomeSider";
import HomeHeader from "../components/HomeHeader";
import { createNotification, events, getNotification, im, isSingleCve, parseMessageType, switchUpload } from "../../../utils";
import ChatContent from "./ChatContent";
import home_bg from "@/assets/images/home_bg.png";
import { customType, notOssMessageTypes } from "../../../constants/messageContentType";
import { useLatest, useReactive, useRequest } from "ahooks";
import { CbEvents } from "../../../utils/open_im_sdk";
import {
  DELETEMESSAGE,
  INSERTTOCURCVE,
  ISSETDRAFT,
  MERMSGMODAL,
  MUTILMSG,
  OPENGROUPMODAL,
  RESETCVE,
  REVOKEMSG,
  SENDFORWARDMSG,
  TOASSIGNCVE,
  UPDATEFRIENDCARD,
} from "../../../constants/events";
import { animateScroll } from "react-scroll";
import MerModal from "./components/MerModal";
import { getGroupInfo, getGroupMemberList, setGroupMemberList } from "../../../store/actions/contacts";
import {
  ConversationItem,
  FriendItem,
  GroupItem,
  GroupMemberItem,
  MergeElem,
  MergerMsgParams,
  MessageItem,
  MessageType,
  PictureElem,
  SessionType,
  WsResponse,
} from "../../../utils/open_im_sdk/types";
import { useTranslation } from "react-i18next";
import { setCurCve } from "../../../store/actions/cve";
import { isNotify, isShowProgress } from "../../../utils/im";

//添加于2022年3月27日 19:26:13
import { MinIOAddress, FileStorage, PICMESSAGETHUMOPTION, PICMESSAGETHUMOPTIONEx } from "../../../config/index"
// 添加于
import { recoverUsersGroupInfoFromDb } from '../../../api/groupManagement'
import { GroupMemberItemDb } from '../../../shared'
import { UploadRequestOption } from "rc-upload/lib/interface";
import { minioUploadType } from "../../../api/admin";
const userFilePath = "D:\\UserFiles";
// 添加结束 👆

const { Content } = Layout;

type NMsgMap = {
  oid: string;
  mid: string;
  flag: boolean;
};

const WelcomeContent = () => {
  const { t } = useTranslation();
  const createGroup = () => {
    events.emit(OPENGROUPMODAL, "create");
  };
  return (
    <div className="content_bg">
      <div className="content_bg_title">{t("CreateGroup")}</div>
      <div className="content_bg_sub">{t("CreateGroupTip")}</div>
      <img src={home_bg} alt="" />
      <Button onClick={createGroup} className="content_bg_btn" type="primary">
        {t("CreateNow")}
      </Button>
    </div>
  );
};

type ReactiveState = {
  historyMsgList: MessageItem[];
  typing: boolean;
  hasMore: boolean;
  merModal: boolean;
  merData: (MergeElem & { sender: string }) | undefined;
  searchStatus: boolean;
  searchCve: ConversationItem[];
};

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [imgGroup, setImgGroup] = useState<Array<string>>([]);
  const selectCveList = (state: RootState) => state.cve.cves;
  const cveList = useSelector(selectCveList, shallowEqual);
  const selectCveLoading = (state: RootState) => state.cve.cveInitLoading;
  const cveLoading = useSelector(selectCveLoading, shallowEqual);
  const selfID = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const curCve = useSelector((state: RootState) => state.cve.curCve, shallowEqual);
  const groupInfo = useSelector((state: RootState) => state.contacts.groupInfo, shallowEqual);
  const [msgReRenderFlag, setMsgReRenderFlag] = useState("flag");
  const dispatch = useDispatch();
  const rs = useReactive<ReactiveState>({
    historyMsgList: [],
    typing: false,
    hasMore: true,
    merModal: false,
    merData: undefined,
    searchStatus: false,
    searchCve: [],
  });
  const timer = useRef<NodeJS.Timeout | null>(null);
  const {
    loading,
    run: getMsg,
    cancel: msgCancel,
  } = useRequest(im.getHistoryMessageList, {
    manual: true,
    onSuccess: handleMsg,
    onError: (err) => message.error(t("GetChatRecordFailed")),
  });
  const { t } = useTranslation();
  let nMsgMaps: NMsgMap[] = [];

  useEffect(() => {
    getNotification();
    return () => {
      resetCve();
    };
  }, []);

  useEffect(() => {
    im.on(CbEvents.ONRECVMESSAGEREVOKED, revokeMsgHandler);
    im.on(CbEvents.ONRECVC2CREADRECEIPT, c2cMsgHandler);
    im.on(CbEvents.ONPROGRESS, onProgressHandler);
    return () => {
      im.off(CbEvents.ONRECVMESSAGEREVOKED, revokeMsgHandler);
      im.off(CbEvents.ONRECVC2CREADRECEIPT, c2cMsgHandler);
      im.off(CbEvents.ONPROGRESS, onProgressHandler);
    };
  }, []);

  useEffect(() => {
    events.on(RESETCVE, resetCve);
    events.on(DELETEMESSAGE, deleteMsg);
    events.on(REVOKEMSG, revokeMyMsgHandler);
    events.on(MERMSGMODAL, merModalHandler);
    events.on(INSERTTOCURCVE, insertMsgHandler);
    window.electron && window.electron.addIpcRendererListener("DownloadFinish", downloadFinishHandler, "downloadListener");
    window.electron && window.electron.addIpcRendererListener("DownloadUpdated", downloadUpdatedHandler, "DownloadUpdatedListener");
    return () => {
      events.off(RESETCVE, resetCve);
      events.off(DELETEMESSAGE, deleteMsg);
      events.off(REVOKEMSG, revokeMyMsgHandler);
      events.off(MERMSGMODAL, merModalHandler);
      events.off(INSERTTOCURCVE, insertMsgHandler);
      window.electron && window.electron.removeIpcRendererListener("downloadListener");
      window.electron && window.electron.removeIpcRendererListener("DownloadUpdatedListener");
    };
  }, []);

  useEffect(() => {
    events.on(SENDFORWARDMSG, sendForwardHandler);
    events.on(TOASSIGNCVE, assignHandler);
    im.on(CbEvents.ONRECVNEWMESSAGE, newMsgHandler);
    im.on(CbEvents.ONRECVGROUPREADRECEIPT, groupMsgHandler);
    return () => {
      events.off(SENDFORWARDMSG, sendForwardHandler);
      events.off(TOASSIGNCVE, assignHandler);
      im.off(CbEvents.ONRECVNEWMESSAGE, newMsgHandler);
      im.off(CbEvents.ONRECVGROUPREADRECEIPT, groupMsgHandler);
    };
  }, [curCve]);

  //  event hander

  const merModalHandler = (el: MergeElem, sender: string) => {
    rs.merData = { ...el, sender };
    rs.merModal = true;
  };

  const assignHandler = (id: string, type: SessionType) => {
    getOneCve(id, type)
      .then((cve) => clickItem(cve))
      .catch((err) => message.error(t("GetCveFailed")));
  };

  const groupMsgHandler = (data: any) => {
    const val = JSON.parse(data.data);
    val.forEach((obj: any) => {
      if (obj.groupID === curCve?.groupID) {
        rs.historyMsgList.forEach((item) => {
          if (item.clientMsgID === obj.msgIDList[0]) {
            if (item.attachedInfoElem.groupHasReadInfo.hasReadUserIDList === null) {
              item.attachedInfoElem.groupHasReadInfo.hasReadUserIDList = [];
            }
            item.attachedInfoElem.groupHasReadInfo.hasReadCount += 1;
            item.attachedInfoElem.groupHasReadInfo.hasReadUserIDList = [...item.attachedInfoElem.groupHasReadInfo.hasReadUserIDList, obj.userID];
            setMsgReRenderFlag(uuid());
          }
        });
      }
    });
  };

  const sendForwardHandler = (options: string | MergerMsgParams, type: MessageType, list: any[]) => {
    list.map(async (s) => {
      const uid = (s as FriendItem).userID ?? "";
      const gid = (s as GroupItem).groupID ?? "";
      let data;
      if (type === MessageType.MERGERMESSAGE) {
        data = await im.createMergerMessage(options as MergerMsgParams);
      } else {
        data = await im.createForwardMessage(options as string);
      }
      sendMsg(data.data, type, undefined, uid, gid);
      events.emit(MUTILMSG, false);
    });
  };

  const insertMsgHandler = (message: MessageItem) => {
    rs.historyMsgList = [message, ...rs.historyMsgList];
  };

  //  im hander
  const newMsgHandler = (data: WsResponse) => {
    const newServerMsg: MessageItem = JSON.parse(data.data);
    if (newServerMsg.contentType !== MessageType.TYPINGMESSAGE && newServerMsg.sendID !== selfID) {
      createNotification(newServerMsg, (id, sessionType) => {
        assignHandler(id, sessionType);
        window.electron ? window.electron.focusHomePage() : window.focus();
      });
    }
    if (!isEmptyCve) {
      if (inCurCve(newServerMsg)) {
        if (newServerMsg.contentType === MessageType.TYPINGMESSAGE) {
          typingUpdate();
        } else {
          if (newServerMsg.contentType === MessageType.REVOKEMESSAGE) {
            rs.historyMsgList = [newServerMsg, ...rs.historyMsgList.filter((ms) => ms.clientMsgID !== newServerMsg.content)];
          } else {
            rs.historyMsgList = [newServerMsg, ...rs.historyMsgList];
          }
          markCveHasRead(curCve, 1);
        }
      }
    }
  };

  const revokeMsgHandler = (data: WsResponse) => {
    const idx = rs.historyMsgList.findIndex((m) => m.clientMsgID === data.data);
    if (idx > -1) {
      rs.historyMsgList.splice(idx, 1);
    }
  };

  const c2cMsgHandler = (data: WsResponse) => {
    JSON.parse(data.data).map((cr: any) => {
      cr.msgIDList.map((crt: string) => {
        rs.historyMsgList.find((hism) => {
          if (hism.clientMsgID === crt) {
            hism.isRead = true;
          }
        });
      });
    });
    setMsgReRenderFlag(uuid());
  };

  const onProgressHandler = (data: WsResponse) => {
    const parseData = JSON.parse(data.data);
    console.log(parseData);
    const idx = rs.historyMsgList.findIndex((his) => his.clientMsgID === parseData.clientMsgID);
    if (idx !== -1 && isShowProgress(rs.historyMsgList[idx].contentType)) {
      rs.historyMsgList[idx].progress = parseData.progress;
      setMsgReRenderFlag(uuid());
    }
  };

  //  ipc hander
  const downloadFinishHandler = (ev: any, state: "completed" | "cancelled" | "interrupted", msgID: string, path: string) => {
    switch (state) {
      case "completed":
        const IMFileMap = JSON.parse(localStorage.getItem("IMFileMap") ?? "{}");
        IMFileMap[msgID] = {
          path,
          status: state,
        };
        localStorage.setItem("IMFileMap", JSON.stringify(IMFileMap));
        message.success("下载成功！");
        break;
      case "cancelled":
        message.warn("下载已取消！");
        break;
      case "interrupted":
        message.error("下载失败！");
        break;
      default:
        break;
    }
  };

  const downloadUpdatedHandler = (ev: any, state: "", progress: number, msgID: string) => {
    const idx = rs.historyMsgList.findIndex((his) => his.clientMsgID === msgID);
    if (idx !== -1 && isShowProgress(rs.historyMsgList[idx].contentType)) {
      rs.historyMsgList[idx].downloadProgress = progress;
      setMsgReRenderFlag(uuid());
    }
  };

  const inCurCve = (newServerMsg: MessageItem): boolean => {
    const isCurSingle = newServerMsg.sendID === curCve?.userID || (newServerMsg.sendID === selfID && newServerMsg.recvID === curCve?.userID);
    return newServerMsg.sessionType === SessionType.Single ? isCurSingle : newServerMsg.groupID === curCve?.groupID;
  };

  const resetCve = () => {
    dispatch(setCurCve({} as ConversationItem));
  };

  const deleteMsg = (mid: string, isCid?: boolean, isNotify = true) => {
    if (isCid) {
      rs.historyMsgList = [];
    } else {
      const idx = rs.historyMsgList.findIndex((h) => h.clientMsgID === mid);
      let tmpList = [...rs.historyMsgList];
      tmpList.splice(idx, 1);
      rs.historyMsgList = tmpList;
    }
    isNotify && message.success(t("DeleteMessageSuc"));
  };

  const revokeMyMsgHandler = (mid: string) => {
    const idx = rs.historyMsgList.findIndex((h) => h.clientMsgID === mid);
    rs.historyMsgList[idx].contentType = MessageType.REVOKEMESSAGE;
  };

  const typingUpdate = () => {
    rs.typing = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      rs.typing = false;
    }, 1000);
  };

  const clickItem = useCallback(
    (cve: ConversationItem) => {
      if (cve.conversationID === curCve?.conversationID) return;

      if (!isEmptyCve) {
        events.emit(ISSETDRAFT, curCve);
      }
      rs.historyMsgList = [];
      dispatch(setCurCve(cve));
      rs.hasMore = true;
      getInfo(cve);
      msgCancel();
      setImgGroup([]);
      getHistoryMsg(cve.userID, cve.groupID, undefined, cve.conversationType === SessionType.Notification ? cve.conversationID : undefined);
      markCveHasRead(cve);
    },
    [curCve.conversationID]
  );

  const getInfo = async (cve: ConversationItem) => {
    if (!isSingleCve(cve)) {
      dispatch(getGroupInfo(cve.groupID));
      const { data } = await recoverUsersGroupInfoFromDb(cve.groupID)
      const options = {
        groupID: cve.groupID,
        offset: 0,
        filter: 0,
        count: 2000,
        newGroupMemberList: data
      };
      dispatch(getGroupMemberList(options));
    }
  };

  const markCveHasRead = (cve: ConversationItem, type?: number) => {
    if (cve.unreadCount === 0 && !type) return;
    if (isSingleCve(cve)) {
      isNotify(cve.conversationType) ? markNotiHasRead(cve.conversationID) : markC2CHasRead(cve.userID, []);
    } else {
      im.markGroupMessageHasRead(cve.groupID);
    }
  };

  const getOneCve = (sourceID: string, sessionType: number): Promise<ConversationItem> => {
    return new Promise((resolve, reject) => {
      im.getOneConversation({ sourceID, sessionType })
        .then((res) => resolve(JSON.parse(res.data)))
        .catch((err) => reject(err));
    });
  };

  const markC2CHasRead = (userID: string, msgIDList: string[]) => {
    im.markC2CMessageAsRead({ userID, msgIDList });
  };

  const markNotiHasRead = (cid: string) => {
    im.markMessageAsReadByConID({ conversationID: cid, msgIDList: [] });
  };

  const getHistoryMsg = (uid?: string, gid?: string, sMsg?: MessageItem, cveID?: string) => {
    console.log("getMsg:::");

    const config = {
      userID: uid ?? "",
      groupID: gid ?? "",
      count: 20,
      startClientMsgID: sMsg?.clientMsgID ?? "",
      conversationID: cveID ?? "",
    };
    getMsg(config);
  };

  function handleMsg(res: WsResponse) {
    if (JSON.parse(res.data).length === 0) {
      rs.hasMore = false;
      return;
    }
    if (JSON.stringify(rs.historyMsgList[rs.historyMsgList.length - 1]) == JSON.stringify(JSON.parse(res.data).reverse()[0])) {
      rs.historyMsgList.pop();
    }
    rs.historyMsgList = [...rs.historyMsgList, ...JSON.parse(res.data).reverse()];
    rs.hasMore = !(JSON.parse(res.data).length < 20);
    console.log(rs.historyMsgList);
  }

  const imgClick = useCallback(
    (el: PictureElem) => {
        //修改于2022年3月27日 19:25:17
      let bigPicUrl = el.bigPicture.url;
      let sourcePicUrl = el.sourcePicture.url;
      if (bigPicUrl.indexOf(MinIOAddress) > -1) {
        bigPicUrl = bigPicUrl.replace("?", "&").replace(MinIOAddress, FileStorage);
      }
      if (sourcePicUrl.indexOf(MinIOAddress) > -1) {
        sourcePicUrl = sourcePicUrl.replace("?", "&").replace(MinIOAddress, FileStorage);
      }
      // const url = el.bigPicture.url !== "" ? el.bigPicture.url : el.sourcePicture.url;
      const url = bigPicUrl !== "" ? bigPicUrl : sourcePicUrl;
      // const url = el.bigPicture.url !== "" ? el.bigPicture.url : el.sourcePicture.url;
      // let tmpArr = [...imgGroup];
      // const idx = tmpArr.findIndex((t) => t === url);
      // if (idx > -1) tmpArr.splice(idx, 1);

      let tmpArr = [];
      tmpArr.push(url);
      setImgGroup(tmpArr);
      setVisible(true);
    },
    [imgGroup]
  );

  const uuid = () => {
    return (Math.random() * 36).toString(36).slice(2) + new Date().getTime().toString();
  };

  const scrollToBottom = (duration?: number) => {
    animateScroll.scrollTo(0, {
      duration: duration ?? 350,
      smooth: true,
      containerId: "scr_container",
    });
  };

  const sendMsg = useCallback(
    async (nMsg: string, type: MessageType,uploadData?: UploadRequestOption,  uid?: string, gid?: string) => {
      // if(type === MessageType.FILEMESSAGE){
      //   const dataStr = {
      //     customType: customType.InsertLoading,
      //     data: {
      //       type,
      //       status: 1,
      //     },
      //   };
      //   const options = {
      //     data: JSON.stringify(dataStr),
      //     extension: "",
      //     description: "",
      //   };

      //   const { data: cusMessage } = await im.createCustomMessage(options);
      //   if ( uid ){
      //     await im.insertSingleMessageToLocalStorage({ message: cusMessage, recvID: uid, sendID: selfID });
      //   }else {
      //     await im.insertGroupMessageToLocalStorage({ message: cusMessage, groupID: gid!, sendID: selfID });
      //   }
      // }

      const operationID = uuid();
      let parsedMsg:any
      if ((uid && curCve?.userID === uid) || (gid && curCve?.groupID === gid) || (!uid && !gid)) {
        parsedMsg = JSON.parse(nMsg);
        const tMsgMap = {
          oid: operationID,
          mid: parsedMsg.clientMsgID,
          flag: false,
        };
        nMsgMaps = [...nMsgMaps, tMsgMap];
        if (!isShowProgress(parsedMsg.contentType)) parsedMsg.status = 2;
        rs.historyMsgList = [parsedMsg, ...rs.historyMsgList];
        //修改于 2022年4月7日 9:06:08
        if(uploadData){
          try {
            const result = await switchUpload(uploadData, parsedMsg.contentType === 102 ? minioUploadType.picture : minioUploadType.file)
            const url = FileStorage + (result.data as any).newName;
            switch (parsedMsg.contentType) {
              case 102:
                const exString = url.indexOf('?') > -1 ? PICMESSAGETHUMOPTIONEx : PICMESSAGETHUMOPTION
                parsedMsg.pictureElem.sourcePicture.url = url
                parsedMsg.pictureElem.snapshotPicture.url = url + exString
                parsedMsg.pictureElem.bigPicture.url = url
                parsedMsg.content = JSON.stringify(parsedMsg.pictureElem)
                break;
              case 104:
                parsedMsg.videoElem.videoUrl = url
                parsedMsg.videoElem.videoPath = ''
                parsedMsg.content = JSON.stringify(parsedMsg.videoElem)
                break;
              case 105:
                parsedMsg.fileElem.filePath = url
                parsedMsg.fileElem.sourceUrl = url
                parsedMsg.content = JSON.stringify(parsedMsg.fileElem)
                break;
            }
          } catch (err) {
            message.error(t("UploadFailed"))
          }
        }
        setTimeout(() => {
          const item = nMsgMaps.find((n) => n.mid === parsedMsg.clientMsgID);
          if (item && !item.flag) {
            rs.historyMsgList.find((h) => {
              if (h.clientMsgID === item.mid) {
                h.status = 1;
                setMsgReRenderFlag(uuid());
                return h;
              }
            });
          }
        }, 2000);
        scrollToBottom();
      }
      const offlinePushInfo = {
        title: "你有一条新消息",
        desc: "",
        ex: "",
        iOSPushSound: "+1",
        iOSBadgeCount: true,
      };
      const sendOption = {
        recvID: uid ?? curCve!.userID,
        groupID: gid ?? curCve!.groupID,
        offlinePushInfo,
        message: parsedMsg ? JSON.stringify(parsedMsg) : nMsg,
      };
      nMsgMaps = nMsgMaps.filter((f) => !f.flag);
      if (notOssMessageTypes.includes(type) && !window.electron) {
        im.sendMessageNotOss(sendOption, operationID)
          .then((res) => sendMsgCB(res, type))
          .catch((err) => sendMsgCB(err, type, true));
      } else {
        im.sendMessage(sendOption, operationID)
          .then((res) => sendMsgCB(res, type))
          .catch((err) => sendMsgCB(err, type, true));
      }
    },
    [rs.historyMsgList,nMsgMaps]
  );

  const sendMsgCB = (res: WsResponse, type: MessageType, err?: boolean) => {
    console.log(res,55555)
    const parseData = JSON.parse(res.data);
    nMsgMaps.map((tn) => {
      if (tn.oid === res.operationID) {
        const idx = rs.historyMsgList.findIndex((his) => his.clientMsgID === tn?.mid);
        if (idx !== -1) {
          tn.flag = true;
          err ? (rs.historyMsgList[idx].status = 3) : (rs.historyMsgList[idx] = parseData);
          setMsgReRenderFlag(uuid());
        }
      }
    });
    if (type === MessageType.MERGERMESSAGE) message.success(t("ForwardSuccessTip"));
  };

  const closeMer = () => {
    rs.merModal = false;
  };

  const siderSearch = useCallback(
    (value: string) => {
      if (value) {
        rs.searchStatus = true;
        rs.searchCve = cveList.filter((c) => c.conversationID.indexOf(value) > -1 || c.showName.indexOf(value) > -1);
      } else {
        rs.searchCve = [];
        rs.searchStatus = false;
      }
    },
    [cveList]
  );

  const isEmptyCve = useMemo(() => JSON.stringify(curCve) === "{}", [curCve.conversationID]);

  const isNomalCve = useMemo(() => !isEmptyCve && !isNotify(curCve!.conversationType), [curCve.conversationID]);

  return (
    <>
      <HomeSider searchCb={siderSearch}>
        <CveList curCve={curCve} loading={cveLoading} cveList={rs.searchStatus ? rs.searchCve : cveList} clickItem={clickItem} />
      </HomeSider>
      <Layout>
        {!isEmptyCve && <HomeHeader ginfo={groupInfo} typing={rs.typing} curCve={curCve} type="chat" />}

        <Content id="chat_main" className={`total_content`}>
          {!isEmptyCve ? (
            <ChatContent
              loadMore={getHistoryMsg}
              loading={loading}
              msgList={isNotify(curCve!.conversationType) ? [...rs.historyMsgList].reverse() : rs.historyMsgList}
              imgClick={imgClick}
              hasMore={rs.hasMore}
              flag={msgReRenderFlag}
              curCve={curCve}
              sendMsg={sendMsg}
            />
          ) : (
            <WelcomeContent />
          )}
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              preview={{
                visible,
                onVisibleChange: (vis) => setVisible(vis),
                current: imgGroup.length - 1,
              }}
            >
              {imgGroup.map((img) => (
                <Image key={img} src={img} />
              ))}
            </Image.PreviewGroup>
          </div>
          {rs.merModal && <MerModal visible={rs.merModal} close={closeMer} curCve={curCve!} imgClick={imgClick} info={rs.merData!} />}
        </Content>
        {isNomalCve && <CveFooter curCve={curCve} sendMsg={sendMsg} />}
      </Layout>
      {isNomalCve && <CveRightBar curCve={curCve} />}
    </>
  );
};

export default Home;
