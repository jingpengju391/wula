import { SearchOutlined } from "@ant-design/icons";
import { Empty, Input, TabPaneProps, Tabs, Typography, Image as AntdImage, Dropdown, Menu } from "antd";
import { t } from "i18next";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { debounce } from "throttle-debounce";
import MyAvatar from "../../../../components/MyAvatar";
import { bytesToSize, downloadFileUtil, events, formatDate, im, switchFileIcon, s_to_hs } from "../../../../utils";
import { ConversationItem, SessionType } from "../../../../utils/open_im_sdk/types";
import styles from "../../../../components/SearchBar/index.module.less";
import file_zip from "../../../../assets/images/file_zip.png";
import { SHOWPLAYERMODAL } from "../../../../constants/events";
import { isFileDownloaded } from "../../../../utils/im";

const { Paragraph, Text } = Typography;

type MessageContentPorps = {
  senderNickname: string;
  createTime: number;
  senderFaceUrl: string;
  content: string;
};

type PicContentProps = {
  url: string;
};

type VideoContentProps = {
  videoUrl: string;
  snapshotUrl: string;
  duration: string;
};

type FileContentProps = {
  name: string;
  size: string;
  senderNickname: string;
  time: string;
  type: string;
  filePath: string;
  msgID: string;
};

export const SearchMessageDrawer = ({ curCve }: { curCve: ConversationItem }) => {
  const [activeKey, setActiveKey] = useState("101");
  const { t } = useTranslation();
  const [messageContent, setMessageContent] = useState<MessageContentPorps[]>([]);
  const [picContent, setPicContent] = useState<PicContentProps[]>([]);
  const [videoContent, setVideoContent] = useState<VideoContentProps[]>([]);
  const [fileContent, setFileContent] = useState<FileContentProps[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const ink: HTMLDivElement | null = window.document.querySelector(".ant-tabs-ink-bar");
      if (ink) ink.style.transform = "translateX(3px)";
    });
  }, []);

  const tabChange = (key: string) => {
    setActiveKey(key);
    if (key === "101") return;
    searchMessage("", Number(key));
  };

  const searchMessage = (key: string, type?: number) => {
    if (key === "" && !type) return;
    const options = {
      sourceID: curCve.conversationType === SessionType.Single ? curCve.userID : curCve.groupID,
      sessionType: curCve.conversationType,
      keywordList: type ? [] : [key],
      keywordListMatchType: 0,
      senderUserIDList: [],
      messageTypeList: type ? [type] : [],
      searchTimePosition: 0,
      searchTimePeriod: 0,
      pageIndex: 1,
      count: 200,
    };
    im.searchLocalMessages(options).then((res) => {
      console.log(JSON.parse(res.data));
      const searchInfo = JSON.parse(res.data);
      const haveData = searchInfo.searchResultItems[0].messageList;
      switch (type) {
        case 102:
          if (!haveData) {
            setPicContent([]);
            return false;
          }
          const picData = haveData.map((item: any) => {
            return {
              url: item.pictureElem.snapshotPicture.url,
            };
          });
          setPicContent(picData);
          break;
        case 104:
          if (!haveData) {
            setVideoContent([]);
            return false;
          }
          const videoData = haveData.map((item: any) => {
            return {
              videoUrl: item.videoElem.videoUrl,
              snapshotUrl: item.videoElem.snapshotUrl,
              duration: s_to_hs(item.videoElem.duration),
            };
          });
          setVideoContent(videoData);
          break;
        case 105:
          if (!haveData) {
            setFileContent([]);
            return false;
          }
          const fileData = haveData.map((item: any) => {
            const filesuffix = item.fileElem.fileName.split(".");
            const type = switchFileIcon(filesuffix[filesuffix.length - 1]);
            return {
              name: item.fileElem.fileName,
              size: bytesToSize(item.fileElem.fileSize),
              senderNickname: item.senderNickname,
              time: formatDate(item.createTime)[3] + " " + formatDate(item.createTime)[4],
              type,
              filePath: item.fileElem.filePath,
              msgID: item.clientMsgID,
            };
          });
          setFileContent(fileData);
          break;
        default:
          if (!haveData) {
            setMessageContent([]);
            return false;
          }
          const messageData = haveData.map((item: any) => {
            return {
              senderNickname: item.senderNickname,
              createTime: formatDate(item.createTime)[3] + " " + formatDate(item.createTime)[4],
              senderFaceUrl: item.senderFaceUrl,
              content: item.content,
            };
          });
          setMessageContent(messageData);
          break;
      }
    });
  };

  const debounceSearch = debounce(1000, searchMessage);

  return (
    <div className="search_message">
      <Tabs activeKey={activeKey} defaultActiveKey="101" onChange={tabChange}>
        <MyTabpane debounceSearch={debounceSearch} tab="消息" key="101">
          <TextMessageList messageContent={messageContent} />
        </MyTabpane>
        <MyTabpane debounceSearch={debounceSearch} tab="图片" key="102">
          <PicMessageList picContent={picContent} />
        </MyTabpane>
        <MyTabpane debounceSearch={debounceSearch} tab="视频" key="104">
          <VideoMessageList videoContent={videoContent} />
        </MyTabpane>
        <MyTabpane debounceSearch={debounceSearch} tab="文件" key="105">
          <FileMessageList fileContent={fileContent} />
        </MyTabpane>
      </Tabs>
    </div>
  );
};

interface MyTabpaneProps extends TabPaneProps {
  debounceSearch: (key: string, type?: number) => void;
}

