import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Col,
  Divider,
  Row,
  Typography,
  Radio,
  Space,
  Card,
  Tooltip,
} from "antd";
import { DownloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import {
  Ticket,
  PositionData,
  PriorityType,
} from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../auth/AuthContext";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { NotificationContext } from "../context/NotificationContext";
import { formatTime } from "../helpers/formatTime";
import { useNavigate } from "react-router";
import { priorityOptions } from "../constants/PriorityOptions";
import useTicketHistory from "../hooks/useTicketHistory";

const { Title, Text } = Typography;
const { Group: RadioGroup } = Radio;

const CreateTicket: React.FC = () => {
  useHideMenu(true);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext)!;
  const { openNotification } = useContext(NotificationContext)!;
  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [lastTicket, setLastTicket] = useState(Number);
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const { get, post, isLoading } = useFetch<Ticket>();
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const [selectedPriority, setSelectedPriority] =
    useState<PriorityType>("regular");
  const [checkingPendingTickets, setCheckingPendingTickets] = useState(false);

  const {
    tickets,
    fetchTickets,
    isLoading: isLoadingTickets,
  } = useTicketHistory(auth.id || undefined);

  const isPriority = selectedPriority !== "regular";
  useEffect(() => {
    if (auth.id) {
      fetchTickets(1, false, "PENDING");
    }
  }, [auth.id, fetchTickets]);

  useEffect(() => {
    const getTicketPositionData = async () => {
      try {
        if (!lastTicket) return;
        const data = await get(`/tickets_/position/${lastTicket}`);
        setPositionData(data);
      } catch (error) {
        console.log(error);
      }
    };
    getTicketPositionData();
  }, [get, lastTicket]);

  useEffect(() => {
    const socket = connectToWebSockets();

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-last-ticket-number-changed") return;
      setPositionData(payload);
    };

    return () => {
      socket.close();
    };
  }, []);
  const checkForPendingTickets = () => {
    const pendingTicket = tickets.length > 0 ? tickets[0] : null;
    return pendingTicket;
  };
  const createNewTicket = async () => {
    try {
      setCheckingPendingTickets(true);

      await fetchTickets(1, false, "PENDING");

      const pendingTicket = checkForPendingTickets();

      if (pendingTicket) {
        openNotification(
          "error",
          "Turno pendiente",
          "Ya tienes un turno pendiente. No puedes crear un nuevo turno hasta que el actual sea atendido o cancelado."
        );

        navigate(`/ticket/${pendingTicket.id}`);
        return;
      } else {
        const payload = {
          userId: auth.id,
          headquarterId: selectedHeadquarter,
          priority: isPriority.toString(),
          priorityType: selectedPriority,
        };

        const data = await post("/tickets_", payload);
        setNewTicket(data.ticket);
        setLastTicket(data.ticket.id);
      }
    } catch (error) {
      console.log(error);
      openNotification(
        "error",
        "Error al crear turno",
        "Ocurrió un error al crear el turno. Por favor, intente nuevamente."
      );
    } finally {
      setCheckingPendingTickets(false);
    }
  };

  return (
    <>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={20} md={16} lg={14}>
          <Card
            title={
              <Title level={4} style={{ textAlign: "center", margin: 0 }}>
                Seleccione su condición
              </Title>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <RadioGroup
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {priorityOptions.map((option) => (
                    <Tooltip
                      key={option.value}
                      title={option.description}
                      placement="right"
                    >
                      <Card
                        hoverable
                        style={{
                          marginBottom: 8,
                          borderColor:
                            selectedPriority === option.value
                              ? "#1890ff"
                              : undefined,
                          backgroundColor:
                            selectedPriority === option.value
                              ? "#e6f7ff"
                              : undefined,
                        }}
                        onClick={() => setSelectedPriority(option.value)}
                      >
                        <Row align="middle" gutter={16}>
                          <Col xs={4} sm={3}>
                            <div
                              style={{
                                fontSize: 24,
                                color:
                                  option.value !== "regular"
                                    ? "#ff4d4f"
                                    : "#52c41a",
                              }}
                            >
                              {option.icon}
                            </div>
                          </Col>
                          <Col xs={20} sm={21}>
                            <Text strong>{option.label}</Text>
                            <div>
                              <Text
                                type="secondary"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {option.description}
                              </Text>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Tooltip>
                  ))}
                </Space>
              </RadioGroup>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row justify="center">
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Presione el botón para solicitar un turno</Title>{" "}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => createNewTicket()}
            loading={isLoading || isLoadingTickets || checkingPendingTickets}
            disabled={
              !selectedHeadquarter ||
              isLoading ||
              isLoadingTickets ||
              checkingPendingTickets
            }
          >
            {isLoading || isLoadingTickets || checkingPendingTickets
              ? checkingPendingTickets
                ? "Verificando turnos pendientes..."
                : "Asignando Turno..."
              : "Nuevo Turno"}
          </Button>
        </Col>
      </Row>
      <Divider />

      {newTicket && (
        <>
          <Row justify="center">
            <Col>
              <Text>Su Turno es: </Text>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Text strong type="danger" style={{ fontSize: 50 }}>
                {positionData?.position}
              </Text>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Text>El tiempo promedio para ser atendido es: </Text>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Text strong style={{ fontSize: 25 }}>
                {positionData?.estimatedTimeAtentionInSeconds &&
                  formatTime(positionData?.estimatedTimeAtentionInSeconds)}
              </Text>
            </Col>
          </Row>

          <Row justify="center" style={{ marginTop: 24 }}>
            <Col>
              <Button
                type="primary"
                icon={<InfoCircleOutlined />}
                onClick={() => navigate(`/ticket/${newTicket.id}`)}
              >
                Ver detalles de mi turno
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CreateTicket;
