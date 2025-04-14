import { CheckOutlined, CloseOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import useHideMenu from "../hooks/useHideMenu";
import getUserStorage from "../helpers/getUserStorage";
import { Navigate, useNavigate } from "react-router";
import { connectToWebSockets } from "../services/WebSocketService";
import { Ticket } from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";

const { Title, Text } = Typography;

const ModulePage: React.FC = () => {
  useHideMenu(false);

  const [user] = useState(getUserStorage());
  const navigate = useNavigate();
  const { get, put, isLoading } = useFetch();

  const [pendingTickets, setPendingTickets] = useState<number[]>([]);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [workingTicket, setWorkingTicket] = useState<Ticket | null>(null);
  const [loadingExit, setLoadingExit] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  useEffect(() => {
    const getPendingTickets = async () => {
      try {
        const data = await get("/tickets/pending");
        setPendingTickets(data);
      } catch (error) {
        console.log(error);
      }
    };
    getPendingTickets();
  }, [get]);

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
    setLoadingExit(true);
    try {
      localStorage.clear();
      await navigate("/asesor/ingresar");
    } finally {
      setLoadingExit(false);
    }
  };

  const onNextTicket = async () => {
    setLoadingNext(true);
    try {
      await onFinishTicket();
      const data = await get(`/tickets/draw/${user.module}`);

      if (data.status === "error") {
        setCurrentTicket(null);
        console.log("No hay tickets pendientes");
      } else {
        setCurrentTicket(data.ticket.number);
        setWorkingTicket(data.ticket);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingNext(false);
    }
  };

  const onFinishTicket = async () => {
    if (!currentTicket) return;
    if (!workingTicket) return;

    setLoadingFinish(true);
    try {
      const data = await put(`/tickets/done/${workingTicket.id}`, {});

      if (data.status === "error") {
        console.log("No se pudo finalizar el ticket");
      } else {
        setCurrentTicket(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingFinish(false);
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
            onClick={onExit}
            loading={loadingExit}
            disabled={loadingExit || isLoading}
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
              onClick={onFinishTicket}
              loading={loadingFinish}
              disabled={loadingFinish || loadingNext || isLoading}
            >
              {loadingFinish ? "Terminando..." : "Terminar"}
            </Button>
          )}
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={onNextTicket}
            loading={loadingNext}
            disabled={loadingNext || loadingFinish || isLoading}
          >
            {loadingNext ? "Cargando..." : "Siguiente"}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default ModulePage;
