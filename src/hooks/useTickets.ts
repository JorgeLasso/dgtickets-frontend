import { useEffect, useState, useCallback } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";

interface TicketsResponse {
  tickets: Ticket[];
}

interface TicketDetailResponse {
  ticket: Ticket & {
    ticketMedicines?: Array<{
      quantity: number;
      medicine: {
        name: string;
      };
    }>;
  };
}

interface MedicineInfo {
  name: string;
  quantity: number;
}

const useTickets = (search?: string, headquarterId?: number) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [medicinesByTicket, setMedicinesByTicket] = useState<MedicineInfo[]>(
    []
  );
  const [isMedicinesLoading, setIsMedicinesLoading] = useState<boolean>(false);
  const { get } = useFetch<TicketsResponse | TicketDetailResponse>();

  const getBaseUrl = useCallback(() => {
    let url = "/tickets_";

    const params = new URLSearchParams();
    if (search) params.append("search", search);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }, [search]);

  const fetchTickets = useCallback(async () => {
    if (!search) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const url = getBaseUrl();
      const response = await get(url);

      if (response && response.tickets) {
        const filteredTickets = headquarterId
          ? response.tickets.filter(
              (ticket: Ticket) => ticket.headquarterId === headquarterId
            )
          : response.tickets;

        setTickets(filteredTickets);
      } else {
        setTickets([]);
      }
      setError(null);
    } catch (err) {
      console.error(
        `Error al obtener tickets (${search || "sin filtro"}, sede ${
          headquarterId || "todas"
        }):`,
        err
      );
      setError(err);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, headquarterId, get, getBaseUrl]);
  useEffect(() => {
    fetchTickets();
  }, [search, headquarterId, fetchTickets]);

  const reloadTickets = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getTicketMedicines = useCallback(
    async (ticketId: number) => {
      try {
        setIsMedicinesLoading(true);
        const response = (await get(
          `/tickets_/${ticketId}`
        )) as TicketDetailResponse;

        if (response && response.ticket && response.ticket.ticketMedicines) {
          const medicines = response.ticket.ticketMedicines.map((med) => ({
            name: med.medicine.name,
            quantity: med.quantity,
          }));
          setMedicinesByTicket(medicines);
          return medicines;
        }
        return [];
      } catch (err) {
        console.error(
          `Error al obtener medicamentos del ticket ${ticketId}:`,
          err
        );
        return [];
      } finally {
        setIsMedicinesLoading(false);
      }
    },
    [get]
  );

  const getMedicinesFromCompletedTickets = useCallback(async () => {
    if (!tickets || tickets.length === 0) {
      return [];
    }

    setIsMedicinesLoading(true);
    try {
      const medicinesPromises = tickets.map((ticket) =>
        getTicketMedicines(ticket.id)
      );
      const medicinesArrays = await Promise.all(medicinesPromises);

      const allMedicines: Record<string, number> = {};

      medicinesArrays.forEach((medicines) => {
        medicines.forEach((med) => {
          const medicineName = med.name;
          allMedicines[medicineName] =
            (allMedicines[medicineName] || 0) + med.quantity;
        });
      });

      const result = Object.entries(allMedicines).map(([name, quantity]) => ({
        name,
        quantity,
      }));

      result.sort((a, b) => b.quantity - a.quantity);

      return result;
    } catch (err) {
      console.error(
        "Error al obtener medicamentos de tickets completados:",
        err
      );
      return [];
    } finally {
      setIsMedicinesLoading(false);
    }
  }, [tickets, getTicketMedicines]);

  return {
    tickets,
    isLoading,
    error,
    reloadTickets,
    getTicketMedicines,
    getMedicinesFromCompletedTickets,
    medicinesByTicket,
    isMedicinesLoading,
  };
};

export default useTickets;
