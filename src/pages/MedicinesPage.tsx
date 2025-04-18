import React, { useEffect, useState, useCallback, useContext } from "react";
import { Typography, Empty, Form, Button, Select } from "antd";
import CardList from "../components/CardList";
import Pagination from "../components/Pagination";
import {
  MedicineResponse,
  MedicineStock,
  Headquarter,
} from "../types/medication/medication.types";
import useHideMenu from "../hooks/useHideMenu";
import useNotification from "../hooks/useNotification";
import useFetch from "../hooks/useFetch";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import GenericFormModal from "../components/GenericFormModal";
import {
  medicinesFormFields,
  headquarterFormField,
} from "../constants/MedicinesFormFields";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../constants/Roles";

const { Title } = Typography;

const MedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [selectedHeadquarter, setSelectedHeadquarter] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineStock | null>(
    null
  );
  const [form] = Form.useForm<MedicineStock>();
  const [createForm] = Form.useForm<MedicineStock>();
  const { openNotification } = useNotification();
  const { isLoading: loading, get, put, post } = useFetch<MedicineResponse>();
  const { get: getHeadquarters } = useFetch<{ headquarters: Headquarter[] }>();

  // Determine user permissions
  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("AuthContext must be used within AuthProvider");
  const { auth } = authContext;
  const canEditOrAdd = auth.role
    ? [ROLES.ADVISER, ROLES.ADMIN].includes(auth.role)
    : false;

  useEffect(() => {
    const loadHeadquarters = async () => {
      try {
        const response = await getHeadquarters("/headquarters");
        setHeadquarters(response.headquarters);
      } catch (error) {
        console.error("Error fetching headquarters:", error);
      }
    };
    loadHeadquarters();
  }, [getHeadquarters]);

  const medicineFormFields = [
    ...medicinesFormFields,
    headquarterFormField(headquarters),
  ];

  useHideMenu(false);

  const fetchMedicines = useCallback(
    async (page: number) => {
      try {
        const query = `medicine-stocks?page=${page}&limit=${pageSize}${
          selectedHeadquarter ? `&headquarterId=${selectedHeadquarter}` : ""
        }`;
        const data = await get(query);
        if (data) {
          setMedicines(data.medicineStocks);
          setTotal(data.total);
          setPageSize(data.limit);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    },
    [pageSize, get, selectedHeadquarter]
  );

  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage, fetchMedicines]);

  const handleHeadquarterChange = (id: number | undefined) => {
    setSelectedHeadquarter(id ?? null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      headquarterId: medicine.headquarterId,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    form.resetFields();
  };

  const handleUpdateMedicine = async (values: MedicineStock) => {
    try {
      if (!editingMedicine) return;

      const updatedMedicine = await put("medicine-stocks/", { ...values });

      if (updatedMedicine) {
        setMedicines((prevMedicines) =>
          prevMedicines.map((med) =>
            med.id === editingMedicine.id ? { ...med, ...updatedMedicine } : med
          )
        );

        openNotification(
          "success",
          "Medicamento actualizado",
          "El medicamento ha sido actualizado correctamente"
        );

        setIsModalOpen(false);
        setEditingMedicine(null);
        form.resetFields();

        fetchMedicines(currentPage);
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      openNotification(
        "error",
        "Error al actualizar",
        "No se pudo actualizar el medicamento. Intente nuevamente."
      );
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
    try {
      const { ...payload } = values;
      const newMedicine = await post("medicine-stocks/", payload);
      if (newMedicine) {
        openNotification(
          "success",
          "Medicamento creado",
          "El medicamento ha sido creado correctamente"
        );
        setIsCreateModalOpen(false);
        createForm.resetFields();
        fetchMedicines(currentPage);
      }
    } catch (error) {
      console.error("Error creando medicamento:", error);
      openNotification(
        "error",
        "Error al crear",
        "No se pudo crear el medicamento. Intente nuevamente."
      );
    }
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Select
          allowClear
          placeholder="Filtrar por sede"
          style={{ width: 200 }}
          value={selectedHeadquarter || undefined}
          onChange={handleHeadquarterChange}
        >
          {headquarters.map((hq) => (
            <Select.Option key={hq.id} value={hq.id}>
              {hq.name}
            </Select.Option>
          ))}
        </Select>
        {canEditOrAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
          >
            Agregar
          </Button>
        )}
      </div>
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
        fields={medicineFormFields}
        loading={loading}
        form={form}
        initialValues={editingMedicine || {}}
      />

      <GenericFormModal<MedicineStock>
        title="Nuevo Medicamento"
        open={isCreateModalOpen}
        onCancel={handleCancelCreate}
        onSubmit={handleCreateMedicine}
        fields={medicineFormFields}
        loading={loading}
        form={createForm}
      />
    </div>
  );
};

export default MedicinesPage;
