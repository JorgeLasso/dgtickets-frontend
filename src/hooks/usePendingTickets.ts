import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";
import { BASE_WS_URL } from "../services/api";

interface TicketsResponse {
  tickets: Ticket[];
  countPendingTickets: number;
  averagePendingTimeToAttendInSecond: number;
  averageProcessingTimeModuleInSecod: number;
}

const usePendingTickets = (type: "priority" | "row", headquarterId: number) => {
  const endpoint = `/tickets_/${type}/${headquarterId}`;
  const { data, isLoading, error, get } = useFetch<TicketsResponse>();
  const [ticketsData, setTicketsData] = useState<TicketsResponse | null>(null);

  // Initial data fetch
  useEffect(() => {
    get(endpoint);
  }, [get, endpoint]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new WebSocket(BASE_WS_URL);
    const wsEventType =
      type === "priority"
        ? "on-pending-priority-tickets"
        : "on-pending-normal-tickets";

    socket.onopen = () => {
      console.log(`WebSocket connected for ${type} tickets`);
    };

    socket.onmessage = (event) => {
      const { type: messageType, payload } = JSON.parse(event.data);
      if (messageType !== wsEventType) return;
      setTicketsData(payload);
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed for ${type} tickets`);
    };

    return () => {
      socket.close();
    };
  }, [type]);

  const currentData = ticketsData || data;

  return {
    tickets: currentData?.tickets || [],
    isLoading,
    error,
    count: currentData?.countPendingTickets || 0,
    avgPending: currentData?.averagePendingTimeToAttendInSecond || 0,
    avgProcessing: currentData?.averageProcessingTimeModuleInSecod || 0,
  };
};

export default usePendingTickets;
