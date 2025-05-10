import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../auth/AuthContext";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";
import {
  PaginatedResponse,
  PaginationOptions,
} from "../types/pagination/pagination.types";

interface TicketsApiResponse extends Omit<PaginatedResponse<Ticket>, "items"> {
  tickets: Ticket[];
}

const useTicketHistory = (userId?: number, options: PaginationOptions = {}) => {
  const { auth } = useContext(AuthContext)!;
  const { get, isLoading } = useFetch<TicketsApiResponse>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [limit] = useState(options.limit || 8);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentUserId = userId || auth.id;
  const fetchTickets = useCallback(
    async (
      page: number = currentPage,
      append: boolean = false,
      search: string = searchTerm
    ) => {
      if (!currentUserId) {
        setError("No se pudo identificar el usuario actual.");
        return;
      }
      try {
        setError(null);
        let url = `/tickets_/user/${currentUserId}?page=${page}&limit=${limit}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await get(url);
        if (response && response.tickets) {
          setTickets((prevTickets) =>
            append ? [...prevTickets, ...response.tickets] : response.tickets
          );
          setTotalTickets(response.total);
          setHasNextPage(!!response.next);
        } else {
          setError("No se pudo obtener la información de turnos.");
        }
      } catch (error) {
        console.error("Error al cargar el historial de turnos:", error);
        setError(
          "Error al cargar el historial de turnos. Por favor, intenta nuevamente."
        );
      }
    },
    [currentUserId, limit, get, searchTerm, currentPage]
  );

  useEffect(() => {
    fetchTickets(currentPage);
  }, [fetchTickets, currentPage]);

  const filterTickets = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      fetchTickets(1, false, term);
    },
    [fetchTickets]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchTickets(currentPage + 1, true).finally(() => {
        setCurrentPage((prevPage) => prevPage + 1);
        setIsLoadingMore(false);
      });
    }
  }, [fetchTickets, currentPage, hasNextPage, isLoadingMore]);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchTickets(page);
    },
    [fetchTickets]
  );

  return {
    tickets,
    totalTickets,
    currentPage,
    totalPages: Math.ceil(totalTickets / limit),
    error,
    isLoading: isLoading || isLoadingMore,
    fetchTickets,
    loadMore,
    setPage,
    filterTickets,
    setSearchTerm,
  };
};

export default useTicketHistory;
