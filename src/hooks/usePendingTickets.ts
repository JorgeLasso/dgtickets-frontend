import { useEffect } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";

interface TicketsResponse {
  tickets: Ticket[];
  countPendingTickets: number;
  averagePendingTimeToAttendInSecond: number;
  averageProcessingTimeModuleInSecod: number;
}

const usePendingTickets = (type: "priority" | "row", headquarterId: number) => {
  const endpoint = `/tickets_/${type}/${headquarterId}`;
  const { data, isLoading, error, get } = useFetch<TicketsResponse>();

  useEffect(() => {
    get(endpoint);
  }, [get, endpoint]);

  return {
    tickets: data?.tickets || [],
    isLoading,
    error,
    count: data?.countPendingTickets || 0,
    avgPending: data?.averagePendingTimeToAttendInSecond || 0,
    avgProcessing: data?.averageProcessingTimeModuleInSecod || 0,
  };
};

export default usePendingTickets;
