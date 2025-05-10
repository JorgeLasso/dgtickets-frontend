import { useEffect, useState, useCallback, useContext } from "react";
import useFetch from "./useFetch";
import {
  State,
  StatePagination,
  StateFormValues,
} from "../types/locations/location.types";
import { NotificationContext } from "../context/NotificationContext";

interface UseStatesReturn {
  states: State[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  fetchStates: (page?: number, limit?: number) => Promise<void>;
  createState: (values: StateFormValues) => Promise<boolean>;
  updateState: (id: number, values: StateFormValues) => Promise<boolean>;
}

/**
 * Custom hook for fetching and managing state data
 * @returns Object containing states data and loading state
 */
const useStates = (): UseStatesReturn => {
  const [states, setStates] = useState<State[]>([]);
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
  const { isLoading, get, post, put } = useFetch<StatePagination>();

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  const fetchStates = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const response = await get(`/states?page=${page}&limit=${limit}`);
        if (response) {
          setStates(response.states);
          setPagination({
            page: response.page,
            limit: response.limit,
            total: response.total,
          });
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        openNotification("error", "Error", "No se pudieron cargar los estados");
      }
    },
    [get, openNotification]
  );

  const createState = async (values: StateFormValues): Promise<boolean> => {
    try {
      await post("/states", values as unknown as Record<string, unknown>);
      await fetchStates(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error creating state:", error);
      openNotification("error", "Error", "No se pudo crear el estado");
      return false;
    }
  };

  const updateState = async (
    id: number,
    values: StateFormValues
  ): Promise<boolean> => {
    try {
      await put(`/states/${id}`, values as unknown as Record<string, unknown>);
      await fetchStates(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      console.error("Error updating state:", error);
      openNotification("error", "Error", "No se pudo actualizar el estado");
      return false;
    }
  };

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  return {
    states,
    isLoading,
    pagination,
    fetchStates,
    createState,
    updateState,
  };
};

export default useStates;
