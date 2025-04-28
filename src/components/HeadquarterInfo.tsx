import React, { useContext, useState } from "react";
import { Alert, Button, Modal, Typography } from "antd";
import { HeadquarterContext } from "../context/HeadquarterContext";
import HeadquarterSelector from "./HeadquarterSelector";

const { Text } = Typography;

const HeadquarterInfo: React.FC = () => {
  const { selectedHeadquarter, headquarters } = useContext(HeadquarterContext)!;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentHeadquarter = headquarters.find(
    (hq) => hq.id === selectedHeadquarter
  );

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFinish = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Alert
        message={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong>Sede actual: </Text>
              {currentHeadquarter ? (
                <Text>{currentHeadquarter.name}</Text>
              ) : (
                <Text type="warning">No has seleccionado una sede</Text>
              )}
            </div>
            <Button type="link" onClick={showModal} style={{ padding: 0 }}>
              {selectedHeadquarter ? "Cambiar sede" : "Seleccionar sede"}
            </Button>
          </div>
        }
        type={currentHeadquarter ? "info" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Modal
        title="Seleccionar Sede"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <HeadquarterSelector onFinish={handleFinish} />
      </Modal>
    </>
  );
};

export default HeadquarterInfo;
