import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Table,
  Tag,
  Empty,
  Spin,
  Button,
  InputNumber,
} from "antd";
import { HeadquarterContext } from "../context/HeadquarterContext";
import useHeadquarters from "../hooks/useHeadquarters";
import {
  HeadquarterMedicine,
  HeadquarterDetail,
} from "../types/headquarters/headquarter.types";
import useFetch from "../hooks/useFetch";
import { Ticket } from "../types/ticket/ticket.types";
import useNotification from "../hooks/useNotification";

const { Title, Text } = Typography;

interface TicketMedicinesModalProps {
  open: boolean;
  onCancel: () => void;
  currentTicket?: Ticket;
  userId: number;
}

interface SelectedMedicine {
  medicineId: number;
  quantity: number;
}

const TicketMedicinesModal: React.FC<TicketMedicinesModalProps> = ({
  open,
  onCancel,
  currentTicket,
  userId,
}) => {
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const { getHeadquarterById } = useHeadquarters();
  const { put, isLoading: isUpdating } = useFetch();
  const { openNotification } = useNotification();

  const [medicines, setMedicines] = useState<HeadquarterMedicine[]>([]);
  const [, setHeadquarterDetail] = useState<HeadquarterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<
    SelectedMedicine[]
  >([]);
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchHeadquarterMedicines = async () => {
      if (!selectedHeadquarter || !open) return;

      try {
        setLoading(true);
        setError(null);

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
    setSelectedMedicines([]);
  }, [selectedHeadquarter, getHeadquarterById, open]);

  const handleQuantityChange = (
    medicineId: number,
    quantity: number | null
  ) => {
    if (quantity === null) return;

    const medicine = medicines.find((m) => m.medicine.id === medicineId);

    if (medicine && quantity > medicine.quantity) {
      setInputErrors({
        ...inputErrors,
        [medicineId]: `Excede la cantidad disponible (${medicine.quantity})`,
      });
    } else {
      const newErrors = { ...inputErrors };
      delete newErrors[medicineId];
      setInputErrors(newErrors);
    }

    setSelectedMedicines((prev) => {
      const existing = prev.find((med) => med.medicineId === medicineId);

      if (existing) {
        if (quantity === 0) {
          return prev.filter((med) => med.medicineId !== medicineId);
        }

        return prev.map((med) =>
          med.medicineId === medicineId ? { ...med, quantity } : med
        );
      } else if (quantity > 0) {
        return [...prev, { medicineId, quantity }];
      }

      return prev;
    });
  };

  const getSelectedQuantity = (medicineId: number): number => {
    const medicine = selectedMedicines.find(
      (med) => med.medicineId === medicineId
    );
    return medicine ? medicine.quantity : 0;
  };

  const handleSaveMedicines = async () => {
    if (!currentTicket) {
      openNotification(
        "error",
        "Error",
        "No hay ticket en atención para asignar medicamentos"
      );
      return;
    }

    if (selectedMedicines.length === 0) {
      openNotification(
        "warning",
        "Advertencia",
        "No has seleccionado ningún medicamento"
      );
      return;
    }

    try {
      await put(`/tickets_/${currentTicket.id}`, {
        ...currentTicket,
        medicines: selectedMedicines,
        priority: currentTicket.priority.toString(),
        userUpdated: userId,
      });

      openNotification(
        "success",
        "Éxito",
        "Medicamentos asignados correctamente"
      );
      onCancel();
    } catch (error) {
      console.error("Error al asignar medicamentos:", error);
      openNotification(
        "error",
        "Error",
        "Error al asignar medicamentos al ticket"
      );
    }
  };

  // Verificar si hay algún error de validación para deshabilitar el botón guardar
  const hasValidationErrors = Object.keys(inputErrors).length > 0;

  const columns = [
    {
      title: "Nombre",
      dataIndex: ["medicine", "name"],
      key: "name",
    },
    {
      title: "Disponible",
      dataIndex: "quantity",
      key: "quantity",
      render: (text: number) => (
        <Tag color={text > 10 ? "green" : text > 0 ? "orange" : "red"}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Cantidad a asignar",
      key: "assignQuantity",
      render: (record: HeadquarterMedicine) => (
        <div>
          <InputNumber
            min={0}
            value={getSelectedQuantity(record.medicine.id)}
            onChange={(value) =>
              handleQuantityChange(record.medicine.id, value)
            }
            disabled={record.quantity <= 0}
            status={inputErrors[record.medicine.id] ? "error" : ""}
          />
          {inputErrors[record.medicine.id] && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {inputErrors[record.medicine.id]}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`Asignar medicamentos al ticket ${currentTicket?.id || ""}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSaveMedicines}
          loading={isUpdating}
          disabled={
            selectedMedicines.length === 0 ||
            !currentTicket ||
            hasValidationErrors
          }
        >
          Guardar
        </Button>,
      ]}
      width={700}
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
        <>
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: "16px" }}
          >
            Selecciona los medicamentos y las cantidades a asignar al ticket.
          </Text>
          <Table
            dataSource={medicines}
            columns={columns}
            rowKey={(record) => record.id.toString()}
            pagination={{ pageSize: 5 }}
          />
          {selectedMedicines.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <Text strong>
                Medicamentos seleccionados: {selectedMedicines.length}
              </Text>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default TicketMedicinesModal;
