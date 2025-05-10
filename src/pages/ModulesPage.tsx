import React, { useContext, useState } from "react";
import { Typography, Empty, Spin, Tooltip, Button } from "antd";
import CardList from "../components/CardList";
import { Module } from "../types/modules/modules.types";
import useHideMenu from "../hooks/useHideMenu";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { NotificationContext } from "../context/NotificationContext";
import useModules from "../hooks/useModules";
import useUsers from "../hooks/useUsers";
import useHeadquarters from "../hooks/useHeadquarters";
import AdviserModuleModal from "../components/AdviserModuleModal";
import AddModuleModal from "../components/AddModuleModal";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../constants/Roles";

const { Title, Text } = Typography;

const ModulesPage: React.FC = () => {
  useHideMenu(false);
  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("AuthContext must be used within AuthProvider");
  const { auth } = authContext;

  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;
  const headquarterContext = useContext(HeadquarterContext);
  if (!headquarterContext)
    throw new Error(
      "HeadquarterContext must be used within HeadquarterProvider"
    );
  const { selectedHeadquarter } = headquarterContext;
  const canEdit = auth.role
    ? [ROLES.ADVISER, ROLES.ADMIN].includes(auth.role)
    : false;
  const {
    modules,
    isLoading,
    updateModuleActiveStatus,
    updateModuleAdviser,
    createModule,
  } = useModules(selectedHeadquarter || 0);
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { getHeadquarterById } = useHeadquarters();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleModuleAction = (module: Module) => {
    setSelectedModule(module);
    setSelectedUserId(module.userId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedModule(null);
    setSelectedUserId(null);
  };

  const handleOk = async () => {
    if (!selectedModule) return;

    const success = await updateModuleAdviser(
      selectedModule.id,
      selectedUserId
    );

    if (success) {
      openNotification(
        "success",
        selectedUserId ? "Módulo asignado" : "Módulo desasignado",
        selectedUserId
          ? `Se ha asignado un asesor al módulo ${selectedModule.name}`
          : `Se ha removido la asignación del módulo ${selectedModule.name}`
      );
      setIsModalVisible(false);
      setSelectedModule(null);
      setSelectedUserId(null);
    } else {
      openNotification(
        "error",
        "Error en la operación",
        `No se pudo ${
          selectedUserId ? "asignar" : "remover la asignación del"
        } módulo ${selectedModule.name}`
      );
    }
  };
  const toggleModuleActiveStatus = async (module: Module) => {
    const success = await updateModuleActiveStatus(module.id, !module.isActive);

    if (success) {
      openNotification(
        "success",
        module.isActive ? "Módulo desactivado" : "Módulo activado",
        `El módulo ${module.name} ha sido ${
          module.isActive ? "desactivado" : "activado"
        } exitosamente`
      );
    } else {
      openNotification(
        "error",
        "Error en la operación",
        `No se pudo ${module.isActive ? "desactivar" : "activar"} el módulo ${
          module.name
        }`
      );
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalVisible(false);
  };

  const handleAddModule = async (name: string) => {
    if (!selectedHeadquarter) {
      openNotification(
        "error",
        "Error al crear el módulo",
        "Debe seleccionar una sede para crear un módulo"
      );
      return false;
    }

    const success = await createModule(name);

    if (success) {
      openNotification(
        "success",
        "Módulo creado",
        `El módulo ${name} ha sido creado exitosamente`
      );
      setIsAddModalVisible(false);
      return true;
    } else {
      openNotification(
        "error",
        "Error al crear el módulo",
        "No se pudo crear el módulo, por favor intente nuevamente"
      );
      return false;
    }
  };
  const renderModuleCard = (module: Module) => {
    return {
      loading: isLoading,
      title: module.name,
      image: undefined,
      properties: [
        {
          label: "Estado",
          value: module.isActive ? (
            <span style={{ color: "green" }}>Activo</span>
          ) : (
            <span style={{ color: "red" }}>Inactivo</span>
          ),
        },
        {
          label: "Asesor",
          value: module.user
            ? `${module.user.firstName} ${module.user.lastName}`
            : "Sin asesor asignado",
        },
      ],
      actions: canEdit
        ? [
            <Tooltip key="edit-tooltip" title="Gestionar asignación de asesor">
              <UserOutlined
                key="edit"
                onClick={() => handleModuleAction(module)}
              />
            </Tooltip>,
            module.isActive ? (
              <Tooltip key="deactivate-tooltip" title="Desactivar módulo">
                <CheckCircleOutlined
                  key="active"
                  style={{ color: "green" }}
                  onClick={() => toggleModuleActiveStatus(module)}
                />
              </Tooltip>
            ) : (
              <Tooltip key="activate-tooltip" title="Activar módulo">
                <CloseCircleOutlined
                  key="inactive"
                  style={{ color: "red" }}
                  onClick={() => toggleModuleActiveStatus(module)}
                />
              </Tooltip>
            ),
          ]
        : [],
    };
  };

  if (isLoading && modules.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando módulos..." />
      </div>
    );
  }
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Módulos de la Sede
        </Title>
      </div>
      {canEdit && selectedHeadquarter && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddModal}
          style={{ marginBottom: "20px" }}
        >
          Crear Módulo
        </Button>
      )}
      {modules.length === 0 && !isLoading ? (
        <Empty description="No hay módulos disponibles para esta sede" />
      ) : (
        <>
          <CardList
            data={modules}
            loading={isLoading}
            renderItem={renderModuleCard}
          />
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Text>
              Mostrando {modules.length} módulos para la sede seleccionada
            </Text>
          </div>
        </>
      )}{" "}
      <AdviserModuleModal
        isVisible={isModalVisible}
        selectedModule={selectedModule}
        selectedUserId={selectedUserId}
        selectedHeadquarter={selectedHeadquarter}
        users={users}
        isLoadingUsers={isLoadingUsers}
        onOk={handleOk}
        onCancel={handleCancel}
        onUserChange={(userId) => setSelectedUserId(userId)}
        updateModuleAdviser={updateModuleAdviser}
        showNotification={openNotification}
        getHeadquarterById={getHeadquarterById}
      />{" "}
      <AddModuleModal
        isVisible={isAddModalVisible}
        onCancel={handleCloseAddModal}
        onSubmit={handleAddModule}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ModulesPage;
