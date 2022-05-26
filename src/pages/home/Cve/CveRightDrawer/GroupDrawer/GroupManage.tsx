import {
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Input, message, Modal, Row } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import MyAvatar from "../../../../../components/MyAvatar";
import { im } from "../../../../../utils";
import { GroupMemberItem } from "../../../../../utils/open_im_sdk/types";
// 添加于
import { updatedGroupManagementToDb, recoverUserGroupInfoFromDb } from '../../../../../api/groupManagement'
import {  useDispatch } from "react-redux";
import store from '../../../../../store'
import { setGroupMemberList } from "../../../../../store/actions/contacts";
type GroupManageProps = {
  adminList: GroupMemberItem[];
  groupMembers:GroupMemberItem[];
  gid:string;
};

const GroupManage: FC<GroupManageProps> = ({ adminList,groupMembers,gid }) => {
  const dispatch = useDispatch();
  const { user } = store.getState()
  const [modalInfo, setModalInfo] = useState({
    type:0,
    visible:false
  });

  const { t } = useTranslation();

  const transfer = (newOwnerUserID:string) => {
      im.transferGroupOwner({groupID:gid,newOwnerUserID}).then(res=>{
          message.success(t("TransferSuc"))
          setModalInfo({
            visible:false,
            type:0
          })
      }).catch(err=>message.error(t("TransferFailed")))
  }

  const updatedGroupManagement = async (member:GroupMemberItem) => {
    try{
      await updatedGroupManagementToDb({
        groupid: member.groupID,
        target: member.userID,
        source: user.selfInfo.userID,
        action: modalInfo.type === 1 ? '1' : '0'
      })
      const {
        data: {
          rolelevel
        }
      } = await recoverUserGroupInfoFromDb({
        groupid: member.groupID,
        target: member.userID
      })
      const memberFind = groupMembers.find(m => m.userID === member.userID)
      memberFind!.roleLevel = rolelevel
      dispatch(setGroupMemberList(groupMembers.map(m => {
        return {
          ...m,
          roleLevel: m.userID === member.userID ? rolelevel : m.roleLevel
        }
      })))
      const msg = modalInfo.type === 1 ? 
      '添加' + t("GroupAdministrators") : 
      '删除' + t("GroupAdministrators")
      message.success(msg + '成功')
    } catch(err:any){
      message.success(err.errMsg)
    }
  }

  const warning = (item:GroupMemberItem) => {
    const title = !modalInfo.type ? 
    t("TransferGroup"): 
    modalInfo.type === 1 ? 
    '添加' + t("GroupAdministrators") : 
    '删除' + t("GroupAdministrators")
    const content = !modalInfo.type ? 
    t("TransferTip"): 
    modalInfo.type === 1 ? 
    '确认添加' + t("GroupAdministrators") : 
    '确认删除' + t("GroupAdministrators")
    Modal.confirm({
      title,
      content: content+" "+item.nickname,
      closable:false,
      className:"warning_modal",
      onOk: ()=> modalInfo.type ? 
      updatedGroupManagement(item) :
      transfer(item.userID)
    })
  }

  return (
    <div className="group_drawer">
      <div className="group_drawer_row">
        <div
          //   onClick={() => changeType("member_list")}
          className="group_drawer_row_title"
        >
          <div>{t("GroupAdministrators")}</div>
          <div>
            <span className="num_tip">0/10</span>
            <RightOutlined />
          </div>
        </div>
        <div className="group_drawer_row_icon">
        {
            // 修改于
            groupMembers
            .filter((member:any) => member.roleLevel !== 1)
            .map((gm, idx) => {
              if (idx < 7) {
                return (
                  <MyAvatar
                    key={gm.userID}
                    shape="square"
                    size={32.8}
                    src={gm.faceURL}
                    icon={<UserOutlined />}
                  />
                );
              }
            })
          }
          {/* {adminList!.length > 0
            ? adminList!.map((gm, idx) => {
                if (idx < 7) {
                  return (
                    <MyAvatar
                      key={gm.userID}
                      shape="square"
                      size={32.8}
                      src={gm.faceURL}
                      icon={<UserOutlined />}
                    />
                  );
                }
              })
            : null} */}
          <PlusOutlined onClick={() => setModalInfo({
            visible:true,
            type:1
          })} />
          <MinusOutlined onClick={() => setModalInfo({
            visible:true,
            type:2
          })} />
        </div>
      </div>
      <div
        onClick={() => setModalInfo({
          visible:true,
          type:0
        })}
        style={{ border: "none" }}
        className="group_drawer_item"
      >
        <div>{t("TransferGroup")}</div>
        <RightOutlined />
      </div>
      <Modal
        title={!modalInfo.type ? 
          t("TransferGroup"): 
          modalInfo.type === 1 ? 
          '添加' + t("GroupAdministrators") : 
          '删除' + t("GroupAdministrators")}
        className="transfer_modal"
        visible={modalInfo.visible}
        onOk={() => {}}
        onCancel={() => setModalInfo({
          visible:false,
          type:0
        })}
      >
        <Input placeholder={t("Search")} prefix={<SearchOutlined />} />
        <Row className="gutter_row" gutter={[16, 0]}>
            {
                groupMembers
                .filter((member:any) => {
                  if(member.roleLevel === 2) return false
                  if(!modalInfo.type) return true
                  return modalInfo.type === 2 ? member.roleLevel === 3 : member.roleLevel !== 3
                })
                .map(m=>(
                    <Col key={m.userID} onClick={()=>warning(m)} span={6}>
                        <div className="member_item">
                            <MyAvatar src={m.faceURL} size={36}/>
                            <span className="member_nick">{m.nickname}</span>
                        </div>
                    </Col>
                ))
            }
          
        </Row>
      </Modal>
    </div>
  );
};

export default GroupManage;
