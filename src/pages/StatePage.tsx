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
import { State } from "../types/locations/location.types";
import useHideMenu from "../hooks/useHideMenu";
import useStates from "../hooks/useStates";
import useCountries from "../hooks/useCountries";
import { NotificationContext } from "../context/NotificationContext";
import GenericFormModal from "../components/GenericFormModal";
import { FormField } from "../types/forms/forms.types";

const { Title } = Typography;

const StatePage: React.FC = () => {
  useHideMenu(false);

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  // Get states from custom hook
  const {
    states,
    isLoading,
    pagination,
    fetchStates,
    createState,
    updateState,
  } = useStates();

  // Get countries for the dropdown
  const { countries } = useCountries();

  // Forms for create and edit
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // States for modal visibility
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);

  // Modal handlers
  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleOpenEditModal = (state: State) => {
    editForm.setFieldsValue({
      name: state.name,
      image: state.image,
      countryId: state.countryId,
      isActive: state.isActive,
    });
    setEditingState(state);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingState(null);
  };

  // Form submission handlers
  const handleCreateSubmit = async (values: State) => {
    const success = await createState(values);
    if (success) {
      setIsCreateModalVisible(false);
      createForm.resetFields();
      openNotification(
        "success",
        "Estado creado",
        "El estado ha sido creado exitosamente"
      );
    }
  };

  const handleEditSubmit = async (values: State) => {
    if (!editingState) return;

    const success = await updateState(editingState.id, values);
    if (success) {
      setIsEditModalVisible(false);
      setEditingState(null);
      openNotification(
        "success",
        "Estado actualizado",
        "El estado ha sido actualizado exitosamente"
      );
    }
  };

  // Pagination handler
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchStates(page, pageSize || pagination.limit);
  };

  // Form fields for create and edit modals
  const getFormFields = (): FormField[] => {
    return [
      {
        name: "name",
        label: "Nombre",
        component: <Input placeholder="Ingrese el nombre del estado" />,
        rules: [
          { required: true, message: "Por favor ingrese el nombre del estado" },
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
        name: "countryId",
        label: "País",
        component: (
          <Select placeholder="Seleccione un país">
            {countries.map((country) => (
              <Select.Option key={country.id} value={country.id}>
                {country.name}
              </Select.Option>
            ))}
          </Select>
        ),
        rules: [{ required: true, message: "Por favor seleccione un país" }],
      },
      {
        name: "isActive",
        label: "Activo",
        component: <Switch />,
        valuePropName: "checked",
        tooltip: "Indica si el estado está activo o no",
      },
    ];
  };

  // Render state card with details
  const renderStateCard = (state: State) => {
    // Find country name
    const country = countries.find((c) => c.id === state.countryId);

    return {
      loading: isLoading,
      title: state.name,
      image: state.image !== "null" ? state.image : undefined,
      properties: [
        {
          label: "País",
          value: state.country
            ? state.country.name
            : country
            ? country.name
            : "No disponible",
        },
        {
          label: "Estado",
          value: state.isActive ? (
            <Tag color="green">Activo</Tag>
          ) : (
            <Tag color="red">Inactivo</Tag>
          ),
        },
      ],
      actions: [
        <Tooltip key="edit-tooltip" title="Editar">
          <EditOutlined key="edit" onClick={() => handleOpenEditModal(state)} />
        </Tooltip>,
      ],
    };
  };

  // Loading state
  if (isLoading && states.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando estados..." />
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
          Gestión de Estados
        </Title>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenCreateModal}
        style={{ marginBottom: "20px" }}
      >
        Crear Estado
      </Button>

      {states.length === 0 && !isLoading ? (
        <Empty description="No hay estados disponibles" />
      ) : (
        <>
          <CardList
            data={states}
            loading={isLoading}
            renderItem={renderStateCard}
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

      {/* Create State Modal */}
      <GenericFormModal
        title="Crear Nuevo Estado"
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        fields={getFormFields()}
        loading={isLoading}
        form={createForm}
      />

      {/* Edit State Modal */}
      <GenericFormModal
        title="Editar Estado"
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

export default StatePage;
