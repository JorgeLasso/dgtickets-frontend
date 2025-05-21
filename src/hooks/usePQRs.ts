import { useState, useEffect, useContext, useCallback } from "react";
import useFetch from "./useFetch";
import { PQR, PQRResponse } from "../types/pqrs/pqrs.types";
import { NotificationContext } from "../context/NotificationContext";
import { AuthContext } from "../auth/AuthContext";

const usePQRs = () => {
  const [pqrs, setPQRs] = useState<PQR[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    next: null as number | null,
    prev: null as number | null,
  });

  const { get, post, put } = useFetch<PQRResponse>();

  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;
  const authContext = useContext(AuthContext);
  const userId = authContext?.auth?.id;
  const fetchPQRs = useCallback(
    async (page = 1, limit = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await get(`pqrs?page=${page}&limit=${limit}`);

        if (response) {
          setPQRs(response.pqrs);
          setPagination({
            page: response.page,
            limit: response.limit,
            total: response.total,
            next: response.next,
            prev: response.prev,
          });

          return response.pqrs;
        }
        return [];
      } catch (error) {
        setError("Error al cargar las PQRs");
        openNotification("error", "Error", "No se pudieron cargar las PQRs");
        console.error("Error fetching PQRs:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [get, openNotification]
  );
  const createPQR = async (description: string) => {
    setIsLoading(true);

    try {
      await post("pqrs", { description, userId });
      await fetchPQRs(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      openNotification("error", "Error", "No se pudo crear la PQR");
      console.error("Error creating PQR:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const answerPQR = async (id: number, answer: string) => {
    setIsLoading(true);

    let extraFields = {};
    if (authContext?.auth?.role === "ADMIN_ROLE") {
      extraFields = {
        pqrType: "COMPLETED",
        answerByUser: userId,
      };
    }

    try {
      await put(`pqrs/${id}`, { answer, ...extraFields });
      await fetchPQRs(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      openNotification("error", "Error", "No se pudo responder la PQR");
      console.error("Error answering PQR:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPQRs();
  }, [fetchPQRs]);

  return {
    pqrs,
    isLoading,
    error,
    pagination,
    fetchPQRs,
    createPQR,
    answerPQR,
  };
};

export default usePQRs;
