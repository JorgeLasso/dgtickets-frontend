import { CheckOutlined, CloseOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import useHideMenu from "../hooks/useHideMenu";
import getUserStorage from "../helpers/getUserStorage";
import { Navigate, useNavigate } from "react-router";
import { connectToWebSockets } from "../services/WebSocketService";
import { BASE_API_URL } from "../services/api";

const { Title, Text } = Typography;

const ModulePage: React.FC = () => {
  useHideMenu(false);

  interface Ticket {
    id: string;
    number: number;
    createdAt: Date;
    done: boolean;
  }

  const [user] = useState(getUserStorage());
  const navigate = useNavigate();

  const [pendingTickets, setPendingTickets] = useState<number[]>([]);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [workingTicket, setWorkingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const getPendingTickets = async () => {
      try {
        const resp = await fetch(`${BASE_API_URL}/tickets/pending`);
        if (!resp.ok) {
          throw new Error(`Error al obtener los tickets: ${resp.statusText}`);
        }
        const data = await resp.json();
        setPendingTickets(data);
      } catch (error) {
        console.log(error);
      }
    };
    getPendingTickets();
  }, []);

  useEffect(() => {
    const socket = connectToWebSockets();

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-ticket-count-changed") return;
      setPendingTickets(payload);
    };

    return () => {
      socket.close();
    };
  }, []);

  const onExit = async () => {
    localStorage.clear();
    await navigate("/asesor/ingresar");
  };

  const onNextTicket = async () => {
    try {
      await onFinishTicket();
      const resp = await fetch(`${BASE_API_URL}/tickets/draw/${user.module}`);
      if (!resp.ok) {
        throw new Error(
          `Error al obtener el siguiente ticket: ${resp.statusText}`
        );
      }
      const { ticket, status } = await resp.json();

      if (status === "error") {
        setCurrentTicket(null);
        console.log("No hay tickets pendientes");
      } else {
        setCurrentTicket(ticket.number);
        setWorkingTicket(ticket);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onFinishTicket = async () => {
    try {
      if (!currentTicket) return;
      if (!workingTicket) {
        throw new Error("No working ticket to finish.");
      }

      const resp = await fetch(
        `${BASE_API_URL}/tickets/done/${workingTicket.id}`,
        {
          method: "PUT",
        }
      );
      if (!resp.ok) {
        throw new Error(`Error al finalizar el ticket: ${resp.statusText}`);
      }
      const { status } = await resp.json();

      if (status === "error") {
        console.log("No se pudo finalizar el ticket");
      } else {
        setCurrentTicket(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!user.userName || !user.module) {
    return <Navigate to="/asesor/ingresar" />;
  }

  return (
    <>
      <Row justify={"space-between"}>
        <Col>
          <Text strong style={{ fontSize: 20 }}>
            Tickets en cola:{" "}
          </Text>
          <Text strong type="danger" style={{ fontSize: 20 }}>
            {pendingTickets ? pendingTickets.length : 0}
          </Text>
        </Col>
        <Col>
          <Button
            icon={<CloseOutlined />}
            danger
            onClick={() => {
              onExit();
            }}
          >
            Salir
          </Button>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={2}>{user.userName}</Title>
          <Text>Usted está trabajando en el módulo: </Text>
          <Text strong type="success">
            {user.module}
          </Text>
        </Col>
      </Row>

      <Divider />

      {currentTicket && (
        <Row justify={"center"}>
          <Col>
            <Text>Atendiendo el Ticket número: </Text>
          </Col>
        </Row>
      )}

      <Row justify={"center"}>
        <Col>
          <Text strong type="danger" style={{ fontSize: 50 }}>
            {currentTicket}
          </Text>
        </Col>
      </Row>

      <Row justify={"end"}>
        <Col style={{ textAlign: "right" }}>
          {currentTicket && (
            <Button
              color="green"
              variant="outlined"
              icon={<CheckOutlined />}
              onClick={() => {
                onFinishTicket();
              }}
            >
              Terminar
            </Button>
          )}
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => {
              onNextTicket();
            }}
          >
            Siguiente
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default ModulePage;
