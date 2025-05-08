import { useState, useCallback } from "react";
import {
  MedicineResponse,
  MedicineStock,
} from "../types/medication/medication.types";
import useFetch from "./useFetch";
import useNotification from "./useNotification";

/**
 * Custom hook for managing medicines operations
 * @returns Object with medicines state and operations
 */
const useMedicines = () => {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { isLoading, get, put, post } = useFetch<MedicineResponse>();
  const { openNotification } = useNotification();

  /**
   * Fetch medicines from the API
   * @param page Current page number
   */
  const fetchMedicines = useCallback(
    async (page: number = currentPage) => {
      try {
        const query = `medicine-stocks?page=${page}&limit=${pageSize}`;
        const data = await get(query);
        if (data) {
          setMedicines(data.medicineStocks);
          setTotal(data.total);
          setPageSize(data.limit);
        }
        return data;
      } catch (error) {
        console.error("Error fetching medicines:", error);
        openNotification(
          "error",
          "Error al cargar medicamentos",
          "No se pudieron cargar los medicamentos. Intente nuevamente."
        );
        return null;
      }
    },
    [pageSize, get, currentPage, openNotification]
  );

  /**
   * Update an existing medicine
   * @param medicine Medicine data to update
   */
  const updateMedicine = useCallback(
    async (medicine: MedicineStock) => {
      try {
        const updatedMedicine = await put("medicine-stocks/", { ...medicine });

        if (updatedMedicine) {
          setMedicines((prevMedicines) =>
            prevMedicines.map((med) =>
              med.id === medicine.id ? { ...med, ...updatedMedicine } : med
            )
          );

          openNotification(
            "success",
            "Medicamento actualizado",
            "El medicamento ha sido actualizado correctamente"
          );

          // Refetch to ensure data consistency
          await fetchMedicines();
          return updatedMedicine;
        }
        return null;
      } catch (error) {
        console.error("Error updating medicine:", error);
        openNotification(
          "error",
          "Error al actualizar",
          "No se pudo actualizar el medicamento. Intente nuevamente."
        );
        return null;
      }
    },
    [put, openNotification, fetchMedicines]
  );

  /**
   * Create a new medicine
   * @param medicine New medicine data
   */
  const createMedicine = useCallback(
    async (medicine: Omit<MedicineStock, "id">) => {
      try {
        const newMedicine = await post("medicine-stocks/", medicine);
        if (newMedicine) {
          openNotification(
            "success",
            "Medicamento creado",
            "El medicamento ha sido creado correctamente"
          );

          // Refetch to ensure data consistency
          await fetchMedicines();
          return newMedicine;
        }
        return null;
      } catch (error) {
        console.error("Error creating medicine:", error);
        openNotification(
          "error",
          "Error al crear",
          "No se pudo crear el medicamento. Intente nuevamente."
        );
        return null;
      }
    },
    [post, openNotification, fetchMedicines]
  );

  /**
   * Change the current page
   * @param page New page number
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchMedicines(page);
    },
    [fetchMedicines]
  );

  return {
    medicines,
    total,
    pageSize,
    currentPage,
    isLoading,
    fetchMedicines,
    updateMedicine,
    createMedicine,
    handlePageChange,
  };
};

export default useMedicines;
