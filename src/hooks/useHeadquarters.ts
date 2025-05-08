import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import {
  Headquarter,
  HeadquarterDetail,
  HeadquarterDetailResponse,
} from "../types/headquarters/headquarter.types";

export interface UseHeadquartersResult {
  headquarters: Headquarter[];
  filteredHeadquarters: Headquarter[];
  filterHeadquarterByCity: (cityId: number | null) => void;
  getHeadquarterById: (id: number) => Promise<HeadquarterDetail | null>;
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

  return {
    headquarters,
    filteredHeadquarters,
    filterHeadquarterByCity,
    getHeadquarterById,
    isLoading,
    error,
  };
};

export default useHeadquarters;
