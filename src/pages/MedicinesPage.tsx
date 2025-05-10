import React, { useEffect, useState, useContext } from "react";
import { Typography, Empty, Form, Button, Row, Col, Spin, Alert } from "antd";
import CardList from "../components/CardList";
import Pagination from "../components/Pagination";
import { MedicineStock } from "../types/medication/medication.types";
import useHideMenu from "../hooks/useHideMenu";
import {
  PlusOutlined,
  EditOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import GenericFormModal from "../components/GenericFormModal";
import { medicinesFormFields } from "../constants/MedicinesFormFields";
import { AuthContext } from "../auth/AuthContext";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { ROLES } from "../constants/Roles";
import useMedicines from "../hooks/useMedicines";
import HeadquarterMedicinesModal from "../components/HeadquarterMedicinesModal";
import GenericSearchBar from "../components/GenericSearchBar";

const { Title, Text } = Typography;

const MedicinesPage: React.FC = () => {
  useHideMenu(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [
    isMedicinesByHeadquarterModalOpen,
    setIsMedicinesByHeadquarterModalOpen,
  ] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineStock | null>(
    null
  );
  const [form] = Form.useForm<MedicineStock>();
  const [createForm] = Form.useForm<MedicineStock>();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize] = useState(8);

  const {
    medicines,
    totalMedicines,
    currentPage,
    isLoading: isLoadingMedicines,
    error,
    fetchMedicines,
    updateMedicine,
    createMedicine,
    setPage,
    searchMedicines,
  } = useMedicines({ limit: pageSize, page: 1 });

  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("AuthContext must be used within AuthProvider");
  const { auth } = authContext;

  const headquarterContext = useContext(HeadquarterContext);
  if (!headquarterContext)
    throw new Error(
      "HeadquarterContext must be used within HeadquarterProvider"
    );
  const { selectedHeadquarter } = headquarterContext;

  const canEditOrAdd = auth.role
    ? [ROLES.ADVISER, ROLES.ADMIN].includes(auth.role)
    : false;

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleEditMedicine = (medicine: MedicineStock) => {
    setEditingMedicine(medicine);
    form.setFieldsValue({
      id: medicine.id,
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      quantity: medicine.quantity,
      unitOfMeasure: medicine.unitOfMeasure,
      quantityPerUnit: medicine.quantityPerUnit,
      image: medicine.image,
      isActive: medicine.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    form.resetFields();
  };

  const handleUpdateMedicine = async (values: MedicineStock) => {
    if (!editingMedicine) return;
    const success = await updateMedicine({ ...values });
    if (success) {
      setIsModalOpen(false);
      setEditingMedicine(null);
      form.resetFields();
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    createForm.resetFields();
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCreateMedicine = async (values: MedicineStock) => {
    const success = await createMedicine(values);
    if (success) {
      setIsCreateModalOpen(false);
      createForm.resetFields();
    }
  };

  const handleOpenMedicinesByHeadquarterModal = () => {
    setIsMedicinesByHeadquarterModalOpen(true);
  };

  const handleCloseMedicinesByHeadquarterModal = () => {
    setIsMedicinesByHeadquarterModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchMedicines(value);
  };

  const renderMedicineCard = (medicine: MedicineStock) => {
    return {
      loading: isLoadingMedicines,
      title: medicine.name,
      image: medicine.image,
      properties: [
        { label: "Fabricante", value: medicine.manufacturer },
        { label: "Cantidad", value: medicine.quantity },
        { label: "Unidad de medida", value: medicine.unitOfMeasure },
        { label: "Cantidad por unidad", value: medicine.quantityPerUnit },
      ],
      actions: canEditOrAdd
        ? [
            <EditOutlined
              key="edit"
              onClick={() => handleEditMedicine(medicine)}
            />,
          ]
        : [],
    };
  };

  if (isLoadingMedicines && medicines.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando medicamentos..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}
      >
        <Col
          xs={24}
          sm={16}
          md={8}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <GenericSearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Nombre o fabricante"
          />
        </Col>
      </Row>
      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <Col
          xs={24}
          sm={8}
          md={4}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {selectedHeadquarter && canEditOrAdd && (
            <Button
              type="primary"
              ghost
              icon={<MedicineBoxOutlined />}
              onClick={handleOpenMedicinesByHeadquarterModal}
              style={{
                marginBottom: 8,
              }}
            >
              Medicamentos por sede
            </Button>
          )}
          {canEditOrAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Agregar Medicamentos
            </Button>
          )}
        </Col>
      </Row>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Medicamentos
      </Title>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}{" "}
      {medicines.length === 0 && !isLoadingMedicines ? (
        <Empty description="No hay medicamentos disponibles" />
      ) : (
        <>
          <CardList
            data={medicines}
            loading={isLoadingMedicines}
            renderItem={renderMedicineCard}
          />
          <div style={{ marginTop: "20px" }}>
            <Pagination
              current={currentPage}
              total={totalMedicines}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
            <Text
              style={{
                display: "block",
                marginTop: "10px",
                textAlign: "right",
              }}
            >
              {" "}
              Mostrando {medicines.length} de {totalMedicines} medicamentos
            </Text>
          </div>
        </>
      )}
      <GenericFormModal<MedicineStock>
        title="Editar Medicamento"
        open={isModalOpen}
        onCancel={handleCancel}
        onSubmit={handleUpdateMedicine}
        fields={medicinesFormFields}
        loading={isLoadingMedicines}
        form={form}
        initialValues={editingMedicine || {}}
      />
      <GenericFormModal<MedicineStock>
        title="Nuevo Medicamento"
        open={isCreateModalOpen}
        onCancel={handleCancelCreate}
        onSubmit={handleCreateMedicine}
        fields={medicinesFormFields}
        loading={isLoadingMedicines}
        form={createForm}
      />
      <HeadquarterMedicinesModal
        open={isMedicinesByHeadquarterModalOpen}
        onCancel={handleCloseMedicinesByHeadquarterModal}
      />
    </div>
  );
};

export default MedicinesPage;
