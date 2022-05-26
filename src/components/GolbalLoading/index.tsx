import { Modal, Spin } from "antd";
import { FC } from "react";

type GolbalLoadingProps = {
  visible: boolean;
  content?: JSX.Element;
};

const GolbalLoading: FC<GolbalLoadingProps> = ({ visible, content }) => (
  <Modal
    footer={null}
    visible={visible}
    closable={false}
    centered
    className="global_loading"
    maskStyle={{
      backgroundColor: "transparent",
    }}
    bodyStyle={{
      padding: 0,
      textAlign: "center",
    }}
  >
    {content ?? <Spin tip="login..." size="large" />}
  </Modal>
);

export default GolbalLoading;
