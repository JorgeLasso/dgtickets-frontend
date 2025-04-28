import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import { Headquarter } from "../types/headquarters/headquarter.types";

export interface UseHeadquartersResult {
  headquarters: Headquarter[];
  filteredHeadquarters: Headquarter[];
  filterHeadquarterByCity: (cityId: number | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const useHeadquarters = (): UseHeadquartersResult => {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [filteredHeadquarters, setFilteredHeadquarters] = useState<
    Headquarter[]
  >([]);
  const { get, isLoading, error } = useFetch<{ headquarters: Headquarter[] }>();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await get("/headquarters");
        setHeadquarters(response.headquarters);
      } catch (err) {
        console.error("Error fetching headquarters:", err);
      }
    };
    load();
  }, [get]);

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

  return {
    headquarters,
    filteredHeadquarters,
    filterHeadquarterByCity,
    isLoading,
    error,
  };
};

export default useHeadquarters;
