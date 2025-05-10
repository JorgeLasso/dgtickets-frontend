import { useEffect, useState, useCallback, useContext } from "react";
import useFetch from "./useFetch";
import {
  City,
  CityPagination,
  CityFormValues,
} from "../types/locations/location.types";
import { NotificationContext } from "../context/NotificationContext";

interface UseCitiesReturn {
  cities: City[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  fetchCities: (page?: number, limit?: number) => Promise<void>;
  createCity: (values: CityFormValues) => Promise<boolean>;
  updateCity: (id: number, values: CityFormValues) => Promise<boolean>;
  filteredCities: City[];
  filterCitiesByState: (stateId: number | null) => void;
}

/**
 * Custom hook for fetching and managing city data
 * @returns Object containing cities data, filtered cities and loading state
 */
const useCities = (): UseCitiesReturn => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  }>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Use the fetch hook
  const { isLoading, get, post, put } = useFetch<CityPagination>();

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;
  const fetchCities = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const response = await get(`/cities?page=${page}&limit=${limit}`);
        if (response) {
          setCities(response.cities);
          setPagination({
            page: response.page,
            limit: response.limit,
            total: response.total,
          });
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        openNotification(
          "error",
          "Error",
          "No se pudieron cargar las ciudades"
        );
      }
    },
    [get, openNotification]
  );
  const createCity = async (values: CityFormValues): Promise<boolean> => {
    try {
      await post("/cities", values as unknown as Record<string, unknown>);
      await fetchCities(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error creating city:", error);
      openNotification("error", "Error", "No se pudo crear la ciudad");
      return false;
    }
  };

  const updateCity = async (
    id: number,
    values: CityFormValues
  ): Promise<boolean> => {
    try {
      await put(`/cities/${id}`, values as unknown as Record<string, unknown>);
      await fetchCities(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error updating city:", error);
      openNotification("error", "Error", "No se pudo actualizar la ciudad");
      return false;
    }
  };

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

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    cities,
    isLoading,
    pagination,
    fetchCities,
    createCity,
    updateCity,
    filteredCities,
    filterCitiesByState,
  };
};

export default useCities;
