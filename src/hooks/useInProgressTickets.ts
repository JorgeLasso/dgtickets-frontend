import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";
import { BASE_WS_URL } from "../services/api";

interface InProgressTicketsResponse {
  tickets: Array<
    Ticket & {
      ticketMedicines: Array<{
        quantity: number;
        medicine: {
          name: string;
        };
      }>;
    }
  >;
}

const useInProgressTickets = (headquarterId: number) => {
  const endpoint = `/tickets_/inprogress/${headquarterId}`;
  const { data, isLoading, error, get } = useFetch<InProgressTicketsResponse>();
  const [workingOnTickets, setWorkingOnTickets] =
    useState<InProgressTicketsResponse | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (headquarterId) {
      get(endpoint);
    }
  }, [get, endpoint, headquarterId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new WebSocket(BASE_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connected for in-progress tickets");
    };

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-in-progress-tickets") return;
      setWorkingOnTickets(payload);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for in-progress tickets");
    };

    return () => {
      socket.close();
    };
  }, []);

  const currentData = workingOnTickets || data;

  return {
    tickets: currentData?.tickets || [],
    isLoading,
    error,
  };
};

export default useInProgressTickets;
