import { Button, Divider, message } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../../../../store";
import { CLOSERIGHTDRAWER } from "../../../../../constants/events";
import { events, im } from "../../../../../utils";
import { PublicUserItem } from "../../../../../utils/open_im_sdk/types";

export const GroupNotice = () => {
  const { t } = useTranslation();
  const groupInfo = useSelector((state: RootState) => state.contacts.groupInfo, shallowEqual);
  const selfID = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const [ownerInfo, setOwnerInfo] = useState<PublicUserItem>();
  const [isEdit, setIsEdit] = useState(false); // 是否要编辑
  const [textValue, setTextValue] = useState(groupInfo.notification); // 文本域的内容

  useEffect(() => {
    if (groupInfo) {
      im.getUsersInfo([groupInfo.ownerUserID]).then((res) => {
        setOwnerInfo(JSON.parse(res.data).length > 0 ? JSON.parse(res.data)[0].publicInfo : {});
      });
    }
  }, [groupInfo]);

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleTextValue = (value: any) => {
    setTextValue(value.target.value);
  };

  const sendNotice = () => {
    console.log(textValue);
    const options = {
      groupID: groupInfo!.groupID,
      groupInfo: {
        groupName: groupInfo!.groupName,
        introduction: groupInfo!.introduction,
        notification: textValue,
        faceURL: groupInfo!.faceURL,
      },
    };
    im.setGroupInfo(options).then((res) => {
      message.success(t("ReleaseSuccess"));
      events.emit(CLOSERIGHTDRAWER);
    });
  };

  return (
    <div className="group_notice">
      {isEdit ? (
        <>
          <textarea autoFocus className="text" value={textValue} id="" placeholder={t("PleaseInputNotice")} onChange={handleTextValue}></textarea>
          <div className="btnBox">
            {textValue === "" ? (
              <Button style={{ backgroundColor: "#999999", borderColor: "#999999" }} onClick={() => message.warning(t("PleaseInput"))} type="primary" className="btn">
                {t("Release")}
              </Button>
            ) : (
              <Button onClick={sendNotice} type="primary" className="btn">
                {t("Release")}
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="noti_content">{textValue}</div>

          <div className="btnBox">
            {ownerInfo?.userID === selfID ? (
              <Button onClick={handleEdit} type="primary" className="btn">
                {t("Edit")}
              </Button>
            ) : (
              <Divider>只有群主及管理员可以编辑</Divider>
            )}
          </div>
        </>
      )}
    </div>
  );
};
