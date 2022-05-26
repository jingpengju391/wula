import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Drawer, Empty, message, Tag } from "antd";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { createTag, deleteTag, getAllTags, updateTag } from "../../../api/tag";
import MyAvatar from "../../../components/MyAvatar";
import StructureSelectModal from "../components/StructureSelectModal";
import tag_icon from "@/assets/images/label_icon.png";

type TagType = {
  tagID: string;
  tagName: string;
  userList: { userID: string; userName: string }[];
};

type PreUpdateStatus = { state: boolean; list: string[]; tag: TagType };

const LabelList = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkedList, setCheckedList] = useState<any[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [tagName, setTagName] = useState("");
  const [preUpdateStatus, setPreUpdateStatus] = useState<PreUpdateStatus>({ state: false, list: [], tag: {} as TagType });

  useEffect(() => {
    getTags();
  }, []);

  const getTags = () => {
    getAllTags().then((res) => {
      setTags(res.data.tags);
    }).catch(err=>message.error("获取标签失败，请稍后再试！"));
  };

  const closeDrawer = () => {
    setTagName("");
    setCheckedList([]);
    setPreUpdateStatus({ state: false, list: [], tag: {} as TagType });
    setDrawerVisible(false);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectConfirm = (data: any[]) => {
    setCheckedList(data);
    closeModal();
  };

  const closeTag = (id: string) => {
    const tmpArr = [...checkedList];
    const idx = tmpArr.findIndex((c) => c.uuid === id);
    tmpArr.splice(idx, 1);
    setCheckedList(tmpArr);
  };

  const drawerConfirm = () => {
    if (!tagName) {
      message.info("请先完成信息填写！");
      return;
    }
    const userIDList: string[] = [];
    checkedList.forEach((c) => userIDList.push(c.uuid));
    if (preUpdateStatus.state) {
      const increaseUserIDList: string[] = [];
      const reduceUserIDList: string[] = [];
      userIDList.forEach((u) => {
        if (!preUpdateStatus.list.includes(u)) {
          increaseUserIDList.push(u);
        }
      });
      preUpdateStatus.list.forEach((p) => {
        if (!userIDList.includes(p)) {
          reduceUserIDList.push(p);
        }
      });
      updateTag(preUpdateStatus.tag.tagID, increaseUserIDList, reduceUserIDList, tagName)
        .then((res) => {
          message.success("修改成功！");
          getTags();
          closeDrawer();
        })
        .catch((err) => message.error("操作失败，请稍后再试！"));
    } else {
      createTag(tagName, userIDList)
        .then((res) => {
          message.success("创建成功！");
          getTags();
          closeDrawer();
        })
        .catch((err) => message.error("操作失败，请稍后再试！"));
    }
  };

  const deleTag = (id: string) => {
    deleteTag(id).then((res) => {
      message.success("删除成功！");
      getTags();
    });
  };

  const modal2Create = () => {
    setPreUpdateStatus({ state: false, list: [], tag: {} as TagType });
    setDrawerVisible(true);
  };

  const modal2Update = (tag: TagType) => {
    const tmpArr: any[] = [...(tag.userList ?? [])];
    const preList: string[] = [];
    tmpArr.forEach((t) => {
      t.userId = t.userID;
      t.name = t.userName;
      t.uuid = t.userID;
      t.showName = t.userName;
      preList.push(t.userID);
    });
    setPreUpdateStatus({ state: true, list: preList, tag });
    setTagName(tag.tagName);
    setCheckedList(tmpArr);
    setDrawerVisible(true);
  };

  const TagItem = ({ tag }: { tag: TagType }) => (
    <div className="group_item">
      <MyAvatar src={tag_icon} size={36} />
      <div className="group_item_info">
        <div className="group_item_title">{tag.tagName}</div>
        <div className="group_item_sub">{(tag.userList ?? []).map((t) => t.userName + " ")}</div>
      </div>
      <div className="label_action">
        <EditOutlined onClick={() => modal2Update(tag)} />
        <CloseOutlined onClick={() => deleTag(tag.tagID)} />
      </div>
    </div>
  );

  return (
    <div className="label_list">
      {tags.length > 0 ? (
        <div className="group_bg">
          {tags.map((item) => (
            <TagItem tag={item} key={item.tagID} />
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoData")} />
      )}
      <span className="create_label" onClick={modal2Create}>
        {t("CreateLabel")}
      </span>
      <Drawer
        className="right_set_drawer togetherSendDrawer"
        width={360}
        // mask={false}
        maskClosable
        title={t("CreateLabel")}
        placement="right"
        onClose={closeDrawer}
        visible={drawerVisible}
      >
        <div className="createDrawerContent">
          <span className="title">{t("LabelName")}</span>
          <input onChange={(e) => setTagName(e.target.value)} value={tagName} type="text" placeholder={t("PleaseEnterTheLabelName")} />
          <span className="title">{t("LabelMember")}</span>
          <div className="addPeople" onClick={showModal}>
            {checkedList.length > 0 ? (
              checkedList.map((checked) => (
                <Tag closable onClose={() => closeTag(checked.uuid)} key={checked.uuid}>
                  {checked.showName}
                </Tag>
              ))
            ) : (
              <span className="tip">{t("ClickAddMemberToLabel")}</span>
            )}
          </div>
          <span onClick={drawerConfirm} className="btn">
            {t("Confirm")}
          </span>
        </div>
      </Drawer>
      {modalVisible && <StructureSelectModal showTag={false} showGroup={true} preList={checkedList} visible={modalVisible} confirm={selectConfirm} close={closeModal} />}
    </div>
  );
};

export default LabelList;
