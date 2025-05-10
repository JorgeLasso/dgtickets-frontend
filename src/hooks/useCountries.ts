import { useEffect, useState, useCallback, useContext } from "react";
import useFetch from "./useFetch";
import {
  Country,
  CountryPagination,
  CountryFormValues,
} from "../types/locations/location.types";
import { NotificationContext } from "../context/NotificationContext";

interface UseCountriesReturn {
  countries: Country[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  fetchCountries: (page?: number, limit?: number) => Promise<void>;
  createCountry: (values: CountryFormValues) => Promise<boolean>;
  updateCountry: (id: number, values: CountryFormValues) => Promise<boolean>;
}

/**
 * Custom hook for fetching and managing country data
 * @returns Object containing countries data and loading state
 */
const useCountries = (): UseCountriesReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
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
  const { isLoading, get, post, put } = useFetch<CountryPagination>();

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  const fetchCountries = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const response = await get(`/countries?page=${page}&limit=${limit}`);
        if (response) {
          setCountries(response.countries);
          setPagination({
            page: response.page,
            limit: response.limit,
            total: response.total,
          });
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        openNotification("error", "Error", "No se pudieron cargar los países");
      }
    },
    [get, openNotification]
  );

  const createCountry = async (values: CountryFormValues): Promise<boolean> => {
    try {
      await post("/countries", values as unknown as Record<string, unknown>);
      await fetchCountries(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error creating country:", error);
      openNotification("error", "Error", "No se pudo crear el país");
      return false;
    }
  };

  const updateCountry = async (
    id: number,
    values: CountryFormValues
  ): Promise<boolean> => {
    try {
      await put(
        `/countries/${id}`,
        values as unknown as Record<string, unknown>
      );
      await fetchCountries(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error updating country:", error);
      openNotification("error", "Error", "No se pudo actualizar el país");
      return false;
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    isLoading,
    pagination,
    fetchCountries,
    createCountry,
    updateCountry,
  };
};

export default useCountries;
