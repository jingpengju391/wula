import { RightOutlined } from "@ant-design/icons";
import { Button, Input, message, Upload } from "antd";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual } from "react-redux";
import MyAvatar from "../../../../../components/MyAvatar";
import { RootState } from "../../../../../store";
import { im, switchUpload } from "../../../../../utils";
import { GroupItem } from "../../../../../utils/open_im_sdk/types";
import group_icon from "@/assets/images/group_icon.png";

import { FileStorage, MinIOAddress } from "../../../../../config";
import { defaultUploadConfig } from "../../../config";

type EditDrawerProps = {};

const EditDrawer: FC<EditDrawerProps> = ({}) => {
  const groupInfo = useSelector((state: RootState) => state.contacts.groupInfo, shallowEqual);
  const [gInfo, setGInfo] = useState<GroupItem>({} as GroupItem);
  const { t } = useTranslation();

  useEffect(() => {
    if (groupInfo) {
      setGInfo(groupInfo);
    }
  }, [groupInfo]);

  // 添加于2022年4月3日 13:35:08
  function filterURL(data: { URL: string; newName: string; }): string{
    return data.URL.indexOf(MinIOAddress) > -1 ? FileStorage + data.newName : data.URL
  }

  const uploadIcon = async (uploadData: UploadRequestOption) => {
    switchUpload(uploadData)
      .then((res) => {
        // 修改于2022年4月3日 13:44:08
        groupInfo.faceURL = filterURL(res.data as { URL: string; newName: string; })
        changeGroupInfo(filterURL(res.data as { URL: string; newName: string; }), "faceURL");
      })
      .catch((err) => message.error(t("UploadFailed")));
  };

  const changeGroupInfo = (val: string, tp: keyof GroupItem) => {
    switch (tp) {
      case "groupName":
        setGInfo({ ...gInfo!, groupName: val });
        break;
      case "faceURL":
        setGInfo({ ...gInfo!, faceURL: val });
        break;
      case "introduction":
        setGInfo({ ...gInfo!, introduction: val });
        break;
      default:
        break;
    }
  };

  const updateGroupInfo = () => {
    const options = {
      groupID: gInfo!.groupID,
      groupInfo: {
        groupName: gInfo!.groupName,
        introduction: gInfo!.introduction,
        notification: gInfo!.notification,
        faceURL: gInfo!.faceURL,
      },
    };
    im.setGroupInfo(options)
      .then((res) => {
        message.success(t("ModifySuc"));
        // setType("set");
      })
      .catch((err) => message.error(t("ModifyFailed")));
  };
  const uploadConfig = defaultUploadConfig()
  return (
    <div>
      <div className="group_drawer_item">
        <div>{t("GroupAvatar")}</div>
        <div className="group_drawer_item_right">
          <Upload {...uploadConfig} customRequest={(data) => uploadIcon(data)}>
            <MyAvatar size={36} src={gInfo?.faceURL === "" ? group_icon : gInfo?.faceURL} />
          </Upload>
          <RightOutlined />
        </div>
      </div>
      <div className="group_drawer_row">
        <div className="group_drawer_row_title">
          <div>{t("GroupName")}</div>
        </div>
        <div style={{ marginBottom: 0 }} className="group_drawer_row_input">
          <Input key="group_name" value={gInfo?.groupName} onChange={(e) => changeGroupInfo(e.target.value, "groupName")} placeholder="请输入群名称" />
        </div>
      </div>
      <div style={{ border: "none" }} className="group_drawer_row">
        <div className="group_drawer_row_title">
          <div>{t("GroupDesc")}</div>
        </div>
        <div style={{ marginBottom: 0 }} className="group_drawer_row_input">
          <Input.TextArea
            key="group_introduction"
            value={gInfo?.introduction}
            onChange={(e) => changeGroupInfo(e.target.value, "introduction")}
            showCount
            autoSize={{ minRows: 4, maxRows: 6 }}
            placeholder={t("GroupDescTip")}
          />
        </div>
      </div>
      <Button onClick={updateGroupInfo} type="primary" className="single_drawer_btn">
        {t("Save")}
      </Button>
    </div>
  );
};

export default EditDrawer;
