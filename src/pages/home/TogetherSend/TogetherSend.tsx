import { useEffect, useMemo, useState } from "react";
import { t } from "i18next";
import TogetherSendDrawer from "./TogetherSendDrawer";
import { massList } from "../../../api/tag";
import { formatDate } from "../../../utils";

const TogetherSend = () => {
  const [visible, setVisible] = useState(false);
  const [mList, setMList] = useState<any[]>([]);

  useEffect(() => {
    getMasslist();
  }, []);

  const getMasslist = () => {
    massList(1, 2000)
      .then((res) => {
        setMList(res.data.logs);
      })
      .catch((err) => console.log(err));
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  const parseLatestTime = (ltime: number): string => {
    const sendArr = formatDate(ltime);
    const dayArr = formatDate(ltime + 86400000);
    const curArr = formatDate(new Date().getTime());
    if (sendArr[3] === curArr[3]) {
      return sendArr[4] as string;
    } else if (dayArr[3] === curArr[3]) {
      return t("Yesterday");
    } else {
      return sendArr[3] as string;
    }
  };

  const switchContent = (data: string) => {
    try {
      const parseData = JSON.parse(JSON.parse(data).data).data;
      return parseData.text;
    } catch (error) {
      return data;
    }
  };

  return (
    <div className="togetherSend">
      {mList.length > 0 ? (
        <ul className="message">
          {mList.map((item, index) => {
            return (
              <li key={index}>
                <div className="title">
                  <div className="text_box">
                    {t("SendTo")}&nbsp;
                    <span>{item.userList ? item.userList[0].userName : ""}</span>
                    &nbsp;{t("Etc")}
                    {item.userList?item.userList.length:0}
                    {t("People")}
                    {/* <span>标签1</span>
                    &nbsp;的两个标签 */}
                  </div>
                </div>
                <div className="content">{switchContent(item.content)}</div>
                <div className="footer">
                  <div className="time">
                    <span>{parseLatestTime(item.sendTime * 1000)}</span>
                  </div>
                  <div className="operation">
                    {/* <span className="delete"></span> */}
                    {/* <span className="details" onClick={() => showDrawer("details")}></span> */}
                    <span className="againSend" onClick={() => showDrawer()}>
                      {t("AgainSend")}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="null">
          <span></span>
          <span>{t("NoData")}</span>
        </div>
      )}
      <div className="createBtn" onClick={() => showDrawer()}></div>
      <TogetherSendDrawer visible={visible} closeDrawer={closeDrawer} getMasslist={getMasslist} />
    </div>
  );
};

export default TogetherSend;
