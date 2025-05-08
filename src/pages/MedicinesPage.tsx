import React, { useEffect, useState, useContext } from "react";
import { Typography, Empty, Form, Button, Row, Col } from "antd";
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

const { Title } = Typography;

const MedicinesPage: React.FC = () => {
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

  const {
    medicines,
    total,
    pageSize,
    currentPage,
    isLoading: loading,
    fetchMedicines,
    updateMedicine,
    createMedicine,
    handlePageChange,
  } = useMedicines();

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

  useHideMenu(false);

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

  const renderMedicineCard = (medicine: MedicineStock) => {
    return {
      loading,
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

  return (
    <div style={{ padding: "20px" }}>
      <Row
        gutter={[16, 16]}
        className="button-container"
        style={{ marginBottom: 16 }}
      >
        <Col xs={24} sm={6}>
          {selectedHeadquarter && canEditOrAdd && (
            <Button
              type="primary"
              ghost
              icon={<MedicineBoxOutlined />}
              onClick={handleOpenMedicinesByHeadquarterModal}
              style={{ width: "100%", maxWidth: "300px" }}
            >
              Ver medicamentos por sede
            </Button>
          )}
        </Col>
        <Col xs={24} sm={6}>
          {canEditOrAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              style={{ width: "100%", maxWidth: "300px" }}
            >
              Agregar Medicamentos
            </Button>
          )}
        </Col>
      </Row>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Medicamentos Disponibles
      </Title>

      {medicines.length === 0 && !loading ? (
        <Empty description="No hay medicamentos disponibles" />
      ) : (
        <>
          <CardList
            data={medicines}
            loading={loading}
            renderItem={renderMedicineCard}
          />
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </>
      )}

      <GenericFormModal<MedicineStock>
        title="Editar Medicamento"
        open={isModalOpen}
        onCancel={handleCancel}
        onSubmit={handleUpdateMedicine}
        fields={medicinesFormFields}
        loading={loading}
        form={form}
        initialValues={editingMedicine || {}}
      />

      <GenericFormModal<MedicineStock>
        title="Nuevo Medicamento"
        open={isCreateModalOpen}
        onCancel={handleCancelCreate}
        onSubmit={handleCreateMedicine}
        fields={medicinesFormFields}
        loading={loading}
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
