import { useState, useEffect } from "react";
import useFetch from "./useFetch";
import { Ticket } from "../types/ticket/ticket.types";
import { useNavigate } from "react-router";
import { BASE_WS_URL } from "../services/api";

const useTicketDetails = (ticketId: string | undefined) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [wsTicket, setWsTicket] = useState<Ticket | null>(null);
  const { get, isLoading } = useFetch<{ ticket: Ticket }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ticketId) {
      navigate("/crear");
      return;
    }

    const getTicketDetails = async () => {
      try {
        const data = await get(`/tickets_/${ticketId}`);
        setTicket(data.ticket);
      } catch (error) {
        console.log(error);
        navigate("/crear");
      }
    };

    getTicketDetails();
  }, [get, ticketId, navigate]);

  // WebSocket connection for real-time ticket updates
  useEffect(() => {
    if (!ticketId) return;

    const socket = new WebSocket(BASE_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connected for ticket details");
    };

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-ticket-by-id" || payload.id !== ticketId) return;
      setWsTicket(payload || payload.ticket);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for ticket details");
    };

    return () => {
      socket.close();
    };
  }, [ticketId]);

  const currentTicket = wsTicket || ticket;

  return { ticket: currentTicket, isLoading };
};

export default useTicketDetails;
