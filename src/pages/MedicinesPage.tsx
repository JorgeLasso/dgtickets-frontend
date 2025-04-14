import React, { useEffect, useState, useCallback } from "react";
import { Typography, Empty } from "antd";
import CardList from "../components/CardList";
import Pagination from "../components/Pagination";
import { BASE_API_URL } from "../services/api";
import {
  MedicineResponse,
  MedicineStock,
} from "../types/medication/medication.types";
import useHideMenu from "../hooks/useHideMenu";

const { Title } = Typography;

const MedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useHideMenu(false);

  const fetchMedicines = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_API_URL}/medicine-stocks?page=${page}&limit=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching medicines");
        }
        const data: MedicineResponse = await response.json();
        setMedicines(data.medicineStocks);
        setTotal(data.total);
        setPageSize(data.limit);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage, fetchMedicines]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderMedicineCard = (medicine: MedicineStock) => {
    return {
      loading: loading,
      title: medicine.name,
      image: medicine.image,
      properties: [
        { label: "Fabricante", value: medicine.manufacturer },
        { label: "Cantidad", value: medicine.quantity },
        { label: "Unidad de medida", value: medicine.unitOfMeasure },
        { label: "Cantidad por unidad", value: medicine.quantityPerUnit },
      ],
    };
  };

  return (
    <div style={{ padding: "20px" }}>
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
    </div>
  );
};

export default MedicinesPage;
