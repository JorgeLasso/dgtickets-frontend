import React, { useState, useEffect } from "react";
import { Modal, Select, Typography, Divider } from "antd";
import { Module } from "../types/modules/modules.types";
import { User } from "../types/user/user.types";
import { ROLES } from "../constants/Roles";
import { HeadquarterDetail } from "../types/headquarters/headquarter.types";

interface AdviserModuleModalProps {
  isVisible: boolean;
  selectedModule: Module | null;
  selectedUserId: number | null;
  selectedHeadquarter: number | null;
  users: User[];
  isLoadingUsers: boolean;
  onOk: () => void;
  onCancel: () => void;
  onUserChange: (userId: number | null) => void;
  updateModuleAdviser: (
    moduleId: number,
    userId: number | null
  ) => Promise<boolean>;
  showNotification: (
    type: "success" | "error",
    title: string,
    message: string
  ) => void;
  getHeadquarterById: (id: number) => Promise<HeadquarterDetail | null>;
}

const AdviserModuleModal: React.FC<AdviserModuleModalProps> = ({
  isVisible,
  selectedModule,
  selectedUserId,
  selectedHeadquarter,
  users,
  isLoadingUsers,
  onOk,
  onCancel,
  onUserChange,
  getHeadquarterById,
}) => {
  const [cityId, setCityId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHeadquarterData = async () => {
      if (selectedHeadquarter) {
        try {
          const headquarterData = await getHeadquarterById(selectedHeadquarter);
          if (headquarterData) {
            setCityId(headquarterData.cityId);
          }
        } catch (error) {
          console.error("Error fetching headquarter data:", error);
        }
      } else {
        setCityId(null);
      }
    };

    fetchHeadquarterData();
  }, [selectedHeadquarter, getHeadquarterById]);

  return (
    <Modal
      title="Asignar Asesor al Módulo"
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
    >
      {" "}
      <div style={{ marginBottom: "16px" }}>
        <Typography.Text strong>
          Módulo: {selectedModule?.name || ""}
        </Typography.Text>
      </div>
      <Divider />
      <div>
        <Typography.Text>Seleccionar Asesor:</Typography.Text>{" "}
        <Select
          placeholder="Seleccionar un asesor"
          style={{ width: "100%", marginTop: "8px" }}
          value={selectedUserId}
          onChange={(value) => onUserChange(value)}
          allowClear
          optionFilterProp="children"
          showSearch
          loading={isLoadingUsers}
        >
          {" "}
          {users
            .filter(
              (user) =>
                (user.userType === ROLES.ADVISER ||
                  user.userType === ROLES.ADMIN) &&
                user.cityId === cityId
            )
            .map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </Select.Option>
            ))}
        </Select>
      </div>
    </Modal>
  );
};

export default AdviserModuleModal;
