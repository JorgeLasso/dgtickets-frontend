import React, { useEffect, useState, useContext } from "react";
import {
  Typography,
  Tag,
  Card,
  Spin,
  Empty,
  Alert,
  Select,
  Space,
  Row,
  Col,
  Button,
} from "antd";
import {
  UserOutlined,
  FilterOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { User } from "../types/user/user.types";
import useUsers from "../hooks/useUsers";
import useCities from "../hooks/useCities";
import CardList from "../components/CardList";
import { CardData } from "../types/cards/cards.types";
import Pagination from "../components/Pagination";
import { ROLES } from "../constants/Roles";
import { NotificationContext } from "../context/NotificationContext";
import UsersFormModal from "../components/UsersFormModal";

const { Title, Text } = Typography;
const { Option } = Select;

// Map of user type values to display labels
const userTypeOptions = Object.entries(ROLES).map(([key, value]) => ({
  value: value,
  label: key,
}));

const UsersPage: React.FC = () => {
  useHideMenu(false);
  const [pageSize] = useState(8);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;
  const {
    users,
    totalUsers,
    currentPage,
    isLoading: isLoadingUsers,
    error,
    fetchUsers,
    setPage,
    filterUsers,
    updateUser,
    createUser,
  } = useUsers({
    limit: pageSize,
    page: 1,
  });

  const { cities, isLoading: isLoadingCities } = useCities();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getCityName = (cityId: number) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : "Desconocida";
  };

  const getUserTypeName = (userType: string) => {
    const option = userTypeOptions.find((opt) => opt.value === userType);
    return option ? option.label : userType;
  };

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const handleUserTypeChange = (value: string) => {
    setSelectedUserType(value);
    filterUsers(value);
  };
  const handleEditUsers = (user: User) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
  };
  const handleSubmitEditUser = async (
    values: Partial<User>
  ): Promise<boolean> => {
    if (!selectedUser) return false;

    try {
      // Don't update password if it's empty (unchanged)
      const userData: Partial<Omit<User, "id">> = {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        emailValidated: values.emailValidated ?? true,
        userType: values.userType || "",
        isActive: values.isActive ?? true,
        cityId: values.cityId || 0,
      };

      // Only include password if it was provided
      if (values.password) {
        userData.password = values.password;
      }

      const success = await updateUser(selectedUser.id, userData);

      if (success) {
        openNotification(
          "success",
          "Usuario actualizado",
          `El usuario ${values.firstName} ${values.lastName} ha sido actualizado exitosamente`
        );
        setIsEditModalVisible(false);
        setSelectedUser(null);
        return true;
      } else {
        openNotification(
          "error",
          "Error al actualizar",
          "No se pudo actualizar el usuario, por favor intente nuevamente"
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      openNotification(
        "error",
        "Error al actualizar",
        "Ocurrió un error al intentar actualizar el usuario"
      );
      return false;
    }
  };

  const handleSubmitCreateUser = async (values: Partial<User>) => {
    try {
      const success = await createUser({
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        emailValidated: values.emailValidated ?? true,
        password: values.password || "",
        userType: values.userType || "",
        isActive: values.isActive ?? true,
        cityId: values.cityId || 0,
      });

      console.log("User creation success:", success);

      if (success) {
        openNotification(
          "success",
          "Usuario creado",
          `El usuario ${values.firstName} ${values.lastName} ha sido creado exitosamente`
        );
        setIsCreateModalVisible(false);
        return true;
      } else {
        openNotification(
          "error",
          "Error al crear",
          "No se pudo crear el usuario, por favor intente nuevamente"
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      openNotification(
        "error",
        "Error al crear",
        "Ocurrió un error al intentar crear el usuario"
      );
      return false;
    }
  };

  const renderUserCard = (user: User): CardData => {
    return {
      loading: false,
      title: `${user.firstName} ${user.lastName}`,
      image: undefined,
      properties: [
        {
          label: "Tipo",
          value: getUserTypeName(user.userType),
        },
        {
          label: "Email",
          value: user.email,
        },
        {
          label: "Email Validado",
          value: user.emailValidated ? (
            <Tag color="green">Validado</Tag>
          ) : (
            <Tag color="red">No Validado</Tag>
          ),
        },
        {
          label: "Ciudad",
          value: getCityName(user.cityId),
        },
        {
          label: "Estado",
          value: user.isActive ? (
            <span style={{ color: "green" }}>Activo</span>
          ) : (
            <span style={{ color: "red" }}>Inactivo</span>
          ),
        },
      ],
      actions: [
        <EditOutlined key="edit" onClick={() => handleEditUsers(user)} />,
      ],
    };
  };

  const isLoading = isLoadingUsers || isLoadingCities;

  if (isLoading && users.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando usuarios..." />
      </div>
    );
  }

  return (
    <>
      {" "}
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "20px" }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <UserOutlined /> Gestión de Usuarios
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Agregar Usuario
            </Button>
          </Col>
        </Row>
        <div style={{ marginBottom: "20px" }}>
          <Text>
            A continuación se muestra la lista de usuarios registrados en el
            sistema.
          </Text>
        </div>{" "}
        <Row gutter={16} style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Space>
              <FilterOutlined />
              <Select
                placeholder="Filtrar por tipo de usuario"
                style={{ width: 200 }}
                allowClear
                onChange={handleUserTypeChange}
                value={selectedUserType}
              >
                {userTypeOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}
        {!error && users.length > 0 ? (
          <>
            <CardList
              data={users}
              loading={isLoading}
              renderItem={renderUserCard}
            />

            <div style={{ marginTop: "20px" }}>
              <Pagination
                current={currentPage}
                total={totalUsers}
                pageSize={pageSize}
                onChange={onPageChange}
                showSizeChanger={false}
              />
              <Text
                style={{
                  display: "block",
                  marginTop: "10px",
                  textAlign: "right",
                }}
              >
                Mostrando {users.length} de {totalUsers} usuarios
                {selectedUserType && (
                  <span> del tipo {getUserTypeName(selectedUserType)}</span>
                )}
              </Text>
            </div>
          </>
        ) : !error ? (
          <Empty
            description="No hay usuarios que coincidan con los criterios de búsqueda"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : null}{" "}
      </Card>{" "}
      {/* Edit User Modal */}
      <UsersFormModal
        title="Editar Usuario"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmitEditUser}
        initialValues={selectedUser}
        isLoading={isLoading}
        cities={cities}
      />
      {/* Create User Modal */}
      <UsersFormModal
        title="Crear Usuario"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
        }}
        onSubmit={handleSubmitCreateUser}
        initialValues={null}
        isLoading={isLoading}
        cities={cities}
      />
    </>
  );
};

export default UsersPage;
