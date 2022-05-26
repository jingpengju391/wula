import { Empty, List, message } from "antd";
import { FC, memo } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { setCveList } from "../../../../store/actions/cve";
import { diffMemo, im } from "../../../../utils";
import { ConversationItem } from "../../../../utils/open_im_sdk/types";
import CveItem from "./CveItem";
import { useLatest } from "ahooks";

type CveListProps = {
  cveList: ConversationItem[];
  clickItem: (cve: ConversationItem) => void;
  loading: boolean;
  marginTop?: number;
  curCve: ConversationItem | null;
};

const CveList: FC<CveListProps> = ({ cveList, clickItem, loading, marginTop, curCve }) => {
  const curUid = useSelector((state: RootState) => state.user.selfInfo.userID, shallowEqual);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const latestList = useLatest(cveList);

  const delCve = (cid: string) => {
    im.deleteConversationFromLocalAndSvr(cid)
      .then((res) => {
        const tarray = [...latestList.current];
        const farray = tarray.filter((c) => c.conversationID !== cid);
        dispatch(setCveList(farray));
      })
      .catch((err) => message.error(t("AccessFailed")));
  };
  return (
    <div className="cve_list">
      {cveList.length > 0 ? (
        <List
          className="cve_list_scroll"
          style={{ height: `calc(100vh - ${marginTop}px)` }}
          itemLayout="horizontal"
          dataSource={cveList}
          split={false}
          loading={loading}
          renderItem={(item,idx) => <CveItem idx={idx} curUid={curUid!} curCid={curCve?.conversationID} key={item.conversationID} onClick={clickItem} delCve={delCve} cve={item} />}
        />
      ) : (
        <Empty description={t("NoCve")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

CveList.defaultProps = {
  marginTop: 58,
};

const diffKey = ["marginTop", "cveList", "loading"];
export default memo(CveList, (p, n) => {
  const shallowFlag = diffMemo(p, n, diffKey);
  const deepFlag = (p.curCve??{}).conversationID === (n.curCve??{}).conversationID
  return shallowFlag && deepFlag ;
});
