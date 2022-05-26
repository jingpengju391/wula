import { Button, Modal } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import StructureBox from "./StructureBox";

type StructureSelectModalProps = {
  visible: boolean;
  showGroup: boolean;
  showTag: boolean;
  preList: any[];
  confirm: (selected: any[]) => void;
  close: () => void;
};

const StructureSelectModal: FC<StructureSelectModalProps> = ({ visible, preList,showGroup,showTag, close, confirm }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<any[]>([]);

  const selectChange = (data: any[]) => {
    setSelected(data);
  };

  return (
    <Modal width="60%" className="orz_modal" title={"选择"} visible={visible} onCancel={close} footer={null} centered>
      <StructureBox preList={preList} showGroup={showGroup} showTag={showTag} onChanged={selectChange} />
      <div className="orz_footer">
        <Button onClick={close}>{t("Cancel")}</Button>
        <Button onClick={() => confirm(selected)} type="primary">
          {t("Confirm")}
        </Button>
      </div>
    </Modal>
  );
};

export default StructureSelectModal;
