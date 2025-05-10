import React, { useState, useContext } from "react";
import {
  Typography,
  Empty,
  Spin,
  Button,
  Pagination,
  Form,
  Input,
  Tooltip,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import CardList from "../components/CardList";
import { Country } from "../types/locations/location.types";
import useHideMenu from "../hooks/useHideMenu";
import useCountries from "../hooks/useCountries";
import { NotificationContext } from "../context/NotificationContext";
import GenericFormModal from "../components/GenericFormModal";
import { FormField } from "../types/forms/forms.types";

const { Title } = Typography;

const CountryPage: React.FC = () => {
  useHideMenu(false);

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  // Get countries from custom hook
  const {
    countries,
    isLoading,
    pagination,
    fetchCountries,
    createCountry,
    updateCountry,
  } = useCountries();

  // Forms for create and edit
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // States for modal visibility
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Modal handlers
  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleOpenEditModal = (country: Country) => {
    editForm.setFieldsValue({
      name: country.name,
      available: country.available,
    });
    setEditingCountry(country);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingCountry(null);
  };

  const handleCreateSubmit = async (values: Country) => {
    const success = await createCountry(values);
    if (success) {
      setIsCreateModalVisible(false);
      createForm.resetFields();
      openNotification(
        "success",
        "País creado",
        "El país ha sido creado exitosamente"
      );
    }
  };

  const handleEditSubmit = async (values: Country) => {
    if (!editingCountry) return;

    const success = await updateCountry(editingCountry.id, values);
    if (success) {
      setIsEditModalVisible(false);
      setEditingCountry(null);
      openNotification(
        "success",
        "País actualizado",
        "El país ha sido actualizado exitosamente"
      );
    }
  };

  // Pagination handler
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchCountries(page, pageSize || pagination.limit);
  };

  // Form fields for create and edit modals
  const getFormFields = (): FormField[] => {
    return [
      {
        name: "name",
        label: "Nombre",
        component: <Input placeholder="Ingrese el nombre del país" />,
        rules: [
          { required: true, message: "Por favor ingrese el nombre del país" },
        ],
      },
      {
        name: "available",
        label: "Disponibilidad",
        component: <Input placeholder="Ingrese la disponibilidad" />,
        rules: [
          { required: true, message: "Por favor ingrese la disponibilidad" },
        ],
      },
    ];
  };

  // Render country card with details
  const renderCountryCard = (country: Country) => {
    return {
      loading: isLoading,
      title: country.name,
      properties: [
        {
          label: "Disponibilidad",
          value:
            country.available !== "null"
              ? country.available
              : "No especificada",
        },
      ],
      actions: [
        <Tooltip key="edit-tooltip" title="Editar">
          <EditOutlined
            key="edit"
            onClick={() => handleOpenEditModal(country)}
          />
        </Tooltip>,
      ],
    };
  };

  // Loading state
  if (isLoading && countries.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando países..." />
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
          Gestión de Países
        </Title>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenCreateModal}
        style={{ marginBottom: "20px" }}
      >
        Crear País
      </Button>

      {countries.length === 0 && !isLoading ? (
        <Empty description="No hay países disponibles" />
      ) : (
        <>
          <CardList
            data={countries}
            loading={isLoading}
            renderItem={renderCountryCard}
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

      {/* Create Country Modal */}
      <GenericFormModal
        title="Crear Nuevo País"
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        fields={getFormFields()}
        loading={isLoading}
        form={createForm}
      />

      {/* Edit Country Modal */}
      <GenericFormModal
        title="Editar País"
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

export default CountryPage;
