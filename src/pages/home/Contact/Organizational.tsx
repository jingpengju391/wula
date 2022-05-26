// import { RightOutlined } from "@ant-design/icons";
// import { Breadcrumb, Empty, message, Tag } from "antd";
// import { t } from "i18next";
// import { FC, useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { getDeptList, getDeptUserList, getUserInfo } from "../../../api/world_window";
// import { Loading } from "../../../components/Loading";
// import MyAvatar from "../../../components/MyAvatar";
// import { TOASSIGNCVE } from "../../../constants/events";
// import { events } from "../../../utils";
// import { SessionType } from "../../../utils/open_im_sdk/types";

// type OrganizationalProps = {
//   selfDepartment: string;
// };

// type DepartmentListProps = {
//   children: DepartmentListProps[];
//   id: string;
//   label: string;
// };

// type NaviItemProps = {
//   id: string;
//   label: string;
// };

// type MemberListProps = {
//   userId: string;
//   name: string;
//   type: string;
//   username: string;
//   deptId: string;
// };

// const Organizational: FC<OrganizationalProps> = ({ selfDepartment }) => {
//   const [departmentList, setDepartmentList] = useState<DepartmentListProps[]>([]);
//   const [initStorage, setInitStorage] = useState<DepartmentListProps[]>([]);
//   const [memberList, setMemberList] = useState<MemberListProps[]>([]);
//   const [naviItem, setNaviItem] = useState<NaviItemProps[]>([]);
//   const [isDep, setIsDep] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getDeplist("", true);
//   }, []);

//   const getDeplist = async (id: string, isInit = false) => {
//     setLoading(true);
//     const res: any = await getDeptList(id);
//     if (res.code === 200) {
//       isInit && setInitStorage(res.data);
//       setDepartmentList(res.data);
//     } else {
//       message.error("Server error");
//     }
//     setLoading(false);
//   };

//   const getDepUserList = async (id: string) => {
//     setLoading(true);
//     const res: any = await getDeptUserList(id);
//     console.log(res);
//     if (res.code === 200) {
//       setMemberList(res.data);
//     } else {
//       message.error("Server error");
//     }
//     setLoading(false);
//   };

//   const handleNavi = async (id: string) => {
//     await getDeplist(id);
//     const naviIndex = naviItem.findIndex((item) => item.id === id);
//     const newNavi = naviItem.slice(0, naviIndex + 1);
//     setIsDep(true);
//     setNaviItem(newNavi);
//   };

//   const departmentItem = async (id: string, children: DepartmentListProps[], label: string) => {
//     if (children.length === 0) {
//       await getDepUserList(id);
//       setIsDep(false);
//     } else {
//       await getDeplist(id);
//     }
//     setNaviItem([
//       ...naviItem,
//       {
//         id,
//         label,
//       },
//     ]);
//   };

//   const goChat = (item: MemberListProps) => {
//     navigate("/");
//     setTimeout(() => {
//       events.emit(TOASSIGNCVE, item.userId, SessionType.Single);
//     }, 0);
//   };

//   const initData = () => {
//     setDepartmentList(initStorage);
//     setIsDep(true);
//     setNaviItem([]);
//   };

//   const DpChildren = () => (
//     <ul className="department">
//       {departmentList.map((item: any, index) => {
//         return (
//           <li key={index} onClick={() => departmentItem(item.id, item.children, item.label)}>
//             <div className="left_box">
//               <span className="department_logo"></span>
//               <span className="department_name">{item.label}</span>
//             </div>
//             <RightOutlined />
//           </li>
//         );
//       })}
//     </ul>
//   );

//   const DpMember = () => (
//     <ul className="organizational_memberList">
//       {memberList.map((item) => (
//         <li key={item.userId} onDoubleClick={() => goChat(item)}>
//           <MyAvatar size={38} />
//           <div className="info">
//             <div className="title">
//               <span>{item.name}</span>
//               {/* <span>创建人</span> */}
//             </div>
//             {/* <span className="status">[手机在线]</span> */}
//           </div>
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <div className="organizational_item">
//       <div className="navigation">
//         <Breadcrumb separator=">">
//           <Breadcrumb.Item onClick={() => initData()}>托云信息技术有限公司</Breadcrumb.Item>
//           {naviItem.map((item) => (
//             <Breadcrumb.Item key={item.id} onClick={() => handleNavi(item.id)}>
//               {item.label}
//             </Breadcrumb.Item>
//           ))}
//         </Breadcrumb>
//       </div>
//       <div className="organizational_item_content">
//         {loading ? <Loading /> : isDep ? <DpChildren /> : <DpMember />}
//         {((isDep && departmentList.length === 0) || (!isDep && memberList.length === 0)) && !loading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoData")} />}
//       </div>
//     </div>
//   );
// };

// export default Organizational;


function Organizational() {
  return (
    <div>Organizational</div>
  )
}

export default Organizational