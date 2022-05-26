import { UserOutlined } from "@ant-design/icons";
import { Divider, Empty, Skeleton } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { pySegSort } from "../../utils/common";
import { FriendItem, PublicUserItem, SessionType } from "../../utils/open_im_sdk/types";
import MyAvatar from "../MyAvatar";
import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./contact.module.less";
import { Loading } from "../Loading";

type ConSectionProps = {
  section: string;
  items: FriendItem[];
  clickItem: (item: FriendItem, type: SessionType) => void;
};

type SectionItemProps = {
  item: FriendItem;
  clickItem: (item: FriendItem, type: SessionType) => void;
};

const ConSection: FC<ConSectionProps> = ({ section, items, clickItem }) => (
  <div id={section} className={styles.cons_section}>
    <div className={styles.cons_section_title}>{section}</div>
    <div className={styles.cons_section_divider} />
    {items.map((i, idx) => (
      <SectionItemComp clickItem={clickItem} key={i.userID} item={i} />
    ))}
  </div>
);

const SectionItemComp: FC<SectionItemProps> = ({ item, clickItem }) => (
  <div onDoubleClick={() => clickItem(item, SessionType.Single)} className={styles.cons_section_item}>
    <MyAvatar shape="square" size={36} src={item.faceURL} icon={<UserOutlined />} />
    <div className={styles.cons_item_desc}>{item.remark === "" || item.remark === undefined ? item.nickname : item.remark}</div>
  </div>
);

type ContactListProps = {
  contactList: FriendItem[] | PublicUserItem[];
  hasMore?: boolean;
  length?: number;
  fetchMoreData?: () => void;
  clickItem: (item: FriendItem, type: SessionType) => void;
};

type Cons = {
  data: FriendItem[];
  initial: string;
};

const ContactList: FC<ContactListProps> = ({ contactList, hasMore,length, fetchMoreData, clickItem }) => {
  const [sections, setSections] = useState<Array<string>>([]);
  const [cons, setCons] = useState<Cons[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (contactList.length > 0) {
      const sortData: Cons[] = pySegSort(contactList);
      setSections(sortData.map((sec) => sec.initial));
      setCons(sortData);
    }
  }, [contactList]);

  const clickAuthor = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const fn = ()=>{}

  const ListView = () => (
    <>
      {cons?.map((con) => (
        <ConSection clickItem={clickItem} key={con.initial} section={con.initial} items={con.data} />
      ))}
      <div className={styles.right_index}>
        <div className={styles.right_con}>
          {sections.map((s, idx) => (
            <div onClick={() => clickAuthor(s)} key={idx} title={s} id={`con${s}`}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </>
  );
  return (
    <div id="scrollableDiv" className={styles.cons_box}>
      <InfiniteScroll
        dataLength={length??cons.length}
        next={fetchMoreData??fn}
        hasMore={hasMore??false}
        loader={<Loading height="72px" />}
        endMessage={<Divider plain/>}
        scrollableTarget="scrollableDiv"
        height="100%"
      >
        {contactList.length > 0 ? <ListView /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoData")} />}
      </InfiniteScroll>
    </div>
  );
};

export default ContactList;
