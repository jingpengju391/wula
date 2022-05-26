import { CheckOutlined, SearchOutlined } from "@ant-design/icons";
import { Empty, Input, message, Modal, Tooltip } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual } from "react-redux";
import { debounce } from "throttle-debounce";
import { Loading } from "../../../../../components/Loading";
import { RootState } from "../../../../../store";
import { im } from "../../../../../utils";
import { GroupMemberItem, GroupRole } from "../../../../../utils/open_im_sdk/types";
import MemberItem from "./MemberItem";

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

type MemberDrawerProps = {
  groupMembers: GroupMemberItem[];
  role: GroupRole;
};

const MemberDrawer: FC<MemberDrawerProps> = ({groupMembers,role}) => {
  const [searchStatus, setSearchStatus] = useState(false);
  const [searchList, setSearchList] = useState<GroupMemberItem[]>([]);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [muteItem,setMuteItem] = useState<GroupMemberItem>();
  const member2Status = useSelector((state: RootState) => state.contacts.member2status, shallowEqual);
  const [muteAction, setMuteAction] = useState({
    seconds: 0,
    loading: false,
  });
  const { t } = useTranslation();

  const onSearch = (e: any) => {
    if (e.key === "Enter") {
      const text = e.target.value;
      if (text !== "") {
        const tmpArr = groupMembers.filter((gm) => gm.userID.indexOf(text) > -1 || gm.nickname.indexOf(text) > -1);
        setSearchList(tmpArr);
        setSearchStatus(true);
      }
    }
  };

  const search = (text: string) => {
    const tmpArr = groupMembers.filter((gm) => gm.userID.indexOf(text) > -1 || gm.nickname.indexOf(text) > -1);
    setSearchList(tmpArr);
    setSearchStatus(true);
  };

  const debounceSearch = debounce(500, search);

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setSearchList([]);
      setSearchStatus(false);
    } else {
      debounceSearch(e.target.value);
    }
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

  const muteIconClick = (item:GroupMemberItem,isMute:boolean) => {
    if (isMute) {
      setMute(0,item);
    } else {
      setMuteItem(item)
      setShowMuteModal(true);
    }
  };

  const closeMuteModal = () => {
    setShowMuteModal(false);
  }

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

  return (
    <div className="group_members">
      <div className="group_members_search">
        <Input onKeyDown={onSearch} onChange={inputOnChange} placeholder={t("Search")} prefix={<SearchOutlined />} />
      </div>
      <div className="group_members_list">
        {searchStatus && searchList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
        ) : (
          (searchStatus ? searchList : groupMembers).map((g,idx) => <MemberItem key={g.userID} muteIconClick={muteIconClick} role={role} item={g} idx={idx} member2Status={member2Status} />)
        )}
      </div>
      <SelectModal/>
    </div>
  );
};

export default MemberDrawer;
