import { useUpdateEffect } from "ahooks";
import { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ContactList from "../../../components/ContactList";
import { APPLICATIONTYPEUPDATE, CLEARSEARCHINPUT, TOASSIGNCVE } from "../../../constants/events";
import { RootState } from "../../../store";
import { getOriginInfoList, setGroupMemberLoading } from "../../../store/actions/contacts";
import { events } from "../../../utils";
import { FriendApplicationItem, FriendItem, GroupApplicationItem, GroupItem, PublicUserItem, SessionType } from "../../../utils/open_im_sdk/types";
import { MenuItem } from "./ContactMenuList";
import GroupList from "./GroupList";
import LabelList from "./LabelList";
import NewNotice from "./NewNotice";
import Organizational from "./Organizational";

type ContactContentProps = {
  menu: MenuItem;
};

export type ContactContentHandler = {
  searchCb: (value: string, idx: number) => void;
};

const ContactContent: ForwardRefRenderFunction<ContactContentHandler, ContactContentProps> = ({ menu }, ref) => {
  const friendList = useSelector((state: RootState) => state.contacts.friendList, shallowEqual);
  const originList = useSelector((state: RootState) => state.contacts.originList, shallowEqual);
  const groupList = useSelector((state: RootState) => state.contacts.groupList, shallowEqual);
  const recvFriendApplicationList = useSelector((state: RootState) => state.contacts.recvFriendApplicationList, shallowEqual);
  const sentFriendApplicationList = useSelector((state: RootState) => state.contacts.sentFriendApplicationList, shallowEqual);
  const recvGroupApplicationList = useSelector((state: RootState) => state.contacts.recvGroupApplicationList, shallowEqual);
  const sentGroupApplicationList = useSelector((state: RootState) => state.contacts.sentGroupApplicationList, shallowEqual);

  const [renderType, setRenderType] = useState<"recv" | "sent">("recv");
  const [contacts, setContacts] = useState<FriendItem[] | GroupItem[] | FriendApplicationItem[] | GroupApplicationItem[]>([]);
  const [searchFlag, setSearchFlag] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    events.on(APPLICATIONTYPEUPDATE, applicationUpdateHandler);
    return () => {
      events.off(APPLICATIONTYPEUPDATE, applicationUpdateHandler);
    };
  }, []);

  useUpdateEffect(() => {
    if (menu.idx === 1 || menu.idx === 2) {
      setRenderType("recv");
    }
    if (searchFlag) {
      setSearchFlag(false);
      events.emit(CLEARSEARCHINPUT);
    }
  }, [menu]);

  const applicationUpdateHandler = (type: "recv" | "sent") => {
    setRenderType(type);
  };

  const clickListItem = (item: FriendItem | GroupItem, type: SessionType) => {
    if (type === SessionType.Group) {
      dispatch(setGroupMemberLoading(true));
    }
    navigate("/");
    setTimeout(() => {
      events.emit(TOASSIGNCVE, type === SessionType.Single ? (item as FriendItem).userID : (item as GroupItem).groupID, type);
    }, 0);
  };

  const searchTemplate = (value: string, fields: string[], origin: any[]) => {
    // @ts-ignore
    const filterArr = origin.filter((o) => fields.find((field) => o[field] && o[field].includes(value)));
    setContacts(filterArr);
  };

  const searchCb = (value: string, idx: number) => {
    if (value === "") {
      setSearchFlag(false);
      return;
    }
    setSearchFlag(true);
    switch (idx) {
      case 0:
        const originFields = ["nickname", "userID"];
        searchTemplate(value, originFields, originList.info);
        break;
      case 3:
        const friendFields = ["nickname", "remark", "userID"];
        searchTemplate(value, friendFields, friendList);
        break;
      case 1:
        const recvFriendApplicationFields = ["fromNickname", "fromUserID"];
        const sentFriendApplicationFields = ["toUserID", "toNickname"];
        searchTemplate(
          value,
          renderType === "recv" ? recvFriendApplicationFields : sentFriendApplicationFields,
          renderType === "recv" ? recvFriendApplicationList : sentFriendApplicationList
        );
        break;
      case 2:
        const recvGroupApplicationFields = ["groupName", "groupID", "nickname", "userID"];
        const sentGroupApplicationFields = ["groupName", "groupID"];
        searchTemplate(
          value,
          renderType === "recv" ? recvGroupApplicationFields : sentGroupApplicationFields,
          renderType === "recv" ? recvGroupApplicationList : sentGroupApplicationList
        );
        break;
      case 4:
        const groupFields = ["groupName", "groupID"];
        searchTemplate(value, groupFields, groupList);
        break;
      // case 5:
      //   const groupFields = ["groupName", "groupID"];
      //   searchTemplate(value, groupFields, groupList);
      //   break;
    }
  };

  const fetchMoreRegisters = () => {
    const totalIDs = originList.id.length;
    const nextLength = originList.current + 20;
    const nextIDs = originList.id.slice(originList.current, nextLength > totalIDs ? totalIDs : nextLength);

    dispatch(getOriginInfoList(nextIDs, originList.current + 20, [...originList.info]) as any);
  };

  useImperativeHandle(ref, () => {
    return {
      searchCb,
    };
  });

  const switchContent = () => {
    switch (menu.idx) {
      case 1:
      case 2:
        let tmpList;
        if (!searchFlag) {
          if (menu.idx === 1 && renderType === "recv") {
            tmpList = recvFriendApplicationList;
          } else if (menu.idx === 1 && renderType === "sent") {
            tmpList = sentFriendApplicationList;
          } else if (menu.idx === 2 && renderType === "recv") {
            tmpList = recvGroupApplicationList;
          } else if (menu.idx === 2 && renderType === "sent") {
            tmpList = sentGroupApplicationList;
          }
        }
        tmpList?.sort((a, b) => (a.handleResult === 0 ? -1 : 1));
        return <NewNotice type={menu.idx} renderType={renderType} renderList={searchFlag ? contacts : tmpList} />;
      case 0:
        const hasMore = originList.current < originList.id.length;
        return (
          <ContactList
            hasMore={searchFlag ? false : hasMore}
            length={originList.current}
            fetchMoreData={fetchMoreRegisters}
            clickItem={clickListItem}
            contactList={searchFlag ? (contacts as PublicUserItem[]) : originList.info}
          />
        );
      case 3:
        return <ContactList clickItem={clickListItem} contactList={searchFlag ? (contacts as FriendItem[]) : friendList} />;
      case 4:
        return <GroupList groupList={searchFlag ? (contacts as GroupItem[]) : groupList} clickItem={clickListItem} />;
      case 5:
        return <LabelList />;
      // case 6:
      // case 7:
      // case 8:
      //   return <Organizational selfDepartment={menu.title} />;
      default:
        return null;
    }
  };
  return switchContent();
};

export default forwardRef(ContactContent);
