// import { BellFilled, SearchOutlined } from "@ant-design/icons";
// import { Input } from "antd";
// import { t } from "i18next";
// import React, { useState } from "react";
// import { getOpenCode } from "../../../api/world_window";

// const Workbench = () => {
//   const [inputValue, setInputValue] = useState("");

//   const onChanged = (e: any) => {
//     setInputValue(e.target.value);
//   };

//   const toOA = async () => {
//     const { data } = await getOpenCode();
//     window.open("http://111.62.143.78:6888/jsp/authLogin.api?code=" + data.code, "_blank");
//   };

//   return (
//     <div className="workbench">
//       <div className="box">
//         <Input allowClear value={inputValue} onChange={onChanged} placeholder={t("Search")} prefix={<SearchOutlined />} />
//         <div className="item_box">
//           <div onClick={toOA} className="item">
//             <BellFilled style={{ backgroundColor: "#61C05D" }} />
//             <span className="title">OA</span>
//           </div>
//           {/* <div className='item'>
//             <BellFilled style={{backgroundColor: '#5496EA'}} />
//             <span className='title'>{t('Supervision')}</span>
//           </div>
//           <div className='item'>
//             <BellFilled style={{backgroundColor: '#FFC463'}} />
//             <span className='title'>{t('Notice')}</span>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Workbench;


function Workbench() {
  return (
    <div>Workbench</div>
  )
}

export default Workbench