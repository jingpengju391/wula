import { Layout, Modal } from "antd";
import { useRef, useState } from "react";
import HomeSider from "../components/HomeSider";
import ContactMenuList, { MenuItem } from "./ContactMenuList";
import my_friend from "@/assets/images/my_friend.png";
import my_group from "@/assets/images/my_group.png";
import new_friend from "@/assets/images/new_friend.png";
import new_group from "@/assets/images/new_group.png";
import nomal_cons from "@/assets/images/nomal_cons.png";
import label_icon from "@/assets/images/label_icon.png";
import department_icon from "@/assets/images/organizational_department.png";
import HomeHeader from "../components/HomeHeader";
import ContactContent, { ContactContentHandler } from "./ContactContent";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

const Contacts = () => {
  const { t } = useTranslation();
  const consMenuList = [
    //修改于2022年4月16日 17:37:56
    // {
    //   title: t("CommonContacts"),
    //   icon: nomal_cons,
    //   bgc: "#FEC757",
    //   idx: 0,
    //   suffix: "nc",
    // },
    {
      title: t("NewFriend"),
      icon: new_friend,
      bgc: "#428BE5",
      idx: 1,
      suffix: "nf",
    },
    {
      title: t("NewGroups"),
      icon: new_group,
      bgc: "#428BE5",
      idx: 2,
      suffix: "ng",
    },
    {
      title: t("MyFriends"),
      icon: my_friend,
      bgc: "#428BE5",
      idx: 3,
      suffix: "mf",
    },
    {
      title: t("MyGroups"),
      icon: my_group,
      bgc: "#53D39C",
      idx: 4,
      suffix: "mg",
    },
    //修改于2022年4月16日 17:38:16
    // {
    //   title: t("Label"),
    //   icon: label_icon,
    //   bgc: "#428BE5",
    //   idx: 5,
    //   suffix: "lb",
    // },
  ];

  const organizationalList = [
    {
      title: t('OrganizationalStructure'),
      icon: department_icon,
      bgc: "",
      idx: 6,
      suffix: "os",
    },
    // {
    //   title: '技术部',
    //   icon: department_icon,
    //   bgc: "",
    //   idx: 7,
    //   suffix: "js",
    // },
    // {
    //   title: '体验部',
    //   icon: department_icon,
    //   bgc: "",
    //   idx: 8,
    //   suffix: "ty",
    // },
  ]
  const [menu, setMenu] = useState(consMenuList[3]);
  const ref = useRef<ContactContentHandler>(null);

  const clickMenuItem = (item: MenuItem) => {
    setMenu(item);
  };

  const fn = () => { }

  return (
    <>
      <HomeSider searchCb={(v) => ref.current?.searchCb(v, menu.idx)}>
        <ContactMenuList curTab={menu.title} menusClick={clickMenuItem} menus={consMenuList} menu2={organizationalList} />
      </HomeSider>
      <Layout>
        {<HomeHeader title={menu.idx < 6 ? menu.title : null} isShowBt={menu.idx !== 3 && menu.idx !== 0} type="contact" />}
        <Content className="total_content">
          <ContactContent ref={ref} menu={menu} />
        </Content>
      </Layout>
    </>
  );
};

export default Contacts;
