import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import {
  Headquarter,
  HeadquarterDetail,
  HeadquarterDetailResponse,
  HeadquarterMedicine,
} from "../types/headquarters/headquarter.types";

export interface UseHeadquartersResult {
  headquarters: Headquarter[];
  filteredHeadquarters: Headquarter[];
  filterHeadquarterByCity: (cityId: number | null) => void;
  getHeadquarterById: (id: number) => Promise<HeadquarterDetail | null>;
  getMedicinesByHeadquarter: (
    id: number
  ) => Promise<HeadquarterMedicine[] | null>;
  updateHeadquarterActiveStatus: (
    id: number,
    isActive: boolean
  ) => Promise<boolean>;
  updateHeadquarter: (
    id: number,
    headquarterData: Partial<HeadquarterDetail>
  ) => Promise<boolean>;

  /**
   * Create a new headquarter
   * @param headquarterData The headquarter data to create
   * @returns Promise resolving to true if successful, false otherwise
   */
  createHeadquarter: (
    headquarterData: Omit<
      HeadquarterDetail,
      "id" | "createdAt" | "updatedAt" | "headquarterMedicines"
    >
  ) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

const useHeadquarters = (): UseHeadquartersResult => {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [filteredHeadquarters, setFilteredHeadquarters] = useState<
    Headquarter[]
  >([]);

  const {
    get: getHeadquarters,
    isLoading,
    error,
  } = useFetch<{ headquarters: Headquarter[] }>();
  const { get: getHeadquarterDetail } = useFetch<HeadquarterDetailResponse>();
  const { put: patchHeadquarter } = useFetch<HeadquarterDetail>();
  const { post: postHeadquarter } = useFetch<HeadquarterDetail>();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getHeadquarters("/headquarters");
        setHeadquarters(response.headquarters);
      } catch (err) {
        console.error("Error fetching headquarters:", err);
      }
    };
    load();
  }, [getHeadquarters]);

  /**
   * Filter headquarters by city ID
   * @param cityId The ID of the city to filter headquarters by
   */
  const filterHeadquarterByCity = useCallback(
    (cityId: number | null) => {
      if (cityId) {
        const headquartersInCity = headquarters.filter(
          (hq) => hq.cityId === cityId
        );
        setFilteredHeadquarters(headquartersInCity);
      } else {
        setFilteredHeadquarters([]);
      }
    },
    [headquarters]
  );

  /**
   * Get headquarter details by ID including associated medicines
   * @param id The ID of the headquarter to fetch
   * @returns Promise with headquarter details or null if there's an error
   */
  const getHeadquarterById = useCallback(
    async (id: number): Promise<HeadquarterDetail | null> => {
      try {
        const response = await getHeadquarterDetail(`/headquarters/${id}`);
        return response.headquarter;
      } catch (err) {
        console.error(`Error fetching headquarter with ID ${id}:`, err);
        return null;
      }
    },
    [getHeadquarterDetail]
  );

  /**
   * Get medicines by headquarter ID
   * @param id The ID of the headquarter
   * @returns Promise with headquarterMedicines array or null if error
   */
  const getMedicinesByHeadquarter = useCallback(
    async (id: number): Promise<HeadquarterMedicine[] | null> => {
      try {
        const response = await getHeadquarterDetail(`/headquarters/${id}`);
        return response.headquarter.headquarterMedicines || [];
      } catch (err) {
        console.error(`Error fetching medicines for headquarter ${id}:`, err);
        return null;
      }
    },
    [getHeadquarterDetail]
  );

  /**
   * Update headquarter active status
   * @param id The ID of the headquarter to update
   * @param isActive The new active status
   * @returns Promise resolving to true if successful, false otherwise
   */
  const updateHeadquarterActiveStatus = useCallback(
    async (id: number, isActive: boolean): Promise<boolean> => {
      try {
        await patchHeadquarter(`/headquarters/${id}`, { isActive });

        // Update the local state
        setHeadquarters((prevHeadquarters) =>
          prevHeadquarters.map((hq) =>
            hq.id === id ? { ...hq, isActive } : hq
          )
        );

        return true;
      } catch (err) {
        console.error(`Error updating headquarter ${id} status:`, err);
        return false;
      }
    },
    [patchHeadquarter]
  );

  /**
   * Update headquarter details
   * @param id The ID of the headquarter to update
   * @param headquarterData The updated headquarter data
   * @returns Promise resolving to true if successful, false otherwise
   */
  const updateHeadquarter = useCallback(
    async (
      id: number,
      headquarterData: Partial<HeadquarterDetail>
    ): Promise<boolean> => {
      try {
        await patchHeadquarter(`/headquarters/${id}`, headquarterData);

        // Update the local state
        setHeadquarters((prevHeadquarters) =>
          prevHeadquarters.map((hq) =>
            hq.id === id
              ? {
                  ...hq,
                  ...headquarterData,
                }
              : hq
          )
        );

        return true;
      } catch (err) {
        console.error(`Error updating headquarter ${id}:`, err);
        return false;
      }
    },
    [patchHeadquarter]
  );

  /**
   * Create a new headquarter
   * @param headquarterData The headquarter data to create
   * @returns Promise resolving to true if successful, false otherwise
   */
  const createHeadquarter = useCallback(
    async (
      headquarterData: Omit<
        HeadquarterDetail,
        "id" | "createdAt" | "updatedAt" | "headquarterMedicines"
      >
    ): Promise<boolean> => {
      try {
        const response = await postHeadquarter(
          "/headquarters",
          headquarterData
        );

        // Add the new headquarter to the local state
        setHeadquarters((prevHeadquarters) => [
          ...prevHeadquarters,
          response as Headquarter,
        ]);

        return true;
      } catch (err) {
        console.error("Error creating headquarter:", err);
        return false;
      }
    },
    [postHeadquarter]
  );
  return {
    headquarters,
    filteredHeadquarters,
    filterHeadquarterByCity,
    getHeadquarterById,
    getMedicinesByHeadquarter,
    updateHeadquarterActiveStatus,
    updateHeadquarter,
    createHeadquarter,
    isLoading,
    error,
  };
};

export default useHeadquarters;
