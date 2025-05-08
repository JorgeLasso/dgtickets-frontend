import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Table,
  Tag,
  Empty,
  Spin,
  Button,
  Form,
  InputNumber,
  Select,
} from "antd";
import { HeadquarterContext } from "../context/HeadquarterContext";
import useHeadquarters from "../hooks/useHeadquarters";
import {
  HeadquarterMedicine,
  HeadquarterDetail,
} from "../types/headquarters/headquarter.types";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import useMedicines from "../hooks/useMedicines";
import useFetch from "../hooks/useFetch";
import useNotification from "../hooks/useNotification";

const { Title } = Typography;

interface HeadquarterMedicinesModalProps {
  open: boolean;
  onCancel: () => void;
}

const HeadquarterMedicinesModal: React.FC<HeadquarterMedicinesModalProps> = ({
  open,
  onCancel,
}) => {
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const { getHeadquarterById } = useHeadquarters();
  const { medicines: availableMedicines, fetchMedicines } = useMedicines();
  const { put } = useFetch();
  const { openNotification } = useNotification();
  const [form] = Form.useForm();

  const [medicines, setMedicines] = useState<HeadquarterMedicine[]>([]);
  const [headquarterDetail, setHeadquarterDetail] =
    useState<HeadquarterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] =
    useState<HeadquarterMedicine | null>(null);

  useEffect(() => {
    const fetchHeadquarterMedicines = async () => {
      if (!selectedHeadquarter || !open) return;

      try {
        setLoading(true);
        setError(null);

        await fetchMedicines();

        const hqDetail = await getHeadquarterById(selectedHeadquarter);

        if (hqDetail) {
          setHeadquarterDetail(hqDetail);
          setMedicines(hqDetail.headquarterMedicines || []);
        } else {
          setError("No se pudo obtener la información de la sede");
        }
      } catch (err) {
        console.error("Error fetching headquarter medicines:", err);
        setError("Error al cargar los medicamentos de la sede");
      } finally {
        setLoading(false);
      }
    };

    fetchHeadquarterMedicines();
  }, [selectedHeadquarter, getHeadquarterById, open, fetchMedicines]);

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    form.resetFields();
    setIsAddMedicineModalOpen(true);
  };

  const handleEditMedicine = (medicine: HeadquarterMedicine) => {
    setEditingMedicine(medicine);
    form.setFieldsValue({
      medicineId: medicine.medicineId,
      quantity: medicine.quantity,
    });
    setIsAddMedicineModalOpen(true);
  };

  const handleCloseAddEditModal = () => {
    setIsAddMedicineModalOpen(false);
    setEditingMedicine(null);
    form.resetFields();
  };

  const handleSaveMedicine = async () => {
    try {
      const values = await form.validateFields();

      if (!headquarterDetail) {
        openNotification(
          "error",
          "Error al guardar",
          "No se pudo obtener la información de la sede"
        );
        return;
      }

      setLoading(true);

      let updatedMedicines = [...medicines];

      if (editingMedicine) {
        updatedMedicines = updatedMedicines.map((med) =>
          med.id === editingMedicine.id
            ? {
                ...med,
                medicineId: values.medicineId,
                quantity: values.quantity,
              }
            : med
        );
      } else {
        const existingMedicine = medicines.find(
          (med) => med.medicineId === values.medicineId
        );

        if (existingMedicine) {
          updatedMedicines = updatedMedicines.map((med) =>
            med.medicineId === values.medicineId
              ? { ...med, quantity: med.quantity + values.quantity }
              : med
          );
        } else {
          const newMedicine: Partial<HeadquarterMedicine> = {
            headquarterId: selectedHeadquarter!,
            medicineId: values.medicineId,
            quantity: values.quantity,
          };

          updatedMedicines.push(newMedicine as HeadquarterMedicine);
        }
      }

      const medicinesForApi = updatedMedicines.map((med) => ({
        medicineId: med.medicineId,
        quantity: med.quantity,
      }));

      const payload = {
        id: headquarterDetail.id,
        name: headquarterDetail.name,
        address: headquarterDetail.address,
        phoneNumber: headquarterDetail.phoneNumber,
        isActive: headquarterDetail.isActive,
        medicines: medicinesForApi,
      };

      await put(`/headquarters/${headquarterDetail.id}`, payload);

      const updatedHeadquarterDetail = await getHeadquarterById(
        selectedHeadquarter!
      );
      if (updatedHeadquarterDetail) {
        setHeadquarterDetail(updatedHeadquarterDetail);
        setMedicines(updatedHeadquarterDetail.headquarterMedicines || []);
      }

      openNotification(
        "success",
        "Guardado exitoso",
        editingMedicine
          ? "El medicamento ha sido actualizado correctamente"
          : "El medicamento ha sido agregado correctamente"
      );

      handleCloseAddEditModal();
    } catch (err) {
      console.error("Error saving medicine:", err);
      openNotification(
        "error",
        "Error al guardar",
        "Ocurrió un error al guardar los cambios. Intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: ["medicine", "name"],
      key: "name",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (text: number) => (
        <Tag color={text > 10 ? "green" : text > 0 ? "orange" : "red"}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: HeadquarterMedicine) => (
        <Button
          icon={<EditOutlined />}
          type="primary"
          size="small"
          onClick={() => handleEditMedicine(record)}
        >
          Editar
        </Button>
      ),
    },
  ];

  const getAvailableMedicines = () => {
    if (editingMedicine) {
      return availableMedicines;
    }

    const assignedMedicineIds = medicines.map((m) => m.medicineId);
    return availableMedicines.filter(
      (m) => !assignedMedicineIds.includes(m.id)
    );
  };

  return (
    <Modal
      title="Medicamentos por Sede"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Cerrar
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMedicine}
        >
          Agregar Medicamento
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" tip="Cargando medicamentos..." />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Title level={5} type="danger">
            {error}
          </Title>
        </div>
      ) : medicines.length === 0 ? (
        <Empty description="No hay medicamentos disponibles en esta sede" />
      ) : (
        <Table
          dataSource={medicines}
          columns={columns}
          rowKey={(record) => record.id.toString()}
          pagination={{ pageSize: 5 }}
        />
      )}

      {isAddMedicineModalOpen && (
        <Modal
          title={editingMedicine ? "Editar Medicamento" : "Agregar Medicamento"}
          open={isAddMedicineModalOpen}
          onCancel={handleCloseAddEditModal}
          onOk={handleSaveMedicine}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="medicineId"
              label="Medicamento"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione un medicamento",
                },
              ]}
            >
              <Select
                placeholder="Seleccionar medicamento"
                disabled={!!editingMedicine}
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toString().toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
                options={getAvailableMedicines().map((med) => ({
                  value: med.id,
                  label: med.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Cantidad"
              rules={[
                { required: true, message: "Por favor ingrese la cantidad" },
                {
                  type: "number",
                  min: 1,
                  message: "La cantidad debe ser mayor a 0",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ingrese la cantidad"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Modal>
  );
};

export default HeadquarterMedicinesModal;
