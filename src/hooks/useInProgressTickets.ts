import { useEffect } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";

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

  useEffect(() => {
    if (headquarterId) {
      get(endpoint);
    }
  }, [get, endpoint, headquarterId]);

  return {
    tickets: data?.tickets || [],
    isLoading,
    error,
  };
};

export default useInProgressTickets;
