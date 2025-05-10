import { useState, useCallback, useEffect } from "react";
import { MedicineStock } from "../types/medication/medication.types";
import useFetch from "./useFetch";
import useNotification from "./useNotification";
import {
  PaginatedResponse,
  PaginationOptions,
} from "../types/pagination/pagination.types";

interface MedicinesApiResponse
  extends Omit<PaginatedResponse<MedicineStock>, "items"> {
  medicineStocks: MedicineStock[];
}

/**
 * Custom hook for managing medicines operations
 * @param options Pagination options
 * @returns Object with medicines state and operations
 */
const useMedicines = (options: PaginationOptions = {}) => {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [limit] = useState(options.limit || 8);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading, get, put, post } = useFetch<MedicinesApiResponse>();
  const { openNotification } = useNotification();

  /**
   * Fetch medicines from the API
   * @param page Current page number
   * @param append Whether to append new data to existing data
   * @param search Search term to filter medicines
   */
  const fetchMedicines = useCallback(
    async (
      page: number = currentPage,
      append: boolean = false,
      search: string = searchTerm
    ) => {
      try {
        setError(null);
        let query = `medicine-stocks?page=${page}&limit=${limit}`;
        if (search) {
          query += `&search=${encodeURIComponent(search)}`;
        }

        const response = await get(query);

        if (response && response.medicineStocks) {
          setMedicines((prevMedicines) =>
            append
              ? [...prevMedicines, ...response.medicineStocks]
              : response.medicineStocks
          );
          setTotalMedicines(response.total);
          setHasNextPage(!!response.next);
          return response;
        } else {
          setError("No se pudo obtener la información de medicamentos.");
          openNotification(
            "error",
            "Error al cargar medicamentos",
            "No se pudieron cargar los medicamentos. Intente nuevamente."
          );
        }
        return null;
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setError(
          "Error al cargar medicamentos. Por favor, intenta nuevamente."
        );
        openNotification(
          "error",
          "Error al cargar medicamentos",
          "No se pudieron cargar los medicamentos. Intente nuevamente."
        );
        return null;
      }
    },
    [limit, get, currentPage, openNotification, searchTerm]
  );

  useEffect(() => {
    fetchMedicines(currentPage);
  }, [fetchMedicines, currentPage]);

  /**
   * Search medicines with specified term
   * @param term Search term
   */
  const searchMedicines = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
      fetchMedicines(1, false, term);
    },
    [fetchMedicines]
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
   * Load more medicines when scrolling or clicking "load more"
   */
  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchMedicines(currentPage + 1, true).finally(() => {
        setCurrentPage((prevPage) => prevPage + 1);
        setIsLoadingMore(false);
      });
    }
  }, [fetchMedicines, currentPage, hasNextPage, isLoadingMore]);

  /**
   * Set a specific page
   * @param page Page number to set
   */
  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchMedicines(page);
    },
    [fetchMedicines]
  );

  return {
    medicines,
    totalMedicines,
    currentPage,
    totalPages: Math.ceil(totalMedicines / limit),
    error,
    isLoading: isLoading || isLoadingMore,
    fetchMedicines,
    updateMedicine,
    createMedicine,
    loadMore,
    setPage,
    searchMedicines,
    searchTerm,
  };
};

export default useMedicines;
