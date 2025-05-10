import { useState, useEffect } from "react";
import useFetch from "./useFetch";
import { PositionData } from "../types/ticket/ticket.types";
import { BASE_WS_URL } from "../services/api";

const useTicketPosition = (ticketId: string | undefined) => {
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [wsPositionData, setWsPositionData] = useState<PositionData | null>(
    null
  );
  const { get: getPositionData, isLoading } = useFetch<PositionData>();

  useEffect(() => {
    if (!ticketId) return;

    const getPosition = async () => {
      try {
        const data = await getPositionData(`/tickets_/position/${ticketId}`);
        setPositionData(data);
      } catch (error) {
        console.log(error);
      }
    };

    getPosition();
  }, [getPositionData, ticketId]);

  // WebSocket connection for real-time position updates
  useEffect(() => {
    if (!ticketId) return;

    const socket = new WebSocket(BASE_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connected for ticket position");
    };

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-position-by-id" || !payload) return;

      if (payload.ticketId === ticketId) {
        setWsPositionData(payload || payload.positionData);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for ticket position");
    };

    return () => {
      socket.close();
    };
  }, [ticketId]);

  const currentPositionData = wsPositionData || positionData;

  return { positionData: currentPositionData, isLoading };
};

export default useTicketPosition;
