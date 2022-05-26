import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal } from 'antd'
import { t } from 'i18next'
import React from 'react'
 const AddSendObjectModal = (props: any) => {

 const handleOk = () => {
   message.success('点击成功')
  props.props.closeModal(false)
 }

 const searchUser = (text: string) => {
  // rs.searchText = text;
  // if (text) {
  //   let arr = rs.friendList.filter((f) => f.userID.indexOf(text) > -1 || f.userID.indexOf(text) > -1);
  //   rs.searchList = [...arr];
  // } else {
  //   rs.searchList = [];
  // }
};

  return (
    <Modal
    width="60%"
    className="group_modal"
    title={'添加接收成员'}
    visible={props.props.modalVisible}
    onCancel={() => props.props.closeModal(false)}
    footer={null}
    centered>
      <div>
        <div className="group_info_item">
          <div className="select_box">
            <div className="select_box_left">
              <Input onChange={(e) => searchUser(e.target.value)} placeholder={t("SearchFriendGroup")} prefix={<SearchOutlined />} />
              {/* {rs.memberList && rs.memberList.length > 0 ? (
                rs.memberList.map((m) => <LeftSelectItem key={m.userID} item={m} />)
              ) : rs.searchList.length > 0 ? (
                //@ts-ignore
                rs.searchList.map((s) => <LeftSelectItem key={s.uid ?? s.userId ?? s.groupID} item={s} />)
              ) : rs.searchText !== "" ? (
                <Empty description={t("SearchEmpty")} />
              ) : type ? (
                <LeftSelect />
              ) : (
                <LeftMenu />
              )} */}
            </div>
            <div className="select_box_right">
              {/* <div className="select_box_right_title">{`${t("Selected")}：${rs.selectedList.length+t("People")}`}</div>
              {rs.selectedList.map((s) => (
                <RightSelectItem key={(s as SelectFriendItem).userID || (s as SelectMemberItem).userID || (s as SelectGroupItem).groupID} item={s} />
              ))} */}
            </div>
          </div>
        </div>
        <div className="group_info_footer">
          <Button onClick={() => props.props.closeModal(false)} >{t("Cancel")}</Button>
          <Button onClick={handleOk} type="primary">
            {t("Confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  )
}


export default AddSendObjectModal