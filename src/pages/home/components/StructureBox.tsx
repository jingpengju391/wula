import { CloseOutlined, LoadingOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Checkbox, Input } from "antd";
import { FC, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
// import { getDeptList, getDeptUserList } from "../../../api/world_window";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useReactive } from "ahooks";
import { getAllTags } from "../../../api/tag";
import group_select from "@/assets/images/select_group.png";
import user_select from "@/assets/images/select_user.png";
import label_icon from "@/assets/images/label_icon.png";
import tag_icon from "@/assets/images/tag_icon.png";
import group_icon from "@/assets/images/group_icon.png";
import { debounce } from "throttle-debounce";
import MyAvatar from "../../../components/MyAvatar";

type StructureBoxProps = {
  preList?: any[];
  showGroup?: boolean;
  showTag?: boolean;
  isInvite?: InviteType;
  onChanged: (selected: any[]) => void;
};

export enum InviteType {
  Nomal = 0,
  Group = 1,
  InGroup = 2,
}

type Step = "menu" | "cate" | "user" | "tag" | "group" | "friend" | "in_group";

type RSType = {
  step: Step;
  depList: any[];
  tagList: any[];
  renderList: any[];
  prvRenderList: any[];
  preDisableList: string[];
  checkedList: any[];
  allCheck: boolean;
  navs: any[];
  searchFlag: boolean;
  searchText: string;
  loadingStatus: {
    id: string;
    loading: boolean;
  };
};
const StructureBox: FC<StructureBoxProps> = ({ preList = [], showGroup = false, showTag = false, isInvite = InviteType.Nomal, onChanged }) => {
  const { t } = useTranslation();
  const selfID = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const groupList = useSelector((state: RootState) => state.contacts.groupList, shallowEqual);
  const friendList = useSelector((state: RootState) => state.contacts.friendList, shallowEqual);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const rs = useReactive<RSType>({
    step: isInvite === InviteType.InGroup ? "in_group" : "menu",
    depList: [],
    tagList: [],
    renderList: [],
    prvRenderList: [],
    preDisableList: [],
    checkedList: [],
    allCheck: false,
    navs: [],
    searchFlag: false,
    searchText: "",
    loadingStatus: {
      id: "",
      loading: false,
    },
  });

  useEffect(() => {
    if (isInvite === InviteType.Group) {
      rs.preDisableList = groupMemberList.reduce<string[]>((total, val) => [...total, val.userID], []);
    }
    if (isInvite === InviteType.InGroup) {
      rs.renderList = groupMemberList.reduce<any[]>((total, val: any) => {
        val.check = false;
        val.disabled = rs.preDisableList.includes(val.userID) || val.userID === selfID;
        val.uuid = val.userID;
        val.showName = val.nickname;
        return [...total, val];
      }, []);
      console.log(rs.renderList);
    }
  }, [groupMemberList]);

  useEffect(() => {
    rs.checkedList = preList ?? [];
  }, []);

  useEffect(() => {
    onChanged(rs.checkedList);
  }, [rs.checkedList]);

  const clickMenu = async (type: string) => {
    rs.loadingStatus = {
      loading: true,
      id: type,
    };
    let allCheckFlag = true;
    switch (type) {
      // case "orz":
      //   const depRes = (await getDeptList()).data ?? [];
      //   rs.depList = depRes;
      //   rs.renderList = rs.depList;
      //   rs.step = "cate";
      //   rs.navs.push({ label: "组织架构", id: "" });
      //   break;
      case "friend":
        const tmpFArr: any[] = [...friendList];
        allCheckFlag = tmpFArr.length !== 0;
        tmpFArr.forEach((user: any) => {
          const fid = rs.checkedList.find((check) => check.uuid === user.userID);
          user.check = fid !== undefined;
          user.disabled = rs.preDisableList.includes(user.userID);
          user.uuid = user.userID;
          user.showName = user.nickname;
          if (fid === undefined && !user.disabled) allCheckFlag = false;
        });
        rs.renderList = tmpFArr;
        rs.step = "friend";
        rs.navs.push({ label: "我的好友", id: "" });
        break;
      case "tag":
        const tagRes = await getAllTags();
        const tagData = tagRes.data.tags ?? [];
        allCheckFlag = tagData.length !== 0;
        tagData.forEach((tag: any) => {
          const fid = rs.checkedList.find((check) => check.tagID === tag.tagID);
          tag.check = fid !== undefined;
          tag.disabled = false;
          tag.uuid = tag.tagID;
          tag.showName = tag.tagName;
          if (fid === undefined && !tag.disabled) allCheckFlag = false;
        });
        rs.tagList = tagData;
        rs.renderList = rs.tagList;
        rs.step = "tag";
        rs.navs.push({ label: "标签", id: "" });
        break;
      case "group":
        const tmpArr: any[] = [...groupList];
        allCheckFlag = tmpArr.length !== 0;
        tmpArr.forEach((group: any) => {
          const fid = rs.checkedList.find((check) => check.groupID === group.groupID);
          group.check = fid !== undefined;
          group.disabled = false;
          group.uuid = group.groupID;
          group.showName = group.groupName;
          if (fid === undefined && !group.disabled) allCheckFlag = false;
        });
        rs.renderList = tmpArr;
        rs.step = "group";
        rs.navs.push({ label: "我的群组", id: "" });
        break;
    }
    rs.loadingStatus = {
      loading: false,
      id: type,
    };
    rs.allCheck = allCheckFlag;
    rs.searchFlag = false;
    rs.searchText = "";
  };

  const clickCate = async (dep: any, idx: number) => {
    // if (dep.children.length === 0) {
    //   rs.loadingStatus = {
    //     id: dep.id,
    //     loading: true,
    //   };
    //   const userResult: any = await getDeptUserList(dep.id);
    //   const data = userResult.code === 200 ? userResult.data : [];
    //   let allCheckFlag = data.length !== 0;
    //   data.forEach((user: any) => {
    //     const fid = rs.checkedList.find((check) => check.uuid === user.userId);
    //     user.check = fid !== undefined;
    //     user.disabled = user.userId === selfID || rs.preDisableList.includes(user.userId);
    //     user.uuid = user.userId;
    //     user.userID = user.userId;
    //     user.showName = user.name;
    //     if (fid === undefined && !user.disabled) allCheckFlag = false;
    //   });
    //   rs.allCheck = allCheckFlag;
    //   rs.renderList = data;
    //   rs.loadingStatus = {
    //     id: dep.id,
    //     loading: false,
    //   };
    //   rs.step = "user";
    // } else {
    //   rs.renderList = rs.renderList[idx].children;
    // }
    // rs.navs.push({ label: dep.label, id: dep.id });
    // rs.searchFlag = false;
    // rs.searchText = "";
  };

  const reset = () => {
    rs.navs = [];
    rs.step = "menu";
    rs.searchFlag = false;
    rs.searchText = "";
  };

  const handleNavi = async (id: string) => {
    // if (id === "") {
    //   rs.renderList = rs.depList;
    // } else {
    //   const res = await getDeptList(id);
    //   rs.renderList = res.data ?? [];
    // }
    // const idx = rs.navs.findIndex((nav) => nav.id === id);
    // rs.navs = rs.navs.slice(0, idx + 1);
    // rs.step = "cate";
    // rs.searchFlag = false;
    // rs.searchText = "";
  };

  const renderNav = () => {
    return (
      isInvite !== InviteType.InGroup && (
        <Breadcrumb separator=">">
          <Breadcrumb.Item onClick={reset}>联系人</Breadcrumb.Item>
          {rs.navs.map((item, index) => {
            return (
              <Breadcrumb.Item key={index} onClick={() => handleNavi(item.id)}>
                {item.label}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      )
    );
  };

  const cancelSelect = (item: any) => {
    const idx = rs.checkedList.findIndex((check) => check.uuid === item.uuid);
    const tmpArr = [...rs.checkedList];
    tmpArr.splice(idx, 1);

    rs.checkedList = tmpArr;
    const ridx = rs.renderList.findIndex((render) => render.uuid === item.uuid);
    if (ridx !== -1) {
      rs.renderList[ridx].check = false;
    }
  };

  const checkClick = (val: boolean, item: any) => {
    if (val) {
      const idx = rs.renderList.findIndex((render) => render.uuid === item.uuid);
      rs.renderList[idx].check = true;
      rs.checkedList = [...rs.checkedList, item];
    } else {
      cancelSelect(item);
    }
    const fid = rs.renderList.find((render) => !render.check && render.uuid !== selfID && !render.disabled);
    rs.allCheck = fid === undefined;
  };

  const allCheck = (val: boolean) => {
    rs.renderList.forEach((render) => (render.uuid !== selfID && !render.disabled ? (render.check = val) : ""));
    if (val) {
      const tmpCheck = rs.checkedList.reduce((total, check) => [...total, check.uuid], []);
      rs.renderList.forEach((render) => {
        if (!tmpCheck.includes(render.uuid) && render.uuid !== selfID && !render.disabled) {
          rs.checkedList = [...rs.checkedList, render];
        }
      });
    } else {
      const cTmpCheck = rs.renderList.reduce((total, render) => [...total, render.uuid], []);
      rs.checkedList = rs.checkedList.filter((check) => !cTmpCheck.includes(check.uuid));
    }
    rs.allCheck = val;
  };

  const searchDep = useCallback(() => {
    if (rs.step === "menu") return;
    if (rs.searchText === "") {
      let allCheckFlag = true;
      rs.prvRenderList.forEach((user: any) => {
        const fid = rs.checkedList.find((check) => check.userId === user.userId);
        user.check = fid !== undefined;
        if (fid === undefined && !user.disabled) allCheckFlag = false;
      });
      rs.renderList = rs.prvRenderList;
      rs.searchFlag = false;
      rs.allCheck = allCheckFlag;
    } else {
      if (!rs.searchFlag) {
        rs.prvRenderList = rs.renderList;
        rs.searchFlag = true;
      }
      filterList(rs.searchText);
    }
  }, [rs.checkedList, rs.step, rs.prvRenderList, rs.searchFlag, rs.renderList]);

  const filterList = (val: string) => {
    const idkey = rs.step === "cate" ? "id" : "uuid";
    const labelkey = rs.step === "cate" ? "label" : "showName";
    rs.renderList = rs.prvRenderList.filter((render) => render[labelkey].includes(val) || render[idkey].includes(val));
  };

  const debounceSearch = debounce(500, searchDep);

  const onSearchChanged = (val: string) => {
    rs.searchText = val;
    debounceSearch();
  };

  const menuList = [
    {
      title: t("OrganizationalStructure"),
      icon: group_select,
      id: "orz",
      visible: false,
    },
    {
      title: t("MyFriends"),
      icon: user_select,
      id: "friend",
      visible: true,
    },
    {
      title: t("Tags"),
      icon: tag_icon,
      id: "tag",
      visible: showTag,
    },
    {
      title: t("MyGroups"),
      icon: group_select,
      id: "group",
      visible: showGroup,
    },
  ];

  const switchStep = () => {
    switch (rs.step) {
      case "menu":
        return menuList.map(
          (menu) =>
            menu.visible && (
              <div key={menu.id} onClick={() => clickMenu(menu.id)} className="cate_item">
                <div className="left_title">
                  <img style={{ width: "20px" }} src={menu.icon} />
                  <span>{menu.title}</span>
                </div>
                {rs.loadingStatus.loading && rs.loadingStatus.id === menu.id ? <LoadingOutlined /> : <RightOutlined />}
              </div>
            )
        );
      case "cate":
        return rs.renderList.map((render, idx) => (
          <div key={render.id} onClick={() => clickCate(render, idx)} className="dep_item">
            <span className="label">{render.label}</span>
            {rs.loadingStatus.id === render.id && rs.loadingStatus.loading ? <LoadingOutlined /> : <RightOutlined />}
          </div>
        ));
      case "user":
      case "tag":
      case "group":
      case "friend":
      case "in_group":
        return (
          <>
            {!rs.searchFlag && (
              <div className="dep_item">
                <Checkbox checked={rs.allCheck} onChange={(e) => allCheck(e.target.checked)}>
                  <span className="label">全选</span>
                </Checkbox>
              </div>
            )}

            {rs.renderList.map((render, idx) => (
              <div key={idx} className="dep_item">
                <Checkbox key={idx} disabled={render.disabled} checked={render.check} onChange={(e) => checkClick(e.target.checked, render)}>
                  <div className="wrap">
                    <MyAvatar src={switchSrc(render)} size={32} />
                    <div style={{ position: render.username ? "absolute" : "unset" }} className="dep_item_info">
                      <span className="label">{render.showName}</span>
                      <span className="label_sub">{render.username}</span>
                    </div>
                  </div>
                </Checkbox>
              </div>
            ))}
          </>
        );
    }
  };

  const switchSrc = (item: any) => {
    if (item.faceURL) {
      return item.faceURL;
    } else if (item.tagName) {
      return label_icon;
    } else if (item.groupName) {
      return group_icon;
    } else {
      return null;
    }
  };

  const switchName = (item: any) => {
    if (item.groupName || item.tagName) {
      return "";
    } else {
      return item.showName;
    }
  };

  return (
    <div className="orz_body">
      <div className="body_left">
        <Input value={rs.searchText} onChange={(e) => onSearchChanged(e.target.value)} placeholder={t("SearchFriendGroup")} prefix={<SearchOutlined />} />
        {renderNav()}
        <div>{switchStep()}</div>
      </div>
      <div className="body_right">
        <div className="selcted_desc">已选：</div>
        {rs.checkedList.map((checked) => (
          <div key={checked.uuid} className="selected_item">
            <div className="selected_info">
              <MyAvatar src={switchSrc(checked)} size={32} />
              <span className="title">{checked.showName}</span>
            </div>
            <CloseOutlined onClick={() => cancelSelect(checked)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StructureBox;
