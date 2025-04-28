import { useEffect, useState, useCallback } from "react";
import useFetch from "./useFetch";
import { City } from "../types/locations/location.types";

/**
 * Custom hook for fetching and managing city data
 * @returns Object containing cities data, filtered cities and loading state
 */
const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const { get, isLoading, error } = useFetch<{ cities?: City[] }>();

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await get("/cities");
        if (response?.cities) {
          setCities(response.cities);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    loadCities();
  }, [get]);

  /**
   * Filter cities by state ID
   * @param stateId The ID of the state to filter cities by
   */
  const filterCitiesByState = useCallback(
    (stateId: number | null) => {
      if (stateId) {
        const citiesInState = cities.filter((city) => city.stateId === stateId);
        setFilteredCities(citiesInState);
      } else {
        setFilteredCities([]);
      }
    },
    [cities]
  );

  return {
    cities,
    filteredCities,
    filterCitiesByState,
    isLoading,
    error,
  };
};

export default useCities;