const MyTabpane: FC<MyTabpaneProps> = (props) => {
  const { t } = useTranslation();

  const inputOnChange = (key: React.ChangeEvent<HTMLInputElement>) => props.debounceSearch(key.target.value);

  return (
    <Tabs.TabPane {...props}>
      <div className="message_search_input">
        <Input onChange={inputOnChange} placeholder={t("Search")} disabled={props.tabKey !== "101" ? true : false} prefix={<SearchOutlined />} />
      </div>
      {props.children}
    </Tabs.TabPane>
  );
};

const TextMessageList = ({ messageContent }: any) => {
  const { t } = useTranslation();

  return (
    <div className="text_message_list">
      {messageContent.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
      ) : (
        <ul className="content_list">
          {messageContent.map((item: MessageContentPorps, index: number) => {
            return (
              <li key={index}>
                <MyAvatar size={38} />
                <div className="info">
                  <div className="title">
                    <Text style={{ maxWidth: "150px" }} ellipsis={{ tooltip: item.senderNickname }}>
                      {item.senderNickname}
                    </Text>
                    {/* <span>{item.senderNickname}</span> */}
                    <span>{item.createTime}</span>
                  </div>
                  <div className="content">
                    <span>
                      <Paragraph copyable={{ text: item.content }}>
                        <Text style={{ width: "220px" }} ellipsis={{ tooltip: item.content }}>
                          {item.content}
                        </Text>
                      </Paragraph>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const preservation = () => {
  console.log("保存");
};

const faceMenu = () => (
  <Menu className={styles.btn_menu}>
    <Menu.Item key="1" onClick={() => preservation()}>
      {t("AddMsg")}
    </Menu.Item>
  </Menu>
);

const PicMessageList = ({ picContent }: any) => {
  return (
    <div className="pic_message_list">
      {picContent.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
      ) : (
        <>
          <div className="week">
            {/* <span>本周</span> */}
            <div className="content">
              {picContent.map((item: PicContentProps, index: number) => {
                return (
                  <div className="item" key={index}>
                    <Dropdown overlay={faceMenu} trigger={["contextMenu"]} placement="bottom">
                      <AntdImage
                        // preview={false}
                        style={{ borderRadius: "5px" }}
                        height={80}
                        width={80}
                        src={item.url}
                        onContextMenu={() => {}}
                      />
                    </Dropdown>
                  </div>
                );
              })}
            </div>
          </div>
          {/* <div className="month">
          <span>本月</span>
          <div className="content">
            {
              new Array(16).fill(null).map((item, index) => {
                return <div className="item" key={index}>
                  <Dropdown
                  overlay={faceMenu}
                  trigger={['contextMenu']}
                  placement='bottom'
                  >
                    <AntdImage
                    // preview={false}
                    style={{borderRadius: '5px'}}
                    height={80}
                    width={80}
                    src={'https://scpic1.chinaz.net/Files/pic/pic9/202203/apic39782_s.jpg'}
                    onContextMenu={() => {}}
                    />
                  </Dropdown>
                </div>
              })
            }
          </div>
        </div> */}
        </>
      )}
    </div>
  );
};

const VideoMessageList = ({ videoContent }: any) => {
  const playVideo = (videoUrl: string) => {
    events.emit(SHOWPLAYERMODAL, videoUrl);
  };
  return (
    <div className="video_message_list">
      {videoContent.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
      ) : (
        <>
          <div className="week">
            {/* <span>本周</span> */}
            <div className="content">
              {videoContent.map((item: VideoContentProps, index: number) => {
                return (
                  <div className="item" key={index}>
                    <AntdImage preview={false} style={{ borderRadius: "5px" }} height={80} width={80} src={item.snapshotUrl} onClick={() => playVideo(item.videoUrl)} />
                    <div className="title">
                      <span></span>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* <div className="month">
          <span>本月</span>
          <div className="content">
            {
              new Array(16).fill(null).map((item, index) => {
                return <div className="item" key={index}>
                  <AntdImage
                  preview={false}
                  style={{borderRadius: '5px'}}
                  height={80}
                  width={80}
                  src={'https://scpic1.chinaz.net/Files/pic/pic9/202203/apic39782_s.jpg'}
                  onContextMenu={() => {}}
                  />
                  <div className="title">
                    <span></span>
                    <span>5:20</span>
                  </div>
                </div>
              })
            }
          </div>
        </div> */}
        </>
      )}
    </div>
  );
};

const downloadFile = (path: string, name: string, msgID: string) => {
  downloadFileUtil(path, name, msgID);
};

const FileMessageList = ({ fileContent }: any) => {
  return (
    <div className="file_message_list">
      {fileContent.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
      ) : (
        <ul className="content_list">
          {fileContent.map((item: FileContentProps, index: number) => {
            return (
              <li key={index}>
                <div className="box">
                  <img src={item.type} alt="" style={{ width: "38px", height: "44px" }} />
                  <div className="info">
                    <div className="title">
                      <Text style={{ maxWidth: "200px" }} ellipsis={{ tooltip: item.name }}>
                        {item.name}
                      </Text>
                    </div>
                    <div className="content">
                      <span>{item.size}&nbsp;&nbsp;</span>
                      <Text style={{ maxWidth: "100px" }} ellipsis={{ tooltip: item.senderNickname }}>
                        {item.senderNickname}
                      </Text>
                      <span>&nbsp;&nbsp;{item.time}</span>
                    </div>
                  </div>
                </div>
                {!isFileDownloaded(item.msgID) && <span className="download" onClick={() => downloadFile(item.filePath, item.name, item.msgID)}></span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
