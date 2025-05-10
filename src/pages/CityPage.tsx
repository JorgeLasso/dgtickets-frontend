import React, { useState, useContext } from "react";
import {
  Typography,
  Empty,
  Spin,
  Button,
  Pagination,
  Form,
  Input,
  Select,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import CardList from "../components/CardList";
import { City } from "../types/locations/location.types";
import useHideMenu from "../hooks/useHideMenu";
import useCities from "../hooks/useCities";
import useStates from "../hooks/useStates";
import { NotificationContext } from "../context/NotificationContext";
import GenericFormModal from "../components/GenericFormModal";
import { FormField } from "../types/forms/forms.types";

const { Title } = Typography;

const CityPage: React.FC = () => {
  useHideMenu(false);

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  // Get cities from custom hook
  const { cities, isLoading, pagination, fetchCities, createCity, updateCity } =
    useCities();

  // Get states for the dropdown
  const { states } = useStates();

  // Forms for create and edit
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // States for modal visibility
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Modal handlers
  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleOpenEditModal = (city: City) => {
    editForm.setFieldsValue({
      name: city.name,
      image: city.image,
      stateId: city.stateId,
      isActive: city.isActive,
    });
    setEditingCity(city);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingCity(null);
  };

  const handleCreateSubmit = async (values: City) => {
    const success = await createCity(values);
    if (success) {
      setIsCreateModalVisible(false);
      createForm.resetFields();
      openNotification(
        "success",
        "Ciudad creada",
        "La ciudad ha sido creada exitosamente"
      );
    }
  };

  const handleEditSubmit = async (values: City) => {
    if (!editingCity) return;

    const success = await updateCity(editingCity.id, values);
    if (success) {
      setIsEditModalVisible(false);
      setEditingCity(null);
      openNotification(
        "success",
        "Ciudad actualizada",
        "La ciudad ha sido actualizada exitosamente"
      );
    }
  };

  // Pagination handler
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchCities(page, pageSize || pagination.limit);
  };

  // Form fields for create and edit modals
  const getFormFields = (): FormField[] => {
    return [
      {
        name: "name",
        label: "Nombre",
        component: <Input placeholder="Ingrese el nombre de la ciudad" />,
        rules: [
          {
            required: true,
            message: "Por favor ingrese el nombre de la ciudad",
          },
        ],
      },
      {
        name: "image",
        label: "URL de imagen",
        component: <Input placeholder="Ingrese la URL de la imagen" />,
        rules: [
          { required: true, message: "Por favor ingrese la URL de la imagen" },
        ],
      },
      {
        name: "stateId",
        label: "Estado",
        component: (
          <Select placeholder="Seleccione un estado">
            {states.map((state) => (
              <Select.Option key={state.id} value={state.id}>
                {state.name}
              </Select.Option>
            ))}
          </Select>
        ),
        rules: [{ required: true, message: "Por favor seleccione un estado" }],
      },
      {
        name: "isActive",
        label: "Activo",
        component: <Switch />,
        valuePropName: "checked",
        tooltip: "Indica si la ciudad está activa o no",
      },
    ];
  };

  // Render city card with details
  const renderCityCard = (city: City) => {
    // Find state name
    const state = states.find((s) => s.id === city.stateId);

    return {
      loading: isLoading,
      title: city.name,
      image: city.image !== "null" ? city.image : undefined,
      properties: [
        {
          label: "Estado",
          value: state ? state.name : "No disponible",
        },
        {
          label: "Estado",
          value: city.isActive ? (
            <Tag color="green">Activo</Tag>
          ) : (
            <Tag color="red">Inactivo</Tag>
          ),
        },
      ],
      actions: [
        <Tooltip key="edit-tooltip" title="Editar">
          <EditOutlined key="edit" onClick={() => handleOpenEditModal(city)} />
        </Tooltip>,
      ],
    };
  };

  // Loading state
  if (isLoading && cities.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando ciudades..." />
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
          Gestión de Ciudades
        </Title>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenCreateModal}
        style={{ marginBottom: "20px" }}
      >
        Crear Ciudad
      </Button>

      {cities.length === 0 && !isLoading ? (
        <Empty description="No hay ciudades disponibles" />
      ) : (
        <>
          <CardList
            data={cities}
            loading={isLoading}
            renderItem={renderCityCard}
          />
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        </>
      )}

      {/* Create City Modal */}
      <GenericFormModal
        title="Crear Nueva Ciudad"
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        fields={getFormFields()}
        loading={isLoading}
        form={createForm}
      />

      {/* Edit City Modal */}
      <GenericFormModal
        title="Editar Ciudad"
        open={isEditModalVisible}
        onCancel={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        fields={getFormFields()}
        loading={isLoading}
        form={editForm}
      />
    </div>
  );
};

export default CityPage;
